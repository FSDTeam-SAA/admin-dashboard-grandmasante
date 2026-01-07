"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"
import { useMutation } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, Image as ImageIcon, Save } from "lucide-react"

// ✅ Backend expects: name, totalUnit, perPrice, unit, and (optional) image file => req.file
const productSchema = z.object({
  name: z.string().min(2, "Product name is required"),
  totalUnit: z.string().refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Must be a positive number"),
  perPrice: z.string().refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Must be a positive number"),
  unit: z.string().optional(),
})

type ProductFormValues = z.infer<typeof productSchema>

export default function AddProductPage() {
  const router = useRouter()

  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      totalUnit: "1",
      perPrice: "1",
      unit: "pieces",
    },
  })

  const totalUnit = form.watch("totalUnit")
  const perPrice = form.watch("perPrice")

  const totalAmount = useMemo(() => {
    const u = Number(totalUnit) || 0
    const p = Number(perPrice) || 0
    return u * p
  }, [totalUnit, perPrice])

  const createProductMutation = useMutation({
    mutationFn: async (values: ProductFormValues) => {
      // ✅ IMPORTANT: to upload image + fields, use multipart/form-data
      const fd = new FormData()
      fd.append("name", values.name)
      fd.append("totalUnit", String(Number(values.totalUnit)))
      fd.append("perPrice", String(Number(values.perPrice)))
      fd.append("unit", values.unit ?? "pieces")

      // ✅ This MUST match your multer field name.
      // If your route is like: upload.single("image") then keep "image".
      // If your route is upload.single("file") then change to "file".
      if (imageFile) fd.append("image", imageFile)

      const res = await apiClient.post("/products", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      return res.data
    },
    onSuccess: () => {
      toast.success("Product added successfully!")
      router.push("/dashboard/products")
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to add product. Please try again."
      toast.error(message)
    },
  })

  return (
    <div className="space-y-6 py-4">
      {/* Top Navigation */}
      <Button
        variant="secondary"
        onClick={() => router.back()}
        className="bg-slate-500 hover:bg-slate-600 text-white rounded-lg h-9 px-4 flex items-center gap-2"
      >
        <ChevronLeft className="w-4 h-4" />
        Back
      </Button>

      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-slate-800">Add Product</h1>
          <p className="text-sm font-medium text-slate-500">Add New Product</p>
        </div>

        <Button
          disabled={createProductMutation.isPending}
          onClick={form.handleSubmit((v) => createProductMutation.mutate(v))}
          className="bg-gradient-to-r from-[#38B475] to-[#4B66F1] hover:opacity-90 h-11 px-8 rounded-xl flex items-center gap-2 font-bold text-white"
        >
          <Save className="w-5 h-5" />
          {createProductMutation.isPending ? "Saving..." : "Save"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: General Info */}
        <Card className="lg:col-span-2 bg-white/40 border-slate-100 rounded-[24px] shadow-sm">
          <CardContent className="p-8 space-y-8">
            <h3 className="text-xl font-bold text-slate-800">General Information</h3>

            <Form {...form}>
              <form
                className="space-y-6"
                onSubmit={form.handleSubmit((v) => createProductMutation.mutate(v))}
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-800 font-bold">Product Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Type product name here."
                          className="h-12 border-slate-200 rounded-xl"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <FormLabel className="text-slate-800 font-bold">Set Prices</FormLabel>

                  <div className="flex flex-wrap items-center gap-6">
                    {/* Total Unit Input */}
                    <div className="flex items-center gap-3">
                      <Input
                        {...form.register("totalUnit")}
                        inputMode="decimal"
                        className="w-24 h-12 text-center font-bold rounded-lg border-slate-200"
                      />
                      <span className="text-slate-600 font-bold">Unit</span>
                    </div>

                    {/* Per Price Input */}
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-500">
                          $
                        </span>
                        <Input
                          {...form.register("perPrice")}
                          inputMode="decimal"
                          className="w-24 h-12 pl-8 text-center font-bold rounded-lg border-slate-200"
                        />
                      </div>
                      <span className="text-slate-600 font-bold">Price</span>
                    </div>

                    {/* Optional Unit Type */}
                    <div className="flex items-center gap-3">
                      <Input
                        {...form.register("unit")}
                        className="w-36 h-12 text-center font-bold rounded-lg border-slate-200"
                        placeholder="pieces"
                      />
                      <span className="text-slate-600 font-bold">Type</span>
                    </div>

                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-[#38B475] to-[#4B66F1] h-12 px-10 rounded-xl font-bold text-white ml-auto"
                      disabled={createProductMutation.isPending}
                    >
                      {createProductMutation.isPending ? "Saving..." : "Set"}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <FormLabel className="text-slate-800 font-bold">Total Amount</FormLabel>
                  <Input
                    disabled
                    value={totalAmount}
                    className="h-12 bg-slate-50/50 border-slate-200 rounded-xl font-bold text-slate-800"
                  />
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Right Side: Image Upload */}
        <Card className="bg-white/40 border-slate-100 rounded-[24px] shadow-sm">
          <CardContent className="p-8 space-y-6">
            <h3 className="text-xl font-bold text-slate-800">Product Image</h3>

            <div className="space-y-4">
              <p className="text-slate-800 font-bold text-sm">Photo</p>

              <div className="aspect-[4/3] rounded-3xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center gap-4 bg-white/50 relative overflow-hidden">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    className="w-full h-full object-cover"
                    alt="Preview"
                  />
                ) : (
                  <>
                    <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600">
                      <ImageIcon className="w-7 h-7" />
                    </div>
                    <p className="text-[12px] text-slate-400 font-medium text-center px-6">
                      Drag and drop image here, or click add image
                    </p>

                    <label className="cursor-pointer bg-[#38B475] hover:bg-[#2e9460] text-white px-6 py-2 rounded-xl font-bold text-sm transition-colors">
                      Add Image
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (!file) return
                          setImageFile(file)
                          setImagePreview(URL.createObjectURL(file))
                        }}
                      />
                    </label>
                  </>
                )}
              </div>

              {imagePreview && (
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    className="rounded-xl"
                    onClick={() => {
                      setImageFile(null)
                      setImagePreview(null)
                    }}
                  >
                    Remove
                  </Button>

                  <Button
                    type="button"
                    className="rounded-xl bg-slate-700 hover:bg-slate-800 text-white"
                    onClick={() => toast.message("Image selected. It will upload on Save.")}
                  >
                    Keep
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
