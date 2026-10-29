import { useI18n } from "./I18nProvider";
import { LANGUAGES } from "./translations";

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useI18n();

  return (
    <div
      role="group"
      aria-label={t("controls.language")}
      className="flex overflow-hidden rounded-md ring-1 ring-line"
    >
      {LANGUAGES.map((code) => (
        <button
          key={code}
          type="button"
          lang={code}
          aria-pressed={language === code}
          onClick={() => setLanguage(code)}
          className="px-2 py-1 text-xs font-medium uppercase aria-pressed:bg-brand-600 aria-pressed:text-white"
        >
          {code}
        </button>
      ))}
    </div>
  );
}
