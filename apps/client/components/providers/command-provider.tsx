"use client";

import { useState } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { GlobalCommand } from "@/components/layout/global-command";

export function CommandPaletteProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <AppHeader onOpenCommand={() => setOpen(true)} />
      {children}
      <GlobalCommand open={open} onOpenChange={setOpen} />
    </>
  );
}
