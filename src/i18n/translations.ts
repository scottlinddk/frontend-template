export type Language = "da" | "en";

export const LANGUAGES: readonly Language[] = ["da", "en"];
export const DEFAULT_LANGUAGE: Language = "da";

/**
 * Danish is the source of truth for the dictionary shape. English is typed
 * against it, so a key missing from either language is a compile error.
 * Placeholders use `{name}` and are filled by `t(key, { name })`.
 */
const da = {
  "app.name": "Frontend-skabelon",

  "nav.home": "Forside",
  "nav.items": "Emner",
  "nav.signIn": "Log ind",
  "nav.signOut": "Log ud",

  "controls.language": "Sprog",
  "controls.theme.toLight": "Skift til lyst tema",
  "controls.theme.toDark": "Skift til mørkt tema",

  "home.lead": "En Vite+ skabelon med React, Tailwind og TanStack Query.",

  "items.title": "Emner",
  "items.titleLabel": "Titel",
  "items.placeholder": "Nyt emne",
  "items.add": "Tilføj",
  "items.loading": "Indlæser…",
  "items.empty": "Ingen emner endnu.",
  "items.count": "{count} emner",

  "auth.signingIn": "Logger ind…",

  "error.title": "Noget gik galt",
  "error.pageLoad": "Siden kunne ikke indlæses.",
  "error.unexpected": "Der opstod en uventet fejl.",
  "error.backHome": "Tilbage til forsiden",
  "error.notFound": "Siden blev ikke fundet.",
} as const;

export type TranslationKey = keyof typeof da;

const en: Record<TranslationKey, string> = {
  "app.name": "Frontend template",

  "nav.home": "Home",
  "nav.items": "Items",
  "nav.signIn": "Sign in",
  "nav.signOut": "Sign out",

  "controls.language": "Language",
  "controls.theme.toLight": "Switch to light theme",
  "controls.theme.toDark": "Switch to dark theme",

  "home.lead": "A Vite+ template with React, Tailwind and TanStack Query.",

  "items.title": "Items",
  "items.titleLabel": "Title",
  "items.placeholder": "New item",
  "items.add": "Add",
  "items.loading": "Loading…",
  "items.empty": "No items yet.",
  "items.count": "{count} items",

  "auth.signingIn": "Signing in…",

  "error.title": "Something went wrong",
  "error.pageLoad": "The page could not be loaded.",
  "error.unexpected": "An unexpected error occurred.",
  "error.backHome": "Back to home",
  "error.notFound": "Page not found.",
};

export const translations: Record<Language, Record<TranslationKey, string>> = { da, en };

export type TranslateVars = Record<string, string | number>;

/** Looks up `key` in `language`, falling back to English, then the key itself. */
export function translate(language: Language, key: TranslationKey, vars?: TranslateVars) {
  const template = translations[language][key] ?? translations.en[key] ?? key;
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  );
}

export function isLanguage(value: unknown): value is Language {
  return typeof value === "string" && (LANGUAGES as readonly string[]).includes(value);
}
