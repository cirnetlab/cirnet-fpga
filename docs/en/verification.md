# Verify the FPGA source and RTL

English · [Tiếng Việt](../vi/verification.md)

[Documentation index](index.md)

## Build the native source candidate

Use Node 26 and Git. Extract the allocator module from the DEV npm archive pinned in [the artifact lock](../../integration/contracts-version.json). Verify both SHA-256 digests and set `CIRNET_ARTIFACTS_CLI` to the absolute path of the verified module. The Node packager checks the module digest again before loading it.

~~~powershell
$env:CIRNET_ARTIFACTS_SESSION = node $env:CIRNET_ARTIFACTS_CLI
node --test tests/build-source.test.mjs
node scripts/build-source.mjs --output (Join-Path $env:CIRNET_ARTIFACTS_SESSION 'cirnet-fpga-scaffold-0.2.2-native-source.tar.gz')
~~~

Run from the FPGA checkout. For a source export, supply the allocator context of the originating checkout and use `--provenance` with the exact exported revision and migration state. The packager requires `cirnet-fpga-scaffold-<VERSION>-native-source.tar.gz`, with the version taken from `VERSION`. The receipt records the version, filename, archive size and SHA-256, source revision, dirty state, portable-source target and Node/zlib versions. Inspect `fpga-artifact.json` for the source inventory, selected Contracts package version, logical envelope and reserved register map. CI packages this candidate in a separate Windows job. The published release lock remains authoritative for the historical archive.

For release selection, record the requirement or compatibility decision, the exact source and Contracts revisions, the verification artifact hashes, the archive identity and both RTL results. Source review covers the RTL module and port surface. Wire review covers the logical schema and its version. Behavior review covers the safety permits and both RTL test markers. Keep `physicalAvailable: false` for this source-only target. Board-specific evidence is required before advertising firmware or a physical protocol.

## Isolated RTL verification

Use a fresh environment outside all checkouts. Current RTL CI uses Node 26 and Python 3.14. Select the exact Contracts 0.1.2 wheel and DEV allocator by digest. The hash-locked closure includes `pyslang==12.0.0`. Use the pinned OSS CAD Suite dated 2026-10-26 with its exact Icarus and vvp builds.

## Verify a clean export

Start in the FPGA checkout in PowerShell 7. Replace the manifest and archive placeholders with reviewed absolute paths. Omitting `--archive` uses the installer’s pinned download.

Bootstrap from the checkout to retain its Git context, then run pytest from a clean export of the reviewed commit in the owned session. The export contains committed files only. Treat results for uncommitted edits as candidate evidence with its own recorded inputs.

Run the commands in order and stop at the first failure.

~~~powershell
$env:CIRNET_CONTRACTS_ARTIFACT_MANIFEST = 'C:/absolute/contracts/artifacts.json'
$bootstrap = python -B -c "from scripts.bootstrap_contract_tools import bootstrap; import json; print(json.dumps(bootstrap()))" | Select-Object -Last 1 | ConvertFrom-Json
if ($LASTEXITCODE -ne 0 -or -not $bootstrap.session -or -not $bootstrap.context) {
    throw 'Could not allocate a verification session.'
}
$env:CIRNET_ARTIFACTS_SESSION = $bootstrap.session
$env:CIRNET_ARTIFACTS_CONTEXT = $bootstrap.context | ConvertTo-Json -Compress -Depth 10
$env:TMP = $env:TEMP = $env:TMPDIR = $bootstrap.session
$env:PIP_CACHE_DIR = Join-Path $bootstrap.session 'pip-cache'
$env:PYTHONDONTWRITEBYTECODE = '1'
$revision = git rev-parse --verify HEAD
$sourceTar = Join-Path $bootstrap.session 'tracked-source.tar'
$export = Join-Path $bootstrap.session 'source-export'
New-Item -ItemType Directory -Path $export | Out-Null
git archive --format=tar "--output=$sourceTar" $revision
tar -xf $sourceTar -C $export
Push-Location -LiteralPath $export
$wheelhouse = Join-Path $bootstrap.session 'wheelhouse'
python -B -m pip download --require-hashes --only-binary=:all: -r requirements-verification.lock --dest $wheelhouse
python -B -m pip install --require-hashes --only-binary=:all: --no-index --find-links $wheelhouse -r requirements-verification.lock
python -B scripts/install_contracts.py --manifest $env:CIRNET_CONTRACTS_ARTIFACT_MANIFEST
python -B -m pip check
$tool = python -B scripts/install_toolchain.py --archive C:/absolute/oss-cad-suite-archive
$env:CIRNET_FPGA_TOOLCHAIN_ROOT = ($tool -join [Environment]::NewLine | ConvertFrom-Json).root
python -B -m pytest -q --basetemp (Join-Path $bootstrap.session 'pytest')
Pop-Location
~~~

The pytest gate invokes `scripts/check_rtl.py` and checks its results. To run the RTL check by itself, use `python -B scripts/check_rtl.py --toolchain-root $env:CIRNET_FPGA_TOOLCHAIN_ROOT`.

Both `LAB_FIRST_RTL_PASS` and `PERMIT_MATRIX_RTL_PASS` must come from actual simulation. The gate authenticates the toolchain execution closure and checks both tops. An unavailable or incorrect tool fails the gate. Compilation, parsing and elaboration alone cannot establish the behavioral result. The original bench and the permit matrix cover reset, lost permits, fault and watchdog behavior, safe stop and unavailable instruments. See the [bench guide](../../fpga/simulation/README.md).

Inspect diagnostics before using the allocator’s guarded cleanup for your session.

The [CI workflow](../../.github/workflows/fpga.yml) runs the Linux gate. The [dated results](history/verification/2026-11-05-fpga-verification.md#2026-11-05-fpga-012-candidate) describe the tested candidate and its limits. Software verification establishes abstract control behavior. Board programming, pinout, timing closure and electrical qualification remain separate.
