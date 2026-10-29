// Turns a fresh copy of the template into your project.
//
//   vp run init                              interactive
//   vp run init --name acme --title "Acme" --auth msal --deploy vercel --yes
//
// Options
//   --name      kebab-case project id (package name, storage key prefix)
//   --title     display name, used in the page title and UI
//   --title-da  Danish display name (defaults to --title)
//   --auth      none | msal | clerk     removes the adapters you do not pick
//   --deploy    vercel | hetzner | both
//   --yes       accept defaults for anything not given, never prompt
//   --no-install  skip the final install and format step
//
// The script deletes itself when it finishes.
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { createInterface } from "node:readline/promises";
import { parseArgs } from "node:util";

import {
  ADAPTER_PACKAGES,
  AUTH_CHOICES,
  DEPLOY_CHOICES,
  escapeHtml,
  isValidName,
  projectReadme,
  removedAdapters,
  stripAdapters,
  stripTemplateOnly,
} from "./init-lib.mjs";

const root = resolve(import.meta.dirname, "..");
const path = (...parts) => join(root, ...parts);
const read = (file) => readFileSync(path(file), "utf8");
const write = (file, content) => writeFileSync(path(file), content);
const remove = (file) => rmSync(path(file), { recursive: true, force: true });

const { values } = parseArgs({
  options: {
    name: { type: "string" },
    title: { type: "string" },
    "title-da": { type: "string" },
    auth: { type: "string" },
    deploy: { type: "string" },
    yes: { type: "boolean", default: false },
    "no-install": { type: "boolean", default: false },
  },
});

const interactive = process.stdin.isTTY && !values.yes;
const rl = interactive ? createInterface({ input: process.stdin, output: process.stdout }) : null;

async function ask(label, fallback, valid, hint) {
  if (!interactive) return fallback;
  for (;;) {
    const answer = (await rl.question(`${label} (${hint ?? fallback}): `)).trim() || fallback;
    if (valid(answer)) return answer;
    console.log(`  Invalid value: ${answer}`);
  }
}

function fail(message) {
  console.error(`init: ${message}`);
  process.exit(1);
}

if (!existsSync(path("scripts/init-lib.mjs"))) fail("this project has already been initialised.");

const folderName = basename(root);
const defaultName =
  isValidName(folderName) && folderName !== "frontend-template" ? folderName : "my-app";

const name = values.name ?? (await ask("Project name", defaultName, isValidName, "kebab-case"));
const title = values.title ?? (await ask("Display title", "My App", (v) => v.length > 0));
const titleDa = values["title-da"] ?? (await ask("Danish title", title, (v) => v.length > 0));
const auth =
  values.auth ??
  (await ask("Auth provider", "none", (v) => AUTH_CHOICES.includes(v), AUTH_CHOICES.join(" | ")));
const deploy =
  values.deploy ??
  (await ask(
    "Deploy target",
    "vercel",
    (v) => DEPLOY_CHOICES.includes(v),
    DEPLOY_CHOICES.join(" | "),
  ));
rl?.close();

if (!isValidName(name))
  fail(`invalid --name "${name}" (use lower-case letters, digits and single dashes).`);
if (!AUTH_CHOICES.includes(auth)) fail(`--auth must be one of ${AUTH_CHOICES.join(", ")}.`);
if (!DEPLOY_CHOICES.includes(deploy)) fail(`--deploy must be one of ${DEPLOY_CHOICES.join(", ")}.`);

const removed = removedAdapters(auth);
console.log(`Initialising "${title}" (${name}) with auth=${auth}, deploy=${deploy}`);

// 1. Identity: project id, title, storage keys.
for (const file of [
  "src/shared/config/app.ts",
  "index.html",
  "src/i18n/I18nProvider.test.tsx",
  "src/shared/theme/ThemeProvider.test.tsx",
]) {
  write(file, read(file).replaceAll("frontend-template", name));
}
write(
  "index.html",
  read("index.html").replace(
    "<title>Frontend Template</title>",
    `<title>${escapeHtml(title)}</title>`,
  ),
);

const translations = read("src/i18n/translations.ts")
  .replace('"app.name": "Frontend-skabelon"', `"app.name": ${JSON.stringify(titleDa)}`)
  .replace('"app.name": "Frontend template"', `"app.name": ${JSON.stringify(title)}`);
write("src/i18n/translations.ts", translations);

// 2. Auth: drop unused adapters from sources, config and deployment files.
const adapterFiles = [
  "src/shared/auth/providers.ts",
  "src/shared/auth/AuthProvider.tsx",
  "src/shared/config/env.ts",
  "src/shared/config/env.test.ts",
  ".env.example",
  "pnpm-workspace.yaml",
  "deploy/hetzner/Dockerfile",
  "deploy/hetzner/compose.yaml",
];
for (const file of adapterFiles) write(file, stripAdapters(read(file), removed));
for (const adapter of removed) remove(`src/shared/auth/adapters/${adapter}.tsx`);
write(
  ".env.example",
  read(".env.example")
    .replace("VITE_AUTH_PROVIDER=none", `VITE_AUTH_PROVIDER=${auth}`)
    .replace(
      "none | msal | clerk (init removes the ones you do not use)",
      [...new Set(["none", auth])].join(" | "),
    ),
);
// Container builds should default to the provider this project uses.
write(
  "deploy/hetzner/Dockerfile",
  read("deploy/hetzner/Dockerfile").replace(
    "ARG VITE_AUTH_PROVIDER=none",
    `ARG VITE_AUTH_PROVIDER=${auth}`,
  ),
);
write(
  "deploy/hetzner/compose.yaml",
  read("deploy/hetzner/compose.yaml").replace(
    "${VITE_AUTH_PROVIDER:-none}",
    `\${VITE_AUTH_PROVIDER:-${auth}}`,
  ),
);

// 3. Deploy target. Vercel only reads vercel.json from the project root.
if (deploy !== "hetzner") renameSync(path("deploy/vercel/vercel.json"), path("vercel.json"));
remove("deploy/vercel");
if (deploy === "vercel") {
  remove("deploy");
  remove(".dockerignore");
}

// 4. Template-only material.
for (const file of [".github/workflows/ci.yml", "docs/ARCHITECTURE.md"]) {
  write(file, stripTemplateOnly(read(file)));
}
remove("docs/ROADMAP.md");
write("README.md", projectReadme({ title, name, auth, deploy }));

const pkg = JSON.parse(read("package.json"));
pkg.name = name;
delete pkg.scripts.init;
write("package.json", `${JSON.stringify(pkg, null, 2)}\n`);

// 5. Remove the dependencies of removed adapters, then format.
const packages = [...removed].flatMap((adapter) => ADAPTER_PACKAGES[adapter]);
const vp = (...args) => execFileSync("vp", args, { cwd: root, stdio: "inherit" });
if (!values["no-install"]) {
  if (packages.length > 0) vp("remove", ...packages);
  vp("check", "--fix");
}

// 6. Delete the init script itself.
for (const file of readdirSync(path("scripts")).filter((f) => f.startsWith("init")))
  remove(`scripts/${file}`);

console.log(`\nDone. Next:\n  vp dev\n  mv ${folderName} ${name}   # optional: rename the folder`);
