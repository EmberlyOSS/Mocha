"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSessions } from "@/hooks/use-settings";
import { api, formatDate, getPrettyUserAgent } from "@/lib/api";

export default function SessionsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useSessions();

  const revokeSession = async (sessionId: string) => {
    try {
      await api(`/api/v1/auth/sessions/${sessionId}`, {
        method: "DELETE",
      });
      await queryClient.invalidateQueries({ queryKey: ["sessions"] });
    } catch (error) {
      console.error("Failed to revoke session", error);
    }
  };

  return (
    <div className="pb-10">
      <Card className="max-w-4xl overflow-hidden rounded-[28px] border-white/[0.08] bg-[#09090b] shadow-[0_28px_80px_rgba(0,0,0,0.35)]">
        <CardHeader className="border-b border-white/[0.08] bg-white/[0.02]">
          <CardTitle className="text-white">Active sessions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-6">
          {isLoading ? (
            <div className="rounded-[24px] border border-dashed border-white/10 px-4 py-10 text-center text-sm text-zinc-500">
              Loading sessions...
            </div>
          ) : (
            data?.sessions?.map((session) => (
              <div
                key={session.id}
                className="flex flex-col gap-4 rounded-[24px] border border-white/[0.08] bg-white/[0.03] px-4 py-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="space-y-1 text-sm">
                  <p className="font-medium text-white">
                    {session.ipAddress === "::1"
                      ? "Localhost"
                      : session.ipAddress}
                  </p>
                  <p className="text-zinc-500">
                    {getPrettyUserAgent(session.userAgent)}
                  </p>
                  <p className="text-zinc-500">
                    Created: {formatDate(session.createdAt)}
                  </p>
                  <p className="text-zinc-500">
                    Expires: {formatDate(session.expires)}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => void revokeSession(session.id)}
                  className="rounded-full"
                >
                  Revoke
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
