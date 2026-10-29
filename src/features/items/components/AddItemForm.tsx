import { useState, type SubmitEvent } from "react";

import { useI18n } from "@/i18n";
import { Button } from "@/shared/ui";

import { useCreateItem } from "../api/items";

export function AddItemForm() {
  const [title, setTitle] = useState("");
  const { mutate, isPending } = useCreateItem();
  const { t } = useI18n();

  const onSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    mutate({ body: { title: trimmed } }, { onSuccess: () => setTitle("") });
  };

  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <label className="sr-only" htmlFor="item-title">
        {t("items.titleLabel")}
      </label>
      <input
        id="item-title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder={t("items.placeholder")}
        className="w-full rounded-md bg-surface-raised px-3 py-2 ring-1 ring-line focus:ring-2 focus:ring-brand-500 focus:outline-none"
      />
      <Button type="submit" disabled={isPending}>
        {t("items.add")}
      </Button>
    </form>
  );
}
