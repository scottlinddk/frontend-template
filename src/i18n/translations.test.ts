import { describe, expect, it } from "vite-plus/test";

import { DEFAULT_LANGUAGE, translate, translations } from "./translations";

describe("translate", () => {
  it("defaults to Danish", () => {
    expect(DEFAULT_LANGUAGE).toBe("da");
  });

  it("returns the text for the requested language", () => {
    expect(translate("da", "nav.home")).toBe("Forside");
    expect(translate("en", "nav.home")).toBe("Home");
  });

  it("fills {placeholders} and leaves unknown ones untouched", () => {
    expect(translate("en", "items.count", { count: 3 })).toBe("3 items");
    expect(translate("en", "items.count", { other: 1 })).toBe("{count} items");
  });

  it("keeps both dictionaries in sync", () => {
    expect(Object.keys(translations.en).sort()).toEqual(Object.keys(translations.da).sort());
  });
});
