# CIRNET source names and compatibility

New source archives identify `cirnet-fpga-scaffold`. The primary RTL modules are
`cirnet_experiment_top` and `cirnet_instrument_scaffold`. Thin legacy module
wrappers forward every port to those implementations. The original behavioral
bench exercises the canonical modules; the unchanged permit-matrix assertions
exercise legacy wrapper forwarding.

`CIRNET_*` settings override `NETCIRCUIT_*`; allocator/bootstrap adapters export
both spellings for pinned older DEV tooling. The pinned DEV wheel, Node digest
and published Contracts artifact identities remain unchanged. Consumers accept
the explicit canonical or old Contracts wheel identity and verify its selected
SHA256, version, ownership and installed resources. DEV resource selection comes
from the exact pinned distribution, supporting either module namespace.

New toolchain provenance uses `.cirnet-toolchain.json`; verification reads the
old marker when the canonical marker is absent. Toolchain version, archive and
complete execution-closure hash requirements remain unchanged.

Legacy names remain only in historical repository aliases/provenance and release
evidence, immutable dependency locks, compatibility wrappers/readers/environment
aliases and tests covering those paths. Original provenance inputs and LICENSE
are unchanged. No physical capability, protocol version or electrical assertion
changes with the source names.


## 2026-11-04 verification

The uncommitted candidate is based on
`0023a0a9725639feac1b7784a517d20b2a6c48d1`. A fresh external Python environment
installs the exact hash-locked verification closure, pyslang 12.0.0, canonical
Contracts 0.1.1 and the unchanged pinned DEV wheel; pip check passes. The official
604,483,111-byte Windows toolchain archive matches the pinned SHA256
`8d0467cbd6d2c8fb41e99d3cd8a727109b8a3f08a9161c33a11ae6e731b998e3`.
The installer verifies the toolchain, and the mandatory gate authenticates its
execution closure, elaborates all sources, compiles both tops, and observes both
`LAB_FIRST_RTL_PASS` and `PERMIT_MATRIX_RTL_PASS`. All 22 tests pass in 38.89s,
including deterministic source archive rebuilds and both distribution identities.
Actionlint 1.7.12 passes the current workflow.

The restricted sandbox initially produced a silent compiler nonzero; identical
native execution passes without changing RTL assertions or tool pins. Earlier
runs against Remote's older Contracts 1.0.1 interpreter are failed environment
evidence, superseded by the fresh exact environment. This verifies software/RTL
scaffold behavior and does not establish physical hardware availability.

Raw evidence remains in the owning six-repository external session's `fpga`
child. Native gate log SHA256
`40296aadbbfd24749792d0d8b93e900289d5a30118906b2707bb825b13f8f9b8`;
complete native pytest log
`3b746eaace80eaf4b95a6e02d97cf679c33a322f3defadc2ac2cd3f5d42b39b6`.
