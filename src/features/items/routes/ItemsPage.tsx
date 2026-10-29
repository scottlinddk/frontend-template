import { Suspense } from "react";

import { useI18n } from "@/i18n";

import { AddItemForm } from "../components/AddItemForm";
import { ItemList } from "../components/ItemList";

export function Component() {
  const { t } = useI18n();
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">{t("items.title")}</h1>
      <AddItemForm />
      <Suspense fallback={<p className="text-ink-muted">{t("items.loading")}</p>}>
        <ItemList />
      </Suspense>
    </section>
  );
}
