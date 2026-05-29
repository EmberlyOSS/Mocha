"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { GoIssueOpened } from "react-icons/go";
import {
  PiFilesDuotone,
  PiGearSixDuotone,
  PiHouseDuotone,
  PiKanbanDuotone,
  PiLightningDuotone,
  PiUserCircleDuotone,
} from "react-icons/pi";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useDocuments } from "@/hooks/use-documents";
import { useTicketStats } from "@/hooks/use-tickets";

export function GlobalCommand({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const {
    open: openTickets,
    unassigned,
    isLoading: ticketStatsLoading,
  } = useTicketStats();
  const { data: documentsData, isLoading: documentsLoading } = useDocuments();

  const documentsCount = documentsData?.notebooks?.length ?? 0;
  const formatCount = (
    count: number,
    singular: string,
    plural = `${singular}s`,
  ) => `${count} ${count === 1 ? singular : plural}`;

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const runCommand = React.useCallback(
    (command: () => void) => {
      onOpenChange(false);
      command();
    },
    [onOpenChange],
  );

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search or navigate..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Recent Activity">
          <CommandItem
            onSelect={() => runCommand(() => router.push("/new"))}
            className="gap-3 group data-[selected=true]:bg-violet-500/10 data-[selected=true]:text-violet-400"
          >
            <Plus
              className="h-4 w-4 text-zinc-500 group-data-[selected=true]:text-violet-400"
              strokeWidth={2.4}
            />
            <span>Create new issue</span>
            <CommandShortcut>⌘N</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/"))}
            className="gap-3"
          >
            <PiHouseDuotone className="h-4 w-4 text-zinc-500" />
            <span>Go to Dashboard</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/issues"))}
            className="gap-3"
          >
            <GoIssueOpened className="h-4 w-4 text-zinc-500" />
            <span>View all issues</span>
            <CommandShortcut>G I</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Library & Queues">
          <div className="grid grid-cols-2 gap-2 p-2 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => runCommand(() => router.push("/issues/open"))}
              className="flex flex-col items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4 text-left transition hover:bg-white/[0.05] hover:border-white/10"
            >
              <PiKanbanDuotone className="h-5 w-5 text-blue-400" />
              <div>
                <p className="text-sm font-semibold text-white">Open issues</p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">
                  {ticketStatsLoading
                    ? "Loading"
                    : formatCount(openTickets, "issue")}
                </p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => runCommand(() => router.push("/documents"))}
              className="flex flex-col items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4 text-left transition hover:bg-white/[0.05] hover:border-white/10"
            >
              <PiFilesDuotone className="h-5 w-5 text-indigo-400" />
              <div>
                <p className="text-sm font-semibold text-white">Documents</p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">
                  {documentsLoading
                    ? "Loading"
                    : formatCount(documentsCount, "document")}
                </p>
              </div>
            </button>
            <button
              type="button"
              onClick={() =>
                runCommand(() => router.push("/issues/unassigned"))
              }
              className="flex flex-col items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-4 text-left transition hover:bg-white/[0.05] hover:border-white/10"
            >
              <PiLightningDuotone className="h-5 w-5 text-amber-400" />
              <div>
                <p className="text-sm font-semibold text-white">Unassigned</p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">
                  {ticketStatsLoading
                    ? "Loading"
                    : formatCount(unassigned, "ticket")}
                </p>
              </div>
            </button>
          </div>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Settings">
          <CommandItem
            onSelect={() => runCommand(() => router.push("/profile"))}
            className="gap-3"
          >
            <PiUserCircleDuotone className="h-4 w-4 text-zinc-500" />
            <span>Profile settings</span>
            <CommandShortcut>⌘P</CommandShortcut>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/settings"))}
            className="gap-3"
          >
            <PiGearSixDuotone className="h-4 w-4 text-zinc-500" />
            <span>Workspace preferences</span>
            <CommandShortcut>⌘,</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
