"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import {
  PiHouseDuotone,
  PiFilesDuotone,
  PiBellDuotone,
  PiUserCircleDuotone,
  PiGearSixDuotone,
  PiGlobeDuotone,
  PiMagnifyingGlassDuotone,
} from "react-icons/pi";
import { GoIssueOpened } from "react-icons/go";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { BrandMark } from "@/components/brand/brand-mark";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const titles: Record<
  string,
  { label: string; icon: ReactNode }
> = {
  "/": {
    label: "Dashboard",
    icon: <PiHouseDuotone className="h-3.5 w-3.5 text-zinc-400" />,
  },
  "/issues": {
    label: "Issues",
    icon: <GoIssueOpened className="h-3.5 w-3.5 text-emerald-400" />,
  },
  "/documents": {
    label: "Documents",
    icon: <PiFilesDuotone className="h-3.5 w-3.5 text-zinc-400" />,
  },
  "/notifications": {
    label: "Notifications",
    icon: <PiBellDuotone className="h-3.5 w-3.5 text-zinc-400" />,
  },
  "/profile": {
    label: "Profile",
    icon: <PiUserCircleDuotone className="h-3.5 w-3.5 text-zinc-400" />,
  },
  "/settings": {
    label: "Settings",
    icon: <PiGearSixDuotone className="h-3.5 w-3.5 text-zinc-400" />,
  },
  "/settings/notifications": {
    label: "Notification Settings",
    icon: <PiBellDuotone className="h-3.5 w-3.5 text-zinc-400" />,
  },
  "/settings/sessions": {
    label: "Sessions",
    icon: <PiGearSixDuotone className="h-3.5 w-3.5 text-zinc-400" />,
  },
  "/settings/flags": {
    label: "Feature Flags",
    icon: <PiGearSixDuotone className="h-3.5 w-3.5 text-zinc-400" />,
  },
  "/portal": {
    label: "Portal",
    icon: <PiGlobeDuotone className="h-3.5 w-3.5 text-zinc-400" />,
  },
  "/new": {
    label: "New Issue",
    icon: <GoIssueOpened className="h-3.5 w-3.5 text-emerald-400" />,
  },
};

export function AppHeader({ onOpenCommand }: { onOpenCommand?: () => void }) {
  const pathname = usePathname();

  // Match prefix for dynamic routes
  const meta =
    titles[pathname] ??
    (pathname.startsWith("/issue/")
      ? { label: "Issue Detail", icon: <GoIssueOpened className="h-3.5 w-3.5 text-emerald-400" /> }
      : pathname.startsWith("/documents/")
        ? { label: "Document", icon: <PiFilesDuotone className="h-3.5 w-3.5 text-zinc-400" /> }
        : { label: "Mocha", icon: null });

  if (pathname.startsWith("/auth")) return null;

  return (
    <TooltipProvider>
      <header className="sticky top-0 z-20 flex h-12 shrink-0 items-center justify-between gap-2 border-b border-white/5 bg-background/90 px-4 backdrop-blur-md transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-11">
        {/* Left — trigger + breadcrumb */}
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <SidebarTrigger className="-ml-1 h-7 w-7 rounded-md text-zinc-600 hover:text-white transition-colors" />
            </TooltipTrigger>
            <TooltipContent side="right">Toggle sidebar</TooltipContent>
          </Tooltip>

          <Separator orientation="vertical" className="h-4 bg-white/10 mx-0.5" />

          <div className="flex items-center gap-1.5">
            <BrandMark size={20} showWordmark={false} />
            {meta.icon && (
              <>
                <span className="text-zinc-700 text-xs leading-none">›</span>
                {meta.icon}
              </>
            )}
            <span className="text-zinc-700 text-xs leading-none">›</span>
            <h1 className="text-sm font-semibold text-zinc-300">{meta.label}</h1>
          </div>
        </div>

        {/* Right — search hint */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              id="header-search"
              onClick={onOpenCommand}
              className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-600 transition hover:border-white/10 hover:text-zinc-400"
            >
              <PiMagnifyingGlassDuotone className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Search</span>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-mono text-zinc-700">
                ⌘K
              </kbd>
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Open command palette</TooltipContent>
        </Tooltip>
      </header>
    </TooltipProvider>
  );
}
