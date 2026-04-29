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

type Plan = {
  _id: string
  name: string
  description: string
  price: number
  userLimit: number
  savePercentage: number
  carryCredit: number // ✅ add this (adjust to boolean if your schema uses boolean)
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "add" | "edit"
  plan: Plan | null
}

export default function PlanFormModal({ open, onOpenChange, mode, plan }: Props) {
  const qc = useQueryClient()

  const [form, setForm] = React.useState({
    name: "",
    description: "",
    price: "",
    userLimit: "",
    savePercentage: "",
    carryCredit: "", // ✅
  })

  React.useEffect(() => {
    if (!open) return

    if (mode === "edit" && plan) {
      setForm({
        name: plan.name ?? "",
        description: plan.description ?? "",
        price: String(plan.price ?? ""),
        userLimit: String(plan.userLimit ?? ""),
        savePercentage: String(plan.savePercentage ?? ""),
        carryCredit: String((plan as any).carryCredit ?? ""), // ✅
      })
    } else {
      setForm({
        name: "",
        description: "",
        price: "",
        userLimit: "",
        savePercentage: "",
        carryCredit: "", // ✅
      })
    }
  }, [open, mode, plan])

  const addMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        userLimit: Number(form.userLimit),
        savePercentage: Number(form.savePercentage),
        carryCredit: Number(form.carryCredit), // ✅ REQUIRED
      }
      const res = await apiClient.post("/subscription/plans", payload)
      return res.data
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["subscription-plans"] })
      onOpenChange(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!plan?._id) throw new Error("Missing plan id")
      const payload = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        userLimit: Number(form.userLimit),
        savePercentage: Number(form.savePercentage),
        carryCredit: Number(form.carryCredit), // ✅ send on edit too
      }
      const res = await apiClient.put(`/subscription/plans/${plan._id}`, payload)
      return res.data
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["subscription-plans"] })
      onOpenChange(false)
    },
  })

  const busy = addMutation.isPending || updateMutation.isPending
  const onSubmit = () => (mode === "add" ? addMutation.mutate() : updateMutation.mutate())

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[620px] rounded-3xl bg-white border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900">
            {mode === "add" ? "Create New Plan" : "Edit Plan Details"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label className="text-slate-700 font-semibold ml-1">Plan Name</Label>
            <Input
              className="bg-slate-50 border-slate-200 text-black placeholder:text-slate-400 h-11 focus-visible:ring-emerald-500"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Professional Tier"
            />
          </div>

          <div className="grid gap-2">
            <Label className="text-slate-700 font-semibold ml-1">Description</Label>
            <Textarea
              className="bg-slate-50 border-slate-200 text-black placeholder:text-slate-400 min-h-[100px] focus-visible:ring-emerald-500"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Describe what users get with this plan..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label className="text-slate-700 font-semibold ml-1">Price (CFA)</Label>
              <Input
                type="number"
                className="bg-slate-50 border-slate-200 text-black h-11 focus-visible:ring-emerald-500"
                value={form.price}
                onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
              />
            </div>

            <div className="grid gap-2">
              <Label className="text-slate-700 font-semibold ml-1">User Limit</Label>
              <Input
                type="number"
                className="bg-slate-50 border-slate-200 text-black h-11 focus-visible:ring-emerald-500"
                value={form.userLimit}
                onChange={(e) => setForm((p) => ({ ...p, userLimit: e.target.value }))}
              />
            </div>

            <div className="grid gap-2">
              <Label className="text-slate-700 font-semibold ml-1">Discount (%)</Label>
              <Input
                type="number"
                className="bg-slate-50 border-slate-200 text-black h-11 focus-visible:ring-emerald-500"
                value={form.savePercentage}
                onChange={(e) => setForm((p) => ({ ...p, savePercentage: e.target.value }))}
              />
            </div>
          </div>

          {/* ✅ carryCredit field */}
          <div className="grid gap-2">
            <Label className="text-slate-700 font-semibold ml-1">
              Carry Credit (CFA)
            </Label>
            <Input
              type="number"
              className="bg-slate-50 border-slate-200 text-black h-11 focus-visible:ring-emerald-500"
              value={form.carryCredit}
              onChange={(e) => setForm((p) => ({ ...p, carryCredit: e.target.value }))}
              placeholder="e.g. 100"
            />
            <p className="text-xs text-slate-400 ml-1">
              Required by backend. Set how much credit can carry to next cycle.
            </p>
          </div>
        </div>

        <DialogFooter className="mt-4 gap-3">
          <Button
            variant="ghost"
            className="text-slate-500 hover:text-slate-800 hover:bg-slate-100 font-medium"
            onClick={() => onOpenChange(false)}
            disabled={busy}
          >
            Cancel
          </Button>

          <Button
            onClick={onSubmit}
            disabled={busy}
            className="px-8 bg-gradient-to-r from-emerald-500 via-blue-500 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-blue-100 hover:opacity-90 transition-opacity"
          >
            {busy ? "Saving..." : mode === "add" ? "Create Plan" : "Update Plan"}
          </Button>
        </DialogFooter>

        {(addMutation.isError || updateMutation.isError) && (
          <div className="mt-2 p-3 bg-red-50 text-xs text-red-600 rounded-lg border border-red-100">
            {(addMutation.error as any)?.message ||
              (updateMutation.error as any)?.message ||
              "An error occurred while saving."}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
