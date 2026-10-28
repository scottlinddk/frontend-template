# frontend-template

Personal template for scaffolding new React frontends on [Vite+](https://viteplus.dev/guide/) (`vp`).

> Status: outline only. No application code yet. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the design and [docs/ROADMAP.md](docs/ROADMAP.md) for the phased plan.

## Goals

- One command to a working, deployable, production-grade SPA.
- One toolchain (`vite-plus`), one config file (`vite.config.ts`), identical commands locally and in CI.
- Strong separation of concerns: logic (hooks, `lib`), components (UI), styling (tokens, Tailwind).
- Swappable adapters where the choice is per project: auth (MSAL or Clerk) and deploy target (Vercel or Hetzner).

## Stack

| Concern | Choice |
|---|---|
| Toolchain | Vite+ 1.x (Vite 8, Rolldown, Vitest 5, Oxlint, Oxfmt, Vite Task) |
| UI | React + TypeScript (strict) |
| Routing | React Router v7, data/library mode (SPA) |
| Server state | TanStack Query v5 |
| Styling | Tailwind CSS v4 |
| Auth | MSAL (Entra ID) or Clerk, behind one `AuthPort` |
| API client | Generated from OpenAPI (typed hooks) |
| Tests | Vitest, Testing Library, MSW, Playwright |
| Output | Static SPA build (`vp build` → `dist/`) |
| Hosting | Vercel or Hetzner (nginx/Caddy container) |

## Intended usage

```bash
vp create github:scottlinddk/frontend-template
```

Whether `github:` templates support placeholder substitution has not been verified. If not, a post-create script or a Bingo generator handles app name and adapter selection. See the roadmap.

## Commands (once scaffolded)

| Command | Purpose |
|---|---|
| `vp dev` | Dev server |
| `vp check` | Format, lint, typecheck |
| `vp test` | Unit and component tests |
| `vp build` | Production build |
| `vp run <task>` | Project tasks (codegen, e2e), cached |
