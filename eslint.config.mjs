import coreWebVitals from "eslint-config-next/core-web-vitals";
import prettier from "eslint-config-prettier";

export default [
  ...coreWebVitals,
  {
    ignores: ["**/*.test.ts"],
  },
  // Disable any ESLint rules that conflict with Prettier formatting (must be last).
  prettier,
];
