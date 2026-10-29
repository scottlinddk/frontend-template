# Architecture

## Principles

1. **Feature-first.** Code is grouped by domain, not by file type.
2. **Strict boundaries.** Features never import from other features. Everything is imported through a folder's `index.ts`.
3. **Separation of concerns.** Logic lives in hooks and `shared/lib`, UI in components, styling in Tailwind tokens (`src/styles`), copy in `src/i18n`.
4. **Adapters at the edges.** Auth and hosting are replaceable without touching features.
5. **One toolchain.** All tooling is configured in `vite.config.ts`. CI runs the same `vp` commands as local.

## File tree

```
.
├── .github/
│   ├── workflows/ci.yml            # verify, e2e (and, in the template only, init smoke tests)
│   └── dependabot.yml              # github-actions + npm
├── .vite-hooks/pre-commit          # `vp staged`
├── AGENTS.md                       # conventions for coding agents
├── deploy/
│   ├── vercel/vercel.json          # copy to the repo root; Vercel only reads it there
│   └── hetzner/                    # Dockerfile, nginx.conf, compose.yaml
├── e2e/                            # Playwright specs
├── lint/                           # rules.ts (the lint rule set), a regression test and its violations fixture
├── openapi/openapi.json            # API contract; replace with your backend's
├── scripts/
│   ├── gen-api.mjs                 # OpenAPI → src/shared/api/schema.d.ts
│   └── init.mjs                    # template only: rename, pick auth and deploy, then self-delete
├── playwright.config.ts
├── vite.config.ts                  # vite + react + tailwind + test + lint + fmt + staged + run tasks
├── pnpm-workspace.yaml             # vite-plus catalog, install policy
└── src/
    ├── main.tsx                    # bootstrap only
    ├── app/                        # composition root, no business logic
    │   ├── providers/              # I18n, Theme, QueryClient, Auth
    │   ├── router/                 # route tree
    │   └── layouts/                # RootLayout, RouteProgress, RouteErrorBoundary
    ├── features/
    │   └── items/                  # example feature: the pattern to copy
    │       ├── api/                # query options and mutation hooks
    │       ├── components/
    │       ├── routes/             # lazy route component + test
    │       ├── types.ts            # types taken from the generated schema
    │       └── index.ts            # the feature's public API
    ├── i18n/                       # translations (da is the source of truth), provider, language switcher
    ├── shared/
    │   ├── api/                    # generated schema + typed client ($api)
    │   ├── auth/                   # AuthPort, AuthProvider, ProtectedRoute, adapters (none | msal | clerk)
    │   ├── config/                 # env.ts (zod, fails fast), app.ts (APP_ID)
    │   ├── lib/                    # http() with zod validation, HttpError, shared queryClient
    │   ├── theme/                  # ThemeProvider, ThemeToggle
    │   └── ui/                     # design-system primitives
    ├── styles/                     # Tailwind v4 entry, semantic color tokens, motion
    ├── mocks/                      # MSW handlers (typed against the schema), browser worker, node server
    └── test/                       # setup, render helper
```

Dependency direction: `i18n` and `shared/config` import nothing from the app. `shared` may import `i18n`. Features import `shared` and `i18n`. `app` composes everything.

## Key decisions

### Router

React Router v8 in **data/library mode** (`createBrowserRouter`), so the build stays a plain Vite SPA. In v8, `RouterProvider` is imported from `react-router/dom` and `react-router-dom` no longer exists. Routes load lazily (`lazy` returns `{ Component }`), and each lazy route has its own `ErrorBoundary`. `RouteProgress` shows a bar while navigation is in flight, and links pass `viewTransition` for a cross-fade.

**Loaders and auth.** Prefetching with a loader (`queryClient.ensureQueryData(itemsQueryOptions())`) is good for public data. Do not do it for routes under `ProtectedRoute`. Loaders start when the router is created, before the user is signed in, so the request would go out without a token. Protected routes fetch inside the component with `useSuspenseQuery`, as `items` does.

### Server state

TanStack Query v5 with one shared `queryClient` (`shared/lib/queryClient.ts`). It does not retry 4xx errors, and signing out clears the cache so the next user never sees the previous user's data.

### API client: two paths

