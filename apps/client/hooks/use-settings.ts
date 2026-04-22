"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { SessionRecord } from "@/lib/types";

export function useSessions() {
  return useQuery({
    queryKey: ["sessions"],
    queryFn: () => api<{ sessions: SessionRecord[] }>("/api/v1/auth/sessions"),
  });
}
