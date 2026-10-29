// @vitest-environment node
import { execFileSync } from "node:child_process";
import { copyFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vite-plus/test";

const root = fileURLToPath(new URL("..", import.meta.url));
const fixture = fileURLToPath(new URL("./fixtures/violations.tsx.txt", import.meta.url));

// If someone drops a plugin from lint.plugins, its rules go silent without any
// error, and nothing else would notice. This lints a file full of violations
// with the project's real config and checks the important rules still report.
const expected = [
  "react-hooks(rules-of-hooks)",
  "react-hooks(exhaustive-deps)",
  "react(set-state-in-effect)",
  "react(purity)",
  "typescript(no-explicit-any)",
  "typescript(ban-ts-comment)",
  "eslint(no-empty)",
  "eslint(no-prototype-builtins)",
  "eslint(no-case-declarations)",
  "eslint(no-debugger)",
];

function lintCodes() {
  const dir = mkdtempSync(join(tmpdir(), "lint-fixture-"));
  const file = join(dir, "violations.tsx");
  copyFileSync(fixture, file);
  try {
    let output: string;
    try {
      output = execFileSync("vp", ["lint", "--format=json", file], { cwd: root, encoding: "utf8" });
    } catch (error) {
      // Lint exits non-zero when it finds errors, which is expected here.
      output = (error as { stdout?: string }).stdout ?? "";
    }
    const report = JSON.parse(output) as { diagnostics: { code: string }[] };
    return new Set(report.diagnostics.map((diagnostic) => diagnostic.code));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

describe("lint rules", () => {
  it("report the violations in the fixture", () => {
    const codes = lintCodes();
    const missing = expected.filter((code) => !codes.has(code));
    expect(missing).toEqual([]);
  });
});
