'use client';

import { PortalShell } from '@/components/portal/portal-shell';
import { PortalTicketList } from '@/components/portal/portal-ticket-list';
import { usePortalTickets } from '@/hooks/use-tickets';

export default function PortalIssuesPage() {
  const { data, isLoading } = usePortalTickets('all');

  return (
    <PortalShell>
      <PortalTicketList
        tickets={data?.tickets ?? []}
        emptyLabel={isLoading ? 'Loading issues...' : 'No portal issues found.'}
      />
    </PortalShell>
  );
}
