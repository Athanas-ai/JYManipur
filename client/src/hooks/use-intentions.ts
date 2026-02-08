import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CreateIntentionRequest } from "@shared/routes";

export function useIntentions() {
  return useQuery({
    queryKey: [api.intentions.list.path],
    queryFn: async () => {
      const res = await fetch(api.intentions.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch intentions");
      return api.intentions.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateIntention() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateIntentionRequest) => {
      const validated = api.intentions.create.input.parse(data);
      const res = await fetch(api.intentions.create.path, {
        method: api.intentions.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 400) {
           const error = api.intentions.create.responses[400].parse(await res.json());
           throw new Error(error.message);
        }
        throw new Error("Failed to create intention");
      }
      return api.intentions.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.intentions.list.path] });
    },
  });
}

export function useIncrementPrayer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, type }: { id: number; type: 'hailMary' | 'ourFather' | 'rosary' }) => {
      const url = buildUrl(api.intentions.increment.path, { id });
      const res = await fetch(url, {
        method: api.intentions.increment.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to increment prayer");
      return api.intentions.increment.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.intentions.list.path] });
    },
  });
}

export function useMarkIntentionPrinted() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.admin.intentions.markPrinted.path, { id });
      const res = await fetch(url, {
        method: api.admin.intentions.markPrinted.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to mark as printed");
      return api.admin.intentions.markPrinted.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.intentions.list.path] });
    },
  });
}
