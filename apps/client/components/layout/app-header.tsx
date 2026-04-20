"use client";

import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarTrigger } from "@/components/ui/sidebar";

const titles: Record<string, string> = {
  "/": "Dashboard",
  "/issues": "Issues",
  "/notifications": "Notifications",
  "/profile": "Profile",
  "/settings": "Settings",
  "/settings/notifications": "Notification Settings",
  "/settings/sessions": "Sessions",
  "/settings/flags": "Feature Flags",
};

export function AppHeader() {
  const pathname = usePathname();
  const title = titles[pathname] ?? "Mocha";

  if (pathname.startsWith("/auth")) return null;

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between gap-2 border-b bg-background/95 px-4 backdrop-blur transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <div className="w-px h-4 bg-border mx-1" />
        <div className="flex flex-col">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground leading-none mb-1">
            Mocha
          </p>
          <h1 className="text-sm font-semibold leading-none">{title}</h1>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
      </div>
    </header>
  );
}
