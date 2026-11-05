# Controller and instrument scaffold

English · [Tiếng Việt](../vi/scaffold.md)

[Documentation index](index.md)

The EP4CE6E22C8N prototype target has no external SDRAM. In simulation, the controller moves through SAFE → SCANNING → SCANNED → PREPARED → ROUTED → POWERED → ARMED → RUNNING. A successful scan indicates readiness of the observation step. Electrical safety and topology correctness remain separate checks.

Reset enters SAFE with drive, routing and experiment clock disabled. The simulated controller requires a safe plan, route readiness, protection and an armed watchdog before enabling drive. These permits remain live. A fault or watchdog assertion immediately inhibits outputs and latches FAULT. Reset after clearance invalidates the old scan and plan. The experiment clock uses abstract control ticks. See the [controller specification](../../fpga/experiment-controller/README.md).

The EP4CE10E22C8N target with external SDRAM reserves interfaces for Logic Analyzer, Scope 2CH, Generator 2CH, SDRAM Arbiter, Trigger, Timestamp and CDC. Availability, capture validity, generator enable and SDRAM request remain false. The domain clock ports do not establish any board frequency. See the [instrument interface](../../fpga/instrument/README.md).

Before enabling a physical target, obtain the board schematic, pin assignments, electrical limits, selected ADC/DAC and SDRAM, timing constraints, clock and reset plan, and measured protection and acquisition results. These inputs remain `TBD_BY_HARDWARE_DESIGN`. The [constraints guide](../../fpga/constraints/README.md) and [Quartus notes](../../fpga/quartus/README.md) describe the missing target inputs. The Hardware Service owns the private transport boundary. Serial and USB-SPI adapters depend on real hardware selection.
