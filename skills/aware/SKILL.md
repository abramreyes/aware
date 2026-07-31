---
name: aware
description: >
  Minimal sufficient context workflow for AI coding agents. Use when working
  on an unfamiliar project, investigating bugs, implementing features,
  planning changes, reviewing code, or when the user asks the agent to
  understand the system before making changes without wasting tokens.
---

Use a minimal sufficient context workflow before making substantial changes.

## Goal

Understand enough of the system to make a grounded change without reading the entire repository, guessing about unseen behavior, or spending unnecessary tokens.

## Trigger Conditions

Use this skill when the user asks to:

- Investigate a bug.
- Understand a system.
- Add or modify existing behavior.
- Review a change.
- Write an implementation plan.
- Trace a workflow.
- Explain unfamiliar code.
- Prepare a technical ticket.
- Work in an unfamiliar repository.

Example trigger phrases include:

```text
use aware
work context-first
understand this project
investigate this issue
trace this workflow
find where this behavior happens
create an implementation plan
fix this bug
review this feature
```

Do not use this skill for simple factual programming questions, isolated snippets with complete context, basic syntax questions, general writing tasks, or non-technical requests.

## Persistence

Apply this workflow throughout the task.

Do not abandon context gathering after the first response. Continue validating assumptions when new evidence appears.

## Core Workflow

1. Understand the requested outcome.
2. Read applicable project instructions.
3. Identify likely entry points.
4. Inspect the smallest directly related file set.
5. Pause at a discovery checkpoint before deeper tracing.
6. Separate verified facts from assumptions.
7. Summarize the working context.
8. Plan the smallest safe change.
9. Implement only after sufficient context exists.
10. Run relevant verification.
11. Report findings, changes, and remaining uncertainty.

## Context Budget

Use minimal sufficient context.

Start from the narrowest relevant evidence. Expand only when current evidence is not enough to answer safely, plan safely, edit safely, or verify honestly.

Stop gathering context when:

- the entry point is known
- the relevant data flow is understood enough for the task
- important risks and unknowns are identified
- the next action or answer is clear

Do not continue scanning just because related files exist.

Match the context budget to the task:

- Orientation: identify the main entry point, key folders, primary flow, and uncertainty. Default to shallow tracing.
- Bug investigation: inspect the exact error path, direct caller or callee, related configuration, and targeted tests.
- Implementation: inspect files needed to make and verify the smallest safe change.
- Review: inspect changed files, nearby contracts, related tests, and risky call paths.
- Small task: read applicable instructions and the target file only unless evidence requires more.

Keep detailed file lists internal unless the user asks for them or they are needed to justify a decision.

### Discovery Checkpoint

After the first relevant entry point and direct relationship are found, decide whether more context is necessary.

Continue only if more context is required to:

- avoid a likely wrong answer
- locate the file that must change
- understand a risky data flow
- verify an API, symbol, command, or test
- resolve a contradiction in the evidence

Otherwise, stop investigating and answer or plan from the current evidence.

### Deferred Detail

For orientation and explanation prompts, defer optional deep slices unless the user asks for them or the task requires them.

Defer by default:

- exhaustive component lists
- full DTO or schema field inventories
- every route in a related module
- all settings or management screens
- every stored procedure branch
- broad trigger or background-job scans
- generated file details

Name the deferred slice briefly only when useful, for example: "I can drill into permissions, database procedures, or alerts next."

## Output Discipline

Use fewer words without losing task continuity.

Prefer concise status, context, plans, and completion reports. Preserve the information needed to continue the work safely:

- the requested outcome
- verified facts
- important inferences
- unresolved unknowns
- meaningful risks
- files or systems involved
- next action or verification state

Avoid restating stable context unless it changed or is needed for a decision. Summarize repeated evidence instead of listing every observation.

For small tasks, use one or two short paragraphs plus verification. For substantial tasks, use compact bullets only where structure improves scanability.

Default visible output budgets:

- Simple answer: 3-6 bullets or one short paragraph.
- Orientation: 5-8 bullets plus optional risks.
- Investigation result: 8-12 bullets, grouped by flow.
- Plan: 5-8 steps.
- Completion: one short paragraph plus verification, unless risks need bullets.

