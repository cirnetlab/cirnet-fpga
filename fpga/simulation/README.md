# FPGA scaffold verification

The benches exercise the RTL scaffold independently of the application’s
VirtualHardwareStation event simulation. Use the [English verification guide](../../docs/en/verification.md)
or [Vietnamese verification guide](../../docs/vi/verification.md) for the pinned
toolchain and clean-export procedure. The pytest gate invokes the RTL check.
Missing or incorrect slang/compiler/runtime is a failure; no optional skip,
unversioned PATH fallback or hardcoded temporary output is permitted.

The original `tb_lab_first_control.v` retains all assertions. Its reset is held
through a clock edge before release, fixing simulator-dependent declaration
initialization. `tb_permit_matrix.v` adds every live permit loss, SAFE_STATE/STOP,
failed scan, zero clock period, exact clock boundaries and unavailable instrument
requests/reset. Expected markers are `LAB_FIRST_RTL_PASS` and
`PERMIT_MATRIX_RTL_PASS`; parser/elaboration cannot substitute for simulation.

Each invocation records distinct owned output directory, source hashes, actual
executable/archive identities and simulation logs. Inspect evidence before
guarded cleanup. Native helper/config/module/DLL/shared-library requirements come
from the authenticated archive; missing or changed support fails before execution.

Scope remains abstract control simulation. Immediate drive inhibition and
synchronous FAULT/routing cleanup are distinct checks. No electrical protection,
pinout, scanner, ADC/DAC/SDRAM timing, target synthesis, CDC or real acquisition
is established. Hosted Linux execution and physical promotion need separate
evidence.
