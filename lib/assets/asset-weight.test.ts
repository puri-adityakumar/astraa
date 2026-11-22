import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, statSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = fileURLToPath(new URL("../..", import.meta.url));

function repoFile(relativePath: string): string {
  return readFileSync(path.join(ROOT, relativePath), "utf8");
}

function byteSize(relativePath: string): number {
  return statSync(path.join(ROOT, relativePath)).size;
}

/** The file must exist on disk and stay under the given size budget. */
function expectWithinBudget(relativePath: string, maxBytes: number): void {
  expect(existsSync(path.join(ROOT, relativePath)), `${relativePath} should exist`).toBe(true);
  expect(byteSize(relativePath), `${relativePath} should stay under budget`).toBeLessThanOrEqual(
    maxBytes,
  );
}

const FAVICON_FILES = [
  "public/assets/astraa_icon_32.png",
  "public/assets/astraa_icon_180.png",
  "public/assets/astraa_icon_192.png",
  "public/assets/astraa_icon_512.png",
];

const PLEX_FONT_FILES = [
  "public/fonts/ibm-plex-mono-latin-400.woff2",
  "public/fonts/ibm-plex-mono-latin-500.woff2",
];

const MAX_ICON_BYTES = 150 * 1024;
const MAX_FONT_BYTES = 50 * 1024;

describe("asset weight budget (issue #107)", () => {
  it("serves a sized favicon set instead of the 400 KB source image", () => {
    for (const file of FAVICON_FILES) {
      expectWithinBudget(file, MAX_ICON_BYTES);
    }
    expect(existsSync(path.join(ROOT, "public/assets/astraa_pfp.png"))).toBe(false);
  });

  it("keeps the repo banner out of the served public assets", () => {
    expect(existsSync(path.join(ROOT, "public/assets/astraa.jpg"))).toBe(false);
    expect(existsSync(path.join(ROOT, ".github/assets/astraa.jpg"))).toBe(true);
  });

  it("points the manifest and metadata at the sized icon set", () => {
    const manifest = JSON.parse(repoFile("public/manifest.json")) as {
      icons: Array<{ src: string; sizes: string; purpose: string }>;
    };
    for (const icon of manifest.icons) {
      expect(existsSync(path.join(ROOT, `public${icon.src}`)), `${icon.src} should exist`).toBe(
        true,
      );
    }
    const maskable = manifest.icons.find((icon) => icon.purpose === "maskable");
    expect(maskable?.sizes).toBe("512x512");

    const layout = repoFile("app/layout.tsx");
    expect(layout).toMatch(/astraa_icon_32\.png/);
    expect(layout).toMatch(/astraa_icon_180\.png/);
    expect(layout).toMatch(/astraa_icon_192\.png/);
    expect(layout).not.toMatch(/astraa_pfp\.png/);
  });

  it("no longer ships IBM Plex Mono from the root layout", () => {
    const layout = repoFile("app/layout.tsx");
    expect(layout).not.toMatch(/IBM_Plex_Mono/);
    expect(layout).not.toMatch(/font-ibm-plex-mono/);

    const globals = repoFile("app/globals.css");
    expect(globals).toMatch(/ibm-plex-mono-latin-400\.woff2/);
    expect(globals).toMatch(/ibm-plex-mono-latin-500\.woff2/);
    for (const file of PLEX_FONT_FILES) {
      expectWithinBudget(file, MAX_FONT_BYTES);
    }

    const editor = repoFile("components/markdown/editor.tsx");
    expect(editor).toMatch(/'IBM Plex Mono'/);
    expect(editor).not.toMatch(/font-ibm-plex-mono/);
  });

  it("ships Funnel Display as a subsetted woff2", () => {
    const woff2 = "public/fonts/FunnelDisplay-SemiBold.woff2";
    expectWithinBudget(woff2, MAX_FONT_BYTES);
    expect(existsSync(path.join(ROOT, "public/fonts/FunnelDisplay-SemiBold.ttf"))).toBe(false);

    const globals = repoFile("app/globals.css");
    expect(globals).toMatch(/FunnelDisplay-SemiBold\.woff2/);
    expect(globals).not.toMatch(/FunnelDisplay-SemiBold\.ttf/);
  });
});
