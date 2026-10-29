// Pre-commit check: rejects staged files above MAX_TOKENS (bytes / 4). See scripts/file-size-lib.mjs.
import { execFileSync } from "node:child_process";

import { findOversized, formatReport } from "./file-size-lib.mjs";

const git = (args) => execFileSync("git", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });

// Added, copied, modified and renamed files only. Deleted files have nothing to measure.
const paths = git(["diff", "--cached", "--name-only", "--diff-filter=ACMR", "-z"])
  .split("\0")
  .filter(Boolean);

// Measure the staged blob (`:path`), not the working tree, so unstaged edits cannot hide a large file.
const files = paths.map((path) => ({ path, bytes: Number(git(["cat-file", "-s", `:${path}`])) }));

const oversized = findOversized(files);
if (oversized.length > 0) {
  console.error(formatReport(oversized));
  process.exit(1);
}
