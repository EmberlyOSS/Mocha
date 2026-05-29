"use client";

import Link from "next/link";
import { use, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTickets } from "@/hooks/use-tickets";

const statusCopy = {
  open: {
    title: "Open issues",
    description: "Review active support tickets.",
    empty: "No open issues were returned.",
  },
  closed: {
    title: "Closed issues",
    description: "Review resolved support tickets.",
    empty: "No closed issues were returned.",
  },
  unassigned: {
    title: "Unassigned issues",
    description: "Review active tickets without an assignee.",
    empty: "No unassigned issues were returned.",
  },
} as const;

type IssueStatus = keyof typeof statusCopy;

const isIssueStatus = (status: string): status is IssueStatus =>
  status in statusCopy;

export default function FilteredIssuesPage({
  params,
}: {
  params: Promise<{ status: string }>;
}) {
  const { status } = use(params);
  const currentStatus = isIssueStatus(status) ? status : "open";
  const copy = statusCopy[currentStatus];
  const { data, isLoading } = useTickets(currentStatus);

  const tickets = useMemo(() => {
    return data?.tickets ?? [];
  }, [data?.tickets]);
  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>{copy.title}</CardTitle>
            <CardDescription>{copy.description}</CardDescription>
          </div>
          <Link href="/issues">
            <Button variant="outline" size="sm">
              All issues
            </Button>
          </Link>
        </CardHeader>
      </Card>
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="px-6 py-16 text-center text-sm text-muted-foreground">
              Loading issues...
            </div>
          ) : tickets.length ? (
            <div className="divide-y divide-border">
              {tickets.map((ticket) => (
                <Link
                  key={ticket.id}
                  href={`/issue/${ticket.id}`}
                  className="grid gap-3 px-6 py-4 transition-colors hover:bg-accent lg:grid-cols-[minmax(0,1.5fr)_160px_160px]"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{ticket.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {ticket.id} · {ticket.assignedTo?.name ?? "Unassigned"}
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {ticket.priority ?? "Normal"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(ticket.createdAt).toLocaleDateString("en-GB")}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="px-6 py-16 text-center text-sm text-muted-foreground">
              {copy.empty}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
