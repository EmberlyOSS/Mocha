"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { setUser, useSession } from "@/lib/store";

type NotificationKey =
  | "ticket_created"
  | "ticket_status_changed"
  | "ticket_assigned"
  | "ticket_comments";

export default function NotificationSettingsPage() {
  const { user } = useSession();
  const [values, setValues] = useState<Record<NotificationKey, boolean>>({
    ticket_created: Boolean(user?.ticket_created),
    ticket_status_changed: Boolean(user?.ticket_status_changed),
    ticket_assigned: Boolean(user?.ticket_assigned),
    ticket_comments: Boolean(user?.ticket_comments),
  });
  const [status, setStatus] = useState("");

  if (!user) return null;

  const items = [
    {
      key: "ticket_created" as const,
      title: "Ticket creation",
      description: "Get emailed when a new ticket is created.",
    },
    {
      key: "ticket_status_changed" as const,
      title: "Ticket status changes",
      description: "Get emailed when a ticket assigned to you changes state.",
    },
    {
      key: "ticket_assigned" as const,
      title: "Assigned tickets",
      description: "Get emailed when you are assigned to a ticket.",
    },
    {
      key: "ticket_comments" as const,
      title: "Ticket comments",
      description: "Get emailed when a comment lands on your ticket.",
    },
  ];

  const save = async () => {
    setStatus("Saving...");

    try {
      await api("/api/v1/auth/profile/notifcations/emails", {
        method: "PUT",
        json: {
          notify_ticket_created: values.ticket_created,
          notify_ticket_assigned: values.ticket_assigned,
          notify_ticket_status_changed: values.ticket_status_changed,
          notify_ticket_comments: values.ticket_comments,
        },
      });

      setUser({
        ...user,
        ticket_created: values.ticket_created,
        ticket_assigned: values.ticket_assigned,
        ticket_status_changed: values.ticket_status_changed,
        ticket_comments: values.ticket_comments,
      });
      setStatus("Saved.");
    } catch (error) {
      console.error("Failed to save notification settings", error);
      setStatus("Save failed.");
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Notification preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item) => (
            <div
              key={item.key}
              className="flex items-start justify-between gap-4 rounded-2xl border border-border bg-background px-4 py-4"
            >
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={values[item.key]}
                onClick={() =>
                  setValues((current) => ({
                    ...current,
                    [item.key]: !current[item.key],
                  }))
                }
                className={`relative h-7 w-12 rounded-full transition-colors ${
                  values[item.key] ? "bg-primary" : "bg-muted"
                }`}
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform ${
                    values[item.key] ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          ))}
          <div className="flex items-center justify-between pt-2">
            <p className="text-sm text-muted-foreground">{status}</p>
            <Button onClick={() => void save()}>Save preferences</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
