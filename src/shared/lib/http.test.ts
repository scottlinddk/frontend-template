import { http as mswHttp, HttpResponse } from "msw";
import { describe, expect, it } from "vite-plus/test";
import { z } from "zod";

import { server } from "@/mocks/server";

import { http, HttpError } from "./http";

describe("http", () => {
  it("validates the response against the schema", async () => {
    server.use(mswHttp.get("*/api/ping", () => HttpResponse.json({ ok: true })));
    await expect(http("/ping", { schema: z.object({ ok: z.boolean() }) })).resolves.toEqual({
      ok: true,
    });
  });

  it("rejects a response that does not match the schema", async () => {
    server.use(mswHttp.get("*/api/ping", () => HttpResponse.json({ ok: "yes" })));
    await expect(http("/ping", { schema: z.object({ ok: z.boolean() }) })).rejects.toThrow();
  });

  it("throws HttpError with status and code from the error body", async () => {
    server.use(
      mswHttp.get("*/api/ping", () =>
        HttpResponse.json({ error: "Nope", code: "denied" }, { status: 403 }),
      ),
    );
    const error = await http("/ping", { schema: z.unknown() }).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(HttpError);
    expect(error).toMatchObject({ status: 403, code: "denied", message: "Nope" });
  });

  it("handles 204 No Content", async () => {
    server.use(mswHttp.delete("*/api/ping", () => new HttpResponse(null, { status: 204 })));
    await expect(
      http("/ping", { method: "DELETE", schema: z.undefined() }),
    ).resolves.toBeUndefined();
  });
});
