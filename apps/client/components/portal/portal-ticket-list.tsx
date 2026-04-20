"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Ticket } from "@/lib/types";

function priorityTone(priority?: string) {
  const value = priority?.toLowerCase();
  if (value === "high") return "bg-red-50 text-red-700";
  if (value === "normal" || value === "medium")
    return "bg-emerald-50 text-emerald-700";
  return "bg-blue-50 text-blue-700";
}

export function PortalTicketList({
  tickets,
  emptyLabel,
}: {
  tickets: Ticket[];
  emptyLabel: string;
}) {
  if (!tickets.length) {
    return (
      <Card>
        <CardContent className="px-6 py-16 text-center text-sm text-muted-foreground">
          {emptyLabel}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Issues</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {tickets.map((ticket) => (
            <Link
              key={ticket.id}
              href={`/portal/issue/${ticket.id}`}
              className="grid gap-3 px-6 py-4 transition-colors hover:bg-accent lg:grid-cols-[minmax(0,1.3fr)_110px_130px_140px]"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{ticket.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  #{ticket.Number ?? ticket.id} ·{" "}
                  {ticket.assignedTo?.name ?? "Unassigned"}
                </p>
              </div>
              <div>
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${priorityTone(ticket.priority)}`}
                >
                  {ticket.priority ?? "Low"}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                {ticket.isComplete ? "Closed" : "Open"}
              </div>
              <div className="text-sm text-muted-foreground">
                {new Date(ticket.createdAt).toLocaleDateString("en-GB")}
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
