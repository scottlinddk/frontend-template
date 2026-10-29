import { expect, test } from "@playwright/test";

test.describe("shell", () => {
  test("renders in Danish by default", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Forside" })).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", "da");
  });

  test("switches language and remembers it after a reload", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "en", exact: true }).click();
    await expect(page.getByRole("link", { name: "Home" })).toBeVisible();

    await page.reload();
    await expect(page.getByRole("link", { name: "Home" })).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });

  test("toggles dark theme and remembers it after a reload", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");
    await expect(page.locator("html")).not.toHaveClass(/dark/);

    await page.getByRole("button", { name: "Skift til mørkt tema" }).click();
    await expect(page.locator("html")).toHaveClass(/dark/);

    await page.reload();
    await expect(page.locator("html")).toHaveClass(/dark/);
  });

  test("shows a not-found page for unknown routes", async ({ page }) => {
    await page.goto("/does-not-exist");
    await expect(page.getByText("Siden blev ikke fundet.")).toBeVisible();
  });
});

test.describe("items", () => {
  test("lists items and adds a new one", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Emner" }).click();

    await expect(page.getByText("First item")).toBeVisible();
    await expect(page.getByText("2 emner")).toBeVisible();

    await page.getByLabel("Titel").fill("Playwright item");
    await page.getByRole("button", { name: "Tilføj" }).click();

    await expect(page.getByText("Playwright item")).toBeVisible();
    await expect(page.getByText("3 emner")).toBeVisible();
  });

  test("supports deep links", async ({ page }) => {
    await page.goto("/items");
    await expect(page.getByText("First item")).toBeVisible();
  });

  test("has no console errors on the happy path", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });

    await page.goto("/items");
    await expect(page.getByText("First item")).toBeVisible();
    expect(errors).toEqual([]);
  });
});
