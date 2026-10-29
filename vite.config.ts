import { fileURLToPath } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, lazyPlugins } from "vite-plus";

import { lintRules } from "./lint/rules";

export default defineConfig({
  plugins: lazyPlugins(() => [react(), tailwindcss()]),
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  staged: {
    "*": "vp check --fix",
  },
  fmt: {
    ignorePatterns: ["src/shared/api/schema.d.ts", "pnpm-lock.yaml"],
  },
  lint: {
    // Rules only run for plugins listed here. "react" carries rules-of-hooks,
    // exhaustive-deps and the React Compiler rules, so do not remove it.
    plugins: ["typescript", "unicorn", "oxc", "react"],
    // Opt in per project. Install @tanstack/eslint-plugin-query first, then add:
    //   plugins: [..., "jsx-a11y"]                  accessibility rules (native)
    //   jsPlugins: [{ name: "tanstack-query", specifier: "@tanstack/eslint-plugin-query" }]
    //   rules: { "tanstack-query/exhaustive-deps": "error", "tanstack-query/stable-query-client": "error" }
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: { ...lintRules, "vite-plus/prefer-vite-plus-imports": "error" },
    ignorePatterns: ["src/shared/api/schema.d.ts", "playwright-report/**", "test-results/**"],
    options: { typeAware: true, typeCheck: true },
  },
  run: {
    tasks: {
      "gen:api": {
        command: "node scripts/gen-api.mjs",
        cache: {
          env: ["OPENAPI_SPEC"],
          input: ["openapi/**", "scripts/gen-api.mjs"],
          output: ["src/shared/api/schema.d.ts"],
        },
      },
    },
  },
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}", "scripts/**/*.test.mjs", "lint/**/*.test.ts"],
    setupFiles: ["./src/test/setup.ts"],
  },
});
