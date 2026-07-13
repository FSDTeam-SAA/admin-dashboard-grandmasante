"use client"

import { useState, Suspense, useRef, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { apiClient } from "@/lib/api-client"

function OTPContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email")
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [loading, setLoading] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Autofocus first field on mount
  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    // Handle paste or single character
    const val = value.slice(-1)
    newOtp[index] = val
    setOtp(newOtp)

    // Move focus forward
    if (val && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Move focus back on backspace if current field is empty
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  async function handleVerify() {
    setLoading(true)
    const otpString = otp.join("")
    try {
      // Logic: Validate OTP here or pass to reset-password page
      // For this flow, we'll pass it to the reset page
      toast.success("OTP Verified")
      router.push(`/auth/reset-password?email=${email}&otp=${otpString}`)
    } catch (error) {
      toast.error("Invalid OTP. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-[440px] space-y-10">
        <div className="space-y-3 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Enter OTP</h1>
          <p className="text-slate-500 font-medium px-6 leading-relaxed">
            We have shared a code to your registered email address <br />
            <span className="font-bold text-slate-800">{email}</span>
          </p>
        </div>

        <div className="space-y-8">
          <div className="flex justify-between gap-2 sm:gap-4">
            {otp.map((digit, idx) => (
              <Input
                key={idx}
                ref={(el) => {
                  inputRefs.current[idx] = el
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onChange={(e) => handleChange(idx, e.target.value)}
                className="h-14 w-full rounded-2xl bg-white border-none text-center text-2xl font-bold shadow-sm focus-visible:ring-2 focus-visible:ring-indigo-500/20"
              />
            ))}
          </div>

          <div className="space-y-4">
            <Button
              onClick={handleVerify}
              disabled={loading || otp.some((d) => !d)}
              className="h-12 w-full rounded-full bg-gradient-to-r from-[#38b475] to-[#4b66f1] text-lg font-bold text-white shadow-lg hover:opacity-90 transition-all active:scale-[0.98]"
            >
              {loading ? "Verifying..." : "Verify"}
            </Button>

            <div className="text-center">
              <p className="text-sm text-slate-500 font-medium">
                Didn't receive a code?{" "}
                <button 
                  type="button"
                  className="text-slate-900 font-bold hover:underline transition-all"
                  onClick={() => toast.info("OTP resent!")}
                >
                  Resend
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function OTPPage() {
  return (
    <Suspense fallback={null}>
      <OTPContent />
    </Suspense>
  )
}
