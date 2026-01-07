"use client"

import * as React from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Eye, EyeOff } from "lucide-react"

const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, "Required"),
    newPassword: z.string().min(6, "Must be 6+ characters"),
    confirmPassword: z.string().min(6, "Required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

function PasswordInput({
  value,
  onChange,
  placeholder,
  show,
  onToggle,
}: {
  value: string
  onChange: (...event: any[]) => void
  placeholder?: string
  show: boolean
  onToggle: () => void
}) {
  return (
    <div className="relative">
      <Input
        type={show ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="h-12 rounded-full border-none bg-white px-6 pr-12 shadow-sm"
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </button>
    </div>
  )
}

export default function SettingsPage() {
  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await apiClient.get("/user/profile")
      return res.data.data
    },
  })

  const form = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  })

  const [show, setShow] = React.useState({
    current: false,
    next: false,
    confirm: false,
  })

  const updatePassword = useMutation({
    mutationFn: (values: z.infer<typeof passwordSchema>) =>
      apiClient.post("/auth/change-password", {
        oldPassword: values.currentPassword, // ✅ match backend
        newPassword: values.newPassword, // ✅ match backend
      }),
    onSuccess: () => {
      toast.success("Password updated successfully")
      form.reset()
      setShow({ current: false, next: false, confirm: false })
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to update password")
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#38B475]" />
      </div>
    )
  }

  return (
    <div className="space-y-8 py-10">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-4xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 font-medium">Edit your personal information</p>
      </div>

      {/* Profile Banner Card */}
      <div className="bg-white/30 backdrop-blur-md rounded-[32px] p-8 border border-white/40 shadow-sm flex items-center gap-6">
        <div className="relative">
          <Avatar className="w-24 h-24 border-4 border-white shadow-md">
            <AvatarImage
              src={profile?.avatar?.url || "/placeholder.jpg"}
              className="object-cover"
            />
            <AvatarFallback className="bg-[#38B475] text-white text-2xl font-bold">
              {profile?.name?.[0] ?? "U"}
            </AvatarFallback>
          </Avatar>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            {profile?.name || "Mr. Suresh"}
          </h2>
          <p className="text-slate-500 font-bold">@{profile?.role || "admin"}</p>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="bg-white/30 backdrop-blur-md rounded-[32px] p-10 border border-white/40 shadow-sm space-y-8">
        <h3 className="text-xl font-bold text-slate-900">Change password</h3>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((v) => updatePassword.mutate(v))}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-slate-700">
                      Current Password
                    </FormLabel>
                    <FormControl>
                      <PasswordInput
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="••••••"
                        show={show.current}
                        onToggle={() =>
                          setShow((p) => ({ ...p, current: !p.current }))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-slate-700">
                      New Password
                    </FormLabel>
                    <FormControl>
                      <PasswordInput
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="••••••"
                        show={show.next}
                        onToggle={() => setShow((p) => ({ ...p, next: !p.next }))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-slate-700">
                      Confirm New Password
                    </FormLabel>
                    <FormControl>
                      <PasswordInput
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="••••••"
                        show={show.confirm}
                        onToggle={() =>
                          setShow((p) => ({ ...p, confirm: !p.confirm }))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={updatePassword.isPending}
                className="h-12 px-10 rounded-full font-bold shadow-lg transition-transform active:scale-95"
                style={{ background: "linear-gradient(90deg, #38B475 0%, #4B66F1 100%)" }}
              >
                {updatePassword.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
