import { z } from "zod";

export const itemSchema = z.object({ id: z.string(), title: z.string() });
export const itemListSchema = z.array(itemSchema);

export type Item = z.infer<typeof itemSchema>;
export type NewItem = Pick<Item, "title">;
