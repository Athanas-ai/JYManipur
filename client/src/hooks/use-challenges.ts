import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CreateChallengeRequest } from "@shared/routes";

// Public Hooks
export function useActiveChallenge() {
  return useQuery({
    queryKey: [api.challenges.active.path],
    queryFn: async () => {
      const res = await fetch(api.challenges.active.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch active challenge");
      const data = await res.json();
      return api.challenges.active.responses[200].parse(data);
    },
  });
}

export function useIncrementChallenge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.challenges.increment.path, { id });
      const res = await fetch(url, {
        method: api.challenges.increment.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to increment challenge");
      return api.challenges.increment.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.challenges.active.path] });
      queryClient.invalidateQueries({ queryKey: [api.admin.challenges.list.path] });
    },
  });
}

// Admin Hooks
export function useAdminChallenges() {
  return useQuery({
    queryKey: [api.admin.challenges.list.path],
    queryFn: async () => {
      const res = await fetch(api.admin.challenges.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch challenges");
      return api.admin.challenges.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateChallenge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateChallengeRequest) => {
      const validated = api.admin.challenges.create.input.parse(data);
      const res = await fetch(api.admin.challenges.create.path, {
        method: api.admin.challenges.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create challenge");
      return api.admin.challenges.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.admin.challenges.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.challenges.active.path] });
    },
  });
}

export function useUpdateChallenge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<CreateChallengeRequest>) => {
      const validated = api.admin.challenges.update.input.parse(updates);
      const url = buildUrl(api.admin.challenges.update.path, { id });
      const res = await fetch(url, {
        method: api.admin.challenges.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update challenge");
      return api.admin.challenges.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.admin.challenges.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.challenges.active.path] });
    },
  });
}

export function useDeleteChallenge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.admin.challenges.delete.path, { id });
      const res = await fetch(url, {
        method: api.admin.challenges.delete.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete challenge");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.admin.challenges.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.challenges.active.path] });
    },
  });
}
