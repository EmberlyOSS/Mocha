"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark } from "@/components/brand/brand-mark";
import { cn } from "@/lib/utils";

const links = [
  { href: "/portal", label: "Overview" },
  { href: "/portal/issues", label: "All issues" },
  { href: "/portal/issues/open", label: "Open" },
  { href: "/portal/issues/closed", label: "Closed" },
  { href: "/portal/new", label: "New issue" },
];

export function PortalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      <div className="rounded-[28px] border border-white/[0.08] bg-[#09090b] p-5">
        <div className="mb-4 flex items-center justify-between gap-4">
          <BrandMark size={36} />
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
            External Portal
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full border px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background hover:bg-accent",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
      {children}
    </div>
  );
}
