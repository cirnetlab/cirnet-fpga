# CIRNET FPGA changelog for major version 0

[Changelog index](README.md) · [English documentation](../en/index.md) · [Tài liệu tiếng Việt](../vi/index.md)

## Contents

- [Unreleased](#unreleased)
- [v0.1.2](#v012)
- [v0.1.1](#v011)

## Unreleased

### Changed

- CI records the toolchain and both RTL behavior markers from the required pytest execution. [CI change](https://github.com/cirnetlab/cirnet-fpga/commit/c4bf5f04df063aa417ab1e22c65bca680305e4dd)
- Added versioned release notes, bilingual documentation conventions and a clean-export procedure for local package verification. [Documentation conventions](../en/contributing/writing-documentation.md) · [Verification guide](../en/verification.md)

## v0.1.2

Published **2026-11-05** at `15:58:39 +07:00`. Lightweight tag target `d27c818aca0eb95e9ee8d9b5ba6bda3182909914`. Remote 0.1.4 selects `cirnet-fpga-scaffold-0.1.2.tar.gz`, asset `712736504`, SHA-256 `b7e866324fe3562c03bb6adec2750dd0880102e772101a388cf7064e1c479c82`. [GitHub release](https://github.com/cirnetlab/cirnet-fpga/releases/tag/v0.1.2) · [Tagged source](https://github.com/cirnetlab/cirnet-fpga/tree/d27c818aca0eb95e9ee8d9b5ba6bda3182909914) · [Remote release lock](https://github.com/cirnetlab/cirnet-remote/blob/38aea6120920f48cea817827ac2277cce4bef25e/integration/release-set.json)

### Changed

- Adopted the CIRNET source archive and the `cirnet_experiment_top` and `cirnet_instrument_scaffold` module names. Retained legacy wrappers, environment aliases and the toolchain marker reader. [Tagged compatibility notes](https://github.com/cirnetlab/cirnet-fpga/blob/d27c818aca0eb95e9ee8d9b5ba6bda3182909914/docs/NAMESPACE.md)
- Selected Contracts 0.1.2 and the independently pinned CIRNET DEV allocator. CI moved to Node 26 and Python 3.14. The logical envelope remains `1.0-scaffold`, the conceptual register map remains `1.0-reserved` and physical firmware and protocol remain `UNAVAILABLE`. [Tagged FPGA guide](https://github.com/cirnetlab/cirnet-fpga/blob/d27c818aca0eb95e9ee8d9b5ba6bda3182909914/README.md)

### Fixed

- Synchronized allocator outputs across canonical and legacy settings so explicit output remains separate from the inherited active session. [Allocator change](https://github.com/cirnetlab/cirnet-fpga/commit/b18b6ae0fc27f94ad3d5535922dda71b5df085d2)

## v0.1.1

Published **2026-10-28** at `22:51:41 +07:00`. Annotated tag target `24ade35eade5382efd42f784008280c0fbb768c3`. Remote 0.1.1 selected `netcircuit-fpga-scaffold-0.1.1.tar.gz`, asset `684944031`, SHA-256 `b82edb4167b821f55d98331304d0c49d2f37638d972fc9c167287bb6368908ca`. [GitHub release](https://github.com/cirnetlab/cirnet-fpga/releases/tag/v0.1.1) · [Tagged source](https://github.com/cirnetlab/cirnet-fpga/tree/24ade35eade5382efd42f784008280c0fbb768c3) · [Remote release lock](https://github.com/cirnetlab/cirnet-remote/blob/065179ead7c7cf4f44483b74edca99bb84f8f2a5/integration/release-set.json)

### Added

- Published the standalone Lab-First controller and disabled instrument interface as a deterministic source scaffold, with pinned Contracts 0.1.1, allocator and RTL toolchain inputs. The behavioral gate requires both simulation markers. Physical firmware and protocol remain `UNAVAILABLE`. [Tagged FPGA guide](https://github.com/cirnetlab/cirnet-fpga/blob/24ade35eade5382efd42f784008280c0fbb768c3/README.md) · [M6 work record](../en/history/m6-release-work.md)
