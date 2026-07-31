# Repository Instructions

This repository contains Aware skills. The primary behavior sources are the `SKILL.md` files under `skills/`.

## Working Rules

- Keep each `skills/*/SKILL.md` file as the source of truth for that skill's behavior.
- Keep documentation aligned with the actual v0.1 surface.
- Do not describe installers, slash commands, registries, CI, evaluation fixtures, or MCP support as available unless those files and tests exist.
- Prefer small, explicit changes over broad rewrites.
- Preserve the repository's lightweight dependency model.

## File Ownership

- `skills/aware/SKILL.md`: normative context workflow behavior.
- `skills/aware/README.md`: detailed user-facing behavior and examples.
- `skills/aware-screenshot/SKILL.md`: normative screenshot workflow behavior.
- `docs/screenshot-workflow.md`: detailed user-facing screenshot workflow reference.
- `README.md`: project overview and manual install/use.
- `CONTRIBUTING.md`: maintainer workflow and test expectations.
- `tests/skill.test.js`: structural validation for the MVP.

## Verification

Run `npm test` after changing skill metadata, required section headings, or documentation claims.

If verification cannot be run, report the reason directly.
