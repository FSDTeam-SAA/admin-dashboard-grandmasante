"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form"
import { apiClient } from "@/lib/api-client"

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  })

  async function onSubmit(values: z.infer<typeof forgotPasswordSchema>) {
    setLoading(true)
    try {
      await apiClient.post("/auth/forget-password", { email: values.email })
      toast.success("OTP sent to your email")
      router.push(`/auth/otp?email=${values.email}`)
    } catch (error) {
      toast.error("Failed to send OTP")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-[540px] space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Forgot Password</h1>
          <p className="text-slate-500 font-medium px-4">
            Enter your registered email address, we'll send you a code to reset your password.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-slate-700 font-semibold ml-1">Email Address</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="you@gmail.com"
                      {...field}
                      className="rounded-full bg-white border-none h-12 px-6 shadow-sm focus-visible:ring-1 focus-visible:ring-slate-300"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-full bg-gradient-to-r from-[#38b475] to-[#4b66f1] text-lg font-bold text-white shadow-lg hover:opacity-90 transition-all active:scale-[0.98]"
            >
              {loading ? "Sending..." : "Send OTP"}
            </Button>
            
            <div className="text-center">
              <button 
                type="button"
                onClick={() => router.back()}
                className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
              >
                Back to Login
              </button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}