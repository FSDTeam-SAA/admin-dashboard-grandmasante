import type React from "react"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-gradient-to-br from-[#f5f3ff] via-[#e0f7f4] to-[#d4f4e7] px-4 py-8">
      <div className="flex w-full justify-center">
        {children}
      </div>
    </div>
  )
}
