"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api, formatDate } from "@/lib/api";

type AdminData = Record<string, unknown>;

const routeDescriptions: Record<
  string,
  { title: string; description: string; endpoint?: string }
> = {
  authentication: {
    title: "Authentication",
    description:
      "Legacy admin authentication settings migrated into the new shell.",
  },
  clients: {
    title: "Clients",
    description: "Client directory from the old admin area.",
    endpoint: "/api/v1/clients/all",
  },
  "clients/new": {
    title: "Create client",
    description:
      "Dedicated create-client screen still needs endpoint-specific controls.",
  },
  "email-queues": {
    title: "Email queues",
    description: "Queue overview from the legacy admin app.",
    endpoint: "/api/v1/email-queues/all",
  },
  "email-queues/new": {
    title: "Create email queue",
    description: "New queue flow has been routed into the new shell.",
  },
  "email-queues/oauth": {
    title: "Email queue OAuth",
    description: "OAuth callback and setup page for email queues.",
  },
  logs: {
    title: "Logs",
    description: "Operational log viewer.",
    endpoint: "/api/v1/data/logs",
  },
  roles: {
    title: "Roles",
    description: "Role configuration surface.",
    endpoint: "/api/v1/roles/all",
  },
  "roles/new": {
    title: "Create role",
    description:
      "Route migrated; role creation controls still need a dedicated editor.",
  },
  smtp: {
    title: "SMTP",
    description: "SMTP configuration and provider setup.",
  },
  "smtp/oauth": {
    title: "SMTP OAuth",
    description: "SMTP provider OAuth callback route.",
  },
  tickets: {
    title: "Admin tickets",
    description: "Administrative ticket overview.",
    endpoint: "/api/v1/tickets/all/admin",
  },
  "users/internal": {
    title: "Internal users",
    description: "Internal user management.",
    endpoint: "/api/v1/users/all",
  },
  "users/internal/new": {
    title: "Create internal user",
    description:
      "Route migrated; account creation form still needs a dedicated editor.",
  },
  webhooks: {
    title: "Webhooks",
    description: "Webhook configuration list.",
    endpoint: "/api/v1/webhooks/all",
  },
};

export default function AdminCatchAllPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = use(params);
  const [data, setData] = useState<AdminData | null>(null);
  const [status, setStatus] = useState("Loading route...");

  const routeKey = useMemo(() => slug.join("/"), [slug]);
  const config = useMemo(() => {
    if (routeDescriptions[routeKey]) {
      return routeDescriptions[routeKey];
    }
    if (slug[0] === "roles" && slug[1] && slug[1] !== "new") {
      return {
        title: `Role ${slug[1]}`,
        description: "Dynamic role detail route migrated into the new shell.",
      };
    }
    if (slug[0] === "smtp" && slug[1] === "templates" && slug[2]) {
      return {
        title: `SMTP template ${slug[2]}`,
        description: "Dynamic SMTP template route migrated into the new shell.",
      };
    }
    return {
      title: `Admin / ${routeKey}`,
      description:
        "Route path exists in the new shell, but no dedicated data loader has been attached yet.",
    };
  }, [routeKey, slug]);

  useEffect(() => {
    const load = async () => {
      if (!config.endpoint) {
        setData(null);
        setStatus("Route migrated.");
        return;
      }

      setStatus("Loading data...");

      try {
        const response = await api<AdminData>(config.endpoint);
        setData(response);
        setStatus("Route migrated.");
      } catch (error) {
        setStatus(
          error instanceof Error ? error.message : "Failed to load route data.",
        );
      }
    };

    void load();
  }, [config.endpoint]);

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>{config.title}</CardTitle>
            <CardDescription>{config.description}</CardDescription>
          </div>
          <Link href="/admin">
            <Button variant="outline" size="sm">
              Admin home
            </Button>
          </Link>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Migration status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{status}</p>
          {data ? <AdminDataView routeKey={routeKey} data={data} /> : null}
        </CardContent>
      </Card>
    </div>
  );
}

function AdminDataView({
  routeKey,
  data,
}: {
  routeKey: string;
  data: AdminData;
}) {
  if (routeKey === "logs") {
    const rawLogs = typeof data.logs === "string" ? data.logs : "";
    const items = rawLogs
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        try {
          return JSON.parse(line) as { time?: string; msg?: string };
        } catch {
          return null;
        }
      })
      .filter(Boolean)
      .slice(0, 20);

    return (
      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={`${item?.time}-${index}`}
            className="rounded-2xl border border-border bg-background px-4 py-3"
          >
            <div className="text-xs text-muted-foreground">
              {formatDate(item?.time)}
            </div>
            <div className="mt-1 text-sm font-medium">
              {item?.msg ?? "Unknown log entry"}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const candidates =
    (Array.isArray(data.clients) && data.clients) ||
    (Array.isArray(data.roles) && data.roles) ||
    (Array.isArray(data.webhooks) && data.webhooks) ||
    (Array.isArray(data.users) && data.users) ||
    (Array.isArray(data.tickets) && data.tickets) ||
    (Array.isArray(data.queues) && data.queues) ||
    [];

  if (!candidates.length) {
    return (
      <pre className="overflow-x-auto rounded-2xl border border-border bg-background p-4 text-xs text-muted-foreground">
        {JSON.stringify(data, null, 2)}
      </pre>
    );
  }

  return (
    <div className="space-y-3">
      {candidates.slice(0, 25).map((item, index) => {
        const record = item as Record<string, unknown>;
        return (
          <div
            key={String(record.id ?? index)}
            className="rounded-2xl border border-border bg-background px-4 py-3"
          >
            <div className="font-medium">
              {String(
                record.name ?? record.title ?? record.id ?? `Row ${index + 1}`,
              )}
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              {String(
                record.email ??
                  record.url ??
                  record.priority ??
                  record.description ??
                  "No secondary field",
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
