# Getting started with CIRNET FPGA

English · [Tiếng Việt](../vi/getting-started.md)

[Documentation index](index.md)

The current source builds the `cirnet-fpga-scaffold-0.1.2.tar.gz` source artifact. Its primary modules are `cirnet_experiment_top` and `cirnet_instrument_scaffold`. Legacy wrappers forward to them. The source package includes RTL, tests, scripts and the file inventory needed for provenance checking.

The [system 0.1.4 release lock](https://github.com/cirnetlab/cirnet-remote/blob/38aea6120920f48cea817827ac2277cce4bef25e/integration/release-set.json) selects the published v0.1.2 source archive from `d27c818aca0eb95e9ee8d9b5ba6bda3182909914` by digest. The current checkout can build the same source version from a later revision. The [dated Windows verification](../archive/2026-11-05-fpga-verification.md) records an earlier candidate and its scope. The published [v0.1.1 archive](https://github.com/cirnetlab/cirnet-fpga/releases/tag/v0.1.1) keeps its recorded provenance.

| Version domain | Current value |
| --- | --- |
| FPGA source artifact | `0.1.2` |
| Contracts wheel selected for verification | `cirnet-contracts==0.1.2` |
| Logical control envelope | `1.0-scaffold` |
| Conceptual register map | `1.0-reserved` |
| Physical firmware and protocol | `UNAVAILABLE` |

The Contracts design-target example retains the illustrative `2.0-scaffold` label. The executable control schema rejects that label. Select the logical envelope by its own version and use the reviewed Contracts wheel and allocator digests.

Start with the [scaffold boundaries](scaffold.md) and run the [verification steps](verification.md). The repository supplies a control simulation and disabled instrument interfaces. Board programming, real transport framing, acquisition and electrical readiness require separate hardware design and evidence.
