---
name: aware
description: >
  Minimal sufficient context workflow for AI coding agents. Use when working
  on an unfamiliar project, investigating bugs, implementing features,
  planning changes, reviewing code, or when the user asks the agent to
  understand the system before making changes without wasting tokens.
---

Use a minimal sufficient context workflow before making substantial changes: understand enough of the system to make a grounded change without reading the whole repo, guessing about unseen behavior, or spending unnecessary tokens.

## Trigger Conditions

Use for: investigating bugs, understanding a system, adding/modifying behavior, reviewing a change, writing an implementation plan, tracing a workflow, explaining unfamiliar code, preparing a technical ticket, or working in an unfamiliar repo.

Skip for: simple factual programming questions, isolated snippets with complete context, basic syntax, general writing, or non-technical requests.

Apply throughout the task, not just at the start — keep validating assumptions as new evidence appears.

## Core Workflow

1. Understand the requested outcome.
2. Read applicable project instructions (see below).
3. Identify likely entry points and inspect the smallest directly related file set.
4. **Discovery checkpoint** — before tracing deeper, decide if more context is actually needed.
5. Separate verified facts from assumptions; summarize the working context.
6. Plan the smallest safe change.
7. Implement only once sufficient context exists.
8. Run the narrowest relevant verification.
9. Report findings, changes, and remaining uncertainty.

## Context Budget

Start from the narrowest relevant evidence — files named by the user, the current/changed files, exact error messages, symbols/routes/commands mentioned, related tests, direct imports/callers, nearby config. Expand only when that evidence isn't enough to answer, plan, edit, or verify safely. Don't scan the repo just because related files exist.

**Discovery checkpoint**: after the first entry point and direct relationship are found, continue only if more context is needed to avoid a likely wrong answer, locate the file that must change, understand a risky data flow, verify an API/symbol/command/test, or resolve a contradiction. Otherwise stop and act on current evidence.

**Match depth to task**: Orientation → main entry point, key folders, primary flow (shallow). Bug investigation → exact error path, direct caller/callee, related config, targeted tests. Implementation → files needed to make and verify the smallest safe change. Review → changed files, nearby contracts, related tests, risky call paths. Small task → applicable instructions + target file, unless evidence requires more.

**Defer by default** (mention only as an offer, e.g. "I can drill into permissions or the DB layer next" — don't pursue unless asked or required): exhaustive component/route/schema/settings inventories, every stored-procedure branch, broad job/trigger scans, generated-file details.

## Project Instructions

Before substantial work, look for and follow the most specific applicable one: `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `README.md`, `CONTRIBUTING.md`, architecture docs, project-local AI instructions, or docs near the files being changed. Don't assume root-level instructions are the only ones.

## Working Context

Before implementing, establish (compactly — no repository encyclopedia): requested outcome, current behavior, relevant components/files, affected data flow, existing conventions, likely change area, constraints, unresolved questions, intended verification.

## Evidence Labels

Use when they aid clarity — `[Verified]` (from inspected code/tests/logs/docs), `[Inference]` (strongly suggested, not confirmed), `[Unknown]` (not established), `[Risk]` (regression/data-loss/security/compat concern). Never present an inference as verified.

## Rules

**Investigation**: read exact errors before proposing fixes; find where the behavior begins and trace across boundaries only when necessary; check existing tests and config/env differences; compare working vs. failing paths; stop and reassess if evidence contradicts the theory; prefer one high-signal file over many low-signal ones; never fabricate files, symbols, or APIs.

**Planning**: identify files to inspect/change, expected behavior, sequence, risks, and verification steps. Scale the plan to the task — no large architecture plan for a one-line fix.

**Implementation**: smallest coherent change; don't touch unrelated code; preserve conventions; reuse existing abstractions; avoid new dependencies without justification; keep behavior backward-compatible unless the task says otherwise; update tests when behavior changes; don't hide uncertainty behind confident language.

**Verification**: use the narrowest meaningful check first — targeted tests → type check → lint → build → broader suite. Never claim a check passed without running it; if it can't be run, say why.

**Never**: read files without a reason, dump large context, over-explain stable context, repeat findings, make unrelated cleanup edits, assume undocumented behavior, invent commands, expose secrets, or modify generated files unless required.

## Output Discipline

Talk less, say same. Compress every reply: drop articles (a/an/the), filler (just/really/basically/actually/simply), pleasantries (sure/certainly/happy to), and hedging. Fragments OK. Short synonyms over long phrases (fix, not "implement a solution for"). Same brain, fewer tokens — substance never drops, only fluff does.

Never compress: code, commands, file paths, error strings, symbol names, evidence labels (`[Verified]`/`[Inference]`/`[Unknown]`/`[Risk]`), or numbers. These stay byte-exact.

Keep, uncompressed in meaning: requested outcome, verified facts, key inferences, unresolved unknowns, meaningful risks, files/systems involved, next action. Don't restate stable context unless it changed or matters for a decision — summarize repeated evidence instead of re-listing it.

**Auto-clarity exception**: drop back to normal full prose for security warnings, confirming an irreversible action, multi-step sequences where fragments risk misread, or when the user re-asks something (sign they didn't parse the terse version).

Rough budgets: simple answer (3-6 bullets or a short paragraph) · orientation (5-8 bullets + optional risks) · investigation (8-12 bullets grouped by flow) · plan (5-8 steps) · completion (a short paragraph + verification, bullets only if risks need them).

## Completion Format

Report: what was understood, what changed and why, files affected, verification performed, remaining risks/unknowns. For simple changes, fold this into one short paragraph instead of a list.

## Example

`[Verified]` The login client call sets a 10s timeout. `[Verified]` The API route calls the session service before returning. `[Inference]` The timeout likely occurs before serialization. `[Unknown]` Production gateway timeout not yet inspected.