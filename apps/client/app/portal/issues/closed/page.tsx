"use client";

import { PortalShell } from "@/components/portal/portal-shell";
import { PortalTicketList } from "@/components/portal/portal-ticket-list";
import { usePortalTickets } from "@/hooks/use-tickets";

export default function PortalClosedIssuesPage() {
  const { data, isLoading } = usePortalTickets("closed");

  return (
    <PortalShell>
      <PortalTicketList
        tickets={data?.tickets ?? []}
        emptyLabel={
          isLoading ? "Loading closed issues..." : "No closed portal issues."
        }
      />
    </PortalShell>
  );
}
