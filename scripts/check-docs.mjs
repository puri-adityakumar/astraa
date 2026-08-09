import { readFile } from "node:fs/promises";
import { dirname, posix, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ROOT = resolve(process.env.ASTRAA_CHECK_DOCS_ROOT ?? SCRIPT_ROOT);
const errors = [];

function report(condition, message) {
  if (!condition) errors.push(message);
}

async function readJson(relativePath) {
  try {
    return JSON.parse(await readFile(resolve(ROOT, relativePath), "utf8"));
  } catch (error) {
    errors.push(`${relativePath} could not be read as JSON: ${formatError(error)}`);
    return {};
  }
}

async function readText(relativePath) {
  try {
    return await readFile(resolve(ROOT, relativePath), "utf8");
  } catch (error) {
    errors.push(`${relativePath} could not be read: ${formatError(error)}`);
    return "";
  }
}

function formatError(error) {
  return error instanceof Error ? error.message : String(error);
}

function duplicateValues(values) {
  const seen = new Set();
  const duplicates = new Set();
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return [...duplicates];
}

export function stripFencedCode(markdown) {
  const lines = markdown.split(/\r?\n/);
  let fence = null;

  return lines
    .map((line) => {
      if (fence) {
        const closing = line.match(/^ {0,3}([`~]+)[ \t]*$/);
        if (closing && closing[1]?.[0] === fence.marker && closing[1].length >= fence.length) {
          fence = null;
        }
        return "";
      }

      const opening = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
      if (!opening) return line;

      const markerRun = opening[1] ?? "";
      const info = opening[2] ?? "";
      if (markerRun.startsWith("`") && info.includes("`")) return line;
      fence = { length: markerRun.length, marker: markerRun[0] };
      return "";
    })
    .join("\n");
}

function normalizeReferenceLabel(label) {
  return label
    .replace(/\\([\\[\]])/g, "$1")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function rangesOverlap(start, end, ranges) {
  return ranges.some(([rangeStart, rangeEnd]) => start < rangeEnd && end > rangeStart);
}

function htmlAnchorLabel(markup) {
  return markup
    .replace(
      /<img\b[^>]*\balt\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))[^>]*>/gi,
      (_match, doubleQuoted, singleQuoted, bare) => doubleQuoted ?? singleQuoted ?? bare ?? "",
    )
    .replace(/<[^>]*>/g, "")
    .trim();
}

export function markdownLinks(markdown) {
  const source = stripFencedCode(markdown);
  const definitions = new Map();
  const definitionPattern =
    /^ {0,3}\[([^\]\r\n]+)\]:[ \t]*(?:<([^>\r\n]+)>|([^\s\r\n]+))(?:[ \t]+(?:"[^"]*"|'[^']*'|\([^)]*\)))?[ \t]*$/gm;
  for (const match of source.matchAll(definitionPattern)) {
    const label = normalizeReferenceLabel(match[1] ?? "");
    const href = (match[2] ?? match[3] ?? "").trim();
    if (label !== "" && !definitions.has(label)) definitions.set(label, href);
  }

  const body = source
    .split(/\r?\n/)
    .map((line) => (line.match(definitionPattern) ? "" : line))
    .join("\n");
  const links = [];
  const consumedRanges = [];

  const inlinePattern =
    /(!?)\[([^\]\r\n]+)\]\([ \t]*(?:<([^>\r\n]+)>|([^\s)\r\n]+))(?:[ \t]+(?:"[^"]*"|'[^']*'|\([^)]*\)))?[ \t]*\)/g;
  for (const match of body.matchAll(inlinePattern)) {
    const start = match.index;
    const end = start + match[0].length;
    consumedRanges.push([start, end]);
    if (match[1] === "!") continue;
    links.push({
      href: (match[3] ?? match[4] ?? "").trim(),
      index: start,
      label: match[2] ?? "",
    });
  }

  const referencePattern = /(!?)\[([^\]\r\n]+)\]\[([^\]\r\n]*)\]/g;
  for (const match of body.matchAll(referencePattern)) {
    const start = match.index;
    const end = start + match[0].length;
    consumedRanges.push([start, end]);
    if (match[1] === "!") continue;

    const referenceLabel = normalizeReferenceLabel(match[3] || match[2] || "");
    const href = definitions.get(referenceLabel);
    if (href !== undefined) {
      links.push({ href, index: start, label: match[2] ?? "" });
    }
  }

  const shortcutPattern = /(!?)\[([^\]\r\n]+)\]/g;
  for (const match of body.matchAll(shortcutPattern)) {
    const start = match.index;
    const end = start + match[0].length;
    if (match[1] === "!" || rangesOverlap(start, end, consumedRanges)) continue;

    const href = definitions.get(normalizeReferenceLabel(match[2] ?? ""));
    if (href !== undefined) {
      links.push({ href, index: start, label: match[2] ?? "" });
    }
  }

  const htmlAnchorPattern =
    /<a\b[^>]*\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))[^>]*>([\s\S]*?)<\/a\s*>/gi;
  for (const match of body.matchAll(htmlAnchorPattern)) {
    links.push({
      href: (match[1] ?? match[2] ?? match[3] ?? "").trim(),
      index: match.index,
      label: htmlAnchorLabel(match[4] ?? ""),
    });
  }

  return links
    .sort((left, right) => left.index - right.index)
    .map(({ href, label }) => ({ href, label }));
}

export function markdownH1s(markdown) {
  return stripFencedCode(markdown).match(/^#\s+\S.*$/gm) ?? [];
}

export function firstIntroductoryParagraph(markdown) {
  const lines = stripFencedCode(markdown).split(/\r?\n/);
  const h1Index = lines.findIndex((line) => /^#\s+\S/.test(line));
  if (h1Index === -1) return "";

  const paragraph = [];
  for (const line of lines.slice(h1Index + 1)) {
    if (line.trim() === "") {
      if (paragraph.length > 0) break;
      continue;
    }
    if (/^(?:#|[-*+]\s|\d+\.\s|```|\|)/.test(line.trim())) break;
    paragraph.push(line.trim());
  }
  return paragraph.join(" ");
}

export function isValidDocsSlug(slug) {
  return typeof slug === "string" && (slug === "" || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug));
}

export function isValidDocsSource(source) {
  return typeof source === "string" && /^docs\/[A-Za-z0-9][A-Za-z0-9._-]*\.md$/.test(source);
}

function validateCatalogShape(documents) {
  report(documents.length > 0, "lib/docs/catalog.json must contain documents.");
  const requiredTextFields = ["route", "sourceKey", "source", "title", "description"];

  for (const [index, document] of documents.entries()) {
    report(typeof document.slug === "string", `Document ${index} is missing slug.`);
    if (typeof document.slug === "string") {
      report(
        isValidDocsSlug(document.slug),
        `Document ${index} slug must be empty or one lowercase kebab-case segment.`,
      );
    }
    for (const field of requiredTextFields) {
      report(
        typeof document[field] === "string" && document[field].trim() !== "",
        `Document ${index} is missing ${field}.`,
      );
    }
    report(Number.isInteger(document.order), `Document ${index} is missing integer order.`);

    if (typeof document.slug === "string" && typeof document.route === "string") {
      const expectedRoute = document.slug === "" ? "/docs" : `/docs/${document.slug}`;
      report(
        document.route === expectedRoute,
        `${document.route} must match slug ${document.slug}.`,
      );
    }
    if (typeof document.source === "string") {
      report(
        isValidDocsSource(document.source),
        `${document.source} must be a direct Markdown source under docs/.`,
      );
    }
  }

  for (const field of ["slug", "route", "sourceKey", "source", "order", "title", "description"]) {
    const values = documents.map((document) => document[field]);
    const duplicates = duplicateValues(values);
    report(duplicates.length === 0, `Duplicate manifest ${field}: ${duplicates.join(", ")}.`);
  }

  const orders = documents.map((document) => document.order);
  report(
    orders.every((order, index) => order === index),
    "Manifest order values must be contiguous and match document order.",
  );
  report(
    documents.filter((document) => document.slug === "" && document.route === "/docs").length === 1,
    "Manifest must contain exactly one /docs overview entry.",
  );
}

async function validateSources(documents) {
  const knownSources = new Set(documents.map((document) => document.source));
  const introductions = [];

  for (const document of documents) {
    if (!isValidDocsSource(document.source)) {
      continue;
    }
    const markdown = await readText(document.source);
    if (markdown === "") continue;

    const h1s = markdownH1s(markdown);
    report(h1s.length === 1, `${document.source} must contain exactly one Markdown H1.`);

    const introduction = firstIntroductoryParagraph(markdown);
    report(
      introduction.length >= 40,
      `${document.source} must start with a distinct introductory description of 40+ characters.`,
    );
    introductions.push(introduction.toLowerCase());

    for (const link of markdownLinks(markdown)) {
      if (/^[a-z][a-z0-9+.-]*:/i.test(link.href) || link.href.startsWith("#")) continue;
      const [pathWithQuery] = link.href.split("#", 1);
      const [rawPath] = (pathWithQuery ?? "").split("?", 1);
      if (!rawPath?.toLowerCase().endsWith(".md")) continue;

      let decodedPath = "";
      try {
        decodedPath = decodeURIComponent(rawPath).replace(/^(?:\.\/)+/, "");
      } catch {
        errors.push(`${document.source} contains an invalid encoded Markdown link: ${link.href}.`);
        continue;
      }
      const segments = decodedPath.split("/");
      if (
        link.href.includes("\\") ||
        segments.some((segment) => segment === "." || segment === "..")
      ) {
        errors.push(`${document.source} contains an out-of-map Markdown link: ${link.href}.`);
        continue;
      }

      const target = posix.normalize(posix.join(posix.dirname(document.source), decodedPath));
      report(
        knownSources.has(target),
        `${document.source} contains unresolved Markdown link ${link.href}.`,
      );
    }
  }

  const duplicateIntroductions = duplicateValues(introductions);
  report(
    duplicateIntroductions.length === 0,
    "Documentation sources must have unique introductory descriptions.",
  );
}

function validateProjectContract(links) {
  report(links.length === 5, "lib/project-links.json must contain five project destinations.");
  for (const field of ["key", "label", "siteHref"]) {
    const values = links.map((link) => link[field]);
    report(
      values.every((value) => typeof value === "string" && value.trim() !== ""),
      `Every project destination must define ${field}.`,
    );
    const duplicates = duplicateValues(values);
    report(duplicates.length === 0, `Duplicate project ${field}: ${duplicates.join(", ")}.`);
  }

  const byKey = new Map(links.map((link) => [link.key, link]));
  const expected = [
    ["docs", "Docs", "/docs", "https://www.astraa.tech/docs", "internal"],
    [
      "roadmap",
      "Roadmap",
      "https://astraa.notion.site/roadmap",
      "https://astraa.notion.site/roadmap",
      "external",
    ],
    [
      "changelog",
      "Changelog",
      "https://astraa.notion.site/changelog",
      "https://astraa.notion.site/changelog",
      "external",
    ],
    [
      "hallOfFame",
      "Hall of Fame",
      "https://astraa.notion.site/documentation",
      "https://astraa.notion.site/documentation",
      "external",
    ],
    ["privacy", "Privacy", "/privacy", null, "internal"],
  ];

  for (const [key, label, siteHref, readmeHref, kind] of expected) {
    const link = byKey.get(key);
    report(Boolean(link), `Missing project destination ${key}.`);
    if (!link) continue;
    report(link.label === label, `${key} must be labelled ${label}.`);
    report(link.siteHref === siteHref, `${label} has the wrong site destination.`);
    report(link.readmeHref === readmeHref, `${label} has the wrong README destination.`);
    report(link.kind === kind, `${label} has the wrong internal/external kind.`);
  }
}

async function validateConsumers(projectLinks) {
  const [footer, readme] = await Promise.all([
    readText("components/footer.tsx"),
    readText("README.md"),
  ]);

  report(
    footer.includes('import { PROJECT_LINKS } from "@/lib/project-links";'),
    "Footer must import the typed project-link contract.",
  );
  report(
    footer.includes('<FooterColumn title="Project" links={PROJECT_LINKS} borderLeft />'),
    "Footer project column must consume PROJECT_LINKS directly.",
  );
  report(
    !footer.includes("astraa.notion.site"),
    "Footer must not duplicate canonical Notion URLs outside the JSON contract.",
  );

  const readmeLinks = markdownLinks(readme);
  for (const link of projectLinks.filter((entry) => entry.readmeHref !== null)) {
    const exactMatches = readmeLinks.filter(
      (candidate) => candidate.label === link.label && candidate.href === link.readmeHref,
    );
    report(
      exactMatches.length === 1,
      `README must contain exactly one [${link.label}](${link.readmeHref}) project link.`,
    );
  }

  for (const link of readmeLinks) {
    const normalizedLabel = link.label.trim().toLowerCase();
    if (normalizedLabel === "docs") {
      report(!link.href.includes("notion.site"), "README Docs must never point to Notion.");
    }
    if (link.href === "https://astraa.notion.site/documentation") {
      report(
        normalizedLabel !== "docs" && normalizedLabel !== "blog",
        "The Hall of Fame destination must never be labelled Docs or Blog.",
      );
    }
    if (normalizedLabel === "roadmap") {
      report(link.href.endsWith("/roadmap"), "README Roadmap and Changelog URLs are swapped.");
    }
    if (normalizedLabel === "changelog") {
      report(link.href.endsWith("/changelog"), "README Roadmap and Changelog URLs are swapped.");
    }
  }
}

async function main() {
  const [catalogJson, projectLinksJson] = await Promise.all([
    readJson("lib/docs/catalog.json"),
    readJson("lib/project-links.json"),
  ]);
  const documents = Array.isArray(catalogJson.documents) ? catalogJson.documents : [];
  const projectLinks = Array.isArray(projectLinksJson.links) ? projectLinksJson.links : [];

  validateCatalogShape(documents);
  await validateSources(documents);
  validateProjectContract(projectLinks);
  await validateConsumers(projectLinks);

  if (errors.length > 0) {
    console.error(`Documentation contract check failed (${errors.length}):`);
    for (const error of errors) console.error(`- ${error}`);
    process.exitCode = 1;
  } else {
    console.log(
      `Documentation contract check passed (${documents.length} sources, ${projectLinks.length} project links).`,
    );
  }
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : "";
if (invokedPath === fileURLToPath(import.meta.url)) await main();
