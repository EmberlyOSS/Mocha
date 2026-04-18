'use client';

import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const settingsSections = [
  {
    href: '/settings/notifications',
    title: 'Notification preferences',
    description: 'Email and ticket notification toggles.',
  },
  {
    href: '/settings/sessions',
    title: 'Sessions',
    description: 'Review active devices and revoke old sessions.',
  },
  {
    href: '/settings/flags',
    title: 'Feature flags',
    description: 'Local client-side switches preserved from the legacy app.',
  },
];

export default function SettingsPage() {
  return (
    <div className="grid gap-4 p-6 lg:p-8 md:grid-cols-3">
      {settingsSections.map((section) => (
        <Link key={section.href} href={section.href}>
          <Card>
            <CardHeader>
              <CardTitle>{section.title}</CardTitle>
              <CardDescription>{section.description}</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Open section
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
