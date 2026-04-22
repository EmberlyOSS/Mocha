"use client";

import { Store, useStore } from "@tanstack/react-store";
import type { User } from "@/lib/types";

interface SessionState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
}

export type { SessionState };

export const sessionStore = new Store<SessionState>({
  user: null,
  loading: true,
  isAuthenticated: false,
});

export const setUser = (user: User | null) => {
  sessionStore.setState((state) => ({
    ...state,
    user,
    isAuthenticated: !!user,
    loading: false,
  }));
};

export const setLoading = (loading: boolean) => {
  sessionStore.setState((state) => ({
    ...state,
    loading,
  }));
};

export const resetSession = () => {
  sessionStore.setState(() => ({
    user: null,
    loading: false,
    isAuthenticated: false,
  }));
};

export function useUser() {
  return useStore(sessionStore, (state) => state.user);
}

export function useSession() {
  return useStore(sessionStore, (state) => state);
}
