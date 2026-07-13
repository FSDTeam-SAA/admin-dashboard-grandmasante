"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  Home,
  CreditCard,
  History,
  ShoppingCart,
  PackageCheck,
  Settings,
  LogOut,
  MessageCircle,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

const menuItems = [
  { name: "Overview", icon: LayoutDashboard, href: "/dashboard" },
  { name: "User List", icon: Users, href: "/dashboard/users" },
  { name: "Product List", icon: Users, href: "/dashboard/products" },
  { name: "Commercial Sales", icon: TrendingUp, href: "/dashboard/commercial-sales" },
  { name: "In House Sales", icon: Home, href: "/dashboard/in-house-sales" },
  { name: "Subscription Plan", icon: CreditCard, href: "/dashboard/subscriptions" },
  { name: "Order Lists", icon: ShoppingCart, href: "/dashboard/orders" },
  { name: "Delivered Orders", icon: PackageCheck, href: "/dashboard/delivered-orders" },
  { name: "Regular Followup", icon: MessageCircle, href: "/dashboard/followup" },
  { name: "Settings", icon: Settings, href: "/dashboard/settings" },
];

type SidebarProps = {
  className?: string
  onNavigate?: () => void
}

export function Sidebar({ className, onNavigate }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div
      className={cn("flex h-full max-h-dvh w-72 max-w-[85vw] flex-col overflow-hidden border-r border-indigo-50/50", className)}
      style={{
        background:
          "linear-gradient(86deg, #E5FFEF -2.79%, #E7E5FF 54.35%, #E5FFEF 111.49%)",
        boxShadow: "0 -1px 2px 0 rgba(80, 72, 231, 0.16)",
      }}
    >
      {/* Branding */}
      <div className="py-6 lg:py-10 flex flex-col items-center justify-center gap-2 shrink-0">
        <div className="relative w-[60px] h-[60px]">
          <Image
            src="/logo.png"
            alt="Grandma santé logo"
            width={60}
            height={60}
            className="object-contain"
          />
        </div>
        <h2
          className="text-[#38B475] text-[28px] font-normal tracking-tight"
          style={{ fontFamily: "var(--font-brand)", fontWeight: 400 }}
        >
          Grandma santé
        </h2>
      </div>

      {/* Nav (scrolls but scrollbar hidden) */}
      <nav className="min-h-0 flex-1 space-y-3 overflow-y-auto px-2 pb-4 sidebar-scroll">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center space-x-4 px-4 py-3 rounded-xl text-base lg:text-lg font-medium transition-all duration-200 border",
                isActive
                  ? "bg-[#C2E9C8] text-[#4A8B4F] border-[#A3D9AC] shadow-sm"
                  : "bg-white/40 text-slate-500 border-white/20 hover:bg-white/60 hover:text-slate-700 shadow-sm"
              )}
            >
              <item.icon
                className={cn("w-5 h-5", isActive ? "text-[#4A8B4F]" : "text-slate-400")}
              />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout pinned bottom */}
      <div className="p-6 border-t border-indigo-50/50 shrink-0">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start gap-4 px-5 py-6 text-slate-500 font-semibold hover:bg-red-50 hover:text-red-600 rounded-xl"
            >
              <LogOut className="w-6 h-6" />
              <span className="text-lg">Logout</span>
            </Button>
          </AlertDialogTrigger>

          <AlertDialogContent className="bg-white rounded-3xl border-none">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-slate-900">Sign Out</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-500">
                Are you sure you want to end your session?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-full border-slate-200">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                className="rounded-full bg-[#4A8B4F] hover:bg-[#3d7341] text-white"
                onClick={() => signOut({ callbackUrl: "/auth/login" })}
              >
                Logout
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
