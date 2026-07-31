# Contributing

Aware is currently a lightweight skill repository. The v0.1 goal is to keep the skills useful, portable, and honest about what is implemented.

## Development Workflow

1. Read `AGENTS.md` and the files you plan to change.
2. Treat each `skills/*/SKILL.md` file as the behavior source of truth for that skill.
3. Keep documentation scoped to the implemented MVP.
4. Add or update tests when changing required structure or public claims.
5. Run `npm test` before submitting changes.

## File Ownership

`skills/aware/SKILL.md` defines the context workflow. `skills/aware-screenshot/SKILL.md` defines the screenshot workflow. Avoid scattering behavioral rules across many files unless a later release adds a generator or synchronization process.

`skills/aware/README.md` explains the skill for users. It can include examples, but it should not introduce requirements that are absent from `SKILL.md`.

`docs/screenshot-workflow.md` explains the screenshot workflow for users. It should stay aligned with `skills/aware-screenshot/SKILL.md`.

Root documentation explains the project and maintainer workflow. It should not claim future features are available.

## Test Expectations

The MVP test suite is intentionally small and uses plain Node.js. It validates:

- Skill file existence.
- Required skill frontmatter.
- Required section headings.
- Required documentation files.
- Absence of unsupported v0.1 claims.

Broader behavior fixtures, installer tests, command tests, and CI can be added in later milestones.

## Unsupported Features in v0.1

Do not add documentation that presents these as already available:

- CLI installer or package binary.
- Slash-command files.
- Registry publishing.
- MCP integration.
- CI release automation.
- Evaluation fixtures.
