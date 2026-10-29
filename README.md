# frontend-template

Personal template for scaffolding new React frontends on [Vite+](https://viteplus.dev/guide/) (`vp`).

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the design and [docs/ROADMAP.md](docs/ROADMAP.md) for what is done and what is next.

## What you get

- One toolchain (`vite-plus`), one config file (`vite.config.ts`), the same commands locally and in CI.
- Feature-first structure with enforced boundaries, and a working example feature to copy.
- Swappable adapters: auth (none, MSAL or Clerk) and deploy target (Vercel or Hetzner).
- Danish-first i18n, light/dark theme, route progress and error boundaries.
- Typed API client generated from OpenAPI, with MSW mocks typed against the same contract.
- Unit tests (Vitest), end-to-end tests (Playwright), CI, Dependabot and `AGENTS.md`.

## Stack

| Concern      | Choice                                                           |
| ------------ | ---------------------------------------------------------------- |
| Toolchain    | Vite+ 1.x (Vite 8, Rolldown, Vitest 5, Oxlint, Oxfmt, Vite Task) |
| UI           | React 19 + TypeScript (strict)                                   |
| Routing      | React Router v8, data/library mode (SPA)                         |
| Server state | TanStack Query v5                                                |
| Styling      | Tailwind CSS v4 with semantic tokens                             |
| Auth         | MSAL (Entra ID) or Clerk, behind one `AuthPort`                  |
| API client   | openapi-typescript, openapi-fetch, openapi-react-query           |
| i18n         | Built in, `da` default, `en` typed against it                    |
| Tests        | Vitest, Testing Library, MSW, Playwright                         |
| Output       | Static SPA build (`vp build` → `dist/`)                          |
| Hosting      | Vercel or Hetzner (nginx container)                              |

## Create a project

```bash
vp create github:scottlinddk/frontend-template
cd frontend-template
vp run init
```

`vp create` clones the template into `./frontend-template` and installs dependencies. It cannot rename things for you, so `vp run init` does that: it asks for a name, title, auth provider and deploy target (or take them from flags), removes what you do not use, writes a project README and deletes itself.

```bash
vp run init --name acme-portal --title "Acme Portal" --auth msal --deploy vercel --yes
```

| Flag         | Values                      | Effect                                                    |
| ------------ | --------------------------- | --------------------------------------------------------- |
| `--name`     | kebab-case                  | Package name and browser storage key prefix               |
| `--title`    | text                        | Page title and UI title (English)                         |
| `--title-da` | text                        | Danish UI title (defaults to `--title`)                   |
| `--auth`     | `none`, `msal`, `clerk`     | Keeps one adapter, removes the others and their packages  |
| `--deploy`   | `vercel`, `hetzner`, `both` | Keeps the chosen target (`vercel.json` moves to the root) |
| `--yes`      |                             | Never prompt, use defaults for anything missing           |

Use `vp install`, not a bare `pnpm install`. The lockfile is written by pnpm 12, which an older pnpm cannot read.

## Develop the template

```bash
vp install
vp dev
```

The dev server mocks the API in the browser (MSW), so it runs without a backend.

| Command          | Purpose                                              |
| ---------------- | ---------------------------------------------------- |
| `vp dev`         | Dev server                                           |
| `vp check`       | Format, lint, typecheck                              |
| `vp test`        | Unit and component tests                             |
| `vp build`       | Production build                                     |
| `vp run e2e`     | Playwright tests (`vp exec playwright install` once) |
| `vp run gen:api` | Regenerate API types from `openapi/openapi.json`     |
| `vp run init`    | Turn a fresh copy into a project (template only)     |

Copy `src/features/items` to start a new feature.
