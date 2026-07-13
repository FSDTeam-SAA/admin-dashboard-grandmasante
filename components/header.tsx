"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Menu } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type HeaderProps = {
  onMenuClick?: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const isNotifications = pathname === "/dashboard/notifications";

  return (
    <header className="flex items-center justify-between gap-3 border-b border-[#4A8B4F]/30 bg-transparent px-4 py-3 sm:px-6 lg:justify-end lg:px-8 lg:py-4">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-10 w-10 rounded-xl bg-white/40 text-slate-600 hover:bg-white/70 lg:hidden"
        onClick={onMenuClick}
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex items-center gap-3 sm:gap-6">
      {/* Notification Bell */}
      <Link
        href="/dashboard/notifications"
        className={cn(
          "relative p-2 rounded-full transition-colors",
          isNotifications ? "bg-white/50" : "hover:bg-white/40"
        )}
        aria-label="Open notifications"
      >
        <Bell className="w-6 h-6 text-slate-600" />
        {/* Dot (show only when you actually have unread) */}
        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
      </Link>

      {/* User Profile Section */}
      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-bold text-slate-900 leading-tight">
            Mr. Suresh
          </p>
          <p className="text-xs text-slate-500 font-medium">
            example@gmail.com
          </p>
        </div>
        <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
          <AvatarImage src="/avatar.png" alt="User" />
          <AvatarFallback className="bg-indigo-100 text-indigo-600 font-bold">
            MS
          </AvatarFallback>
        </Avatar>
      </div>
      </div>
    </header>
  );
}
