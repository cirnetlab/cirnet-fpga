import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, dirname, isAbsolute, join, resolve } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const source = join(root, 'integration', 'source-provenance.json')
const executable = join(root, 'scripts', 'build-source.mjs')
assert.ok(process.env.CIRNET_ARTIFACTS_SESSION && isAbsolute(process.env.CIRNET_ARTIFACTS_SESSION),
  'Select the owned external CIRNET_ARTIFACTS_SESSION before testing.')
const allocatorPath = process.env.CIRNET_ARTIFACTS_CLI
assert.ok(allocatorPath && isAbsolute(allocatorPath), 'Select the pinned DEV allocator before testing.')
const pin = JSON.parse(readFileSync(join(root, 'integration', 'contracts-version.json'), 'utf8')).dev.node_sha256
assert.equal(createHash('sha256').update(readFileSync(allocatorPath)).digest('hex'), pin, 'DEV allocator SHA-256 mismatch')
const allocator = await import(pathToFileURL(allocatorPath).href)
const scratch = mkdtempSync(join(allocator.getArtifactDirectory(), 'fpga-packaging-test-'))
const filename = `cirnet-fpga-scaffold-${readFileSync(join(root, 'VERSION'), 'utf8').trim()}-native-source.tar.gz`

function build(output, provenance = source, env = process.env) {
  return spawnSync(process.execPath, [executable, '--output', output, '--provenance', provenance], { cwd: root, env, encoding: 'utf8' })
}

test('builds a deterministic candidate with a complete source-only inventory', () => {
  const archive = join(scratch, filename)
  const rebuilt = join(scratch, 'rebuild')
  mkdirSync(rebuilt)
  const rebuild = join(rebuilt, filename)
  const first = build(archive)
  const second = build(rebuild)
  assert.equal(first.status, 0, first.stderr)
  assert.equal(second.status, 0, second.stderr)
  const bytes = readFileSync(archive)
  assert.deepEqual(bytes, readFileSync(rebuild))
  const receipt = JSON.parse(first.stdout)
  assert.equal(receipt.source.sha256, createHash('sha256').update(bytes).digest('hex'))
  assert.equal(receipt.source.size, bytes.length)
  assert.equal(receipt.source.filename, basename(archive))

  const listing = spawnSync('tar', ['-tf', archive], { encoding: 'utf8' })
  assert.equal(listing.status, 0, listing.stderr)
  const files = listing.stdout.trim().split(/\r?\n/)
  assert.ok(!files.some(file => /\.(?:py|pyc|whl|exe|dll)$/i.test(file)))
  assert.ok(files.includes('fpga/experiment-controller/rtl/top.v'))
  assert.ok(files.includes('fpga/instrument/rtl/top.v'))
  assert.ok(files.includes('fpga/simulation/tb_lab_first_control.v'))
  assert.ok(files.includes('fpga/simulation/tb_permit_matrix.v'))
  const metadata = spawnSync('tar', ['-xOf', archive, 'fpga-artifact.json'], { encoding: 'utf8' })
  assert.equal(metadata.status, 0, metadata.stderr)
  const identity = JSON.parse(metadata.stdout)
  assert.equal(identity.name, 'cirnet-fpga-scaffold')
  assert.equal(identity.version, '0.2.2')
  assert.equal(identity.version, receipt.version)
  assert.equal(identity.contractsVersion, '0.1.2')
  assert.equal(identity.logicalProtocolVersion, '1.0-scaffold')
  assert.equal(identity.registerMapVersion, '1.0-reserved')
  assert.equal(identity.physicalAvailable, false)
  assert.equal(identity.sourceFingerprint, receipt.sourceFingerprint)
  assert.deepEqual(files.sort(), [...Object.keys(identity.files), 'fpga-artifact.json'].sort())
  const extracted = join(scratch, 'extracted')
  mkdirSync(extracted)
  const extraction = spawnSync('tar', ['-xf', archive, '-C', extracted], { encoding: 'utf8' })
  assert.equal(extraction.status, 0, extraction.stderr)
  const rows = []
  for (const name of Object.keys(identity.files).sort()) {
    const digest = createHash('sha256').update(readFileSync(join(extracted, name))).digest('hex')
    assert.equal(identity.files[name], digest, name)
    rows.push(`${digest}  ${name}\n`)
  }
  assert.equal(identity.sourceFingerprint, createHash('sha256').update(rows.join('')).digest('hex'))
  assert.notEqual(build(archive).status, 0)
  assert.deepEqual(readFileSync(archive), bytes)
})

test('rejects unrelated provenance, a mismatched allocator, and unsafe output', () => {
  const wrong = join(scratch, 'unrelated.json')
  const provenance = JSON.parse(readFileSync(source, 'utf8'))
  writeFileSync(wrong, JSON.stringify({ ...provenance, originalRepository: 'https://github.com/unrelated/repository.git' }))
  const foreign = build(join(scratch, 'foreign.tar.gz'), wrong)
  assert.notEqual(foreign.status, 0)
  assert.match(foreign.stderr, /repository/i)
  const mismatch = build(join(scratch, 'mismatch.tar.gz'), source, { ...process.env, CIRNET_ARTIFACTS_CLI: wrong })
  assert.notEqual(mismatch.status, 0)
  assert.match(mismatch.stderr, /allocator.*sha-256/i)
  const unsafe = build(join(root, 'LICENSE'))
  assert.notEqual(unsafe.status, 0)
  assert.match(unsafe.stderr, /product source|checkout/i)
  const outside = build(join(dirname(dirname(scratch)), `${basename(scratch)}.tar.gz`))
  assert.notEqual(outside.status, 0)
  assert.match(outside.stderr, /outside|owned|artifact/i)
  const alias = build(join(scratch, 'CON.tar.gz'))
  assert.notEqual(alias.status, 0)
  assert.match(alias.stderr, /safe .* archive name/i)
})

test('rejects the published archive name for different candidate bytes', () => {
  const publishedName = join(scratch, 'cirnet-fpga-scaffold-0.1.2.tar.gz')
  const result = build(publishedName)
  assert.notEqual(result.status, 0)
  assert.match(result.stderr, /candidate archive name/i)
  assert.equal(existsSync(publishedName), false)
})
