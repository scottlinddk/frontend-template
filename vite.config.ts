import { fileURLToPath } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, lazyPlugins } from "vite-plus";

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
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: { "vite-plus/prefer-vite-plus-imports": "error" },
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
    include: ["src/**/*.test.{ts,tsx}", "scripts/**/*.test.mjs"],
    setupFiles: ["./src/test/setup.ts"],
  },
});
