import { spawnSync } from "node:child_process";
import {
  existsSync,
  lstatSync,
  readFileSync,
  readdirSync,
  readlinkSync,
  realpathSync,
} from "node:fs";
import path from "node:path";

const REPO_ROOT = process.cwd();
const SKILLS_ROOT = path.join(REPO_ROOT, ".agents", "skills");
const CLAUDE_SKILLS_ROOT = path.join(REPO_ROOT, ".claude", "skills");
const REGISTRY_START = "<!-- ASTRAA_SKILLS_START -->";
const REGISTRY_END = "<!-- ASTRAA_SKILLS_END -->";

const SKILLS = [
  {
    name: "astraa-architecture",
    files: ["SKILL.md", "agents/openai.yaml"],
  },
  {
    name: "astraa-code-quality",
    files: ["SKILL.md", "agents/openai.yaml", "references/review-checklist.md"],
  },
  {
    name: "astraa-feature-workflow",
    files: ["SKILL.md", "agents/openai.yaml", "references/feature-contract.md"],
  },
];

const errors = [];
const descriptions = new Map();

function addError(message) {
  errors.push(message);
}

function sameMembers(actual, expected) {
  return (
    actual.length === expected.length && actual.every((value, index) => value === expected[index])
  );
}

function runGit(args) {
  const result = spawnSync("git", args, {
    cwd: REPO_ROOT,
    encoding: "utf8",
  });

  if (result.error) {
    addError(`Unable to run git ${args.join(" ")}: ${result.error.message}`);
  }

  return result;
}

function repoPath(...segments) {
  return segments.join("/");
}

function absolutePath(repoRelativePath) {
  return path.join(REPO_ROOT, ...repoRelativePath.split("/"));
}

function listPrefixedEntries(directory) {
  if (!existsSync(directory)) {
    addError(`Missing directory: ${path.relative(REPO_ROOT, directory)}`);
    return [];
  }

  return readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.name.startsWith("astraa-"))
    .map((entry) => entry.name)
    .sort();
}

function listFiles(directory, prefix = "") {
  const files = [];

  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
    const entryPath = path.join(directory, entry.name);

    if (entry.isSymbolicLink()) {
      addError(`Canonical skill content must not be a symlink: ${entryPath}`);
      continue;
    }

    if (entry.isDirectory()) {
      files.push(...listFiles(entryPath, relativePath));
    } else if (entry.isFile()) {
      files.push(relativePath);
    } else {
      addError(`Unsupported canonical skill entry: ${entryPath}`);
    }
  }

  return files.sort();
}

function listExistingPaths(directory, repoRelativeDirectory) {
  const paths = [];

  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const repoRelativePath = repoPath(repoRelativeDirectory, entry.name);
    paths.push(repoRelativePath);

    if (entry.isDirectory()) {
      paths.push(...listExistingPaths(path.join(directory, entry.name), repoRelativePath));
    }
  }

  return paths;
}

function listNonAstraaPaths(directory, repoRelativeDirectory) {
  if (!existsSync(directory)) {
    return [];
  }

  const paths = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.name.startsWith("astraa-")) {
      continue;
    }

    const repoRelativePath = repoPath(repoRelativeDirectory, entry.name);
    paths.push(repoRelativePath);
    if (entry.isDirectory()) {
      paths.push(...listExistingPaths(path.join(directory, entry.name), repoRelativePath));
    }
  }

  return paths.sort();
}

function parseFrontmatter(skillName, source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]+)$/);

  if (!match) {
    addError(`${skillName}/SKILL.md must contain frontmatter and a nonempty body`);
    return null;
  }

  const fields = new Map();
  const frontmatter = match[1];

  for (const line of frontmatter.split(/\r?\n/)) {
    const fieldMatch = line.match(/^([a-z][a-z0-9_-]*):\s*(.+)$/);

    if (!fieldMatch) {
      addError(`${skillName}/SKILL.md has unsupported frontmatter: ${line}`);
      continue;
    }

    const [, key, rawValue] = fieldMatch;
    const value = rawValue.replace(/^(["'])(.*)\1$/, "$2").trim();
    fields.set(key, value);
  }

  const keys = [...fields.keys()].sort();
  if (!sameMembers(keys, ["description", "name"])) {
    addError(`${skillName}/SKILL.md frontmatter must contain only name and description`);
  }

  if (fields.get("name") !== skillName) {
    addError(`${skillName}/SKILL.md name must match its folder`);
  }

  const description = fields.get("description") ?? "";
  if (!description || description.includes("TODO")) {
    addError(`${skillName}/SKILL.md must contain a nonempty description`);
  }

  return description;
}

function validateOpenAiMetadata(skillName, source) {
  const displayName = source.match(/^  display_name: "([^"]+)"$/m)?.[1] ?? "";
  const shortDescription = source.match(/^  short_description: "([^"]+)"$/m)?.[1] ?? "";
  const defaultPrompt = source.match(/^  default_prompt: "([^"]+)"$/m)?.[1] ?? "";

  if (!/^interface:\r?$/m.test(source)) {
    addError(`${skillName}/agents/openai.yaml must contain an interface block`);
  }
  if (!displayName) {
    addError(`${skillName}/agents/openai.yaml must contain a quoted display_name`);
  }
  if (shortDescription.length < 25 || shortDescription.length > 64) {
    addError(`${skillName}/agents/openai.yaml short_description must be 25-64 characters`);
  }
  if (!defaultPrompt.includes(`$${skillName}`)) {
    addError(`${skillName}/agents/openai.yaml default_prompt must mention $${skillName}`);
  }
}

