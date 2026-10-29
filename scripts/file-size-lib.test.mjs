import { describe, expect, it } from "vite-plus/test";

import { estimateTokens, findOversized, formatReport, isIgnored } from "./file-size-lib.mjs";

describe("estimateTokens", () => {
  it("is bytes / 4, rounded up", () => {
    expect(estimateTokens(20000)).toBe(5000);
    expect(estimateTokens(20001)).toBe(5001);
  });
});

describe("isIgnored", () => {
  it.each([
    "pnpm-lock.yaml",
    "packages/app/yarn.lock",
    "src/shared/api/schema.d.ts",
    "openapi/openapi.json",
    "public/mockServiceWorker.js",
    "public/logo.png",
    "dist/assets/index.js",
  ])("skips %s", (path) => {
    expect(isIgnored(path)).toBe(true);
  });

  it.each(["src/app/App.tsx", "docs/ARCHITECTURE.md", "src/shared/api/client.ts"])(
    "checks %s",
    (path) => {
      expect(isIgnored(path)).toBe(false);
    },
  );
});

describe("findOversized", () => {
  it("allows exactly 5000 tokens and rejects one more", () => {
    const files = [
      { path: "src/a.ts", bytes: 20000 },
      { path: "src/b.ts", bytes: 20001 },
    ];
    expect(findOversized(files).map((f) => f.path)).toEqual(["src/b.ts"]);
  });

  it("ignores generated files however large, and sorts largest first", () => {
    const files = [
      { path: "pnpm-lock.yaml", bytes: 900000 },
      { path: "src/small.ts", bytes: 30000 },
      { path: "src/big.ts", bytes: 90000 },
    ];
    expect(findOversized(files).map((f) => f.path)).toEqual(["src/big.ts", "src/small.ts"]);
  });
});

describe("formatReport", () => {
  it("names the file, its size and concrete split steps", () => {
    const report = formatReport(findOversized([{ path: "src/Big.tsx", bytes: 48000 }]));
    expect(report).toContain("src/Big.tsx: ~12000 tokens");
    expect(report).toContain("into 3 files");
    expect(report).toContain("hooks");
    expect(report).toContain("IGNORED");
  });

  it("gives test-specific advice for test files", () => {
    const report = formatReport(findOversized([{ path: "src/a.test.ts", bytes: 40000 }]));
    expect(report).toContain("describe");
  });
});
