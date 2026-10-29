import { http as mswHttp, HttpResponse } from "msw";
import { describe, expect, it } from "vite-plus/test";

import { server } from "@/mocks/server";
import { setTokenGetter } from "@/shared/auth/token";
import { HttpError } from "@/shared/lib/http";

import { fetchClient } from "./client";

describe("generated client", () => {
  it("returns typed data", async () => {
    const { data } = await fetchClient.GET("/items");
    expect(data?.[0]).toMatchObject({ id: "1", title: "First item" });
  });

  it("sends the access token as a bearer header", async () => {
    let seen: string | null = null;
    server.use(
      mswHttp.get("*/api/items", ({ request }) => {
        seen = request.headers.get("authorization");
        return HttpResponse.json([]);
      }),
    );
    setTokenGetter(() => Promise.resolve("secret"));
    await fetchClient.GET("/items");
    setTokenGetter(() => Promise.resolve(null));
    expect(seen).toBe("Bearer secret");
  });

  it("rejects with HttpError on non-2xx responses", async () => {
    server.use(
      mswHttp.get("*/api/items", () =>
        HttpResponse.json({ error: "Unauthorized", code: "no_token" }, { status: 401 }),
      ),
    );
    const error = await fetchClient.GET("/items").catch((e: unknown) => e);
    expect(error).toBeInstanceOf(HttpError);
    expect(error).toMatchObject({ status: 401, code: "no_token" });
  });
});
