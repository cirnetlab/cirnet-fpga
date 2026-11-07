# FPGA verification records from 2026-11-05

[Dated sections in the original README](https://github.com/cirnetlab/cirnet-fpga/blob/497aded7f8dcd5f7071c128cb44cc5842120d450/README.md#2026-11-05-fpga-012-candidate)

These sections preserve the recorded candidate and toolchain checks. See the [current verification guide](../en/verification.md) or its [Vietnamese counterpart](../vi/verification.md) for current commands.

## 2026-11-05 FPGA 0.1.2 candidate

Native Windows verification at UTC+07:00 used an external export of the
uncommitted candidate based on `f02a928802c48644ab8ff79226970e8bec66ffc4`,
CPython 3.14.4, the exact canonical Contracts 0.1.2 wheel, pyslang 12.0.0,
and the SHA256-pinned OSS CAD Suite. Both top modules compiled, and the two
testbenches reported `LAB_FIRST_RTL_PASS` and `PERMIT_MATRIX_RTL_PASS`.
All 31 pytest cases passed after the bootstrap fixture restored both
allocator environment prefixes. Actionlint 1.7.12 passed the workflow.
Raw output used the external session owned by `cirnet-release-014-20261105`.
The RTL report SHA256 is
`dfc65d2528f4a3bc4e357d4092cd248cf585d38127302c2e39d1cec463afdac0`
and the pytest log SHA256 is
`a3eb13f3cbb36097cbaba08d6365ad552456db095c5d870d10e5259a40299f40`.
The release archive requires the actual committed revision. These software
tests cover the scaffold and abstract control behavior.

## Node 26 LTS CI baseline (2026-11-05)

Both checks in `tests/test_bootstrap_environment.py` pass with portable Node
26.13.0 on PATH. actionlint 1.7.12 passes the workflow with
`-shellcheck= -pyflakes=`. CI selects major 26 before allocator bootstrap. RTL, dependency
locks and published artifacts are unchanged. RTL simulation, native/FPGA build,
physical board verification and hosted Actions are NOT_RUN for this toolchain
policy change. Raw evidence was inspected outside Git in the shared session
owned by `cirnet-node26-compat-20261105`.

## Python 3.14 CI baseline (2026-11-05)

Primary CI selects Python 3.14. All three bootstrap/toolchain selection checks
pass, and the existing binary-only hash closure verifies for CPython 3.14
Windows AMD64 and glibc Linux x86_64 without changing versions or hashes.
actionlint 1.7.12 passes the workflow. RTL, protocol, immutable artifacts and
historical evidence are unchanged. Native RTL simulation, synthesis, board
programming, hosted Actions and publication are NOT_RUN for this toolchain
upgrade. Raw diagnostics are external under the session owned by
`cirnet-python314-compat-20261105`.
