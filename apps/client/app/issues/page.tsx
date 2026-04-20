"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAllTickets } from "@/hooks/use-tickets";
import type { Ticket } from "@/lib/types";

function badgeTone(ticket: Ticket) {
  const priority = ticket.priority?.toLowerCase();
  if (priority === "high") return "destructive";
  if (priority === "normal" || priority === "medium") return "secondary";
  return "outline";
}

export default function IssuesPage() {
  const { data, isLoading } = useAllTickets();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "open" | "closed">("all");

  const tickets = useMemo(() => {
    const source = data?.tickets ?? [];
    return source.filter((ticket) => {
      const matchesQuery =
        !query ||
        ticket.title.toLowerCase().includes(query.toLowerCase()) ||
        ticket.id.toLowerCase().includes(query.toLowerCase()) ||
        ticket.assignedTo?.name?.toLowerCase().includes(query.toLowerCase());

      const matchesFilter =
        filter === "all"
          ? true
          : filter === "closed"
            ? Boolean(ticket.isComplete)
            : !ticket.isComplete;

      return matchesQuery && matchesFilter;
    });
  }, [data?.tickets, filter, query]);

  return (
    <div className="flex flex-col gap-6 p-0 max-w-6xl w-full">
      <Card className="rounded-[2rem] border-border/60 bg-card/60 backdrop-blur-xl shadow-xs overflow-hidden">
        <CardHeader className="gap-6 lg:flex-row lg:items-end lg:justify-between border-b border-border/40 bg-accent/20 px-8 py-6">
          <div>
            <CardTitle className="text-2xl">Issue workspace</CardTitle>
            <CardDescription className="text-base mt-1">
              Migrated from the old `pages/issues` flow into the new client
              shell.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            {(["all", "open", "closed"] as const).map((value) => (
              <Button
                key={value}
                variant={filter === value ? "default" : "secondary"}
                className={`rounded-full px-5 capitalize font-semibold ${filter === value ? "shadow-md" : ""}`}
                onClick={() => setFilter(value)}
              >
                {value}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by title, issue id, or assignee"
              className="w-full pl-12 bg-background/50 h-14 rounded-2xl text-base shadow-sm border-border/80 focus-visible:ring-1"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[2rem] border-border/60 bg-card/60 backdrop-blur-xl shadow-xs overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="px-8 py-20 text-center font-medium text-muted-foreground">
              Loading issues...
            </div>
          ) : tickets.length ? (
            <div className="divide-y divide-border/40">
              {tickets.map((ticket) => (
                <Link
                  key={ticket.id}
                  href={`/issue/${ticket.id}`}
                  className="grid gap-4 px-8 py-5 transition-colors hover:bg-accent/40 lg:grid-cols-[minmax(0,1.5fr)_140px_140px_160px] items-center"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-base">
                      {ticket.title}
                    </p>
                    <p className="mt-1 text-xs font-medium text-muted-foreground">
                      <span className="text-foreground/70">{ticket.id}</span> ·{" "}
                      {ticket.assignedTo?.name ?? "Unassigned"}
                    </p>
                  </div>
                  <div>
                    <Badge
                      variant={badgeTone(ticket) as any}
                      className="capitalize px-3 py-0.5 rounded-full text-[11px] font-bold tracking-wide"
                    >
                      {ticket.priority ?? "Low"}
                    </Badge>
                  </div>
                  <div className="text-sm font-semibold text-muted-foreground">
                    {ticket.isComplete ? (
                      <span className="text-emerald-500">Closed</span>
                    ) : (
                      <span className="text-blue-500">Open</span>
                    )}
                  </div>
                  <div className="text-sm font-medium text-muted-foreground">
                    {new Date(ticket.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="px-8 py-20 text-center font-medium text-muted-foreground">
              No issues matched the current filters.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
