"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  PiArrowRightDuotone,
  PiCheckCircleDuotone,
  PiListChecksDuotone,
  PiStackDuotone,
  PiTagDuotone,
  PiUserDuotone,
} from "react-icons/pi";
import { BrandMark } from "@/components/brand/brand-mark";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { useSession } from "@/lib/store";

type OptionRecord = {
  id: string;
  name: string;
  email?: string;
};

type ComposerStatus = "backlog" | "in_progress" | "in_review" | "done" | "hold";

type ComposerValues = {
  title: string;
  detail: string;
  priority: "low" | "medium" | "high";
  type: string;
  assignee: string;
  project: string;
  labels: string;
  status: ComposerStatus;
  createMore: boolean;
};

const issueTypes = [
  "bug",
  "feature",
  "support",
  "incident",
  "service",
  "maintenance",
  "access",
  "feedback",
];

const statusOptions: Array<{ value: ComposerStatus; label: string }> = [
  { value: "backlog", label: "Backlog" },
  { value: "in_progress", label: "In progress" },
  { value: "in_review", label: "In review" },
  { value: "done", label: "Done" },
  { value: "hold", label: "Hold" },
];

const priorityOptions = [
  { value: "low" as const, label: "Low" },
  { value: "medium" as const, label: "Medium" },
  { value: "high" as const, label: "High" },
];

const statusToTicketStatus: Record<ComposerStatus, string> = {
  backlog: "needs_support",
  in_progress: "in_progress",
  in_review: "in_review",
  done: "done",
  hold: "hold",
};

function buildSummaryNote(values: ComposerValues, projectName?: string) {
  const lines = [
    projectName ? `Project: ${projectName}` : "",
    values.labels ? `Labels: ${values.labels}` : "",
    `Composer status: ${statusOptions.find((item) => item.value === values.status)?.label ?? "Backlog"}`,
  ].filter(Boolean);

  return lines.length ? lines.join("\n") : "";
}

