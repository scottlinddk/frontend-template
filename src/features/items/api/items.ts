import { useQueryClient } from "@tanstack/react-query";

import { $api } from "@/shared/api";

/** Query options for the item list. Use with useSuspenseQuery or in a loader. */
export const itemsQueryOptions = () => $api.queryOptions("get", "/items");

export function useCreateItem() {
  const queryClient = useQueryClient();
  return $api.useMutation("post", "/items", {
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["get", "/items"] }),
  });
}
