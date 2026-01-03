"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2 } from "lucide-react"

const passwordSchema = z.object({
  currentPassword: z.string().min(6, "Required"),
  newPassword: z.string().min(6, "Must be 6+ characters"),
  confirmPassword: z.string().min(6, "Required"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export default function SettingsPage() {
  const queryClient = useQueryClient()

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

  const updatePassword = useMutation({
    mutationFn: (values: z.infer<typeof passwordSchema>) => apiClient.put("/user/change-password", values),
    onSuccess: () => {
      toast.success("Password updated successfully")
      form.reset()
    },
    onError: () => toast.error("Failed to update password"),
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
            <AvatarImage src={profile?.avatar?.url || "/placeholder.jpg"} className="object-cover" />
            <AvatarFallback className="bg-[#38B475] text-white text-2xl font-bold">
              {profile?.name?.[0]}
            </AvatarFallback>
          </Avatar>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{profile?.name || "Mr. Suresh"}</h2>
          <p className="text-slate-500 font-bold">@{profile?.role || "admin"}</p>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="bg-white/30 backdrop-blur-md rounded-[32px] p-10 border border-white/40 shadow-sm space-y-8">
        <h3 className="text-xl font-bold text-slate-900">Change password</h3>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit((v) => updatePassword.mutate(v))} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-slate-700">Current Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••" {...field} className="h-12 rounded-full border-none bg-white px-6 shadow-sm" />
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
                    <FormLabel className="font-bold text-slate-700">New Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••" {...field} className="h-12 rounded-full border-none bg-white px-6 shadow-sm" />
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
                    <FormLabel className="font-bold text-slate-700">Confirm New Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••" {...field} className="h-12 rounded-full border-none bg-white px-6 shadow-sm" />
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
                style={{ background: 'linear-gradient(90deg, #38B475 0%, #4B66F1 100%)' }}
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