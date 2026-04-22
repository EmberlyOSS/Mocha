import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppHeader } from "@/components/layout/app-header";
import { Sidebar } from "@/components/layout/sidebar";
import { IssueComposerProvider } from "@/components/providers/issue-composer-provider";
import Providers from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mocha | Issue Management",
  description: "Premium issue and document management system.",
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
};

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { CommandPaletteProvider } from "@/components/providers/command-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full bg-background text-foreground selection:bg-white/20">
        <Providers>
          <div className="dark h-full w-full bg-[#050507]">
            <IssueComposerProvider>
              <SidebarProvider>
                <Sidebar />
                <SidebarInset className="bg-[#050507]">
                  <CommandPaletteProvider>
                    <main className="flex-1 overflow-y-auto w-full">
                      <div className="mx-auto w-full max-w-[1440px] p-4 sm:p-6 lg:p-8">
                        {children}
                      </div>
                    </main>
                  </CommandPaletteProvider>
                </SidebarInset>
              </SidebarProvider>
            </IssueComposerProvider>
          </div>
        </Providers>
      </body>
    </html>
  );
}
