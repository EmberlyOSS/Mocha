"use client";

import {
  PiBellDuotone,
  PiArrowSquareOutDuotone,
  PiCheckCircleDuotone,
} from "react-icons/pi";
import { GoIssueOpened } from "react-icons/go";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { api, formatDate } from "@/lib/api";
import { setUser, useSession } from "@/lib/store";

export default function NotificationsPage() {
  const { user } = useSession();
  const [pendingId, setPendingId] = useState<string | null>(null);

  const unread = user?.notifcations?.filter((item) => !item.read) ?? [];

  const markAsRead = async (id: string) => {
    if (!user) return;
    setPendingId(id);
    try {
      await api(`/api/v1/user/notifcation/${id}`);
      setUser({
        ...user,
        notifcations: user.notifcations.map((item) =>
          item.id === id ? { ...item, read: true } : item,
        ),
      });
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    } finally {
      setPendingId(null);
    }
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-6 pb-10 max-w-4xl w-full">
        {/* ── Header ── */}
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/5 bg-white/[0.04]">
            <PiBellDuotone className="h-5 w-5 text-zinc-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Notifications
            </h1>
            <p className="text-sm text-zinc-500 mt-0.5">
              {unread.length === 0
                ? "You're all caught up"
                : `${unread.length} unread notification${unread.length === 1 ? "" : "s"}`}
            </p>
          </div>

          {unread.length > 0 && (
            <div className="ml-auto">
              <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-violet-600 px-2 text-xs font-bold text-white">
                {unread.length}
              </span>
            </div>
          )}
        </div>

        <Separator className="bg-white/5" />

        {/* ── List ── */}
        <div className="rounded-2xl border border-white/5 bg-[#09090b] overflow-hidden">
          {!user ? (
            <div className="divide-y divide-white/5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-start gap-5 px-6 py-5">
                  <Skeleton className="mt-1 h-2 w-2 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3.5 w-3/4 rounded" />
                    <Skeleton className="h-2.5 w-1/3 rounded" />
                  </div>
                  <Skeleton className="h-7 w-24 rounded-full" />
                </div>
              ))}
            </div>
          ) : unread.length ? (
            <ScrollArea className="max-h-[65vh]">
              <div className="divide-y divide-white/[0.04]">
                {unread.map((item) => (
                  <div
                    key={item.id}
                    className="group flex items-start gap-5 px-6 py-4 transition-colors hover:bg-white/[0.025]"
                  >
                    {/* Unread indicator */}
                    <div className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-violet-500 ring-2 ring-violet-500/20" />

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <Link
                        href={item.ticketId ? `/issue/${item.ticketId}` : "/issues"}
                        className="group/link"
                      >
                        <p className="flex items-start gap-2 font-medium text-sm text-zinc-200 group-hover/link:text-white transition-colors leading-relaxed">
                          <GoIssueOpened className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400/70" />
                          {item.text}
                        </p>
                        <p className="mt-1 text-xs text-zinc-600 ml-6">
                          {formatDate(item.createdAt)}
                        </p>
                      </Link>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {item.ticketId && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link href={`/issue/${item.ticketId}`}>
                              <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/5 bg-white/[0.03] text-zinc-600 transition hover:border-white/10 hover:text-zinc-400">
                                <PiArrowSquareOutDuotone className="h-4 w-4" />
                              </button>
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent>View issue</TooltipContent>
                        </Tooltip>
                      )}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full px-3 text-xs font-semibold border-white/10 bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08] hover:text-white h-8 gap-1.5"
                            disabled={pendingId === item.id}
                            onClick={(e) => {
                              e.preventDefault();
                              void markAsRead(item.id);
                            }}
                          >
                            {pendingId === item.id ? (
                              "Saving…"
                            ) : (
                              <>
                                <PiCheckCircleDuotone className="h-3.5 w-3.5" />
                                Mark read
                              </>
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Dismiss this notification</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex flex-col items-center gap-4 py-24 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/5 bg-white/[0.03]">
                <PiBellDuotone className="h-7 w-7 text-zinc-700" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-zinc-400">
                  You&apos;re all caught up
                </p>
                <p className="text-xs text-zinc-600">
                  No unread notifications right now.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
