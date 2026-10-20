// @tempo-owned: tailwind-v3-host-config
import type { Config } from "tailwindcss";
import userConfig from "../tailwind.config";

// Tempo-owned Tailwind v3 config for the canvas host. Inherits the app's theme,
// brand tokens and plugins, then rewrites `content` for the host: Tailwind v3
// resolves relative content globs against the build cwd (tempo/), so the app's
// own globs are rebased from the app config's directory and the canvas-source
// globs are appended.
const appContent = Array.isArray((userConfig as Config).content)
  ? ((userConfig as Config).content as unknown[])
  : [];
const rebasedAppContent = appContent
  .filter((glob): glob is string => typeof glob === "string")
  .map((glob) => {
    const negation = glob.startsWith("!") ? "!" : "";
    const body = negation ? glob.slice(1) : glob;
    if (body.startsWith("/")) return glob;
    return `${negation}../${body.replace(/^\.\//, "")}`;
  });

const config: Config = {
  ...(userConfig as Config),
  content: [
    ...rebasedAppContent,
    "../app/**/*.{ts,tsx,js,jsx,mdx}",
    "../components/**/*.{ts,tsx,js,jsx,mdx}",
    "../lib/**/*.{ts,tsx,js,jsx,mdx}",
    "./designs/**/*.{ts,tsx,js,jsx,mdx}",
    "./app/**/*.{ts,tsx,js,jsx,mdx}",
    "./components/**/*.{ts,tsx,js,jsx,mdx}",
  ],
};

export default config;
