"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { PortalShell } from "@/components/portal/portal-shell";
import { PortalTicketList } from "@/components/portal/portal-ticket-list";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { usePortalTickets } from "@/hooks/use-tickets";

export default function PortalPage() {
  const { data, isLoading } = usePortalTickets("open");
  const tickets = data?.tickets ?? [];

  return (
    <PortalShell>
      <section className="grid gap-6 xl:grid-cols-[1.6fr_1fr] p-0 max-w-6xl">
        <Card className="rounded-[2rem] border-border/60 bg-card/60 backdrop-blur-xl shadow-xs overflow-hidden">
          <CardHeader className="bg-accent/20 border-b border-border/40 px-8 py-6">
            <CardTitle className="text-xl">Open portal issues</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <PortalTicketList
              tickets={tickets.slice(0, 10)}
              emptyLabel={
                isLoading
                  ? "Loading portal issues..."
                  : "No open portal issues yet."
              }
            />
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-border/60 bg-card/60 backdrop-blur-xl shadow-xs overflow-hidden h-fit">
          <CardHeader className="bg-accent/20 border-b border-border/40 px-8 py-6">
            <CardTitle className="text-xl">Portal actions</CardTitle>
            <CardDescription>Customer-facing issue tracking</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-8 text-sm font-medium text-muted-foreground/90">
            <p className="leading-relaxed">
              Create and track external customer issues from the new client
              shell seamlessly alongside internal ones.
            </p>
            <Link href="/portal/new" className="block w-full">
              <Button
                size="lg"
                className="w-full gap-2 rounded-xl h-12 font-semibold shadow-sm"
              >
                <Plus className="h-4 w-4" />
                New issue
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </PortalShell>
  );
}
