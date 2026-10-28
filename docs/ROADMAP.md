# Roadmap

## Phase 1: Core skeleton
- `vp create` compatible app with `vite.config.ts`, strict TS, Tailwind v4.
- CI (`setup-vp`), Dependabot, pre-commit hook, `AGENTS.md`.
- Done when: `vp install && vp check && vp test && vp build` pass on a clean clone.

## Phase 2: Foundations
- Providers, router (data mode), `env.ts`, http client.
- Vitest and MSW setup, render helpers, one example feature with query, mutation and test.
- Done when: the example feature shows the full pattern including a test.

## Phase 3: Adapters and modules
- `AuthPort` with MSAL and Clerk adapters.
- Deploy targets: Vercel and Hetzner (Docker and nginx/Caddy).
- Optional: OpenAPI codegen, i18n (da/en), Playwright, React Compiler toggle.

## Phase 4: Distribution
- Decide the scaffolding mechanism:
  1. `vp create github:scottlinddk/frontend-template` plus a post-create script, or
  2. a Bingo generator, or
  3. an `@scottlinddk/create` package with a `createConfig.templates` manifest.
- Verify how `github:` templates handle placeholders before choosing.

## Open questions
- Which past repositories should be mined for patterns? None have been reviewed yet.
- Oxlint rule coverage versus the ESLint plugins used in past projects.
- Generated API code: committed or generated on install?
- How the unused auth or deploy adapter is removed at scaffold time.
