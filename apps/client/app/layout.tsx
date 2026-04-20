import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppHeader } from "@/components/layout/app-header";
import { Sidebar } from "@/components/layout/sidebar";
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
};

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full bg-background text-foreground selection:bg-white/20">
        <Providers>
          <div className="dark h-full w-full bg-background">
            <SidebarProvider>
              <Sidebar />
              <SidebarInset className="bg-background">
                <AppHeader />
                <main className="flex-1 overflow-y-auto w-full">
                  <div className="mx-auto w-full max-w-[1400px] p-6 lg:p-12">
                    {children}
                  </div>
                </main>
              </SidebarInset>
            </SidebarProvider>
          </div>
        </Providers>
      </body>
    </html>
  );
}
