"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import type { Ticket } from "@/lib/types";

function useQueueTickets(name: string) {
  return useQuery({
    queryKey: ["queue", name],
    enabled: Boolean(name),
    queryFn: () =>
      api<{ tickets: Ticket[] }>(
        `/api/v1/ticket/emailQueue?name=${encodeURIComponent(name)}`,
        {
          auth: false,
        },
      ),
  });
}

export default function QueuePage() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { data, isLoading } = useQueueTickets(id);
  const tickets = data?.tickets ?? [];

  return (
    <div className="p-6 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Queue: {id}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="px-6 py-14 text-center text-sm text-muted-foreground">
              Loading queue...
            </div>
          ) : tickets.length ? (
            <div className="divide-y divide-border">
              {tickets.map((ticket) => (
                <Link
                  key={ticket.id}
                  href={`/issue/${ticket.id}`}
                  className="grid gap-3 px-6 py-4 transition-colors hover:bg-accent lg:grid-cols-[100px_160px_minmax(0,1fr)_140px]"
                >
                  <div className="text-sm text-muted-foreground">
                    #{ticket.Number ?? "-"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {ticket.client?.name ?? "No client"}
                  </div>
                  <div className="truncate font-medium">{ticket.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {ticket.priority ?? "Low"}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="px-6 py-14 text-center text-sm text-muted-foreground">
              No tickets in this queue.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
