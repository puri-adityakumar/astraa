import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: [
      "app/**/*.test.ts",
      "components/**/*.test.ts",
      "hooks/**/*.test.ts",
      "lib/**/*.test.ts",
    ],
  },
  resolve: {
    alias: {
      "@": projectRoot,
    },
  },
});