function extractRegistry(fileName) {
  const source = readFileSync(absolutePath(fileName), "utf8");
  const startCount = source.split(REGISTRY_START).length - 1;
  const endCount = source.split(REGISTRY_END).length - 1;

  if (startCount !== 1 || endCount !== 1) {
    addError(`${fileName} must contain exactly one repository-skill registry block`);
    return "";
  }

  const startIndex = source.indexOf(REGISTRY_START);
  const endIndex = source.indexOf(REGISTRY_END, startIndex);
  if (endIndex < startIndex) {
    addError(`${fileName} registry markers are out of order`);
    return "";
  }

  return source.slice(startIndex, endIndex + REGISTRY_END.length);
}

function parseRegistry(block, fileName) {
  const entries = [];
  let currentEntry = null;
  let collectingTrigger = false;

  for (const line of block.split(/\r?\n/)) {
    const heading = line.match(/^- \*\*`([^`]+)`\*\*$/);
    if (heading) {
      if (currentEntry) {
        entries.push(currentEntry);
      }
      currentEntry = { name: heading[1], path: "", trigger: "" };
      collectingTrigger = false;
      continue;
    }

    if (!currentEntry) {
      continue;
    }

    const pathMatch = line.match(/^  - Path: `([^`]+)`$/);
    if (pathMatch) {
      currentEntry.path = pathMatch[1];
      collectingTrigger = false;
      continue;
    }

    const triggerMatch = line.match(/^  - Trigger: (.+)$/);
    if (triggerMatch) {
      currentEntry.trigger = triggerMatch[1];
      collectingTrigger = true;
      continue;
    }

    if (collectingTrigger && /^    \S/.test(line)) {
      currentEntry.trigger += ` ${line.trim()}`;
    }
  }

  if (currentEntry) {
    entries.push(currentEntry);
  }

  const names = entries.map((entry) => entry.name).sort();
  const expectedNames = SKILLS.map((skill) => skill.name).sort();
  if (!sameMembers(names, expectedNames)) {
    addError(`${fileName} registry must list exactly the three configured skills once`);
  }

  for (const entry of entries) {
    const expectedPath = `.agents/skills/${entry.name}/SKILL.md`;
    if (entry.path !== expectedPath) {
      addError(`${fileName} has an invalid registry path for ${entry.name}`);
    }
    if (entry.trigger !== descriptions.get(entry.name)) {
      addError(`${fileName} trigger must match ${entry.name}/SKILL.md description exactly`);
    }
  }
}

const expectedSkillNames = SKILLS.map((skill) => skill.name).sort();
const actualSkillNames = listPrefixedEntries(SKILLS_ROOT);
if (!sameMembers(actualSkillNames, expectedSkillNames)) {
  addError(".agents/skills must contain exactly the configured astraa-* skill folders");
}

const expectedRepoFiles = [];
for (const skill of SKILLS) {
  const skillDirectory = path.join(SKILLS_ROOT, skill.name);

  if (!existsSync(skillDirectory) || !lstatSync(skillDirectory).isDirectory()) {
    addError(`Canonical skill must be a directory: .agents/skills/${skill.name}`);
    continue;
  }

  const actualFiles = listFiles(skillDirectory);
  const expectedFiles = [...skill.files].sort();
  if (!sameMembers(actualFiles, expectedFiles)) {
    addError(`${skill.name} contains missing or unexpected files`);
  }

  for (const relativeFile of skill.files) {
    const repoRelativePath = repoPath(".agents", "skills", skill.name, relativeFile);
    expectedRepoFiles.push(repoRelativePath);
    if (!existsSync(absolutePath(repoRelativePath))) {
      addError(`Missing canonical skill file: ${repoRelativePath}`);
    }
  }

  const skillFile = path.join(skillDirectory, "SKILL.md");
  if (existsSync(skillFile)) {
    const description = parseFrontmatter(skill.name, readFileSync(skillFile, "utf8"));
    if (description) {
      descriptions.set(skill.name, description);
    }
  }

  const metadataFile = path.join(skillDirectory, "agents", "openai.yaml");
  if (existsSync(metadataFile)) {
    validateOpenAiMetadata(skill.name, readFileSync(metadataFile, "utf8"));
  }
}

