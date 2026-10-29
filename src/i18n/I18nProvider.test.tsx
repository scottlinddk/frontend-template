import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vite-plus/test";

import { I18nProvider, useI18n } from "./I18nProvider";
import { LanguageSwitcher } from "./LanguageSwitcher";

function Probe() {
  const { t } = useI18n();
  return <p>{t("nav.home")}</p>;
}

afterEach(() => window.localStorage.clear());

describe("I18nProvider", () => {
  it("starts in Danish, switches language, and persists the choice", async () => {
    const user = userEvent.setup();
    render(
      <I18nProvider>
        <LanguageSwitcher />
        <Probe />
      </I18nProvider>,
    );

    expect(screen.getByText("Forside")).toBeInTheDocument();
    expect(document.documentElement.lang).toBe("da");

    await user.click(screen.getByRole("button", { name: "en" }));

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(document.documentElement.lang).toBe("en");
    expect(window.localStorage.getItem("frontend-template.language")).toBe("en");
  });

  it("restores the stored language", () => {
    window.localStorage.setItem("frontend-template.language", "en");
    render(
      <I18nProvider>
        <Probe />
      </I18nProvider>,
    );
    expect(screen.getByText("Home")).toBeInTheDocument();
  });
});