export function QuickIssueComposerDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(920px,calc(100vw-1.5rem))] overflow-hidden rounded-[28px] border border-white/10 bg-[#121215] p-0 shadow-[0_40px_120px_rgba(0,0,0,0.78)] [&>button]:hidden">
        <QuickComposerSurface
          onCreated={() => onOpenChange(false)}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function QuickComposerSurface({
  onCreated,
  onClose,
}: {
  onCreated?: () => void;
  onClose?: () => void;
}) {
  const router = useRouter();
  const { user } = useSession();
  const [clients, setClients] = useState<OptionRecord[]>([]);
  const [users, setUsers] = useState<OptionRecord[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [values, setValues] = useState<ComposerValues>({
    title: "",
    detail: "",
    priority: "medium",
    type: "bug",
    assignee: "",
    project: "",
    labels: "",
    status: "backlog",
    createMore: false,
  });

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const [clientsResponse, usersResponse] = await Promise.all([
          api<{ clients?: OptionRecord[] }>("/api/v1/clients/all"),
          api<{ users?: OptionRecord[] }>("/api/v1/users/all"),
        ]);

        if (!active) return;

        setClients(clientsResponse.clients ?? []);
        setUsers(usersResponse.users ?? []);
      } catch (error) {
        if (!active) return;
        setStatus(
          error instanceof Error
            ? error.message
            : "Failed to load quick composer data.",
        );
      } finally {
        if (active) {
          setLoadingOptions(false);
        }
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!user || values.assignee || !users.length) return;

    const currentUser = users.find((item) => item.id === user.id);
    setValues((current) => ({
      ...current,
      assignee: currentUser?.id ?? user.id,
    }));
  }, [user, users, values.assignee]);

  const assigneeOptions = useMemo(() => {
    return users.map((item) => ({
      ...item,
      label: item.id === user?.id ? `${item.name} (Me)` : item.name,
    }));
  }, [user?.id, users]);
  const projectOptions = useMemo(() => {
    return [
      { id: "unassigned", name: "Project" },
      ...clients.map((item) => ({
        id: item.id,
        name: item.name,
      })),
    ];
  }, [clients]);

  const canSubmit = Boolean(values.title.trim() && values.detail.trim() && user);

  const resetComposer = () => {
    setValues((current) => ({
      ...current,
      title: "",
      detail: "",
      labels: "",
      status: "backlog",
      priority: "medium",
      type: "bug",
      project: "",
      assignee: user?.id ?? "",
    }));
  };

  const submit = async () => {
    if (!user) {
      setStatus("You need to be signed in to create an issue.");
      return;
    }

    if (!canSubmit) {
      setStatus("Title and description are required.");
      return;
    }

    const selectedAssignee = users.find((item) => item.id === values.assignee);
    const selectedProject = clients.find((item) => item.id === values.project);
    const mappedStatus = statusToTicketStatus[values.status];
    const note = buildSummaryNote(values, selectedProject?.name);

    setSaving(true);
    setStatus("");

    try {
      const created = await api<{ success?: boolean; id?: string }>(
        "/api/v1/ticket/create",
        {
          method: "POST",
          json: {
            name: user.name,
            title: values.title.trim(),
            detail: values.detail.trim(),
            email: user.email,
            priority: values.priority,
            type: values.type,
            engineer: selectedAssignee
              ? {
                  id: selectedAssignee.id,
                  name: selectedAssignee.name,
                  email: selectedAssignee.email ?? user.email,
                }
              : undefined,
            company: selectedProject ? selectedProject.id : undefined,
            createdBy: {
              id: user.id,
              name: user.name,
              role: user.isAdmin ? "admin" : "member",
              email: user.email,
            },
          },
        },
      );

      if (!created?.success || !created.id) {
        throw new Error("Issue creation failed.");
      }

      await api("/api/v1/ticket/update", {
        method: "PUT",
        json: {
          id: created.id,
          status: mappedStatus,
          note,
        },
      });

      if (values.status === "done") {
        await api("/api/v1/ticket/status/update", {
          method: "PUT",
          json: {
            id: created.id,
            status: true,
          },
        });
      }

      if (values.createMore) {
        resetComposer();
        setStatus(`Created issue ${created.id}.`);
        return;
      }

      onCreated?.();
      router.push(`/issue/${created.id}`);
      router.refresh();
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Failed to create issue.",
      );
    } finally {
      setSaving(false);
    }
  };

  const cycleStatus = () => {
    const currentIndex = statusOptions.findIndex(
      (item) => item.value === values.status,
    );
    const next = statusOptions[(currentIndex + 1) % statusOptions.length];
    setValues((current) => ({ ...current, status: next.value }));
  };

  const cyclePriority = () => {
    const currentIndex = priorityOptions.findIndex(
      (item) => item.value === values.priority,
    );
    const next = priorityOptions[(currentIndex + 1) % priorityOptions.length];
    setValues((current) => ({ ...current, priority: next.value }));
  };

  const cycleAssignee = () => {
    const options = [
      { id: "unassigned", label: "Assignee" },
      ...assigneeOptions.map((item) => ({ id: item.id, label: item.label })),
    ];
    const currentIndex = options.findIndex((item) => item.id === values.assignee);
    const next = options[(currentIndex + 1 + options.length) % options.length];
    setValues((current) => ({
      ...current,
      assignee: next.id === "unassigned" ? "" : next.id,
    }));
  };

  const cycleProject = () => {
    const currentIndex = projectOptions.findIndex(
      (item) => item.id === (values.project || "unassigned"),
    );
    const next =
      projectOptions[(currentIndex + 1 + projectOptions.length) % projectOptions.length];
    setValues((current) => ({
      ...current,
      project: next.id === "unassigned" ? "" : next.id,
    }));
  };

  const currentStatusLabel =
    statusOptions.find((item) => item.value === values.status)?.label ?? "Todo";
  const currentPriorityLabel =
    priorityOptions.find((item) => item.value === values.priority)?.label ??
    "Priority";
  const currentAssigneeLabel =
    assigneeOptions.find((item) => item.id === values.assignee)?.label ??
    "Assignee";
  const currentProjectLabel =
    projectOptions.find((item) => item.id === (values.project || "unassigned"))
      ?.name ?? "Project";

  return (
    <div
      style={{
        width: "100%",
        background:
          "linear-gradient(180deg, rgba(33,26,48,0.78) 0%, rgba(23,23,28,0.98) 14%, #17171b 100%)",
        borderRadius: 18,
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 24px 80px rgba(0,0,0,0.45)",
        overflow: "hidden",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "14px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          background:
            "linear-gradient(90deg, rgba(99,102,241,0.14) 0%, rgba(168,85,247,0.08) 28%, rgba(255,255,255,0.02) 100%)",
        }}
      >
        <BrandMark size={18} showWordmark={false} className="flex items-center" />
        <span style={{ color: "#8d91a5", fontSize: 13 }}>
          {user?.name?.slice(0, 3).toUpperCase() || "ADM"}
        </span>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M5 3l4 4-4 4"
            stroke="#646b7d"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span style={{ color: "#f5f7fb", fontSize: 14, fontWeight: 600 }}>
          New issue
        </span>

        <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
          <button
            type="button"
            onClick={() => router.push("/new")}
            style={quickIconButtonStyle}
            aria-label="Expand composer"
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path
                d="M2 9.5V13H5.5M13 5.5V2H9.5M2 5.5V2H5.5M13 9.5V13H9.5"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => onClose?.()}
            style={quickIconButtonStyle}
            aria-label="Close composer"
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path
                d="M2.5 2.5l10 10M12.5 2.5l-10 10"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <div style={{ padding: "18px 18px 14px" }}>
        <input
          value={values.title}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              title: event.target.value,
            }))
          }
          placeholder="Issue title"
          style={quickTitleInputStyle}
        />

        <textarea
          value={values.detail}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              detail: event.target.value,
            }))
          }
          placeholder="Add description..."
          rows={3}
          style={quickTextareaStyle}
        />
      </div>

      <div
        style={{
          height: 1,
          background: "rgba(255,255,255,0.07)",
          margin: "2px 0 0",
        }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          padding: "12px 16px",
          flexWrap: "wrap",
          minHeight: 52,
        }}
      >
        <MetaButton
          icon={
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle
                cx="7"
                cy="7"
                r="5.5"
                stroke="#9ca3af"
                strokeWidth="1.4"
              />
            </svg>
          }
          label={currentStatusLabel}
          onClick={cycleStatus}
        />

        <MetaButton
          icon={
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect
                x="1"
                y="9"
                width="2.5"
                height="4"
                rx="0.5"
                fill="#6b7280"
              />
              <rect
                x="5.5"
                y="6"
                width="2.5"
                height="7"
                rx="0.5"
                fill="#6b7280"
              />
              <rect
                x="10"
                y="3"
                width="2.5"
                height="10"
                rx="0.5"
                fill="#6b7280"
              />
            </svg>
          }
          label={currentPriorityLabel}
          dotted
          onClick={cyclePriority}
        />

        <MetaButton
          icon={
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle
                cx="7"
                cy="5"
                r="2.5"
                stroke="#6b7280"
                strokeWidth="1.3"
              />
              <path
                d="M1.5 13c0-2.485 2.462-4.5 5.5-4.5s5.5 2.015 5.5 4.5"
                stroke="#6b7280"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
            </svg>
          }
          label={currentAssigneeLabel}
          onClick={cycleAssignee}
        />

        <MetaButton
          icon={
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect
                x="1.5"
                y="1.5"
                width="11"
                height="11"
                rx="2"
                stroke="#6b7280"
                strokeWidth="1.3"
              />
              <path
                d="M4 7l2 2 4-4"
                stroke="#6b7280"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
          label={currentProjectLabel}
          onClick={cycleProject}
        />

        <MetaButton
          icon={
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M1.5 7.5L6.5 2.5H12.5V8.5L7.5 13.5L1.5 7.5Z"
                stroke="#6b7280"
                strokeWidth="1.3"
                strokeLinejoin="round"
              />
              <circle cx="9.5" cy="4.5" r="1" fill="#6b7280" />
            </svg>
          }
          label="Labels"
          onClick={() => {}}
        />

        <button
          type="button"
          style={quickMoreButtonStyle}
          aria-label="More actions"
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <circle cx="3" cy="7.5" r="1.2" fill="currentColor" />
            <circle cx="7.5" cy="7.5" r="1.2" fill="currentColor" />
            <circle cx="12" cy="7.5" r="1.2" fill="currentColor" />
          </svg>
        </button>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px 16px",
          borderTop: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <button type="button" style={quickIconButtonStyle} aria-label="Attach file">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M13.5 7.5L7.5 13.5C6.119 14.881 3.881 14.881 2.5 13.5C1.119 12.119 1.119 9.881 2.5 8.5L8.5 2.5C9.328 1.672 10.672 1.672 11.5 2.5C12.328 3.328 12.328 4.672 11.5 5.5L5.5 11.5C5.086 11.914 4.414 11.914 4 11.5C3.586 11.086 3.586 10.414 4 10L9.5 4.5"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div
              onClick={() =>
                setValues((current) => ({
                  ...current,
                  createMore: !current.createMore,
                }))
              }
              style={{
                width: 32,
                height: 18,
                borderRadius: 9,
                background: values.createMore ? "#6d5efc" : "#41414b",
                cursor: "pointer",
                position: "relative",
                transition: "background 0.2s",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 2,
                  left: values.createMore ? 16 : 2,
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  background: "white",
                  transition: "left 0.2s",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                }}
              />
            </div>
            <span style={{ color: "#9ca3af", fontSize: 12.5 }}>Create more</span>
          </div>

          <button
            type="button"
            onClick={() => void submit()}
            disabled={!canSubmit || saving || loadingOptions}
            style={{
              background:
                !canSubmit || saving || loadingOptions
                  ? "#45454e"
                  : "linear-gradient(180deg, #7b6dff 0%, #5e58d7 100%)",
              border: "none",
              borderRadius: 10,
              color: "white",
              fontSize: 13,
              fontWeight: 600,
              fontFamily: "inherit",
              padding: "9px 16px",
              cursor:
                !canSubmit || saving || loadingOptions ? "not-allowed" : "pointer",
              letterSpacing: "0.01em",
              opacity: !canSubmit || saving || loadingOptions ? 0.7 : 1,
            }}
          >
            {saving ? "Creating..." : "Create issue"}
          </button>
        </div>
      </div>

      {status ? (
        <div
          style={{
            padding: "0 16px 14px",
            color: "#9ca3af",
            fontSize: 12.5,
          }}
        >
          {status}
        </div>
      ) : null}
    </div>
  );
}

