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
│   ├── workflows/ci.yml            # setup-vp (pinned exact version) → vp check / test / build
│   └── dependabot.yml              # github-actions + npm
├── .vite-hooks/pre-commit          # `vp staged`
├── .vscode/                        # settings + recommended extensions
├── AGENTS.md                       # conventions for coding agents
├── deploy/
│   ├── vercel/vercel.json          # SPA rewrite + security headers
│   └── hetzner/                    # Dockerfile, nginx.conf (SPA fallback, caching, headers), compose
├── e2e/                            # Playwright specs and fixtures
├── public/
├── index.html
├── vite.config.ts                  # vite + test + lint + fmt + staged + run
├── tsconfig.json                   # strict, alias @/* → src/*
├── .env.example
└── src/
    ├── main.tsx                    # bootstrap only
    ├── app/                        # composition root, no business logic
    │   ├── providers/              # QueryClient, Auth, Theme, I18n, ErrorBoundary
    │   ├── router/                 # route tree, guards, lazy routes
    │   └── layouts/
    ├── features/
    │   └── <feature>/
    │       ├── api/                # query key factory, queryOptions(), mutations
    │       ├── components/
    │       ├── hooks/              # logic, no JSX
    │       ├── routes/
    │       ├── types.ts
    │       └── index.ts            # the feature's public API
    ├── shared/
    │   ├── auth/                   # AuthPort + adapters (msal | clerk)
    │   ├── ui/                     # design-system primitives
    │   ├── hooks/
    │   ├── lib/                    # http client, formatters, utils
    │   ├── config/env.ts           # zod-validated env, fails fast
    │   └── types/
    ├── styles/                     # Tailwind v4 entry, theme tokens (@theme)
    ├── i18n/                       # da / en (optional module)
    └── test/                       # setup, MSW handlers, render helpers
```

## Key decisions

### Router
React Router v7 in **data/library mode** (`createBrowserRouter`) so the build stays a plain Vite SPA. Framework mode ships its own Vite plugin and server runtime. Compatibility with `vp build` is unverified and not needed for a static output.

### Server state
TanStack Query v5. Each feature owns a key factory and `queryOptions()` factories, so routes can prefetch in loaders and components consume the same options.

### API client
Typed client generated from the backend's OpenAPI document (`openapi-typescript` or Orval, decided in phase 3). Codegen runs as a cached `vp run` task, and generated code is committed under `shared/lib/api/generated` or ignored. This is an open decision.

### Auth: one port, two adapters
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
