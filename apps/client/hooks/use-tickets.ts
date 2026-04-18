'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Ticket } from '@/lib/types';

const fetcher = <T,>(url: string) => api<T>(url);

export function useTicketStats() {
  const openQuery = useQuery({
    queryKey: ['tickets', 'stats', 'open'],
    queryFn: () => fetcher<{ count: number }>('/api/v1/data/tickets/open'),
  });

  const completedQuery = useQuery({
    queryKey: ['tickets', 'stats', 'completed'],
    queryFn: () => fetcher<{ count: number }>('/api/v1/data/tickets/completed'),
  });

  const unassignedQuery = useQuery({
    queryKey: ['tickets', 'stats', 'unassigned'],
    queryFn: () => fetcher<{ count: number }>('/api/v1/data/tickets/unassigned'),
  });

  return {
    open: openQuery.data?.count ?? 0,
    completed: completedQuery.data?.count ?? 0,
    unassigned: unassignedQuery.data?.count ?? 0,
    isLoading: openQuery.isLoading || completedQuery.isLoading || unassignedQuery.isLoading,
  };
}

export function useTickets(status: 'open' | 'closed' = 'open') {
  return useQuery({
    queryKey: ['tickets', status],
    queryFn: () => fetcher<{ tickets: Ticket[] }>(`/api/v1/tickets/${status}`),
  });
}

export function useAllTickets() {
  return useQuery({
    queryKey: ['tickets', 'all'],
    queryFn: () => fetcher<{ tickets: Ticket[] }>('/api/v1/tickets/all'),
    refetchInterval: 5000,
  });
}

export function useTicket(id: string) {
  return useQuery({
    queryKey: ['ticket', id],
    enabled: Boolean(id),
    queryFn: () => fetcher<{ ticket: Ticket }>(`/api/v1/ticket/${id}`),
  });
}

export function usePortalTickets(
  mode: 'all' | 'open' | 'closed' = 'all',
) {
  const endpoint =
    mode === 'open'
      ? '/api/v1/tickets/user/open/external'
      : mode === 'closed'
        ? '/api/v1/tickets/user/closed/external'
        : '/api/v1/tickets/user/external';

  return useQuery({
    queryKey: ['portal-tickets', mode],
    queryFn: () => fetcher<{ tickets: Ticket[] }>(endpoint),
  });
}
