import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  appendFileSync,
  cpSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { afterEach, describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import {
  firstIntroductoryParagraph,
  isValidDocsSlug,
  isValidDocsSource,
  markdownH1s,
  markdownLinks,
} from "./check-docs.mjs";

const REPOSITORY_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CHECK_SCRIPT = resolve(REPOSITORY_ROOT, "scripts/check-docs.mjs");
const fixtureRoots = new Set();

afterEach(() => {
  for (const root of fixtureRoots) rmSync(root, { force: true, recursive: true });
  fixtureRoots.clear();
});

function createContractFixture() {
  const root = mkdtempSync(join(tmpdir(), "astraa-docs-contract-"));
  fixtureRoots.add(root);

  for (const relativePath of [
    "README.md",
    "components/footer.tsx",
    "docs",
    "lib/docs/catalog.json",
    "lib/project-links.json",
  ]) {
    const destination = resolve(root, relativePath);
    mkdirSync(dirname(destination), { recursive: true });
    cpSync(resolve(REPOSITORY_ROOT, relativePath), destination, { recursive: true });
  }

  return root;
}

function runContractCheck(root) {
  try {
    const output = execFileSync(process.execPath, [CHECK_SCRIPT], {
      cwd: REPOSITORY_ROOT,
      encoding: "utf8",
      env: { ...process.env, ASTRAA_CHECK_DOCS_ROOT: root },
      stdio: ["ignore", "pipe", "pipe"],
    });
    return { output, status: 0 };
  } catch (error) {
    return {
      output: `${error.stdout ?? ""}${error.stderr ?? ""}`,
      status: typeof error.status === "number" ? error.status : 1,
    };
  }
}

describe("Markdown contract parsing", () => {
  it("resolves angle-wrapped, normalized reference, collapsed, and shortcut links", () => {
    const markdown = [
      "[Angle](<./ANGLE.md>)",
      "[Reference][ missing   GUIDE ]",
      "[Collapsed][]",
      "[Shortcut]",
      "",
      "[Missing Guide]: <./REFERENCE.md>",
      "[collapsed]: ./COLLAPSED.md",
      "[shortcut]: ./SHORTCUT.md",
    ].join("\n");

    assert.deepEqual(markdownLinks(markdown), [
      { href: "./ANGLE.md", label: "Angle" },
      { href: "./REFERENCE.md", label: "Reference" },
      { href: "./COLLAPSED.md", label: "Collapsed" },
      { href: "./SHORTCUT.md", label: "Shortcut" },
    ]);
  });

  it("reads HTML anchor text and image alt labels used by README badges", () => {
    assert.deepEqual(
      markdownLinks('<a href="https://astraa.notion.site/documentation"><img alt="Docs" /></a>'),
      [{ href: "https://astraa.notion.site/documentation", label: "Docs" }],
    );
  });

  it("ignores headings, links, and definitions inside fenced code", () => {
    const markdown = [
      "~~~markdown",
      "# Fake heading",
      "[Broken][fake]",
      "[fake]: ./MISSING.md",
      "~~~",
      "# Real heading",
      "",
      "This real introductory paragraph is comfortably longer than forty characters.",
      "",
      "[Architecture](./ARCHITECTURE.md)",
    ].join("\n");

    assert.deepEqual(markdownH1s(markdown), ["# Real heading"]);
    assert.equal(
      firstIntroductoryParagraph(markdown),
      "This real introductory paragraph is comfortably longer than forty characters.",
    );
    assert.deepEqual(markdownLinks(markdown), [
      { href: "./ARCHITECTURE.md", label: "Architecture" },
    ]);
  });
});

describe("documentation manifest path validation", () => {
  for (const slug of ["", "architecture", "server-interfaces", "api2"]) {
    it(`accepts safe slug ${JSON.stringify(slug)}`, () =>
      assert.equal(isValidDocsSlug(slug), true));
  }

  for (const slug of [
    "../privacy",
    "a/b",
    "%2e%2e",
    "architecture?raw=1",
    "architecture#section",
    "Architecture",
    "two--segments",
  ]) {
    it(`rejects unsafe slug ${slug}`, () => assert.equal(isValidDocsSlug(slug), false));
  }

  for (const source of ["docs/API.md", "docs/server-interfaces.md"]) {
    it(`accepts direct source ${source}`, () => assert.equal(isValidDocsSource(source), true));
  }

  for (const source of [
    "docs/nested/API.md",
    "docs\\API.md",
    "docs/API\\nested.md",
    "docs/../API.md",
    "docs/API.md?raw=1",
    "docs/API.md#section",
  ]) {
    it(`rejects non-direct source ${source}`, () => assert.equal(isValidDocsSource(source), false));
  }
});

describe("documentation contract corruption fixtures", () => {
  it("rejects a broken reference-style Markdown link with normalized labels", () => {
    const root = createContractFixture();
    appendFileSync(
      resolve(root, "docs/README.md"),
      "\n\n[Broken guide][ missing   guide ]\n\n[Missing Guide]: <./MISSING.md>\n",
    );

    const result = runContractCheck(root);
    assert.equal(result.status, 1);
    assert.match(result.output, /unresolved Markdown link \.\/MISSING\.md/);
  });

  it("rejects a broken angle-wrapped Markdown destination", () => {
    const root = createContractFixture();
    appendFileSync(resolve(root, "docs/README.md"), "\n\n[Broken](<./MISSING.md>)\n");

    const result = runContractCheck(root);
    assert.equal(result.status, 1);
    assert.match(result.output, /unresolved Markdown link \.\/MISSING\.md/);
  });

  for (const forbiddenLabel of ["Docs", "Blog"]) {
    it(`rejects Hall of Fame relabelled ${forbiddenLabel} through a reference`, () => {
      const root = createContractFixture();
      const readmePath = resolve(root, "README.md");
      const readme = readFileSync(readmePath, "utf8").replace(
        "[Hall of Fame](https://astraa.notion.site/documentation)",
        `[${forbiddenLabel}][hall destination]\n\n[Hall   Destination]: <https://astraa.notion.site/documentation>`,
      );
      writeFileSync(readmePath, readme);

      const result = runContractCheck(root);
      assert.equal(result.status, 1);
      assert.match(result.output, /must never be labelled Docs or Blog/);
    });
  }

  it("passes when fake H1 and broken links exist only inside fenced code", () => {
    const root = createContractFixture();
    appendFileSync(
      resolve(root, "docs/README.md"),
      "\n\n```markdown\n# Fake heading\n[Broken][fake]\n[fake]: ./MISSING.md\n```\n",
    );

    const result = runContractCheck(root);
    assert.equal(result.status, 0, result.output);
    assert.match(result.output, /Documentation contract check passed/);
  });
});
