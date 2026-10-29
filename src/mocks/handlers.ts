import { http, HttpResponse } from "msw";

import type { Item } from "@/features/items";

let items: Item[] = [
  { id: "1", title: "First item" },
  { id: "2", title: "Second item" },
];

/** Reset in-memory data between tests. */
export function resetMockData() {
  items = [
    { id: "1", title: "First item" },
    { id: "2", title: "Second item" },
  ];
}

export const handlers = [
  http.get("*/api/items", () => HttpResponse.json(items)),
  http.post("*/api/items", async ({ request }) => {
    const { title } = (await request.json()) as { title: string };
    const created: Item = { id: String(items.length + 1), title };
    items = [...items, created];
    return HttpResponse.json(created, { status: 201 });
  }),
];
