import { useSuspenseQuery } from "@tanstack/react-query";

import { itemsQueryOptions } from "../api/items";

export function ItemList() {
  const { data } = useSuspenseQuery(itemsQueryOptions());

  if (data.length === 0) return <p className="text-slate-500">No items yet.</p>;
  return (
    <ul className="divide-y divide-slate-200 rounded-md bg-white ring-1 ring-slate-200">
      {data.map((item) => (
        <li key={item.id} className="px-4 py-3">
          {item.title}
        </li>
      ))}
    </ul>
  );
}
