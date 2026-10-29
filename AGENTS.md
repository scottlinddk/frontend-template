# Agent instructions

React + TypeScript SPA on Vite+ (`vp`). Read `docs/ARCHITECTURE.md` before structural changes.

## Commands

- `vp check` format, lint and typecheck (run before every commit)
- `vp test` unit and component tests
- `vp build` production build
- `vp dev` dev server (MSW mocks on by default via `.env.development`)
- `vp run e2e` Playwright tests, `vp run gen:api` regenerate API types

Built-in commands run Vite+ tools. Use `vp run <script>` for `package.json` scripts.

## Structure rules

- `src/features/<name>/` owns one domain: `api/`, `components/`, `routes/`, `types.ts`, `index.ts`.
- Features never import from other features. Import across folders only through `index.ts`.
- `src/shared/` is domain-free. `src/app/` only composes providers, layouts and routes.
- Logic belongs in hooks and `shared/lib`, not in JSX. Styling is Tailwind utilities and `@theme` tokens in `src/styles`.
- Features depend on `useAuth()` from `@/shared/auth`, never on MSAL or Clerk directly.
- Read config only through `@/shared/config/env`. `VITE_*` values are public.

## Data

- Server state uses TanStack Query v5 with the shared `queryClient` from `@/shared/lib/queryClient`.
- If the backend publishes OpenAPI, use `$api` from `@/shared/api` (typed hooks and `queryOptions`). Update `openapi/openapi.json`, run `vp run gen:api`, and commit the regenerated `schema.d.ts`. Never edit it by hand.
- If there is no spec, use `http()` from `shared/lib/http.ts` with a zod `schema`.
- Failed requests throw `HttpError` (status, message, optional code).
- Do not prefetch in route loaders for routes under `ProtectedRoute`: loaders run before sign-in, so the request would have no token.

## File size

- Pre-commit rejects any staged file above 5,000 tokens (bytes / 4, so about 20 KB). Split it as the error message says. Never bypass with `--no-verify`. Generated files and lockfiles are exempt via `IGNORED` in `scripts/file-size-lib.mjs`.

## Lint

- Rules live in `lint/rules.ts` and mirror ESLint recommended, typescript-eslint recommended and react-hooks v7 (including the React Compiler rules). Do not weaken them to make code pass; fix the code.
- Oxlint only runs a plugin's rules when it is listed in `lint.plugins` in `vite.config.ts`. Keep `react` and `typescript` there. `lint/rules.test.ts` fails if those rules go silent.
- `no-undef` is off on purpose (TypeScript reports undefined names).
- Optional: add `jsx-a11y` to `lint.plugins` for accessibility rules, or load `@tanstack/eslint-plugin-query` via `jsPlugins` (see the comment in `vite.config.ts`).

## Copy and styling

- User-visible text goes in `src/i18n/translations.ts`. Add every key to `da` first, then `en` (it is typed against `da`). Never hardcode strings in components.
- Use semantic color tokens (`bg-surface`, `text-ink`, `text-ink-muted`, `ring-line`, `brand-*`), not raw palette colors, so dark mode works without per-component variants.
- Animations must respect `prefers-reduced-motion`. Link between routes with `viewTransition`.

## Testing

- Tests sit next to the code (`*.test.ts(x)`). Import test APIs from `vite-plus/test`.
- Network is mocked with MSW (`src/mocks`). Unhandled requests fail the test.
- Wrap components with `renderWithProviders` from `@/test/render` (English by default, pass `language: "da"` to test Danish).
- Mock handlers in `src/mocks` are typed against the generated schema. Keep them in step with the contract.
- E2E specs live in `e2e/` and run against the dev server with mocks. Do not hardcode the app title in them.

## Dependencies

- Add with `vp add`. pnpm 12 enforces a minimum release age, so a package published in the last day cannot be installed yet.
