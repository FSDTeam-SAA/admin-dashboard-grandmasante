"use client"

import { useEffect, useMemo, useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { PRODUCT_CATEGORY_OPTIONS } from "@/lib/product-categories"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { ImagePlus, Loader2 } from "lucide-react"

type Product = {
  _id: string
  name: string
  perPrice: number
  quantity?: number // your current UI
  totalUnit?: number // backend
  unit?: string
  category?: string | null
  image?: { url?: string }
  avatar?: { url?: string } // your current UI
}

export function EditProductModal({
  open,
  onOpenChange,
  product,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  product: Product | null
}) {
  const queryClient = useQueryClient()

  const initial = useMemo(() => {
    if (!product) return null
    return {
      name: product.name ?? "",
      // support both shapes
      totalUnit: String(product.totalUnit ?? product.quantity ?? ""),
      unit: product.unit ?? "Piece",
      category: product.category ?? "",
      perPrice: String(product.perPrice ?? ""),
      previewUrl: product.image?.url ?? product.avatar?.url ?? "",
    }
  }, [product])

  const [name, setName] = useState("")
  const [totalUnit, setTotalUnit] = useState("")
  const [unit, setUnit] = useState("Piece")
  const [category, setCategory] = useState("")
  const [perPrice, setPerPrice] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>("")

  useEffect(() => {
    if (!initial) return
    setName(initial.name)
    setTotalUnit(initial.totalUnit)
    setUnit(initial.unit)
    setCategory(initial.category)
    setPerPrice(initial.perPrice)
    setFile(null)
    setPreviewUrl(initial.previewUrl)
  }, [initial])

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      if (!product?._id) throw new Error("Missing product id")

      const fd = new FormData()
      fd.append("name", name)
      fd.append("totalUnit", totalUnit) // backend expects totalUnit
      fd.append("unit", unit)
      fd.append("perPrice", perPrice)
      fd.append("category", category)
      if (file) fd.append("image", file) // IMPORTANT: must be "image"

      const res = await apiClient.put(`/products/${product._id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      return res.data
    },
    onSuccess: async () => {
      // refresh current list
      await queryClient.invalidateQueries({ queryKey: ["products"] })
      onOpenChange(false)
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-0 shadow-2xl sm:max-w-[620px]">
        <DialogHeader className="border-b border-slate-100 px-5 py-4 text-left sm:px-6">
          <DialogTitle className="text-xl font-bold text-slate-900">Edit Product</DialogTitle>
        </DialogHeader>

        {!product ? (
          <div className="px-5 py-8 text-sm font-medium text-slate-500 sm:px-6">No product selected.</div>
        ) : (
          <div className="space-y-5 px-5 py-5 sm:px-6">
            <div className="grid gap-4 sm:grid-cols-[76px_1fr] sm:items-end">
              <div className="h-20 w-20 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-sm sm:h-[76px] sm:w-[76px]">
                <img
                  src={previewUrl || "/placeholder.svg"}
                  alt="preview"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="min-w-0">
                <Label className="text-sm font-bold text-slate-700">Image</Label>
                <label className="mt-2 flex h-12 cursor-pointer items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-600 shadow-sm transition hover:border-[#38B475]/50 hover:bg-white">
                  <span className="flex min-w-0 items-center gap-2">
                    <ImagePlus className="h-4 w-4 shrink-0 text-[#38B475]" />
                    <span className="truncate">{file?.name || "Choose product image"}</span>
                  </span>
                  <span className="shrink-0 rounded-lg bg-white px-3 py-1 text-xs text-slate-500 shadow-sm">
                    Browse
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      const f = e.target.files?.[0] ?? null
                      setFile(f)
                      if (f) setPreviewUrl(URL.createObjectURL(f))
                    }}
                  />
                </label>
              </div>
            </div>

            <div>
              <Label className="text-sm font-bold text-slate-700">Name</Label>
              <Input
                className="mt-2 h-12 rounded-xl border-slate-200 bg-white text-slate-900 shadow-sm focus-visible:ring-[#38B475]/20"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-sm font-bold text-slate-700">Total Unit</Label>
                <Input
                  className="mt-2 h-12 rounded-xl border-slate-200 bg-white text-slate-900 shadow-sm focus-visible:ring-[#38B475]/20"
                  inputMode="numeric"
                  value={totalUnit}
                  onChange={(e) => setTotalUnit(e.target.value)}
                />
              </div>
              <div>
                <Label className="text-sm font-bold text-slate-700">Unit</Label>
                <Input
                  className="mt-2 h-12 rounded-xl border-slate-200 bg-white text-slate-900 shadow-sm focus-visible:ring-[#38B475]/20"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-bold text-slate-700">
                Category <span className="text-slate-400 font-medium">(Optional)</span>
              </Label>
              <select
                className="mt-2 flex h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 shadow-sm outline-none transition focus:border-[#38B475] focus:ring-2 focus:ring-[#38B475]/20"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">No category selected</option>
                {PRODUCT_CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label className="text-sm font-bold text-slate-700">Per Piece Price (CFA)</Label>
              <Input
                className="mt-2 h-12 rounded-xl border-slate-200 bg-white text-slate-900 shadow-sm focus-visible:ring-[#38B475]/20"
                inputMode="decimal"
                value={perPrice}
                onChange={(e) => setPerPrice(e.target.value)}
              />
            </div>
          </div>
        )}

        <DialogFooter className="border-t border-slate-100 bg-slate-50/80 px-5 py-4 sm:px-6">
          <Button
            variant="outline"
            className="h-11 rounded-xl border-slate-300 bg-white px-6 font-bold text-slate-700 hover:bg-slate-100"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            className="h-11 rounded-xl bg-[#38B475] px-7 font-bold text-white shadow-sm hover:bg-[#2e9460]"
            onClick={() => mutate()}
            disabled={isPending || !product}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? "Updating..." : "Update"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
