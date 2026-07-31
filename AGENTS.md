# Repository Instructions

This repository contains the Aware skill. The primary behavior source is `skills/aware/SKILL.md`.

## Working Rules

- Keep `skills/aware/SKILL.md` as the source of truth for agent behavior.
- Keep documentation aligned with the actual v0.1 surface.
- Do not describe installers, slash commands, registries, CI, evaluation fixtures, or MCP support as available unless those files and tests exist.
- Prefer small, explicit changes over broad rewrites.
- Preserve the repository's lightweight dependency model.

## File Ownership

- `skills/aware/SKILL.md`: normative skill behavior.
- `skills/aware/README.md`: detailed user-facing behavior and examples.
- `README.md`: project overview and manual install/use.
- `CONTRIBUTING.md`: maintainer workflow and test expectations.
- `tests/skill.test.js`: structural validation for the MVP.

## Verification

Run `npm test` after changing skill metadata, required section headings, or documentation claims.

If verification cannot be run, report the reason directly.
