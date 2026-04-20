"use client";

import { getCookie } from "cookies-next";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { api } from "@/lib/api";
import { resetSession, setLoading, setUser } from "@/lib/store";
import type { User } from "@/lib/types";

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const fetchUserProfile = async () => {
    const token = getCookie("session");

    if (pathname.startsWith("/auth")) {
      setLoading(false);
      return;
    }

    if (!token) {
      resetSession();
      router.replace("/auth/login");
      return;
    }

    try {
      const data = await api<{ user?: User }>("/api/v1/auth/profile");

      if (data.user) {
        setUser(data.user);
      } else {
        resetSession();
        router.replace("/auth/login");
      }
    } catch (error) {
      console.error("Session error:", error);
      resetSession();
      router.replace("/auth/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchUserProfile();
  }, [pathname]);

  return <>{children}</>;
}
