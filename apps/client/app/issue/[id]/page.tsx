"use client";

import { useParams } from "next/navigation";
import { GoIssueOpened, GoIssueClosed } from "react-icons/go";
import { PiCalendarDuotone, PiUserDuotone, PiTagDuotone } from "react-icons/pi";
import type * as React from "react";
import { CardContent } from "@/components/ui/card";
import { useTicket } from "@/hooks/use-tickets";
import { formatDate } from "@/lib/api";

export default function IssueDetailPage() {
  const params = useParams<{ id: string }>();
  const ticketId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { data, isLoading } = useTicket(ticketId);
  const ticket = data?.ticket;

  return (
    <div className="flex flex-col gap-6 pb-10">
      <section className="overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#09090b] shadow-[0_28px_80px_rgba(0,0,0,0.35)]">
        <div className="border-b border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))] px-6 py-5">
          <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-zinc-500">
            <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1">
              {ticket?.id ?? ticketId}
            </span>
            <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1">
              {ticket?.assignedTo?.name ?? "Unassigned"}
            </span>
            <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1">
              {ticket?.client?.name ?? "No project"}
            </span>
          </div>
          <div className="mt-4 flex flex-col gap-2">
            <h1 className="text-3xl font-semibold tracking-tight text-white">
              {isLoading ? "Loading issue..." : (ticket?.title ?? "Issue not found")}
            </h1>
            <p className="text-sm text-zinc-500">
              {ticket?.detail?.slice(0, 140) ??
                "The issue detail shell surfaces the core metadata and conversation summary."}
            </p>
          </div>
        </div>

        <CardContent className="space-y-6 p-6 text-sm">
          {ticket ? (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <DetailCard
                  label="Status"
                  value={ticket.isComplete ? "Closed" : (ticket.status ?? "Open")}
                  icon={ticket.isComplete ? GoIssueClosed : GoIssueOpened}
                  tone={ticket.isComplete ? "text-violet-400" : "text-emerald-400"}
                />
                <DetailCard
                  label="Priority"
                  value={ticket.priority ?? "Normal"}
                  icon={PiTagDuotone}
                  tone="text-amber-400"
                />
                <DetailCard
                  label="Created"
                  value={formatDate(ticket.createdAt)}
                  icon={PiCalendarDuotone}
                  tone="text-zinc-400"
                />
              </div>

              <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.03] p-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                    Detail
                  </p>
                  <p className="mt-3 whitespace-pre-wrap leading-7 text-zinc-300">
                    {ticket.note ||
                      ticket.detail ||
                      "The rich editor view has not been migrated yet. This page is the thin detail shell for the new app."}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.03] p-5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                      Assignee
                    </p>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.05]">
                        <PiUserDuotone className="h-4 w-4 text-zinc-300" />
                      </div>
                      <div>
                        <p className="font-medium text-white">
                          {ticket.assignedTo?.name ?? "Unassigned"}
                        </p>
                        <p className="text-sm text-zinc-500">
                          {ticket.client?.name ?? "No project attached"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.03] p-5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
                      Internal note
                    </p>
                    <p className="mt-3 text-sm leading-6 text-zinc-400">
                      {ticket.note ? "Composer metadata was stored on this issue." : "No internal note was added."}
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-[24px] border border-dashed border-white/10 px-6 py-10 text-zinc-500">
              The issue payload could not be loaded.
            </div>
          )}
        </CardContent>
      </section>
    </div>
  );
}

function DetailCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.03] p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
          {label}
        </p>
        <Icon className={`h-4 w-4 ${tone}`} />
      </div>
      <p className="mt-3 text-lg font-semibold tracking-tight text-white">
        {value}
      </p>
    </div>
  );
}
