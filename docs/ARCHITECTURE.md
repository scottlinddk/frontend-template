# Architecture

## Principles

1. **Feature-first.** Code is grouped by domain, not by file type.
2. **Strict boundaries.** Features never import from other features. Everything is imported through a folder's `index.ts`.
3. **Separation of concerns.** Logic lives in hooks and `shared/lib`, UI in components, styling in Tailwind tokens (`src/styles`).
4. **Adapters at the edges.** Auth and hosting are replaceable without touching features.
5. **One toolchain.** All tooling is configured in `vite.config.ts`. CI runs the same `vp` commands as local.

## File tree

```
frontend-template/
├── .github/
│   ├── workflows/ci.yml            # setup-vp (pinned commit SHA) → vp check / test / build
│   └── dependabot.yml              # github-actions + npm
├── .vite-hooks/pre-commit          # `vp staged`
├── .vscode/extensions.json
├── AGENTS.md                       # conventions for coding agents
├── deploy/
│   ├── vercel/vercel.json          # SPA rewrite + cache + security headers
│   └── hetzner/                    # Dockerfile, nginx.conf, compose.yaml
├── public/                         # favicon, MSW service worker
├── index.html
├── vite.config.ts                  # vite + react + tailwind + test + lint + fmt + staged
├── tsconfig.json                   # strict, alias @/* → src/*
├── pnpm-workspace.yaml             # vite-plus catalog, install policy
├── .env.example / .env.development
└── src/
    ├── main.tsx                    # bootstrap only
    ├── app/                        # composition root, no business logic
    │   ├── providers/              # QueryClient + AuthProvider
    │   ├── router/                 # route tree, lazy routes
    │   └── layouts/
    ├── features/
    │   └── items/                  # example feature: the pattern to copy
    │       ├── api/                # query key factory, queryOptions(), mutation
    │       ├── components/
    │       ├── routes/             # lazy route component + test
    │       ├── types.ts            # zod schemas and inferred types
    │       └── index.ts            # the feature's public API
    ├── shared/
    │   ├── auth/                   # AuthPort, AuthProvider, RequireAuth, adapters (none | msal | clerk)
    │   ├── ui/                     # design-system primitives
    │   ├── lib/                    # http client (zod-validated responses)
    │   └── config/env.ts           # zod-validated env, fails fast
    ├── styles/                     # Tailwind v4 entry, theme tokens (@theme)
    ├── mocks/                      # MSW handlers, browser worker, node server
    └── test/                       # setup, render helper
```

Not built yet: `i18n/`, `shared/hooks`, OpenAPI codegen, Playwright e2e. See the roadmap.

## Key decisions

### Router

React Router v7 in **data/library mode** (`createBrowserRouter`) so the build stays a plain Vite SPA. Framework mode ships its own Vite plugin and server runtime. Compatibility with `vp build` is unverified and not needed for a static output.

### Server state

TanStack Query v5. Each feature owns a key factory and `queryOptions()` factories, so routes can prefetch in loaders and components consume the same options.

### API client

Not built yet. Today `shared/lib/http.ts` validates every response against a zod schema. Planned: generate the client from the backend's OpenAPI document (`openapi-typescript` or Orval) as a cached `vp run` task. Whether generated code is committed is still open.

### Auth: one port, three adapters

`shared/auth` exposes an `AuthPort`: `useAuth()` (user, status, signIn, signOut), `getAccessToken()` and a route guard. Two adapters implement it:

- **MSAL** (`@azure/msal-browser` and `@azure/msal-react`) for Entra ID.
- **Clerk** (`@clerk/clerk-react`).

Features only depend on the port. Shipping both adapters bloats the app and the dependency tree, so the scaffold keeps one and removes the other. How that selection works depends on the scaffolding mechanism (see roadmap). For a pure SPA, tokens are held in the browser, so token-bearing calls to your own API must be validated server-side.

### Styling

Tailwind v4 with CSS-first config (`@theme` tokens in `src/styles`). No component library by default. `shared/ui` holds a small set of primitives built on the tokens. Variants via a class-variance utility are optional.

### Environment

All config enters through `shared/config/env.ts` (zod). `VITE_*` values are public and end up in the bundle, so no secrets belong there. Hosting-specific values (for example API base URL) differ per environment.

### Quality gates

- Local: `vp check` and `vp test`. Pre-commit runs `vp staged` (`vp check --fix` on staged files).
- CI: `voidzero-dev/setup-vp` at an exact version, then `vp check`, `vp test`, `vp build`, plus a Vite Task cache.
- Oxlint replaces ESLint. Before adopting, verify rule coverage for react-hooks, TanStack Query and a11y. Add a gap list to this doc if any are missing.

### Hosting (static output)

`vp build` produces `dist/`.

- **Vercel:** `vercel.json` with a catch-all rewrite to `/index.html`, immutable caching for hashed assets, and security headers.
- **Hetzner:** multi-stage Dockerfile (build with Vite+, serve with nginx or Caddy), SPA fallback, gzip/brotli, the same cache and security headers, healthcheck. TLS terminates at a reverse proxy or Caddy.

Both targets live under `deploy/`. A project keeps one.

### Testing

- Unit and component: Vitest and Testing Library.
- Network: MSW handlers shared between tests and, optionally, the dev server.
- E2E: Playwright against `vp preview` or the container.

## Version policy

Pin `vite-plus` and `setup-vp` to exact versions. Dependabot proposes bumps. The `v1` tag of `setup-vp` no longer receives updates, so it must not be used.

## Implementation notes

Findings from building the template. Each affects how it behaves in CI.

- **pnpm 12 enforces a minimum release age.** `vp install` rejects lockfile entries published within about a day. Generate the lockfile with the `vp`-managed pnpm (`vp install`), not a globally installed older pnpm, or CI fails.
- **pnpm 12 fails on unapproved install scripts.** `@clerk/shared` has one (telemetry notice), denied via `allowBuilds` in `pnpm-workspace.yaml`. New dependencies with install scripts need an explicit decision.
- **MSW 3 renamed `onUnhandledRequest` to `onUnhandledFrame`.**
- **MSW is dev-only.** `main.tsx` guards the dynamic import with `import.meta.env.DEV`, so the worker is not in the production bundle. `public/mockServiceWorker.js` is still copied into `dist/` and is inert.
- **All three auth adapters are separate chunks.** Only the selected one is downloaded, but all auth packages remain in `package.json` until a project removes the ones it does not use.
- **Verified:** `vp check`, `vp test`, `vp build`, and a browser run of the dev server (routing, mocked API, add item, deep link). **Not verified:** the MSAL and Clerk adapters against real tenants, the Docker image (no daemon in the build environment), the Vercel deployment, and the CI workflow (it only runs on GitHub).