1. **Backend publishes OpenAPI (preferred).** `vp run gen:api` generates `src/shared/api/schema.d.ts` with `openapi-typescript` from `openapi/openapi.json`, or from any URL via `OPENAPI_SPEC=https://host/openapi.json`. `$api` (openapi-fetch + openapi-react-query) gives typed hooks and `queryOptions` for every operation. The generated file is committed, so installs need no network and API changes show up in review. CI re-runs the task and fails if the file is stale. The task is cached by Vite Task.
2. **No spec.** `http()` in `shared/lib/http.ts` validates every response against a zod schema.

Both attach the bearer token, and both throw `HttpError` (status, message, optional `code` from an `{ error, code }` body), so error handling and the retry policy are uniform. MSW handlers are typed against the generated schema, so a contract change breaks type-checking in the mocks.

### Auth: one port, three adapters

`shared/auth` exposes an `AuthPort`: `useAuth()` (user, status, signIn, signOut), `getAccessToken()` and `ProtectedRoute`. Adapters implement it:

- **none**: a fixed local user, for development.
- **MSAL** (`@azure/msal-browser`, `@azure/msal-react`) for Entra ID.
- **Clerk** (`@clerk/clerk-react`).

Each adapter is its own lazy chunk, so only the selected one is downloaded. Adapter-specific lines carry `@adapter <name>` tags, which `vp run init` uses to remove the adapters a project does not need, along with their dependencies. For a pure SPA, tokens are held in the browser, so calls to your own API must be validated server-side.

### i18n

Danish is the default and the source of truth. `en` is typed against `da`, so a missing key in either language fails type-checking. Placeholders use `{name}`. Lookups fall back to English, then to the key. The choice persists in `localStorage` and sets `<html lang>`. There is no i18n library, so the cost is a few hundred bytes. Add plural or date formatting with `Intl` when a project needs it.

### Theme

Light and dark via a class on `<html>`. A script in `index.html` applies the saved theme before first paint to avoid a flash (keep its storage key in sync with `ThemeProvider`). Components use semantic tokens (`bg-surface`, `text-ink`, `ring-line`) defined as CSS variables, never raw palette colors, so dark mode needs no per-component variants.

### Styling

Tailwind v4 with CSS-first config (`@theme` in `src/styles`). No component library by default. `shared/ui` holds small primitives built on the tokens. Animations respect `prefers-reduced-motion`.

### Environment

All config enters through `shared/config/env.ts` (zod). `VITE_*` values are public and end up in the bundle, so no secrets belong there. Required variables per auth provider are declared once in `shared/auth/providers.ts`.

### Quality gates

- Local: `vp check` and `vp test`. Pre-commit runs `vp staged` (`vp check --fix` on staged files).
- CI: `voidzero-dev/setup-vp` pinned to a commit SHA, then `vp check`, `vp test`, `vp build`, the generated-types check, and Playwright e2e.
- Oxlint replaces ESLint. `lint/rules.ts` enables the equivalent of `@eslint/js`, typescript-eslint and react-hooks v7 recommended (94 rules, including the React Compiler ones), and `lint/rules.test.ts` fails if the `react` plugin or any of those rules stops reporting. `jsx-a11y` (native) and `@tanstack/eslint-plugin-query` (via `jsPlugins`) are opt-in; see the comment in `vite.config.ts`.

### Hosting (static output)

`vp build` produces `dist/`.

- **Vercel:** `vercel.json` with a catch-all rewrite to `/index.html`, immutable caching for hashed assets and security headers. It must sit in the repo root. `vp run init` moves it there.
- **Hetzner:** multi-stage Dockerfile (build with Vite+, serve with unprivileged nginx), SPA fallback, gzip, the same cache and security headers, and a healthcheck. TLS terminates at a reverse proxy.

### Testing

- Unit and component: Vitest and Testing Library, next to the code.
- Network: MSW handlers shared between unit tests and the dev server (the browser worker is dev-only).
- E2E: Playwright against the dev server, which serves the mocked API. Specs avoid hardcoding the app title so they survive `vp run init`.

<!-- @template-start -->

## Starting a project from the template

```bash
vp create github:scottlinddk/frontend-template   # clones into ./frontend-template and installs
cd frontend-template
vp run init                                      # prompts, or pass --name --title --auth --deploy --yes
```

`vp create` has no placeholder support for `github:` templates: it clones with `degit`, installs, and always uses the repository name as the folder. `init` fills that gap. It sets the project id (package name, storage keys), the page title and UI title, keeps one auth adapter and one deploy target, removes the unused dependencies, writes a project README, strips template-only material, and deletes itself.

<!-- @template-end -->

## Version policy

