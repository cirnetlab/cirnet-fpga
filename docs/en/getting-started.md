# Getting started with CIRNET FPGA

English · [Tiếng Việt](../vi/getting-started.md)

[Documentation index](index.md)

The current source builds the `cirnet-fpga-scaffold-0.1.2.tar.gz` source artifact. Its primary modules are `cirnet_experiment_top` and `cirnet_instrument_scaffold`. Legacy wrappers forward to them. The source package includes RTL, tests, scripts and the file inventory needed for provenance checking.

| Version domain | Current value |
| --- | --- |
| FPGA source artifact | `0.1.2` |
| Contracts wheel selected for verification | `cirnet-contracts==0.1.2` |
| Logical control envelope | `1.0-scaffold` |
| Conceptual register map | `1.0-reserved` |
| Physical firmware and protocol | `UNAVAILABLE` |

The Contracts design-target example retains the illustrative `2.0-scaffold` label. The executable control schema rejects that label. Select the logical envelope by its own version and use the reviewed Contracts wheel and allocator digests.

Start with the [scaffold boundaries](scaffold.md) and run the [verification steps](verification.md). The repository supplies a control simulation and disabled instrument interfaces. Board programming, real transport framing, acquisition and electrical readiness require separate hardware design and evidence.
