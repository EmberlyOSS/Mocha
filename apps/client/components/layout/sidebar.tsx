'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  CircleDot, 
  FileText,
  LayoutDashboard, 
  Bell,
  Settings, 
  UserCircle2,
  FolderKanban,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser, useSession } from '@/lib/store';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Issues', href: '/issues', icon: CircleDot },
  { name: 'Documents', href: '/documents', icon: FileText },
  { name: 'Portal', href: '/portal', icon: FolderKanban },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Profile', href: '/profile', icon: UserCircle2 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const user = useUser();
  const { loading } = useSession();

  // Hide sidebar on auth pages
  if (pathname.startsWith('/auth')) return null;

  return (
    <div className="hidden h-full w-64 shrink-0 flex-col border-r border-border bg-card lg:flex">
      <div className="flex h-16 items-center px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <div className="h-8 w-8 rounded-lg bg-linear-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white">
            M
          </div>
          <span>Mocha</span>
        </Link>
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto px-4 py-4">
        <nav className="flex-1 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <item.icon className={cn('h-4 w-4', isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-accent-foreground')} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="border-t border-border p-4">
        {loading ? (
          <div className="flex items-center justify-center py-2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : user ? (
          <div className="flex items-center gap-3 rounded-lg border border-border/70 bg-background px-3 py-2">
            {user.avatar ? (
               <img src={user.avatar} className="h-8 w-8 rounded-full object-cover" alt={user.name} />
            ) : (
              <div className="h-8 w-8 rounded-full bg-linear-to-br from-violet-100 to-indigo-100 dark:from-violet-900/40 dark:to-indigo-900/40 flex items-center justify-center text-[10px] font-bold text-primary">
                {user.name.split(' ').map(n => n[0]).join('')}
              </div>
            )}
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium truncate">{user.name}</span>
              <span className="text-xs text-muted-foreground truncate">{user.isAdmin ? 'Admin' : 'Member'}</span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
