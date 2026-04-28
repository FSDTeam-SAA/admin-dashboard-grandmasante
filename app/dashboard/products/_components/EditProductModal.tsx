"use client"

import { useEffect, useMemo, useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { PRODUCT_CATEGORY_OPTIONS } from "@/lib/product-categories"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

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
      <DialogContent className="sm:max-w-[560px] bg-white">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>

        {!product ? (
          <div className="text-slate-500">No product selected.</div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden border bg-slate-50">
                <img
                  src={previewUrl || "/placeholder.svg"}
                  alt="preview"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="w-full">
                <label className="text-sm font-semibold text-slate-600">Image</label>
                <Input
                  type="file"
                  accept="image/*"
                  className="mt-2"
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null
                    setFile(f)
                    if (f) setPreviewUrl(URL.createObjectURL(f))
                  }}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-600">Name</label>
              <Input className="mt-2" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-600">Total Unit</label>
                <Input
                  className="mt-2"
                  inputMode="numeric"
                  value={totalUnit}
                  onChange={(e) => setTotalUnit(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-600">Unit</label>
                <Input className="mt-2" value={unit} onChange={(e) => setUnit(e.target.value)} />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-600">
                Category <span className="text-slate-400 font-medium">(Optional)</span>
              </label>
              <select
                className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
              <label className="text-sm font-semibold text-slate-600">Per Piece Price</label>
              <Input
                className="mt-2"
                inputMode="decimal"
                value={perPrice}
                onChange={(e) => setPerPrice(e.target.value)}
              />
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button
            className="bg-[#38B475] hover:bg-[#2e9460]"
            onClick={() => mutate()}
            disabled={isPending || !product}
          >
            {isPending ? "Updating..." : "Update"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
