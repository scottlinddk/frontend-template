import { useSuspenseQuery } from "@tanstack/react-query";

import { useI18n } from "@/i18n";

import { itemsQueryOptions } from "../api/items";

export function ItemList() {
  const { data } = useSuspenseQuery(itemsQueryOptions());
  const { t } = useI18n();

  if (data.length === 0) return <p className="text-ink-muted">{t("items.empty")}</p>;
  return (
    <>
      <p className="text-sm text-ink-muted">{t("items.count", { count: data.length })}</p>
      <ul className="divide-y divide-line rounded-md bg-surface-raised ring-1 ring-line">
        {data.map((item) => (
          <li key={item.id} className="px-4 py-3">
            {item.title}
          </li>
        ))}
      </ul>
    </>
  );
}
