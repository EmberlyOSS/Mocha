"use client";

import { GoIssueOpened } from "react-icons/go";
import { Plus } from "lucide-react";
import Link from "next/link";
import { PortalShell } from "@/components/portal/portal-shell";
import { PortalTicketList } from "@/components/portal/portal-ticket-list";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePortalTickets } from "@/hooks/use-tickets";

export default function PortalPage() {
  const { data, isLoading } = usePortalTickets("open");
  const tickets = data?.tickets ?? [];

  return (
    <PortalShell>
      <TooltipProvider>
        <div className="max-w-5xl space-y-6">
          {/* Header */}
          <div className="flex items-end justify-between gap-4">
            <div className="space-y-0.5">
              <h1 className="text-3xl font-bold tracking-tight">Portal</h1>
              <p className="text-muted-foreground text-sm">
                {isLoading
                  ? "Loading…"
                  : `${tickets.length} open issue${tickets.length === 1 ? "" : "s"}`}
              </p>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/portal/new">
                  <Button className="gap-2 rounded-full px-5 font-semibold">
                    <Plus className="h-4 w-4" strokeWidth={2.4} />
                    New issue
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>Submit a new portal issue</TooltipContent>
            </Tooltip>
          </div>

          <Separator />

          {/* Issues list */}
          <div className="rounded-2xl border border-border/50 bg-card/60 overflow-hidden">
            {/* Column header */}
            <div className="flex items-center gap-3 border-b border-border/30 bg-accent/10 px-6 py-3">
              <GoIssueOpened className="h-4 w-4 text-emerald-500" />
              <span className="text-sm font-semibold">Open portal issues</span>
            </div>

            {isLoading ? (
              <div className="divide-y divide-border/30">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 px-6 py-4">
                    <Skeleton className="h-4 w-4 rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3.5 w-3/4 rounded" />
                      <Skeleton className="h-2.5 w-1/3 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <PortalTicketList
                tickets={tickets.slice(0, 10)}
                emptyLabel="No open portal issues yet."
              />
            )}
          </div>
        </div>
      </TooltipProvider>
    </PortalShell>
  );
}