Pin `vite-plus` and `setup-vp` to exact versions. Dependabot proposes bumps. The `v1` tag of `setup-vp` no longer receives updates, so it must not be used.

<!-- @template-start -->

## Implementation notes

Findings from building the template. Each affects how it behaves in CI or for contributors.

- **pnpm 12 enforces a minimum release age.** `vp install` rejects lockfile entries published within about a day. Generate the lockfile with the `vp`-managed pnpm (`vp install`), not a globally installed older pnpm, or CI fails.
- **pnpm 12 lockfiles have two YAML documents.** pnpm 10 cannot read them. Always use `vp install`.
- **pnpm 12 fails on unapproved install scripts.** `@clerk/shared` has one (telemetry notice), denied via `allowBuilds`. New dependencies with install scripts need an explicit decision.
- **TypeScript is pinned to 6.0.x.** `openapi-typescript` 7 uses the TypeScript compiler API, which TypeScript 7 does not expose, and its peer range stops at 5.x. A pnpm override cannot fix a peer dependency. Type-checking in `vp check` is unaffected. Revisit when `openapi-typescript` supports TypeScript 7.
- **`openapi-fetch` captures `fetch` at creation.** That bypasses MSW. The client passes `fetch: (request) => globalThis.fetch(request)` to resolve it per request.
- **MSW 3 renamed `onUnhandledRequest` to `onUnhandledFrame`.**
- **`vp create github:` rewrites `vite.config.ts`.** It wraps plugins in `lazyPlugins(...)`. The template already uses it, so scaffolding produces no diff.
- **Vitest picks up `*.spec.ts` by default.** `test.include` is restricted so Playwright specs are not run by Vitest.
- **Playwright's browser.** Locally, point `PLAYWRIGHT_CHROMIUM_EXECUTABLE` at a system Chromium if Playwright's download is unavailable. CI uses `playwright install`.
- **Oxlint did not lint React at all at first.** Rules only run for plugins listed in `lint.plugins`, and the first version of the config did not list `react`, so `rules-of-hooks`, `exhaustive-deps` and every React Compiler rule were silent. Found by comparing against the Family-Meals ESLint setup, and now guarded by `lint/rules.test.ts`.
- **Oxlint coverage of the Family-Meals ESLint rules (Oxlint 1.89, ESLint 10.13, react-hooks 7.1.1, typescript-eslint 8.72):** 99 rules resolved; 95 have a native Oxlint equivalent (core 61 of 63, typescript-eslint 20 of 20, react-hooks 14 of 16). The four without one are `no-dupe-args` and `no-octal` (syntax errors in ES modules) and `react-hooks/config` and `gating` (compiler config messages). On about 35 deliberate violations ESLint reported 25 findings and the configured Oxlint reported all 25. Known differences: ESLint flags the `catch` after `try { return <JSX/> }` as unreachable and Oxlint does not; Oxlint also runs its own default correctness rules (for example `no-eval`). The React Compiler rules `globals`, `preserve-manual-memoization` and `unsupported-syntax` could not be triggered in ESLint either, so their parity is unproven.
- **Verified:** `vp check`, `vp test`, `vp build`, Playwright e2e, and `vp run init` for `msal/hetzner`, `none/vercel` and `clerk/both` (each followed by check, test and build). **Not verified:** the MSAL and Clerk adapters against real tenants, the Docker image (no daemon in the build environment), the Vercel deployment, and the CI workflow's first GitHub run.

### Where the patterns came from

| Pattern                                                                                                               | Source project                 |
| --------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| Danish default, `en` typed against `da`, `{name}` placeholders, language in `<html lang>`                             | BoligData, Family-Meals        |
| Light/dark `ThemeProvider` with pre-paint script                                                                      | BoligData                      |
| Shared `queryClient`, `lazy` returning `Component`, per-route `ErrorBoundary`, loader prefetch with `ensureQueryData` | Tredjekort                     |
| `RouteProgress`, `viewTransition` links, reduced-motion guards                                                        | Family-Meals                   |
| Typed API error with status and code, no retry on 4xx, 204 handling, clear cache on sign-out                          | ESP32 e-ink system             |
| OpenAPI document as the contract, generated types committed and refreshed in CI                                       | ESP32 e-ink system, Tredjekort |
| Playwright-style smoke tests that never touch a real backend                                                          | BoligData                      |
| Oxlint + Vite 8 + React Router data mode + `@vitejs/plugin-react` 6                                                   | Tredjekort                     |

<!-- @template-end -->
