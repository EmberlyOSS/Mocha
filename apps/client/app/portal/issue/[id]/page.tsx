"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useState } from "react";
import {
  PiChatDuotone,
  PiCheckCircleDuotone,
  PiArrowCounterClockwiseDuotone,
  PiClockDuotone,
  PiHashDuotone,
  PiUserDuotone,
} from "react-icons/pi";
import { GoIssueOpened, GoIssueClosed } from "react-icons/go";
import { PortalShell } from "@/components/portal/portal-shell";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useTicket } from "@/hooks/use-tickets";
import { api, formatDate } from "@/lib/api";

export default function PortalIssueDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const queryClient = useQueryClient();
  const { data, isLoading } = useTicket(id);
  const [comment, setComment] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const ticket = data?.ticket;

  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["ticket", id] }),
      queryClient.invalidateQueries({ queryKey: ["portal-tickets"] }),
    ]);
  };

  const toggleStatus = async () => {
    if (!ticket) return;
    setStatusMsg("Saving…");
    try {
      await api("/api/v1/ticket/status/update", {
        method: "PUT",
        json: { status: !ticket.isComplete, id },
      });
      await refresh();
      setStatusMsg("");
    } catch {
      setStatusMsg("Save failed.");
    }
  };

  const addComment = async () => {
    if (!comment.trim()) return;
    setStatusMsg("Saving…");
    try {
      await api("/api/v1/ticket/comment", {
        method: "POST",
        json: { text: comment, id, public: true },
      });
      setComment("");
      await refresh();
      setStatusMsg("");
    } catch {
      setStatusMsg("Comment failed.");
    }
  };

  return (
    <PortalShell>
      <div className="max-w-3xl space-y-6">
        {/* ── Title/Status bar ── */}
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-8 w-2/3 rounded" />
            <Skeleton className="h-4 w-1/3 rounded" />
          </div>
        ) : ticket ? (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                {ticket.isComplete ? (
                  <GoIssueClosed className="mt-1 h-5 w-5 shrink-0 text-violet-400" />
                ) : (
                  <GoIssueOpened className="mt-1 h-5 w-5 shrink-0 text-emerald-400" />
                )}
                <h1 className="text-2xl font-bold text-foreground leading-tight">
                  {ticket.title}
                </h1>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 rounded-full gap-1.5 text-xs font-semibold"
                onClick={() => void toggleStatus()}
              >
                {ticket.isComplete ? (
                  <>
                    <PiArrowCounterClockwiseDuotone className="h-3.5 w-3.5" />
                    Reopen
                  </>
                ) : (
                  <>
                    <PiCheckCircleDuotone className="h-3.5 w-3.5 text-emerald-400" />
                    Close issue
                  </>
                )}
              </Button>
            </div>

            {statusMsg && (
              <p className="text-xs text-muted-foreground">{statusMsg}</p>
            )}

            {/* ── Meta pills ── */}
            <div className="flex flex-wrap gap-2">
              <Badge
                variant="secondary"
                className="gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
              >
                <PiHashDuotone className="h-3.5 w-3.5" />
                {ticket.Number ?? ticket.id}
              </Badge>
              <Badge
                variant="secondary"
                className={`gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                  ticket.isComplete
                    ? "bg-violet-500/10 text-violet-400 border-violet-500/20"
                    : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                }`}
              >
                {ticket.isComplete ? (
                  <GoIssueClosed className="h-3.5 w-3.5" />
                ) : (
                  <GoIssueOpened className="h-3.5 w-3.5" />
                )}
                {ticket.isComplete ? "Closed" : "Open"}
              </Badge>
              <Badge
                variant="secondary"
                className="gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
              >
                <PiClockDuotone className="h-3.5 w-3.5" />
                {formatDate(ticket.createdAt)}
              </Badge>
              {ticket.assignedTo?.name && (
                <Badge
                  variant="secondary"
                  className="gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
                >
                  <PiUserDuotone className="h-3.5 w-3.5" />
                  {ticket.assignedTo.name}
                </Badge>
              )}
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground">Issue not found.</p>
        )}

        <Separator />

        {/* ── Description ── */}
        {ticket && (
          <div className="rounded-xl border border-border/40 bg-card/60 p-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Description
            </p>
            <p className="whitespace-pre-wrap text-sm text-foreground/80 leading-relaxed">
              {ticket.detail || ticket.note || "No description provided."}
            </p>
          </div>
        )}

        {/* ── Comments ── */}
        {ticket && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <PiChatDuotone className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-semibold text-foreground">
                Comments{" "}
                <span className="text-muted-foreground font-normal">
                  ({(ticket.comments ?? []).length})
                </span>
              </p>
            </div>

            {(ticket.comments ?? []).length > 0 && (
              <div className="space-y-3">
                {(ticket.comments ?? []).map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3 rounded-xl border border-border/40 bg-card/60 p-4"
                  >
                    <Avatar className="h-8 w-8 rounded-lg shrink-0">
                      <AvatarFallback className="rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 text-xs font-bold text-white">
                        {item.user.name[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">{item.user.name}</p>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(item.createdAt)}
                        </span>
                      </div>
                      <p className="mt-1.5 text-sm whitespace-pre-wrap text-foreground/80">
                        {item.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Comment box */}
            <div className="rounded-xl border border-border/50 bg-card/40 overflow-hidden">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="min-h-24 w-full resize-none bg-transparent px-4 py-3 text-sm outline-none placeholder-muted-foreground"
                placeholder="Leave a comment…"
              />
              <div className="flex items-center justify-between border-t border-border/30 bg-accent/10 px-4 py-2.5">
                <p className="text-xs text-muted-foreground">{statusMsg}</p>
                <Button
                  size="sm"
                  onClick={() => void addComment()}
                  disabled={!comment.trim()}
                  className="rounded-full px-5 gap-1.5 text-xs font-semibold"
                >
                  <PiChatDuotone className="h-3.5 w-3.5" />
                  Add comment
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PortalShell>
  );
}
