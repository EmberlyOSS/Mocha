"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "@/lib/store";

const adminRoutes = [
  { href: "/admin/clients", label: "Clients" },
  { href: "/admin/tickets", label: "Tickets" },
  { href: "/admin/roles", label: "Roles" },
  { href: "/admin/users/internal", label: "Internal users" },
  { href: "/admin/email-queues", label: "Email queues" },
  { href: "/admin/webhooks", label: "Webhooks" },
  { href: "/admin/logs", label: "Logs" },
];

export default function AdminPage() {
  const { user } = useSession();

  return (
    <div className="p-6 lg:p-8">
      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Admin</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>Signed in as: {user?.name ?? "Unknown user"}</p>
          <p>
            Manage clients, tickets, roles, users, email queues, webhooks, and
            operational logs from one place.
          </p>
          <div className="grid gap-2 pt-2 md:grid-cols-2">
            {adminRoutes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className="rounded-xl border border-border bg-background px-3 py-2 transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                {route.label}
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
