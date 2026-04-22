"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { QuickIssueComposerDialog } from "@/components/issues/issue-composer";

type IssueComposerContextValue = {
  open: boolean;
  openComposer: () => void;
  closeComposer: () => void;
};

const IssueComposerContext = createContext<IssueComposerContextValue | null>(
  null,
);

export function IssueComposerProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const value = useMemo(
    () => ({
      open,
      openComposer: () => setOpen(true),
      closeComposer: () => setOpen(false),
    }),
    [open],
  );

  return (
    <IssueComposerContext.Provider value={value}>
      {children}
      <QuickIssueComposerDialog open={open} onOpenChange={setOpen} />
    </IssueComposerContext.Provider>
  );
}

export function useIssueComposer() {
  const context = useContext(IssueComposerContext);

  if (!context) {
    throw new Error(
      "useIssueComposer must be used within an IssueComposerProvider",
    );
  }

  return context;
}
