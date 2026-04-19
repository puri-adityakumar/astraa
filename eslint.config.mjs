import nextConfig from "eslint-config-next";
import coreWebVitals from "eslint-config-next/core-web-vitals";

export default [
  ...nextConfig,
  ...coreWebVitals,
  {
    ignores: ["**/*.test.ts"],
  },
];
