# Verify the FPGA source and RTL

English · [Tiếng Việt](../vi/verification.md)

[Documentation index](index.md)

Use a fresh environment outside all checkouts. Current CI uses Node 26 and Python 3.14. Select the exact Contracts 0.1.2 wheel and DEV allocator by digest. The hash-locked closure includes `pyslang==12.0.0`. Use the pinned OSS CAD Suite dated 2026-10-26 with its exact Icarus and vvp builds.

Run from the FPGA repository in PowerShell. Replace the manifest and archive placeholders with reviewed absolute paths. Omitting `--archive` uses the installer’s pinned download.

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
$wheelhouse = Join-Path $bootstrap.session 'wheelhouse'
python -B -m pip download --require-hashes --only-binary=:all: -r requirements-verification.lock --dest $wheelhouse
python -B -m pip install --require-hashes --only-binary=:all: --no-index --find-links $wheelhouse -r requirements-verification.lock
python -B scripts/install_contracts.py --manifest $env:CIRNET_CONTRACTS_ARTIFACT_MANIFEST
python -B -m pip check
$tool = python -B scripts/install_toolchain.py --archive C:/absolute/oss-cad-suite-archive
$env:CIRNET_FPGA_TOOLCHAIN_ROOT = ($tool -join [Environment]::NewLine | ConvertFrom-Json).root
python -B scripts/check_rtl.py --toolchain-root $env:CIRNET_FPGA_TOOLCHAIN_ROOT
python -B -m pytest -q --basetemp (Join-Path $bootstrap.session 'pytest')
~~~

Both `LAB_FIRST_RTL_PASS` and `PERMIT_MATRIX_RTL_PASS` must come from actual simulation. The gate authenticates the toolchain execution closure and checks both tops. An unavailable or incorrect tool fails the gate. Compilation, parsing and elaboration alone cannot establish the behavioral result. The original bench and the permit matrix cover reset, lost permits, fault and watchdog behavior, safe stop and unavailable instruments. See the [bench guide](../../fpga/simulation/README.md).

Build the source archive into the owned session after the checks.

~~~powershell
$archive = Join-Path $bootstrap.session 'cirnet-fpga-scaffold-0.1.2.tar.gz'
python -B scripts/build_source.py --output $archive --provenance integration/source-provenance.json
~~~

The archive contains a deterministic inventory and `fpga-artifact.json` provenance. Compare two builds from identical inputs. For release, use the actual clean commit and record its SHA256. The published `v0.1.1` archive keeps its original identity. Inspect diagnostics before using the allocator’s guarded cleanup for your session.

The [CI workflow](../../.github/workflows/fpga.yml) runs the Linux gate. The [dated results](../../README.md#2026-11-05-fpga-012-candidate) describe the tested candidate and its limits. Software verification establishes abstract control behavior. Board programming, pinout, timing closure and electrical qualification remain separate.
