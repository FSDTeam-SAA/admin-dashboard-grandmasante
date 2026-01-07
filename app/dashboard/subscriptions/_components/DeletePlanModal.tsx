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
import { AlertCircle } from "lucide-react"

type Plan = { _id: string; name: string }

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  plan: Plan | null
}

export default function DeletePlanModal({ open, onOpenChange, plan }: Props) {
  const qc = useQueryClient()

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

  const busy = deleteMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] rounded-[28px] bg-white border-none p-8 shadow-2xl">
        <DialogHeader className="items-center text-center">
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6 text-red-500" />
          </div>
          <DialogTitle className="text-xl font-bold text-black">
            Delete Subscription Plan
          </DialogTitle>
        </DialogHeader>

        <div className="text-center text-[15px] leading-relaxed text-slate-500 py-2">
          Are you sure you want to delete{" "}
          <span className="font-bold text-black">
            "{plan?.name ?? "this plan"}"
          </span>
          ? This action is permanent and cannot be reversed.
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-6">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            disabled={busy}
            className="flex-1 rounded-xl border-slate-200 text-slate-600 font-semibold h-11"
          >
            No, Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => deleteMutation.mutate()}
            disabled={busy || !plan}
            className="flex-1 rounded-xl bg-red-500 hover:bg-red-600 font-bold h-11 transition-all"
          >
            {busy ? "Deleting..." : "Yes, Delete"}
          </Button>
        </DialogFooter>

        {deleteMutation.isError && (
          <div className="mt-4 p-3 bg-red-50 text-center text-xs text-red-600 rounded-lg border border-red-100 font-medium">
            {(deleteMutation.error as any)?.message || "Delete failed. Please try again."}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}