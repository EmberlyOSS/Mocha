"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Notebook } from "@/lib/types";

export function useDocuments() {
  return useQuery({
    queryKey: ["documents"],
    queryFn: () => api<{ notebooks: Notebook[] }>("/api/v1/notebooks/all"),
  });
}

export function useDocument(id: string) {
  return useQuery({
    queryKey: ["document", id],
    enabled: Boolean(id),
    queryFn: () => api<{ note: Notebook }>(`/api/v1/notebooks/note/${id}`),
  });
}
