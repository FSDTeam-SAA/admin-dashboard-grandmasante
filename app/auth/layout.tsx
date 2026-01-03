import type React from "react"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#f5f3ff] via-[#e0f7f4] to-[#d4f4e7] p-4">
      {/* The gradient uses:
         - Top Left: Soft Lavender (#f5f3ff)
         - Middle: Minty White (#e0f7f4)
         - Bottom Right: Pale Seafoam (#d4f4e7)
      */}
      <div className="w-full flex justify-center">
        {children}
      </div>
    </div>
  )
}