Do not shorten output by removing uncertainty, evidence labels, risks, or verification accuracy.

## Project Instructions

Before substantial work, look for:

- `AGENTS.md`
- `CLAUDE.md`
- `GEMINI.md`
- `README.md`
- `CONTRIBUTING.md`
- architecture documentation
- project-local AI instruction files
- documentation near the files being changed

Follow the most specific applicable instruction. Do not assume root-level instructions are the only instructions.

## Context Discovery

Start with:

- files named by the user
- current file
- changed files
- exact error messages
- symbols mentioned in the task
- routes or commands involved
- related tests
- direct imports
- direct callers
- nearby configuration

Expand only when evidence requires it. Do not scan the entire repository by default. Stop when the next safe answer or action is clear.

## Working Context

Before implementation, establish:

- requested outcome
- current behavior
- relevant components
- relevant files
- affected data flow
- existing conventions
- likely change area
- constraints
- unresolved questions
- intended verification

Keep the summary compact. Do not create a repository encyclopedia. Include only context that helps explain the current task, decision, implementation, or verification.

## Evidence Labels

Use labels when they improve clarity:

- `[Verified]` Supported directly by inspected code, tests, logs, or docs.
- `[Inference]` Strongly suggested by available evidence.
- `[Unknown]` Not established yet.
- `[Risk]` Could cause regression, data loss, security issues, or compatibility issues.

Never present an inference as a verified codebase fact.

## Investigation Rules

- Read exact errors before proposing fixes.
- Find where the relevant behavior begins.
- Trace the behavior across boundaries when necessary.
- Inspect existing tests before designing a fix.
- Compare working and failing paths when both exist.
- Check configuration and environment differences.
- Stop and reassess when evidence contradicts the current theory.
- Stop scanning when enough evidence exists for the requested outcome.
- Prefer one high-signal file over many low-signal related files.
- Do not fabricate files, symbols, dependencies, or APIs.

## Planning Rules

A plan should identify:

- files likely to change
- files that must be inspected
- expected behavior
- implementation sequence
- risks
- verification steps

Plans should be proportional to the task. Do not produce a large architecture plan for a one-line fix.

## Implementation Rules

- Prefer the smallest coherent change.
- Do not modify unrelated code.
- Preserve project conventions.
- Reuse existing abstractions when appropriate.
- Do not introduce new dependencies without justification.
- Keep public behavior backward-compatible unless the task requires otherwise.
- Update tests when behavior changes.
- Do not hide uncertainty behind confident language.

## Verification Rules

Use the narrowest meaningful verification first:

1. Targeted tests
2. Type checking
3. Linting
4. Build
5. Broader test suite

Do not claim verification succeeded unless the command was actually run and passed.

When verification cannot be run, say why.

## Completion Format

Report:

- what was understood
- what changed
- why it changed
- files affected
- verification performed
- remaining risks or unknowns

For simple changes, combine these into a short paragraph when that is clearer than a list.

## Boundaries

Do not:

- read every file without a reason
- produce large context dumps
- over-explain stable context
- list every discovered related file by default
- repeat the same findings
- make unrelated cleanup changes
- assume undocumented behavior
- claim tests passed without running them
- invent project commands
- expose secrets
- modify generated files unless required

## Examples

### Bug Investigation

For "investigate why login times out", first find project instructions, then inspect the relevant route, handler, client call, timeout configuration, and related tests before proposing a fix.

Use evidence labels when summarizing:

```markdown
[Verified] The login client call sets a 10 second timeout.
[Verified] The API route calls the session service before returning.
[Inference] The timeout likely occurs before the response is serialized.
[Unknown] The production gateway timeout has not been inspected.
```

### Implementation Plan

For "create an implementation plan for export filters", inspect the existing export flow, filter model, UI entry point, and relevant tests before naming files or sequencing work.

### Small Task

For a one-file copy change, keep the workflow lightweight: read applicable instructions, inspect the file, make the smallest change, and run the narrowest useful check.
