/** Deterministic source-only FPGA candidate packaging. */
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { closeSync, existsSync, lstatSync, openSync, readdirSync, readFileSync, realpathSync, unlinkSync, writeFileSync } from 'node:fs'
import { basename, dirname, extname, isAbsolute, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { parseArgs } from 'node:util'
import { gzipSync } from 'node:zlib'

const root = realpathSync(resolve(dirname(fileURLToPath(import.meta.url)), '..'))
const repository = 'https://github.com/cirnetlab/cirnet-fpga.git'
const originalRepository = 'https://github.com/cirnetlab/cirnet-remote.git'
const originalRevision = 'f43f92c7730d40040e717bf1bacd3a3773e2a131'
const allowed = new Set(['.json', '.md', '.v', '.sv', '.vh', '.svh', '.tcl'])
const sha256 = data => createHash('sha256').update(data).digest('hex')
const sortedNames = files => [...files.keys()].sort((a, b) => Buffer.compare(Buffer.from(a), Buffer.from(b)))
const unsafePart = part => /[<>:"\\|?*\x00-\x1f]|[. ]$/.test(part) ||
  /^(?:\.git|CON|PRN|AUX|NUL|COM[1-9¹²³]|LPT[1-9¹²³])(?:\.|$)/i.test(part)
const inside = (base, file) => {
  const path = relative(base, file)
  return path !== '..' && !path.startsWith('..' + sep) && !isAbsolute(path)
}

function selectedSource(path) {
  const { repository: current, originalRepository: original, originalRevision: migrated, revision, uncommittedMigration } =
    JSON.parse(readFileSync(path, 'utf8'))
  if (![repository, repository.slice(0, -4)].includes(current) ||
      ![originalRepository, originalRepository.slice(0, -4)].includes(original) || migrated !== originalRevision) {
    throw new Error('Provenance must identify the FPGA repository and exact Remote migration source.')
  }
  if (typeof revision !== 'string' || !/^[0-9a-f]{40}$/.test(revision) || typeof uncommittedMigration !== 'boolean') {
    throw new Error('Provenance requires an explicit source revision and migration state.')
  }
  const source = { repository, originalRepository, originalRevision, revision, uncommittedMigration }
  if (existsSync(join(root, '.git'))) {
    const env = { ...process.env }
    for (const key of Object.keys(env)) {
      if (['GIT_DIR', 'GIT_WORK_TREE', 'GIT_COMMON_DIR', 'GIT_INDEX_FILE', 'GIT_OBJECT_DIRECTORY', 'GIT_ALTERNATE_OBJECT_DIRECTORIES'].includes(key.toUpperCase())) delete env[key]
    }
    const git = (...args) => execFileSync('git', ['--no-optional-locks', '-C', root, ...args], { encoding: 'utf8', env }).trim()
    source.revision = git('rev-parse', '--verify', 'HEAD')
    source.uncommittedMigration = Boolean(git('status', '--porcelain=v1', '--untracked-files=all'))
  }
  return source
}

function sourceFiles() {
  const files = new Map()
  const spelling = new Set()
  let size = 0
  function add(name) {
    const parts = name.split('/')
    if (parts.some(unsafePart)) {
      throw new Error(`Unsafe source path: ${name}`)
    }
    const key = name.toLowerCase()
    if (spelling.has(key)) throw new Error(`Case-colliding source path: ${name}`)
    spelling.add(key)
    const path = join(root, ...parts)
    const stat = lstatSync(path)
    if (stat.isSymbolicLink() || realpathSync(path) !== path) throw new Error(`Source aliases are unsupported: ${name}`)
    if (stat.isDirectory()) {
      for (const entry of readdirSync(path)) add(`${name}/${entry}`)
      return
    }
    if (!stat.isFile() || (parts.length > 1 && !allowed.has(extname(name)) && basename(name) !== '.gitkeep')) {
      throw new Error(`Unexpected product source file: ${name}`)
    }
    size += stat.size
    if (size > 127 * 1024 * 1024 || files.size >= 9_999) throw new Error('FPGA source exceeds archive limits.')
    const bytes = readFileSync(path)
    if (bytes.length !== stat.size) throw new Error(`Source changed while packaging: ${name}`)
    files.set(name, bytes)
  }

  for (const name of ['LICENSE', 'README.md', 'VERSION', 'fpga', 'docs', 'integration']) add(name)
  for (const required of ['fpga/experiment-controller/rtl/top.v', 'fpga/instrument/rtl/top.v',
    'fpga/simulation/tb_lab_first_control.v', 'fpga/simulation/tb_permit_matrix.v']) {
    if (!files.has(required)) throw new Error(`Missing required source: ${required}`)
  }
  if (files.get('VERSION')?.toString().trim() !== '0.1.2') throw new Error('Unsupported scaffold source version.')
  return files
}

function tarGzip(files) {
  const records = []
  for (const name of sortedNames(files)) {
    const data = files.get(name)
    const header = Buffer.alloc(512)
    if (Buffer.byteLength(name) > 100) throw new Error(`FPGA archive path exceeds 100 UTF-8 bytes: ${name}`)
    header.write(name, 0, 100)
    const octal = (value, offset, width) => header.write(value.toString(8).padStart(width - 1, '0'), offset)
    octal(0o644, 100, 8)
    octal(0, 108, 8)
    octal(0, 116, 8)
    octal(data.length, 124, 12)
    octal(0, 136, 12)
    header.fill(0x20, 148, 156)
    header.write('0', 156)
    header.write('ustar\0' + '00', 257)
    const checksum = header.reduce((sum, byte) => sum + byte, 0)
    header.write(checksum.toString(8).padStart(6, '0') + '\0 ', 148)
    records.push(header, data, Buffer.alloc((512 - data.length % 512) % 512))
  }
  records.push(Buffer.alloc(1024))
  return gzipSync(Buffer.concat(records), { level: 9 })
}

async function build(output, provenance, allocatorPath) {
  if (!isAbsolute(output)) throw new Error('Source archive output must be absolute and allocator-owned.')
  if (inside(root, resolve(output))) throw new Error('Source archive output cannot be inside product source.')
  if (!output.endsWith('.tar.gz') || unsafePart(basename(output))) throw new Error('Expected a safe .tar.gz source archive name.')
  const pin = JSON.parse(readFileSync(join(root, 'integration', 'contracts-version.json'), 'utf8')).dev.node_sha256
  if (!allocatorPath || !isAbsolute(allocatorPath)) throw new Error('Select an absolute pinned DEV allocator with --allocator or CIRNET_ARTIFACTS_CLI.')
  const modulePath = realpathSync(allocatorPath)
  if (sha256(readFileSync(modulePath)) !== pin) throw new Error('DEV allocator SHA-256 differs from the selected pin.')
  const allocator = await import(pathToFileURL(modulePath).href)
  const inherited = process.env.CIRNET_ARTIFACTS_SESSION ?? process.env.NETCIRCUIT_ARTIFACTS_SESSION
  if (!inherited) throw new Error('Set CIRNET_ARTIFACTS_SESSION to a pinned allocator-owned external session.')
  const session = allocator.getArtifactDirectory()
  const parent = allocator.validateArtifactDirectory(dirname(output))
  if (!inside(session, parent) || inside(root, parent)) throw new Error('Source archive output must stay inside the owned session and outside product source.')
  const destination = join(parent, basename(output))
  const source = selectedSource(provenance)
  const files = sourceFiles()
  const hashes = Object.fromEntries(sortedNames(files).map(name => [name, sha256(files.get(name))]))
  const fingerprint = sha256(Object.entries(hashes).map(([name, digest]) => `${digest}  ${name}\n`).join(''))
  const identity = { schemaVersion: 1, name: 'cirnet-fpga-scaffold', version: '0.1.2', kind: 'source',
    contractsVersion: '0.1.2', logicalProtocolVersion: '1.0-scaffold', registerMapVersion: '1.0-reserved',
    physicalAvailable: false, source, files: hashes, sourceFingerprint: fingerprint }
  const metadata = Buffer.from(JSON.stringify(identity, null, 2) + '\n')
  if (metadata.length > 1024 * 1024) throw new Error('FPGA source identity exceeds archive limits.')
  files.set('fpga-artifact.json', metadata)
  const bytes = tarGzip(files)
  if (bytes.length > 128 * 1024 * 1024) throw new Error('FPGA source exceeds compressed archive limits.')
  const handle = openSync(destination, 'wx')
  try {
    try { writeFileSync(handle, bytes) } finally { closeSync(handle) }
  } catch (error) {
    unlinkSync(destination)
    throw error
  }
  return { schemaVersion: 1, source: { path: destination, sha256: sha256(bytes) }, sourceFingerprint: fingerprint,
    revision: source.revision, uncommittedMigration: source.uncommittedMigration, target: 'portable-source',
    toolchain: { node: process.version, zlib: process.versions.zlib } }
}

try {
  const { values } = parseArgs({ options: {
    output: { type: 'string' }, provenance: { type: 'string' }, allocator: { type: 'string' },
  } })
  if (!values.output) throw new Error('Usage: node scripts/build-source.mjs --output ABSOLUTE_ARCHIVE [--provenance FILE] [--allocator FILE]')
  const provenance = values.provenance ?? join(root, 'integration', 'source-provenance.json')
  const allocator = values.allocator ?? process.env.CIRNET_ARTIFACTS_CLI ?? process.env.NETCIRCUIT_ARTIFACTS_CLI
  console.log(JSON.stringify(await build(values.output, provenance, allocator), null, 2))
} catch (error) {
  console.error(`build-source: ${error.message}`)
  process.exitCode = 1
}
