# Maintain CIRNET FPGA documentation

[Tiếng Việt](../../vi/contributing/writing-documentation.md) · [Documentation](../index.md) · [Repository policy](../../../fpga/AGENTS.md)

Keep the root README in English and link both indexes. Maintain current pages at matching paths under `docs/en/` and `docs/vi/`. Update each pair together and preserve identifiers, commands, limits and capability claims across languages. FPGA owns RTL, simulation and source packaging. Contracts owns the logical schema, Hardware Service owns the private transport, and Remote owns system integration and release selection. [Scaffold guide](../scaffold.md)

Use one `CHANGELOG_V<major>.md` per released major. Keep Unreleased first and list releases in descending order. Give each version a SemVer heading, a linked contents entry, an evidenced date and its tag target. Distinguish the published archive, a candidate build and the current checkout. [Release changelogs](../../changelogs/README.md)

Keep AI task plans in `.superpowers/plans/` and matching specs, acceptance criteria and checklists in `.superpowers/specs/` at the checkout root. These paths are ignored. Use `- [ ]` for open work and `- [x]` after verification. The [repository policy](../../../fpga/AGENTS.md) stays under `fpga/` to preserve the legacy source packager's root allowlist. Build the [native source candidate](../verification.md#build-the-native-source-candidate) with Node. Use a [clean export](../verification.md#verify-a-clean-export) for the isolated RTL and legacy packaging tests.

Keep dated verification and migration records at their recorded paths and in their source language. Preserve README anchors, approved toolchain and artifact identities, and compatibility references. Before moving a document, trace Markdown, source, test, CI and packaging references. Cite superseded records at fixed Git revisions. [Historical verification](../index.md#history)

Check each affected language pair, link path, case, heading anchor and cross-repository reference. Record the revision, inputs and scope of a verification result. Keep raw evidence in an allocator-owned session outside checkouts, worktrees and Git directories. Update the relevant technical pages and changelog after verification, then review Git diff, status and ignored output. [Verification guide](../verification.md)
