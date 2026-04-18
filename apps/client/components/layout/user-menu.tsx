'use client';

import Link from 'next/link';
import { Bell, LogOut, Settings, Shield, UserCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLogout } from '@/hooks/use-auth';
import { useUser } from '@/lib/store';

export function UserMenu() {
  const user = useUser();
  const logout = useLogout();

  if (!user) return null;

  return (
    <div className="flex items-center gap-2">
      <Link href="/notifications">
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-4 w-4" />
        </Button>
      </Link>
      <Link href="/profile">
        <Button variant="outline" size="sm" className="gap-2">
          <UserCircle2 className="h-4 w-4" />
          <span className="max-w-28 truncate">{user.name}</span>
        </Button>
      </Link>
      {user.isAdmin ? (
        <Link href="/admin">
          <Button variant="ghost" size="icon" aria-label="Admin">
            <Shield className="h-4 w-4" />
          </Button>
        </Link>
      ) : null}
      <Link href="/settings">
        <Button variant="ghost" size="icon" aria-label="Settings">
          <Settings className="h-4 w-4" />
        </Button>
      </Link>
      <Button variant="ghost" size="icon" aria-label="Log out" onClick={() => logout(user.id)}>
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
}
