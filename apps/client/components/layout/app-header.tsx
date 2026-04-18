'use client';

import { usePathname } from 'next/navigation';
import { UserMenu } from '@/components/layout/user-menu';

const titles: Record<string, string> = {
  '/': 'Dashboard',
  '/issues': 'Issues',
  '/notifications': 'Notifications',
  '/profile': 'Profile',
  '/settings': 'Settings',
  '/settings/notifications': 'Notification Settings',
  '/settings/sessions': 'Sessions',
  '/settings/flags': 'Feature Flags',
};

export function AppHeader() {
  const pathname = usePathname();
  const title = titles[pathname] ?? 'Mocha';

  if (pathname.startsWith('/auth')) return null;

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Mocha Client
          </p>
          <h1 className="text-xl font-semibold">{title}</h1>
        </div>
        <UserMenu />
      </div>
    </header>
  );
}
