import { http, HttpResponse } from "msw";

import type { Schemas } from "@/shared/api";

// Typed against the generated schema: if openapi/openapi.json changes shape,
// these handlers stop compiling until they are updated.
type Item = Schemas["Item"];
type NewItem = Schemas["NewItem"];
type ApiError = Schemas["ApiError"];

const seed = (): Item[] => [
  { id: "1", title: "First item" },
  { id: "2", title: "Second item" },
];

let items = seed();

/** Reset in-memory data between tests. */
export function resetMockData() {
  items = seed();
}

export const handlers = [
  http.get("*/api/items", () => HttpResponse.json<Item[]>(items)),
  http.post<never, NewItem, Item | ApiError>("*/api/items", async ({ request }) => {
    const { title } = await request.json();
    if (!title.trim()) {
      return HttpResponse.json<ApiError>(
        { error: "Title is required", code: "invalid_title" },
        { status: 400 },
      );
    }
    const created: Item = { id: String(items.length + 1), title };
    items = [...items, created];
    return HttpResponse.json<Item>(created, { status: 201 });
  }),
];
