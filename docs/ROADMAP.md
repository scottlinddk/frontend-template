# Roadmap

## Done

- **Core:** Vite+ app, strict TypeScript, Tailwind v4, CI (pinned `setup-vp`), Dependabot, pre-commit hook, `AGENTS.md`.
- **Foundations:** providers, React Router v8 data mode, validated env, HTTP layer, Vitest and MSW, one example feature.
- **Adapters:** auth (none, MSAL, Clerk) behind `AuthPort`; deploy targets for Vercel and Hetzner.
- **Patterns from past projects:** Danish-first i18n, light/dark theme, route progress and error boundaries, shared `queryClient`, `HttpError`.
- **OpenAPI codegen:** committed generated types, typed hooks, typed mocks, CI freshness check, cached `vp run gen:api` task.
- **Playwright e2e** against the mocked dev server, in CI.
- **Placeholder substitution:** `vp run init` renames the project and prunes unused adapters, verified for `msal/hetzner`, `none/vercel` and `clerk/both`.

## Next

- Run the MSAL and Clerk adapters against real tenants.
- Build and run the Hetzner container once, and deploy once to Vercel.
- Publish an `@scottlinddk/create` package with a `createConfig.templates` manifest, so `vp create @scottlinddk` can prompt for options directly instead of needing `vp run init`.
- Optional modules: React Compiler toggle, Storybook, plural and date formatting helpers.

## Open questions

- Oxlint rule coverage versus the ESLint plugins used in past projects (react-hooks, TanStack Query, a11y).
- Move TypeScript back to 7.x once `openapi-typescript` supports it.
- Whether to keep `http()` alongside the generated client, or drop it once every project has a spec.
