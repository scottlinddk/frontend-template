import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";

import { http } from "@/shared/lib/http";

import { itemListSchema, itemSchema, type NewItem } from "../types";

export const itemKeys = {
  all: ["items"] as const,
  list: () => [...itemKeys.all, "list"] as const,
};

export const itemsQueryOptions = () =>
  queryOptions({
    queryKey: itemKeys.list(),
    queryFn: () => http("/items", { schema: itemListSchema }),
  });

export function useCreateItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (item: NewItem) =>
      http("/items", { method: "POST", body: item, schema: itemSchema }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: itemKeys.all }),
  });
}