const actualClaudeNames = listPrefixedEntries(CLAUDE_SKILLS_ROOT);
if (!sameMembers(actualClaudeNames, expectedSkillNames)) {
  addError(".claude/skills must contain exactly the configured astraa-* entries");
}

for (const skill of SKILLS) {
  const claudeRepoPath = repoPath(".claude", "skills", skill.name);
  const claudePath = absolutePath(claudeRepoPath);
  const expectedLink = `../../.agents/skills/${skill.name}`;
  expectedRepoFiles.push(claudeRepoPath);

  if (!existsSync(claudePath)) {
    addError(`Claude skill link does not resolve: ${claudeRepoPath}`);
    continue;
  }
  if (!lstatSync(claudePath).isSymbolicLink()) {
    addError(`Claude skill entry must be a symlink: ${claudeRepoPath}`);
    continue;
  }

  const linkValue = readlinkSync(claudePath);
  if (path.isAbsolute(linkValue) || linkValue !== expectedLink) {
    addError(`${claudeRepoPath} must be the expected relative symlink`);
  }

  const canonicalPath = path.join(SKILLS_ROOT, skill.name);
  if (realpathSync(claudePath) !== realpathSync(canonicalPath)) {
    addError(`${claudeRepoPath} must resolve to its canonical .agents skill`);
  }
}

const agentsRegistry = extractRegistry("AGENTS.md");
const claudeRegistry = extractRegistry("CLAUDE.md");
if (agentsRegistry && claudeRegistry && agentsRegistry !== claudeRegistry) {
  addError("AGENTS.md and CLAUDE.md registry blocks must be byte-identical");
}
if (agentsRegistry) {
  parseRegistry(agentsRegistry, "AGENTS.md");
}
if (claudeRegistry) {
  parseRegistry(claudeRegistry, "CLAUDE.md");
}

for (const repoRelativePath of expectedRepoFiles) {
  const ignoreResult = runGit(["check-ignore", "--no-index", "-q", repoRelativePath]);
  if (ignoreResult.status === 0) {
    addError(`Repository-owned skill path is ignored: ${repoRelativePath}`);
  } else if (ignoreResult.status !== 1) {
    addError(`Unable to determine ignore status for ${repoRelativePath}`);
  }
}

const ignoredLocalPaths = new Set([
  ".agent/local-skill/SKILL.md",
  ".agents/skills/local-skill/SKILL.md",
  ".claude/skills/local-skill",
  ...listNonAstraaPaths(SKILLS_ROOT, ".agents/skills"),
  ...listNonAstraaPaths(CLAUDE_SKILLS_ROOT, ".claude/skills"),
]);
for (const ignoredProbe of [...ignoredLocalPaths].sort()) {
  const ignoreResult = runGit(["check-ignore", "--no-index", "-q", ignoredProbe]);
  if (ignoreResult.status !== 0) {
    addError(`Local agent path must remain ignored: ${ignoredProbe}`);
  }
}

const trackedResult = runGit(["ls-files", "-z", "--", ".agents/skills", ".claude/skills"]);
if (trackedResult.status !== 0) {
  addError("Unable to list tracked repository skill paths");
}
const trackedFiles = new Set((trackedResult.stdout ?? "").split("\0").filter(Boolean));
const expectedTrackedFiles = new Set(expectedRepoFiles);
for (const trackedFile of trackedFiles) {
  if (!expectedTrackedFiles.has(trackedFile)) {
    addError(`Tracked repository skill path is outside the exact allowlist: ${trackedFile}`);
  }
}

for (const repoRelativePath of expectedRepoFiles) {
  if (process.env.CI === "true" && !trackedFiles.has(repoRelativePath)) {
    addError(`CI requires the repository skill path to be tracked: ${repoRelativePath}`);
    continue;
  }

  if (!trackedFiles.has(repoRelativePath)) {
    const statusResult = runGit([
      "status",
      "--short",
      "--untracked-files=all",
      "--",
      repoRelativePath,
    ]);
    if (statusResult.status !== 0 || !statusResult.stdout.trim()) {
      addError(`Untracked repository skill path is not visible to git status: ${repoRelativePath}`);
    }
  }
}

if (errors.length > 0) {
  console.error("Repository skill validation failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exitCode = 1;
} else {
  console.log(
    `Repository skills valid: ${SKILLS.length} canonical skills, ` +
      `${SKILLS.length} Claude symlinks, identical registries.`,
  );
}
