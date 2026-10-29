import { useState, type SubmitEvent } from "react";

import { Button } from "@/shared/ui";

import { useCreateItem } from "../api/items";

export function AddItemForm() {
  const [title, setTitle] = useState("");
  const { mutate, isPending } = useCreateItem();

  const onSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    mutate({ title: trimmed }, { onSuccess: () => setTitle("") });
  };

  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <label className="sr-only" htmlFor="item-title">
        Title
      </label>
      <input
        id="item-title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="New item"
        className="w-full rounded-md px-3 py-2 ring-1 ring-slate-300 focus:ring-2 focus:ring-brand-500 focus:outline-none"
      />
      <Button type="submit" disabled={isPending}>
        Add
      </Button>
    </form>
  );
}
