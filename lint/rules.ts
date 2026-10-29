/**
 * Lint rules, mirroring what the ESLint setup in Family-Meals enforces:
 * `@eslint/js` recommended, `typescript-eslint` recommended and
 * `eslint-plugin-react-hooks` v7 recommended (including the React Compiler rules).
 *
 * Oxlint only runs a plugin's rules when the plugin is listed in `lint.plugins`
 * (see vite.config.ts), so the `react` and `typescript` plugins must stay enabled.
 * `lint/rules.test.ts` fails if these rules stop reporting.
 *
 * Deliberately not enabled:
 * - `eslint/no-undef`: TypeScript reports undefined names, and Oxlint would need
 *   browser and node globals declared to avoid false positives.
 * - `no-dupe-args`, `no-octal`: syntax errors in ES modules, reported by the parser.
 * - `react-hooks/config`, `react-hooks/gating`: internal React Compiler config messages.
 */

type Severity = "error" | "warn";
type Rules = Record<string, Severity | [Severity, Record<string, unknown>]>;

// @eslint/js recommended
const core: Rules = {
  "eslint/constructor-super": "error",
  "eslint/for-direction": "error",
  "eslint/getter-return": "error",
  "eslint/no-async-promise-executor": "error",
  "eslint/no-case-declarations": "error",
  "eslint/no-class-assign": "error",
  "eslint/no-compare-neg-zero": "error",
  "eslint/no-cond-assign": "error",
  "eslint/no-const-assign": "error",
  "eslint/no-constant-binary-expression": "error",
  "eslint/no-constant-condition": "error",
  "eslint/no-control-regex": "error",
  "eslint/no-debugger": "error",
  "eslint/no-delete-var": "error",
  "eslint/no-dupe-class-members": "error",
  "eslint/no-dupe-else-if": "error",
  "eslint/no-dupe-keys": "error",
  "eslint/no-duplicate-case": "error",
  "eslint/no-empty": "error",
  "eslint/no-empty-character-class": "error",
  "eslint/no-empty-pattern": "error",
  "eslint/no-empty-static-block": "error",
  "eslint/no-ex-assign": "error",
  "eslint/no-extra-boolean-cast": "error",
  "eslint/no-fallthrough": "error",
  "eslint/no-func-assign": "error",
  "eslint/no-global-assign": "error",
  "eslint/no-import-assign": "error",
  "eslint/no-invalid-regexp": "error",
  "eslint/no-irregular-whitespace": "error",
  "eslint/no-loss-of-precision": "error",
  "eslint/no-misleading-character-class": "error",
  "eslint/no-new-native-nonconstructor": "error",
  "eslint/no-nonoctal-decimal-escape": "error",
  "eslint/no-obj-calls": "error",
  "eslint/no-prototype-builtins": "error",
  "eslint/no-redeclare": "error",
  "eslint/no-regex-spaces": "error",
  "eslint/no-self-assign": "error",
  "eslint/no-setter-return": "error",
  "eslint/no-shadow-restricted-names": "error",
  "eslint/no-sparse-arrays": "error",
  "eslint/no-this-before-super": "error",
  "eslint/no-unassigned-vars": "error",
  "eslint/no-unexpected-multiline": "error",
  "eslint/no-unreachable": "error",
  "eslint/no-unsafe-finally": "error",
  "eslint/no-unsafe-negation": "error",
  "eslint/no-unsafe-optional-chaining": "error",
  "eslint/no-unused-labels": "error",
  "eslint/no-unused-private-class-members": "error",
  "eslint/no-useless-assignment": "error",
  "eslint/no-useless-backreference": "error",
  "eslint/no-useless-catch": "error",
  "eslint/no-useless-escape": "error",
  "eslint/no-with": "error",
  "eslint/preserve-caught-error": "error",
  "eslint/require-yield": "error",
  "eslint/use-isnan": "error",
  "eslint/valid-typeof": "error",
};

// typescript-eslint recommended
const typescript: Rules = {
  "eslint/no-array-constructor": "error",
  "eslint/no-unused-expressions": "error",
  "eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
  "typescript/ban-ts-comment": "error",
  "typescript/no-duplicate-enum-values": "error",
  "typescript/no-empty-object-type": "error",
  "typescript/no-explicit-any": "error",
  "typescript/no-extra-non-null-assertion": "error",
  "typescript/no-misused-new": "error",
  "typescript/no-namespace": "error",
  "typescript/no-non-null-asserted-optional-chain": "error",
  "typescript/no-require-imports": "error",
  "typescript/no-this-alias": "error",
  "typescript/no-unnecessary-type-constraint": "error",
  "typescript/no-unsafe-declaration-merging": "error",
  "typescript/no-unsafe-function-type": "error",
  "typescript/no-wrapper-object-types": "error",
  "typescript/prefer-as-const": "error",
  "typescript/prefer-namespace-keyword": "error",
  "typescript/triple-slash-reference": "error",
};

// eslint-plugin-react-hooks recommended (v7)
const reactHooks: Rules = {
  "react/error-boundaries": "error",
  "react/exhaustive-deps": "warn",
  "react/globals": "error",
  "react/immutability": "error",
  "react/incompatible-library": "warn",
  "react/preserve-manual-memoization": "error",
  "react/purity": "error",
  "react/refs": "error",
  "react/rules-of-hooks": "error",
  "react/set-state-in-effect": "error",
  "react/set-state-in-render": "error",
  "react/static-components": "error",
  "react/unsupported-syntax": "warn",
  "react/use-memo": "error",
};

export const lintRules: Rules = { ...core, ...typescript, ...reactHooks };
