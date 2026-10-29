// Pure helpers for scripts/init.mjs. Kept free of I/O so they can be unit tested.

/**
 * Removes the parts of `source` that belong to removed adapters.
 *
 *   foo(); // @adapter msal              single line, dropped if msal is removed
 *   // @adapter-start clerk ... -end     block, dropped if clerk is removed
 *
 * Markers of kept adapters are stripped so no tags are left behind.
 */
export function stripAdapters(source, removed) {
  const out = [];
  let block = null;

  for (const line of source.split("\n")) {
    const start = line.match(/@adapter-start (\w+)/);
    if (start) {
      block = start[1];
      continue;
    }
    if (/@adapter-end \w+/.test(line)) {
      block = null;
      continue;
    }
    if (block && removed.has(block)) continue;

    const tagged = line.match(/\s*(?:\/\/|#)\s*@adapter (\w+)\s*$/);
    if (tagged) {
      if (removed.has(tagged[1])) continue;
      out.push(line.slice(0, tagged.index));
      continue;
    }
    out.push(line);
  }
  return out.join("\n");
}

/** Removes `@template-start` ... `@template-end` blocks (parts that only make sense in the template repo). */
export function stripTemplateOnly(source) {
  const out = [];
  let skipping = false;
  for (const line of source.split("\n")) {
    if (/@template-start/.test(line)) skipping = true;
    else if (/@template-end/.test(line)) skipping = false;
    else if (!skipping) out.push(line);
  }
  return out.join("\n");
}

/** Lower-case kebab-case, starting with a letter. Matches valid npm package names. */
export function isValidName(name) {
  return /^[a-z][a-z0-9-]*$/.test(name) && !name.endsWith("-") && !name.includes("--");
}

export function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export const AUTH_CHOICES = ["none", "msal", "clerk"];
export const DEPLOY_CHOICES = ["vercel", "hetzner", "both"];

/** Adapters that must be removed for the chosen auth provider. */
export function removedAdapters(auth) {
  return new Set(["msal", "clerk"].filter((adapter) => adapter !== auth));
}

export const ADAPTER_PACKAGES = {
  msal: ["@azure/msal-browser", "@azure/msal-react"],
  clerk: ["@clerk/clerk-react"],
};

export function projectReadme({ title, name, auth, deploy }) {
  const authLine =
    auth === "none"
      ? "Authentication is disabled (a fixed local user). Add an adapter in `src/shared/auth` when you need one."
      : `Authentication uses ${auth === "msal" ? "Microsoft Entra ID (MSAL)" : "Clerk"}. Set \`VITE_AUTH_PROVIDER=${auth}\` and the variables in \`.env.example\`.`;
  const deployLine =
    deploy === "vercel"
      ? "Deploy to Vercel. `vercel.json` provides the SPA rewrite and headers."
      : deploy === "hetzner"
        ? "Deploy to Hetzner with the container in `deploy/hetzner` (nginx, SPA fallback)."
        : "Deploy targets: Vercel (`deploy/vercel`) and Hetzner (`deploy/hetzner`). Keep one and delete the other.";

  return `# ${title}

React + TypeScript single-page app on [Vite+](https://viteplus.dev/guide/). Package: \`${name}\`.

## Getting started

\`\`\`bash
vp install
vp dev
\`\`\`

The dev server mocks the API in the browser (MSW, see \`.env.development\`), so it runs without a backend.

## Commands

| Command | Purpose |
| --- | --- |
| \`vp dev\` | Dev server |
| \`vp check\` | Format, lint, typecheck |
| \`vp test\` | Unit and component tests |
| \`vp build\` | Production build into \`dist/\` |
| \`vp run e2e\` | Playwright end-to-end tests |
| \`vp run gen:api\` | Regenerate API types from \`openapi/openapi.json\` |

## Notes

- ${authLine}
- ${deployLine}
- Architecture and conventions: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and [AGENTS.md](AGENTS.md).
`;
}
