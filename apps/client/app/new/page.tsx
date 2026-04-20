"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/lib/api";
import { useSession } from "@/lib/store";

const ticketTypes = [
  "Incident",
  "Service",
  "Feature",
  "Bug",
  "Maintenance",
  "Access",
  "Feedback",
];

interface OptionRecord {
  id: string;
  name: string;
  email?: string;
  role?: string;
}

export default function NewTicketPage() {
  const { user } = useSession();
  const [clients, setClients] = useState<OptionRecord[]>([]);
  const [engineers, setEngineers] = useState<OptionRecord[]>([]);
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    title: "",
    detail: "",
    company: "",
    engineer: "",
    priority: "medium",
    type: "Bug",
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [clientsResponse, usersResponse] = await Promise.all([
          api<{ clients?: OptionRecord[] }>("/api/v1/clients/all"),
          api<{ users?: OptionRecord[] }>("/api/v1/users/all"),
        ]);

        setClients(clientsResponse.clients ?? []);
        setEngineers(usersResponse.users ?? []);
      } catch (error) {
        setStatus(
          error instanceof Error
            ? error.message
            : "Failed to load ticket metadata.",
        );
      }
    };

    void load();
  }, []);

  const canSubmit = useMemo(
    () => Boolean(form.name && form.email && form.title && form.detail),
    [form],
  );

  const createTicket = async () => {
    if (!user) {
      setStatus("You need to be signed in to create an internal ticket.");
      return;
    }
    if (!canSubmit) {
      setStatus("Fill out the required fields first.");
      return;
    }

    const selectedEngineer = engineers.find(
      (engineer) => engineer.id === form.engineer,
    );

    setSubmitting(true);
    setStatus("");

    try {
      const response = await api<{ success?: boolean; error?: string }>(
        "/api/v1/ticket/create",
        {
          method: "POST",
          json: {
            name: form.name,
            title: form.title,
            company: form.company || undefined,
            email: form.email,
            detail: form.detail,
            priority: form.priority,
            engineer: selectedEngineer,
            type: form.type,
            createdBy: {
              id: user.id,
              name: user.name,
              role: user.isAdmin ? "admin" : "member",
              email: user.email,
            },
          },
        },
      );

      setStatus(
        response.success
          ? "Ticket created."
          : (response.error ?? "Ticket creation failed."),
      );
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Ticket creation failed.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Create issue</CardTitle>
          <CardDescription>
            Migrated replacement for the legacy internal `/new` ticket flow.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field label="Contact name">
            <input
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none"
            />
          </Field>
          <Field label="Contact email">
            <input
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none"
            />
          </Field>
          <Field label="Client">
            <select
              value={form.company}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  company: event.target.value,
                }))
              }
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none"
            >
              <option value="">Unassigned</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Engineer">
            <select
              value={form.engineer}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  engineer: event.target.value,
                }))
              }
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none"
            >
              <option value="">Unassigned</option>
              {engineers.map((engineer) => (
                <option key={engineer.id} value={engineer.id}>
                  {engineer.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Issue type">
            <select
              value={form.type}
              onChange={(event) =>
                setForm((current) => ({ ...current, type: event.target.value }))
              }
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none"
            >
              {ticketTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Priority">
            <select
              value={form.priority}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  priority: event.target.value,
                }))
              }
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </Field>
          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-medium">Title</label>
            <input
              value={form.title}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none"
            />
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-medium">Issue details</label>
            <textarea
              rows={8}
              value={form.detail}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  detail: event.target.value,
                }))
              }
              className="w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm outline-none"
            />
          </div>
        </CardContent>
        <CardFooter className="justify-between gap-3">
          <p className="text-sm text-muted-foreground">{status}</p>
          <Button onClick={() => void createTicket()} disabled={submitting}>
            {submitting ? "Creating..." : "Create ticket"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}
