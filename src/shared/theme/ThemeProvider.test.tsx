import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vite-plus/test";

import { I18nProvider } from "@/i18n";

import { ThemeProvider } from "./ThemeProvider";
import { ThemeToggle } from "./ThemeToggle";

afterEach(() => {
  window.localStorage.clear();
  document.documentElement.classList.remove("dark");
});

function setup() {
  render(
    <I18nProvider initialLanguage="en">
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    </I18nProvider>,
  );
}

describe("ThemeProvider", () => {
  it("toggles the dark class and persists the choice", async () => {
    const user = userEvent.setup();
    setup();

    await user.click(screen.getByRole("button", { name: "Switch to dark theme" }));
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(window.localStorage.getItem("frontend-template.theme")).toBe("dark");

    await user.click(screen.getByRole("button", { name: "Switch to light theme" }));
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("uses the stored theme on load", () => {
    window.localStorage.setItem("frontend-template.theme", "dark");
    setup();
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });
});
