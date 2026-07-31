const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const skillPath = path.join(root, "skills", "aware", "SKILL.md");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assertFile(relativePath) {
  assert.ok(fs.existsSync(path.join(root, relativePath)), `${relativePath} should exist`);
}

function parseFrontmatter(markdown) {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  assert.ok(match, "SKILL.md should start with YAML-style frontmatter");

  const fields = {};
  for (const line of match[1].split(/\r?\n/)) {
    const field = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (field) {
      fields[field[1]] = field[2].trim();
    }
  }

  return fields;
}

function test(name, fn) {
  try {
    fn();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    throw error;
  }
}

test("required files exist", () => {
  [
    "README.md",
    "LICENSE",
    "AGENTS.md",
    "CONTRIBUTING.md",
    "package.json",
    "skills/aware/SKILL.md",
    "skills/aware/README.md"
  ].forEach(assertFile);
});

test("skill frontmatter is valid", () => {
  const skill = fs.readFileSync(skillPath, "utf8");
  const frontmatter = parseFrontmatter(skill);

  assert.equal(frontmatter.name, "aware");
  assert.ok(frontmatter.description, "description should be present");
});

test("skill contains required sections", () => {
  const skill = fs.readFileSync(skillPath, "utf8");
  const requiredSections = [
    "## Goal",
    "## Trigger Conditions",
    "## Persistence",
    "## Core Workflow",
    "## Context Budget",
    "## Output Discipline",
    "## Project Instructions",
    "## Context Discovery",
    "## Working Context",
    "## Evidence Labels",
    "## Investigation Rules",
    "## Planning Rules",
    "## Implementation Rules",
    "## Verification Rules",
    "## Completion Format",
    "## Boundaries",
    "## Examples"
  ];

  for (const section of requiredSections) {
    assert.ok(skill.includes(section), `SKILL.md should include ${section}`);
  }
});

test("skill documents all evidence labels", () => {
  const skill = fs.readFileSync(skillPath, "utf8");
  ["[Verified]", "[Inference]", "[Unknown]", "[Risk]"].forEach((label) => {
    assert.ok(skill.includes(label), `SKILL.md should document ${label}`);
  });
});

test("skill documents token-conscious context rules", () => {
  const skill = fs.readFileSync(skillPath, "utf8");
  [
    "Use minimal sufficient context.",
    "Stop gathering context when:",
    "Do not continue scanning just because related files exist.",
    "Keep detailed file lists internal",
    "### Discovery Checkpoint",
    "### Deferred Detail",
    "Default visible output budgets:"
  ].forEach((text) => {
    assert.ok(skill.includes(text), `SKILL.md should include token-conscious rule: ${text}`);
  });
});

test("docs do not claim deferred features are available", () => {
  const docs = [
    "README.md",
    "CONTRIBUTING.md",
    "AGENTS.md",
    "skills/aware/README.md"
  ].map(read).join("\n");

  const forbiddenClaims = [
    /\binstall\.sh\b/i,
    /\binstall\.ps1\b/i,
    /\bbin\/install\.js\b/i,
    /\bnpx\s+aware\b/i,
    /\bslash commands are available\b/i,
    /(^|\s)`?\/aware(`?|\s|$)/,
    /\bMCP integration is available\b/i,
    /\bregistry publishing is available\b/i,
    /\bevaluation fixtures are included\b/i
  ];

  for (const pattern of forbiddenClaims) {
    assert.equal(pattern.test(docs), false, `docs should not match unsupported claim ${pattern}`);
  }
});
