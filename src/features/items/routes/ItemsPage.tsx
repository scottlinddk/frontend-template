import { Suspense } from "react";

import { AddItemForm } from "../components/AddItemForm";
import { ItemList } from "../components/ItemList";

export function Component() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Items</h1>
      <AddItemForm />
      <Suspense fallback={<p className="text-slate-500">Loading…</p>}>
        <ItemList />
      </Suspense>
    </section>
  );
}
