// Pure helpers for scripts/check-file-size.mjs. Kept free of I/O so they can be unit tested.

/** Files above this many tokens are rejected. Tokens are estimated as bytes / 4. */
export const MAX_TOKENS = 5000;
export const BYTES_PER_TOKEN = 4;

/**
 * Files nobody writes by hand: lockfiles, codegen output, vendored or minified code,
 * snapshots and binary assets. A path matching any of these is never size checked.
 */
export const IGNORED = [
  /(^|\/)(pnpm-lock\.yaml|package-lock\.json|npm-shrinkwrap\.json|yarn\.lock|bun\.lockb?)$/,
  /(^|\/)src\/shared\/api\/schema\.d\.ts$/,
  /(^|\/)openapi\/openapi\.json$/,
  /(^|\/)public\/mockServiceWorker\.js$/,
  /\.(min\.(js|css)|map|snap|lock)$/,
  /\.(png|jpe?g|gif|webp|avif|ico|svgz?|woff2?|ttf|otf|eot|pdf|zip|gz|mp[34]|webm)$/i,
  /(^|\/)(dist|coverage|node_modules|playwright-report|test-results)\//,
];

export function isIgnored(path) {
  return IGNORED.some((pattern) => pattern.test(path));
}

export function estimateTokens(bytes) {
  return Math.ceil(bytes / BYTES_PER_TOKEN);
}

/** Returns the oversized entries of `files` ({ path, bytes }), largest first. */
export function findOversized(files, maxTokens = MAX_TOKENS) {
  return files
    .filter(({ path }) => !isIgnored(path))
    .map(({ path, bytes }) => ({ path, bytes, tokens: estimateTokens(bytes) }))
    .filter(({ tokens }) => tokens > maxTokens)
    .sort((a, b) => b.tokens - a.tokens);
}

/** Splitting advice for one file. Tailored to the repo's structure rules (AGENTS.md). */
function adviceFor(path) {
  if (/\.test\.tsx?$/.test(path)) {
    return [
      "Split by behaviour: one `<name>.<behaviour>.test.ts(x)` per `describe` block, next to the code under test.",
      "Move shared fixtures and builders to `src/test/` and import them.",
    ];
  }
  if (/\.(tsx|jsx)$/.test(path)) {
    return [
      "Move logic out of the component into hooks (`use<Thing>.ts`) next to it.",
      "Extract each self-contained part of the JSX into its own component file in the same `components/` folder.",
      "Keep the original file as a thin composition of those parts; re-export through the folder's `index.ts` only if the public API must stay the same.",
    ];
  }
  if (/translations\.ts$/.test(path)) {
    return [
      "Split by feature: one `src/i18n/<feature>.ts` per domain, each exporting `da` first and `en` typed against it.",
      "Merge them in `translations.ts`.",
    ];
  }
  if (/\.(ts|mjs|js)$/.test(path)) {
    return [
      "Group functions by responsibility and move each group to its own module (`<name>.<responsibility>.ts`).",
      "Move types to `types.ts` and constants to `constants.ts` in the same folder.",
      "Keep the original file as the entry point that re-exports the public API.",
    ];
  }
  return [
    "Split the file by top-level section into several smaller files and link them from an index.",
    "For docs, move each `##` section to its own file under `docs/` and link them from the original.",
  ];
}

export function formatReport(oversized, maxTokens = MAX_TOKENS) {
  const lines = [
    `Commit blocked: ${oversized.length} staged file(s) exceed ${maxTokens} tokens (tokens = bytes / ${BYTES_PER_TOKEN}).`,
    "Large files are expensive for agents to read and edit, and they hide unrelated changes in one diff.",
    "",
  ];

  for (const { path, bytes, tokens } of oversized) {
    // Aim for ~80% of the limit per file so the pieces have room to grow.
    const parts = Math.ceil(tokens / (maxTokens * 0.8));
    lines.push(
      `${path}: ~${tokens} tokens (${bytes} bytes), limit ${maxTokens}.`,
      `  Split it into ${parts} files of about ${Math.ceil(tokens / parts)} tokens each:`,
      ...adviceFor(path).map((step) => `  - ${step}`),
      "",
    );
  }

  lines.push(
    "How to split, in order:",
    "  1. Pick the seams. One responsibility per file; name each file after what it does, not 'part2'.",
    "  2. Move code verbatim. Do not rewrite it while moving it, so the diff stays reviewable.",
    "  3. Fix imports. Features import only through their own `index.ts`; never across features.",
    "  4. Stage the new files (`git add <new files>`) together with the shortened original.",
    "  5. Run `vp check` and `vp test`, then commit again.",
    "",
    "Do not bypass with --no-verify and do not shorten the file by deleting meaningful code.",
    "If a file is generated or a lockfile, add its path to IGNORED in scripts/file-size-lib.mjs instead.",
  );
  return lines.join("\n");
}
