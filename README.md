# Aware

Minimal sufficient context before code.

Aware is a small set of portable workflow skills for AI coding agents.

The main skill is [`skills/aware/SKILL.md`](skills/aware/SKILL.md). It helps an agent understand the relevant parts of a project before investigating, planning, editing, or reviewing code, while avoiding unnecessary token use.

The companion [`skills/aware-screenshot/SKILL.md`](skills/aware-screenshot/SKILL.md) skill captures project-relative local route screenshots for visual review.

## Problem

AI coding agents often fail in two opposite ways:

- They guess too early and edit without enough evidence.
- They inspect too much and turn the repository into noise.

Aware gives the agent a small repeatable workflow for finding the least context needed to act safely.

## What Aware Does

Aware instructs an agent to:

- Read applicable project instructions.
- Locate likely entry points.
- Inspect the smallest useful set of related files, tests, configuration, imports, and callers.
- Pause before deeper tracing and continue only when more evidence is needed.
- Separate verified facts from assumptions.
- Keep output concise without dropping task-critical context.
- Plan the smallest safe change.
- Implement only in the relevant area.
- Run meaningful verification or report why verification could not be run.

## Before and After

Without Aware, an agent may guess likely implementation details, search random files, change unrelated code, or claim behavior it has not verified.

With Aware, an agent should work from inspected evidence, stop gathering context once the next safe move is clear, keep output compact, label uncertainty, and report what was actually verified.

## Skills

- `aware`: minimal sufficient context workflow before code changes.
- `aware-screenshot`: project-relative screenshot capture under `docs/screenshots/{date-time}/`.

## Install

Aware v0.1 is manual-install only.

Copy the desired directory from `skills/` into a skills location supported by your agent. For agents that support repository-local skills, keep this repository available and point the agent at the relevant `SKILL.md`.

This release does not include an installer, CLI, slash commands, registry publishing, MCP integration, or generated agent-specific mirrors.

## Usage

Use natural trigger phrases such as:

```text
use aware
work context-first
investigate this issue
create an implementation plan
review this change
trace this workflow
understand this project before editing
use aware-screenshot to capture route screenshots
```

Aware is most useful when the agent is working in an unfamiliar codebase, investigating a bug, implementing a feature, reviewing a change, or preparing a grounded plan.

For simple syntax questions or isolated snippets with complete context, Aware is usually unnecessary.

## Workflow

The skill guides the agent through this sequence:

```text
Understand request
Find project instructions
Locate likely entry points
Inspect minimal relevant files
Trace relationships only as needed
Pause before deeper tracing
Separate facts from assumptions
Summarize working context
Plan the smallest safe change
Implement
Verify
Report
```

## Supported Agents

Aware is intended for coding agents that can load skill or instruction files, including Codex, Claude Code, Gemini CLI, Cursor, Windsurf, Cline, GitHub Copilot, and similar tools.

Compatibility in v0.1 means the skill text is portable. Agent-specific installers and command integrations are planned for later releases.

## Development

Run the structural test suite with:

```bash
npm test
```

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for development guidelines.
