# Agent instructions

React + TypeScript SPA on Vite+ (`vp`). Read `docs/ARCHITECTURE.md` before structural changes.

## Commands

- `vp check` format, lint and typecheck (run before every commit)
- `vp test` unit and component tests
- `vp build` production build
- `vp dev` dev server (MSW mocks on by default via `.env.development`)

Built-in commands run Vite+ tools. Use `vp run <script>` for `package.json` scripts.

## Structure rules

- `src/features/<name>/` owns one domain: `api/`, `components/`, `routes/`, `types.ts`, `index.ts`.
- Features never import from other features. Import across folders only through `index.ts`.
- `src/shared/` is domain-free. `src/app/` only composes providers, layouts and routes.
- Logic belongs in hooks and `shared/lib`, not in JSX. Styling is Tailwind utilities and `@theme` tokens in `src/styles`.
- Features depend on `useAuth()` from `@/shared/auth`, never on MSAL or Clerk directly.
- Read config only through `@/shared/config/env`. `VITE_*` values are public.

## Data

- Server state uses TanStack Query v5: a key factory and `queryOptions()` per feature.
- HTTP goes through `shared/lib/http.ts` with a zod `schema`, so responses are validated.

## Testing

- Tests sit next to the code (`*.test.ts(x)`). Import test APIs from `vite-plus/test`.
- Network is mocked with MSW (`src/mocks`). Unhandled requests fail the test.
- Wrap components with `renderWithProviders` from `@/test/render`.

## Dependencies

- Add with `vp add`. pnpm 12 enforces a minimum release age, so a package published in the last day cannot be installed yet.
