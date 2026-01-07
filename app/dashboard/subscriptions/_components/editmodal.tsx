"use client"

import * as React from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Trash2 } from "lucide-react"

type Plan = {
  _id: string
  name: string
  description: string
  price: number
  userLimit: number
  savePercentage: number
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  plan: Plan | null
}

export default function PlanEditModal({ open, onOpenChange, plan }: Props) {
  const qc = useQueryClient()

  const [form, setForm] = React.useState({
    name: "",
    description: "",
    price: "",
    userLimit: "",
    savePercentage: "",
  })

  React.useEffect(() => {
    if (!plan) return
    setForm({
      name: plan.name ?? "",
      description: plan.description ?? "",
      price: String(plan.price ?? ""),
      userLimit: String(plan.userLimit ?? ""),
      savePercentage: String(plan.savePercentage ?? ""),
    })
  }, [plan])

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!plan?._id) throw new Error("Missing plan id")
      const payload = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        userLimit: Number(form.userLimit),
        savePercentage: Number(form.savePercentage),
      }
      const res = await apiClient.put(`/subscription/plans/${plan._id}`, payload)
      return res.data
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["subscription-plans"] })
      onOpenChange(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!plan?._id) throw new Error("Missing plan id")
      const res = await apiClient.post(`/subscription/plans/${plan._id}/toggle`, {
        action: "delete",
      })
      return res.data
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["subscription-plans"] })
      onOpenChange(false)
    },
  })

  const busy = updateMutation.isPending || deleteMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] rounded-[32px] bg-white border-none p-8 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-black">
            Edit Subscription Plan
          </DialogTitle>
          <p className="text-slate-500 text-sm">
            Modify the pricing and features for this tier.
          </p>
        </DialogHeader>

        {!plan ? (
          <div className="py-12 text-center text-slate-400 font-medium">
            No plan data found.
          </div>
        ) : (
          <div className="grid gap-6 py-6">
            <div className="space-y-2">
              <Label className="text-black font-bold text-sm ml-1">Plan Name</Label>
              <Input
                className="h-12 bg-slate-50 border-slate-200 text-black focus-visible:ring-emerald-500 rounded-xl"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-black font-bold text-sm ml-1">Description</Label>
              <Textarea
                className="min-h-[100px] bg-slate-50 border-slate-200 text-black focus-visible:ring-emerald-500 rounded-xl resize-none"
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-black font-bold text-sm ml-1">Price ($)</Label>
                <Input
                  type="number"
                  className="h-12 bg-slate-50 border-slate-200 text-black focus-visible:ring-emerald-500 rounded-xl"
                  value={form.price}
                  onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-black font-bold text-sm ml-1">Users</Label>
                <Input
                  type="number"
                  className="h-12 bg-slate-50 border-slate-200 text-black focus-visible:ring-emerald-500 rounded-xl"
                  value={form.userLimit}
                  onChange={(e) => setForm((p) => ({ ...p, userLimit: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-black font-bold text-sm ml-1">Save %</Label>
                <Input
                  type="number"
                  className="h-12 bg-slate-50 border-slate-200 text-black focus-visible:ring-emerald-500 rounded-xl"
                  value={form.savePercentage}
                  onChange={(e) => setForm((p) => ({ ...p, savePercentage: e.target.value }))}
                />
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-2">
          {/* Delete Button on the left */}
          <Button
            variant="ghost"
            onClick={() => deleteMutation.mutate()}
            disabled={busy || !plan}
            className="text-red-500 hover:text-red-600 hover:bg-red-50 font-semibold flex gap-2"
          >
            <Trash2 className="w-4 h-4" />
            {deleteMutation.isPending ? "Deleting..." : "Delete Plan"}
          </Button>

          <div className="flex gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={busy}
              className="rounded-xl border-slate-200 text-slate-600 font-semibold px-6"
            >
              Cancel
            </Button>

            <Button
              onClick={() => updateMutation.mutate()}
              disabled={busy || !plan}
              className="rounded-xl bg-gradient-to-r from-emerald-500 via-blue-500 to-indigo-600 text-white font-bold px-8 shadow-lg shadow-blue-100 hover:opacity-90 transition-all"
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogFooter>

        {(updateMutation.isError || deleteMutation.isError) && (
          <div className="mt-4 p-3 bg-red-50 text-xs text-red-600 rounded-xl border border-red-100 font-medium">
            {(updateMutation.error as any)?.message ||
              (deleteMutation.error as any)?.message ||
              "An error occurred."}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}