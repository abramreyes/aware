# Aware Skill

Aware is a minimal sufficient context workflow for AI coding agents. The behavior source of truth is [`SKILL.md`](SKILL.md).

## When to Use

Use Aware when asking an agent to work in an unfamiliar project, investigate a bug, implement or modify behavior, review code, trace a workflow, explain unfamiliar code, or create an implementation plan.

Example activations:

```text
use aware to investigate this issue
work context-first and create an implementation plan
review this change with aware
trace where this behavior starts
understand this project before editing
```

Aware is usually unnecessary for isolated snippets with complete context, basic syntax questions, or general writing tasks.

## Expected Behavior

The agent should:

- Read applicable project instructions before substantial work.
- Start from named files, errors, symbols, routes, commands, tests, and direct relationships.
- Expand context only when evidence requires it and stop when the next safe answer or action is clear.
- Distinguish verified facts from assumptions.
- Use fewer words while preserving facts, assumptions, risks, and verification state.
- Make the smallest coherent change.
- Verify with targeted commands when possible.
- Report remaining risks or unknowns honestly.

## Evidence Labels

Aware uses four labels when they improve clarity:

- `[Verified]` for facts supported by inspected code, tests, logs, or docs.
- `[Inference]` for conclusions strongly suggested by available evidence.
- `[Unknown]` for information not established yet.
- `[Risk]` for possible regressions, data loss, security issues, or compatibility concerns.

## Expected Output Style

Aware should keep visible context compact. It should not produce a repository encyclopedia, repeat findings, or restate stable context unless it changed or is needed for a decision.

Concise output must still preserve:

- the requested outcome
- verified facts
- important inferences
- unresolved unknowns
- meaningful risks
- files or systems involved
- next action or verification state

For substantial tasks, an agent may show a short working context before planning:

```markdown
## Working Context

[Verified] The failing behavior starts in the checkout route.
[Verified] The payment client is wrapped by a retry helper.
[Inference] The duplicate charge risk is in retry handling, not request parsing.
[Unknown] The provider idempotency behavior has not been confirmed.
```

Completion reports should cover what was understood, what changed, why it changed, affected files, verification performed, and remaining uncertainty. For simple changes, one short paragraph plus verification is enough.

## Context Budget

Aware should gather the least context needed to work safely:

- Orientation: main entry point, key folders, primary flow, uncertainty. Default to shallow tracing.
- Bug investigation: exact error path, direct caller or callee, related config, targeted tests.
- Implementation: files needed for the smallest safe change and verification.
- Review: changed files, nearby contracts, related tests, risky call paths.
- Small task: applicable instructions and the target file unless evidence requires more.

Detailed file lists should stay out of the visible response unless the user asks for them or they justify a decision.

After finding the first relevant entry point and direct relationship, Aware should pause and continue only when more context is needed to avoid a wrong answer, locate the change area, understand risk, verify a contract, or resolve contradictory evidence.

For orientation prompts, Aware should defer optional deep slices such as full DTO fields, every route in a module, settings screens, stored procedure branches, broad trigger scans, and generated files. It can offer those slices as follow-up options instead.

## Manual Installation

Aware v0.1 is manual-install only. Copy the `skills/aware` directory into a skills location supported by your agent, or point your agent at `skills/aware/SKILL.md` when repository-local skill loading is available.

This skill does not currently ship slash commands, an installer, a package binary, registry metadata, or MCP integration.
