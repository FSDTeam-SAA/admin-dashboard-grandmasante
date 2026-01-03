import type React from "react"
import { Sidebar } from "@/components/sidebar"
import Header from "@/components/header"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{
        background: "linear-gradient(86deg, #E5FFEF -2.79%, #E7E5FF 54.35%, #E5FFEF 111.49%)",
      }}
    >
      {/* Sidebar */}
      <aside className="h-screen overflow-y-auto">
        <Sidebar />
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="shrink-0">
          <Header />
        </div>

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto px-8 pb-8">
          {children}
        </main>
      </div>
    </div>
  )
}
