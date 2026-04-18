'use client';

import { PortalShell } from '@/components/portal/portal-shell';
import { PortalTicketList } from '@/components/portal/portal-ticket-list';
import { usePortalTickets } from '@/hooks/use-tickets';

export default function PortalOpenIssuesPage() {
  const { data, isLoading } = usePortalTickets('open');

  return (
    <PortalShell>
      <PortalTicketList
        tickets={data?.tickets ?? []}
        emptyLabel={isLoading ? 'Loading open issues...' : 'No open portal issues.'}
      />
    </PortalShell>
  );
}