export function IssueComposerDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] w-[min(1120px,calc(100vw-1.5rem))] overflow-hidden rounded-[28px] border border-white/10 bg-[#0a0a0c] p-0 shadow-[0_40px_120px_rgba(0,0,0,0.7)]">
        <IssueComposerSurface
          onCreated={() => onOpenChange(false)}
          className="max-h-[92vh]"
        />
      </DialogContent>
    </Dialog>
  );
}

export function IssueComposerPage() {
  return (
    <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-6 pb-10">
      <ComposerShell compact={false} />
    </div>
  );
}

function IssueComposerSurface({
  onCreated,
  className,
}: {
  onCreated?: () => void;
  className?: string;
}) {
  return <ComposerShell onCreated={onCreated} className={className} compact />;
}

function ComposerShell({
  onCreated,
  compact,
  className,
}: {
  onCreated?: () => void;
  compact: boolean;
  className?: string;
}) {
  const router = useRouter();
  const { user } = useSession();
  const [clients, setClients] = useState<OptionRecord[]>([]);
  const [users, setUsers] = useState<OptionRecord[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [values, setValues] = useState<ComposerValues>({
    title: "",
    detail: "",
    priority: "medium",
    type: "bug",
    assignee: "",
    project: "",
    labels: "",
    status: "backlog",
    createMore: false,
  });

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const [clientsResponse, usersResponse] = await Promise.all([
          api<{ clients?: OptionRecord[] }>("/api/v1/clients/all"),
          api<{ users?: OptionRecord[] }>("/api/v1/users/all"),
        ]);

        if (!active) {
          return;
        }

        setClients(clientsResponse.clients ?? []);
        setUsers(usersResponse.users ?? []);
      } catch (error) {
        if (!active) {
          return;
        }
        setStatus(
          error instanceof Error
            ? error.message
            : "Failed to load issue composer data.",
        );
      } finally {
        if (active) {
          setLoadingOptions(false);
        }
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!user || values.assignee || !users.length) {
      return;
    }

    const currentUser = users.find((item) => item.id === user.id);
    setValues((current) => ({
      ...current,
      assignee: currentUser?.id ?? user.id,
    }));
  }, [user, users, values.assignee]);

  const assigneeOptions = useMemo(() => {
    return users.map((item) => ({
      ...item,
      label: item.id === user?.id ? `${item.name} (Me)` : item.name,
    }));
  }, [user?.id, users]);

  const canSubmit = Boolean(values.title.trim() && values.detail.trim() && user);

  const resetComposer = () => {
    setValues((current) => ({
      ...current,
      title: "",
      detail: "",
      labels: "",
      status: "backlog",
      priority: "medium",
      type: "bug",
      project: "",
      assignee: user?.id ?? "",
    }));
  };

  const submit = async () => {
    if (!user) {
      setStatus("You need to be signed in to create an issue.");
      return;
    }

    if (!canSubmit) {
      setStatus("Title and description are required.");
      return;
    }

    const selectedAssignee = users.find((item) => item.id === values.assignee);
    const selectedProject = clients.find((item) => item.id === values.project);
    const mappedStatus = statusToTicketStatus[values.status];
    const note = buildSummaryNote(values, selectedProject?.name);

    setSaving(true);
    setStatus("");

    try {
      const created = await api<{ success?: boolean; id?: string }>(
        "/api/v1/ticket/create",
        {
          method: "POST",
          json: {
            name: user.name,
            title: values.title.trim(),
            detail: values.detail.trim(),
            email: user.email,
            priority: values.priority,
            type: values.type,
            engineer: selectedAssignee
              ? {
                  id: selectedAssignee.id,
                  name: selectedAssignee.name,
                  email: selectedAssignee.email ?? user.email,
                }
              : undefined,
            company: selectedProject ? selectedProject.id : undefined,
            createdBy: {
              id: user.id,
              name: user.name,
              role: user.isAdmin ? "admin" : "member",
              email: user.email,
            },
          },
        },
      );

      if (!created?.success || !created.id) {
        throw new Error("Issue creation failed.");
      }

      await api("/api/v1/ticket/update", {
        method: "PUT",
        json: {
          id: created.id,
          status: mappedStatus,
          note,
        },
      });

      if (values.status === "done") {
        await api("/api/v1/ticket/status/update", {
          method: "PUT",
          json: {
            id: created.id,
            status: true,
          },
        });
      }

      if (values.createMore) {
        resetComposer();
        setStatus(`Created issue ${created.id}.`);
        return;
      }

      onCreated?.();
      router.push(`/issue/${created.id}`);
      router.refresh();
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Failed to create issue.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className={[
        "flex h-full w-full flex-col overflow-hidden",
        compact ? "max-h-[92vh]" : "rounded-[28px] border border-white/10 bg-[#0a0a0c]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="relative overflow-hidden border-b border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))] px-6 py-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.18),transparent_30%),radial-gradient(circle_at_left,rgba(14,165,233,0.08),transparent_30%)]" />
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <BrandMark size={44} />
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-zinc-500">
            <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1">
              {user?.name ?? "Account"}
            </span>
            <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1">
              {user?.email ?? "signed-in user"}
            </span>
            <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-violet-300">
              New issue
            </span>
          </div>
        </div>
      </div>

      <div
        className={[
          "grid flex-1 gap-0 overflow-hidden",
          compact ? "md:grid-cols-[1.15fr_0.85fr]" : "md:grid-cols-[1.2fr_0.8fr]",
        ].join(" ")}
      >
        <div className="overflow-y-auto px-6 py-6">
          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
                Title
              </Label>
              <Input
                value={values.title}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                placeholder="Short, precise summary"
                className="h-12 rounded-2xl border-white/10 bg-white/[0.04] text-white placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-white/[0.15]"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
                Description
              </Label>
              <Textarea
                value={values.detail}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    detail: event.target.value,
                  }))
                }
                placeholder="Explain what happened, what you expected, and any context that matters."
                rows={10}
                className="min-h-[260px] rounded-2xl border-white/10 bg-white/[0.04] text-white placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-white/[0.15]"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <ComposerField label="Status" icon={<PiListChecksDuotone className="h-4 w-4" />}>
                <Select
                  value={values.status}
                  onValueChange={(value) =>
                    setValues((current) => ({
                      ...current,
                      status: value as ComposerStatus,
                    }))
                  }
                >
                  <SelectTrigger className="h-11 rounded-2xl border-white/10 bg-white/[0.04] text-zinc-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </ComposerField>

              <ComposerField label="Priority" icon={<PiTagDuotone className="h-4 w-4" />}>
                <Select
                  value={values.priority}
                  onValueChange={(value) =>
                    setValues((current) => ({
                      ...current,
                      priority: value as ComposerValues["priority"],
                    }))
                  }
                >
                  <SelectTrigger className="h-11 rounded-2xl border-white/10 bg-white/[0.04] text-zinc-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </ComposerField>

              <ComposerField label="Assignee" icon={<PiUserDuotone className="h-4 w-4" />}>
                <Select
                  value={values.assignee}
                  onValueChange={(value) =>
                    setValues((current) => ({
                      ...current,
                      assignee: value,
                    }))
                  }
                >
                  <SelectTrigger className="h-11 rounded-2xl border-white/10 bg-white/[0.04] text-zinc-200">
                    <SelectValue placeholder="Unassigned" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {assigneeOptions.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </ComposerField>

              <ComposerField label="Project" icon={<PiStackDuotone className="h-4 w-4" />}>
                <Select
                  value={values.project}
                  onValueChange={(value) =>
                    setValues((current) => ({
                      ...current,
                      project: value,
                    }))
                  }
                >
                  <SelectTrigger className="h-11 rounded-2xl border-white/10 bg-white/[0.04] text-zinc-200">
                    <SelectValue placeholder="Unassigned" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {clients.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </ComposerField>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
                Labels
              </Label>
              <Input
                value={values.labels}
                onChange={(event) =>
                  setValues((current) => ({
                    ...current,
                    labels: event.target.value,
                  }))
                }
                placeholder="frontend, urgent, customer"
                className="h-11 rounded-2xl border-white/10 bg-white/[0.04] text-white placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-white/[0.15]"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-white/[0.08] bg-[#09090b] px-6 py-6 md:border-l md:border-t-0">
          <div className="space-y-5">
            <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.03] p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                <PiCheckCircleDuotone className="h-4 w-4 text-emerald-400" />
                What will happen
              </div>
              <ul className="mt-4 space-y-3 text-sm text-zinc-400">
                <li className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-violet-400" />
                  The issue is created in the internal queue and assigned to the selected account.
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-violet-400" />
                  Project, labels, and status are stored with the issue metadata.
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-violet-400" />
                  The form can stay open for fast batch creation if you enable create more.
                </li>
              </ul>
            </div>

            <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.03] p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-white">Create more</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    Keep this composer open after submission.
                  </p>
                </div>
                <Switch
                  checked={values.createMore}
                  onCheckedChange={(checked) =>
                    setValues((current) => ({
                      ...current,
                      createMore: checked,
                    }))
                  }
                />
              </div>
            </div>

            <Separator className="bg-white/[0.08]" />

            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.22em] text-zinc-600">
                Status
              </p>
              <p className="min-h-5 text-sm text-zinc-400">{loadingOptions ? "Loading users and projects..." : status || "Ready to create."}</p>
            </div>

            <Button
              onClick={() => void submit()}
              disabled={!canSubmit || saving}
              className="h-11 w-full rounded-full bg-white text-black hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Creating..." : "Create issue"}
              <PiArrowRightDuotone className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ComposerField({
  label,
  icon,
  children,
}: {
  label: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
        {icon}
        {label}
      </Label>
      {children}
    </div>
  );
}

const quickIconButtonStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.06)",
  color: "#8f95a7",
  cursor: "pointer",
  padding: "5px",
  borderRadius: 8,
  display: "flex",
  alignItems: "center",
};

const quickMoreButtonStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.06)",
  color: "#8f95a7",
  cursor: "pointer",
  padding: "5px 7px",
  borderRadius: 8,
  display: "flex",
  alignItems: "center",
};

const quickTitleInputStyle: React.CSSProperties = {
  width: "100%",
  background: "none",
  border: "none",
  outline: "none",
  color: "#f4f5f8",
  fontSize: 18,
  fontWeight: 600,
  fontFamily: "inherit",
  marginBottom: 14,
  caretColor: "#7c72ff",
  boxSizing: "border-box",
};

const quickTextareaStyle: React.CSSProperties = {
  width: "100%",
  background: "none",
  border: "none",
  outline: "none",
  color: "#b0b4c2",
  fontSize: 14,
  fontFamily: "inherit",
  resize: "none",
  caretColor: "#7c72ff",
  boxSizing: "border-box",
  lineHeight: 1.6,
  minHeight: 112,
};

function MetaButton({
  icon,
  label,
  dotted,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  dotted?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
        color: "#aeb4c4",
        fontSize: 12.5,
        fontFamily: "inherit",
        cursor: "pointer",
        padding: "6px 10px",
        borderRadius: 999,
        whiteSpace: "nowrap",
      }}
    >
      {dotted ? (
        <span style={{ color: "#7f8798", fontSize: 11, marginRight: -2 }}>
          ...
        </span>
      ) : (
        icon
      )}
      <span>{label}</span>
    </button>
  );
}
