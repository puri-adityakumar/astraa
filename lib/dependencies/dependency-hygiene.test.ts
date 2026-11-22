import { describe, expect, it } from "vitest";
import { existsSync, readdirSync, readFileSync, statSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = fileURLToPath(new URL("../..", import.meta.url));

function repoFile(relativePath: string): string {
  return readFileSync(path.join(ROOT, relativePath), "utf8");
}

/** Runtime packages that are consumed without an import statement in our source. */
const NON_IMPORTED_DEPENDENCIES = new Set([
  // SWC fallback binary resolved internally by Next.js, never imported by user code.
  "@next/swc-wasm-nodejs",
  // React renderer required by the Next.js runtime itself; user code never imports it.
  "react-dom",
]);

/** Build tooling and type packages that must live in devDependencies. */
const BUILD_TOOLING = [
  "autoprefixer",
  "eslint",
  "eslint-config-next",
  "postcss",
  "tailwindcss",
  "tailwindcss-animate",
  "@eslint/eslintrc",
  "@tailwindcss/typography",
  "@types/js-yaml",
  "@types/node",
  "@types/papaparse",
  "@types/react",
  "@types/react-dom",
  "@types/three",
  "@vitejs/plugin-react",
  "typescript",
  "vitest",
];

/** Dependencies removed by issue #106 (dead or only used by deleted ui components). */
const REMOVED_DEPENDENCIES = [
  "@hookform/resolvers",
  "@radix-ui/react-accordion",
  "@radix-ui/react-aspect-ratio",
  "@radix-ui/react-collapsible",
  "@radix-ui/react-context-menu",
  "@radix-ui/react-hover-card",
  "@radix-ui/react-menubar",
  "@radix-ui/react-navigation-menu",
  "@radix-ui/react-progress",
  "@radix-ui/react-radio-group",
  "@radix-ui/react-scroll-area",
  "@radix-ui/react-separator",
  "@radix-ui/react-toggle",
  "@radix-ui/react-toggle-group",
  "embla-carousel-react",
  "focus-trap-react",
  "input-otp",
  "react-day-picker",
  "react-hook-form",
  "react-resizable-panels",
  "recharts",
  "sonner",
  "vaul",
];

interface Pkg {
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
}

function sourceFiles(): string[] {
  const files: string[] = [];
  const visit = (dir: string): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "node_modules") continue;
        visit(full);
        continue;
      }
      if ([".ts", ".tsx", ".js", ".mjs", ".jsx"].includes(path.extname(entry.name))) {
        files.push(full);
      }
    }
  };
  visit(path.join(ROOT, "app"));
  visit(path.join(ROOT, "components"));
  visit(path.join(ROOT, "lib"));
  visit(path.join(ROOT, "hooks"));
  const rootEntries = [
    "proxy.ts",
    "instrumentation.ts",
    "instrumentation-client.ts",
    "next.config.js",
  ];
  for (const root of rootEntries) {
    const full = path.join(ROOT, root);
    if (existsSync(full)) files.push(full);
  }
  return files;
}

function importedSpecs(file: string): string[] {
  const source = readFileSync(file, "utf8");
  const pattern = /(?:from\s+|import\s*\(\s*|require\(|import\s+)["']([^"']+)["']/g;
  const specs: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(source))) {
    if (match[1]) specs.push(match[1]);
  }
  return specs;
}

function packageName(specifier: string): string {
  if (specifier.startsWith("@")) return specifier.split("/").slice(0, 2).join("/");
  return specifier.split("/")[0] ?? specifier;
}

function resolveLocal(fromFile: string, specifier: string): string | null {
  let base: string | null = null;
  if (specifier.startsWith("@/")) {
    base = specifier.slice(2);
  } else if (specifier.startsWith(".")) {
    base = path.relative(ROOT, path.resolve(path.dirname(fromFile), specifier));
  }
  if (!base) return null;
  const candidates = [
    base,
    `${base}.tsx`,
    `${base}.ts`,
    `${base}.jsx`,
    `${base}.js`,
    path.join(base, "index.tsx"),
    path.join(base, "index.ts"),
    path.join(base, "index.js"),
  ];
  for (const candidate of candidates) {
    const full = path.join(ROOT, candidate);
    if (existsSync(full) && statSync(full).isFile()) return candidate;
  }
  return null;
}

describe("dependency hygiene (issue #106)", () => {
  const pkg = JSON.parse(repoFile("package.json")) as Pkg;

  it("keeps build tooling and type packages out of runtime dependencies", () => {
    for (const name of BUILD_TOOLING) {
      expect(pkg.dependencies[name], `${name} must not be a runtime dependency`).toBeUndefined();
      expect(pkg.devDependencies[name], `${name} should be a devDependency`).toBeTruthy();
    }
  });

  it("does not resurrect removed dead or orphaned dependencies", () => {
    for (const name of REMOVED_DEPENDENCIES) {
      expect(pkg.dependencies[name], `${name} was removed by issue #106`).toBeUndefined();
      expect(pkg.devDependencies[name], `${name} was removed by issue #106`).toBeUndefined();
    }
  });

  it("imports every runtime dependency from source", () => {
    const imported = new Set<string>();
    for (const file of sourceFiles()) {
      for (const specifier of importedSpecs(file)) {
        imported.add(packageName(specifier));
      }
    }
    const missing = Object.keys(pkg.dependencies)
      .filter((name) => !NON_IMPORTED_DEPENDENCIES.has(name) && !imported.has(name));
    expect(
      missing,
      `runtime dependencies with no source import (delete them or move to devDependencies)`,
    ).toEqual([]);
  });

  it("keeps every ui component reachable from a route entry point", () => {
    const uiDir = path.join(ROOT, "components/ui");
    const uiFiles = readdirSync(uiDir)
      .filter((name) => /\.(tsx|ts)$/.test(name))
      .map((name) => path.join("components/ui", name));

    const reachable = new Set<string>();
    const stack = sourceFiles()
      .map((file) => path.relative(ROOT, file))
      .filter((file) => file.startsWith("app/") || file === "proxy.ts");
    while (stack.length > 0) {
      const file = stack.pop();
      if (!file || reachable.has(file)) continue;
      reachable.add(file);
      for (const specifier of importedSpecs(path.join(ROOT, file))) {
        const resolved = resolveLocal(file, specifier);
        if (resolved && !reachable.has(resolved)) stack.push(resolved);
      }
    }

    const unreachable = uiFiles.filter((file) => !reachable.has(file));
    expect(
      unreachable,
      "unreachable ui components (delete them or wire them into a route)",
    ).toEqual([]);
  });
});
