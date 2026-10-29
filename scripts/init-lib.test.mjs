import { describe, expect, it } from "vite-plus/test";

import { isValidName, removedAdapters, stripAdapters, stripTemplateOnly } from "./init-lib.mjs";

describe("stripAdapters", () => {
  const source = [
    "const a = 1;",
    'msal: lazy(() => import("./msal")), // @adapter msal',
    'clerk: lazy(() => import("./clerk")), // @adapter clerk',
    "// @adapter-start msal",
    "block();",
    "// @adapter-end msal",
    "VAR=1 # @adapter clerk",
    "end();",
  ].join("\n");

  it("drops tagged lines and blocks of removed adapters and untags the kept one", () => {
    const result = stripAdapters(source, new Set(["msal"]));
    expect(result).toBe(
      ["const a = 1;", 'clerk: lazy(() => import("./clerk")),', "VAR=1", "end();"].join("\n"),
    );
  });

  it("removes every tagged line when all adapters are removed", () => {
    expect(stripAdapters(source, new Set(["msal", "clerk"]))).toBe("const a = 1;\nend();");
  });

  it("leaves untagged text alone and leaves no markers when nothing is removed", () => {
    const result = stripAdapters(source, new Set());
    expect(result).not.toContain("@adapter");
    expect(result).toContain("block();");
  });
});

describe("stripTemplateOnly", () => {
  it("removes template-only blocks", () => {
    const input = ["keep", "# @template-start", "drop", "# @template-end", "keep too"].join("\n");
    expect(stripTemplateOnly(input)).toBe("keep\nkeep too");
  });
});

describe("isValidName", () => {
  it.each(["acme", "acme-portal", "a1"])("accepts %s", (name) => {
    expect(isValidName(name)).toBe(true);
  });

  it.each(["", "Acme", "1acme", "acme_portal", "acme-", "acme--portal", "../x"])(
    "rejects %s",
    (name) => {
      expect(isValidName(name)).toBe(false);
    },
  );
});

describe("removedAdapters", () => {
  it("keeps only the chosen adapter", () => {
    expect([...removedAdapters("msal")]).toEqual(["clerk"]);
    expect([...removedAdapters("none")].sort()).toEqual(["clerk", "msal"]);
  });
});
