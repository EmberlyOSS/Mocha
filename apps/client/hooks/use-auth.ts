'use client';

import { deleteCookie } from 'cookies-next';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { resetSession } from '@/lib/store';

export function useLogout() {
  const router = useRouter();

  return async (userId?: string) => {
    try {
      if (userId) {
        await api(`/api/v1/auth/user/${userId}/logout`, {
          method: 'GET',
        });
      }
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      deleteCookie('session');
      resetSession();
      router.replace('/auth/login');
      router.refresh();
    }
  };
}
