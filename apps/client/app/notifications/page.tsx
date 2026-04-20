"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api, formatDate } from "@/lib/api";
import { setUser, useSession } from "@/lib/store";

export default function NotificationsPage() {
  const { user } = useSession();
  const [pendingId, setPendingId] = useState<string | null>(null);

  const unread = user?.notifcations?.filter((item) => !item.read) ?? [];

  const markAsRead = async (id: string) => {
    if (!user) return;
    setPendingId(id);

    try {
      await api(`/api/v1/user/notifcation/${id}`);
      setUser({
        ...user,
        notifcations: user.notifcations.map((item) =>
          item.id === id ? { ...item, read: true } : item,
        ),
      });
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="p-0">
      <Card className="max-w-5xl md:mt-2 xl:mt-4 rounded-[2rem] border-border/60 bg-card/60 backdrop-blur-xl shadow-xs overflow-hidden">
        <CardHeader className="bg-accent/20 border-b border-border/40 pb-6 pt-8 px-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
              <Bell className="size-6" />
            </div>
            <div>
              <CardTitle className="text-2xl">
                {unread.length} unread notification
                {unread.length === 1 ? "" : "s"}
              </CardTitle>
              <CardDescription className="text-base mt-1.5">
                Catch up on updates related to tickets you own or follow.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {unread.length ? (
            <div className="divide-y divide-border/40 max-h-[60vh] overflow-y-auto">
              {unread.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-4 px-8 py-5 transition-colors hover:bg-accent/40 md:flex-row md:items-center md:justify-between group"
                >
                  <Link
                    href={item.ticketId ? `/issue/${item.ticketId}` : "/issues"}
                    className="flex-1"
                  >
                    <p className="font-semibold text-base text-foreground group-hover:underline decoration-border underline-offset-4">
                      {item.text}
                    </p>
                    <p className="mt-1.5 text-xs font-medium text-muted-foreground">
                      {formatDate(item.createdAt)}
                    </p>
                  </Link>
                  <Button
                    variant="outline"
                    className="rounded-full px-5 text-xs font-semibold shadow-none border-border/80 bg-background/50 hover:bg-background h-9"
                    disabled={pendingId === item.id}
                    onClick={(event) => {
                      event.preventDefault();
                      void markAsRead(item.id);
                    }}
                  >
                    {pendingId === item.id ? "Saving..." : "Mark as read"}
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-8 py-20 text-center text-base font-medium text-muted-foreground">
              You're all caught up. No unread notifications.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
