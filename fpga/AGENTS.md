# CIRNET FPGA repository work

- Write each AI task's plan only in `.superpowers/plans/` and its matching spec, acceptance criteria and checklist only in `.superpowers/specs/` at the checkout root.
- Use `- [ ]` for open items and `- [x]` after verified completion. Update the affected [English](../docs/en/index.md) and [Vietnamese](../docs/vi/index.md) docs and the applicable [changelog](../docs/changelogs/README.md).
- Verify against selected Contracts and the [verification guide](../docs/en/verification.md). Preserve both RTL markers, toolchain and artifact identities, compatibility aliases and dated evidence.
- Scope RTL results to simulated behavior. Keep physical firmware and protocol `UNAVAILABLE` until separate board-specific evidence qualifies them.
- Use the pinned shared DEV allocator for raw verification output outside every checkout, worktree and Git directory from the first write. Inspect it and clean only the owned session.
- Review Git diff, status and ignored outputs. Stage, commit or push only on request.
