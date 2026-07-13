"use client"

import type React from "react"
import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import Header from "@/components/header"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  return (
    <div
      className="flex h-dvh overflow-hidden"
      style={{
        background: "linear-gradient(86deg, #E5FFEF -2.79%, #E7E5FF 54.35%, #E5FFEF 111.49%)",
      }}
    >
      <aside className="hidden h-full shrink-0 lg:block">
        <Sidebar />
      </aside>

      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent side="left" className="w-72 max-w-[85vw] border-none bg-transparent p-0">
          <SheetTitle className="sr-only">Dashboard navigation</SheetTitle>
          <Sidebar onNavigate={() => setMobileSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="shrink-0">
          <Header onMenuClick={() => setMobileSidebarOpen(true)} />
        </div>

        <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-6 sm:px-6 lg:px-8 lg:pb-8">
          {children}
        </main>
      </div>
    </div>
  )
}
