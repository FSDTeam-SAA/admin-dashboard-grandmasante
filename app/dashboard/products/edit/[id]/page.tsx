"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { formatCfa } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronLeft, Image as ImageIcon, Save } from "lucide-react"

const productSchema = z.object({
  name: z.string().min(2, "Product name is required"),
  unit: z.string().refine((val) => !isNaN(Number(val)), "Must be a number"),
  price: z.string().refine((val) => !isNaN(Number(val)), "Must be a number"),
})

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string
  const queryClient = useQueryClient()
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  // 1. Fetch Product Data
  const { data: product, isLoading } = useQuery({
    queryKey: ["product", productId],
    queryFn: async () => {
      const res = await apiClient.get(`/products/${productId}`)
      return res.data.data
    },
  })

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: { name: "", unit: "0", price: "0" },
  })

  // 2. Sync Form with Fetched Data
  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name || "",
        unit: String(product.quantity || 0),
        price: String(product.price || 0),
      })
      setImagePreview(product.image?.url || null)
    }
  }, [product, form])

  const unit = form.watch("unit")
  const price = form.watch("price")
  const totalAmount = (Number(unit) || 0) * (Number(price) || 0)

  // 3. Mutation for Updating
  const updateProductMutation = useMutation({
    mutationFn: async (values: z.infer<typeof productSchema>) => {
      const response = await apiClient.put(`/products/${productId}`, {
        name: values.name,
        quantity: Number(values.unit),
        price: Number(values.price),
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
      toast.success("Product updated successfully!")
      router.push("/dashboard/products")
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update product")
    },
  })

  // 4. Loading State (Skeletons)
  if (isLoading) {
    return (
      <div className="space-y-6 py-4 animate-in fade-in duration-500">
        <Skeleton className="h-9 w-24 rounded-lg" />
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-11 w-36 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-slate-100 rounded-[24px]">
            <CardContent className="p-8 space-y-8">
              <Skeleton className="h-7 w-44" />
              <div className="space-y-6">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-12 w-full rounded-xl" />
                </div>
                <div className="space-y-4">
                  <Skeleton className="h-4 w-20" />
                  <div className="flex gap-6">
                    <Skeleton className="h-12 w-32 rounded-lg" />
                    <Skeleton className="h-12 w-32 rounded-lg" />
                    <Skeleton className="h-12 w-28 rounded-xl ml-auto" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-12 w-full rounded-xl" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-100 rounded-[24px]">
            <CardContent className="p-8 space-y-6">
              <Skeleton className="h-7 w-36" />
              <div className="space-y-4">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="aspect-[4/3] w-full rounded-3xl" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // 5. Main UI
  return (
    <div className="space-y-6 py-4">
      <Button
        variant="secondary"
        onClick={() => router.back()}
        className="bg-slate-500 hover:bg-slate-600 text-white rounded-lg h-9 px-4 flex items-center gap-2 transition-all"
      >
        <ChevronLeft className="w-4 h-4" />
        Back
      </Button>

      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-slate-800">Edit Product</h1>
          <p className="text-sm font-medium text-slate-500">Update product information</p>
        </div>
        <Button
          onClick={form.handleSubmit((v) => updateProductMutation.mutate(v))}
          disabled={updateProductMutation.isPending}
          className="bg-gradient-to-r from-[#38B475] to-[#4B66F1] hover:opacity-90 h-11 px-8 rounded-xl flex items-center gap-2 font-bold text-white shadow-lg shadow-blue-100 disabled:opacity-70"
        >
          <Save className="w-5 h-5" />
          {updateProductMutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-white/40 border-slate-100 rounded-[24px] shadow-sm backdrop-blur-sm">
          <CardContent className="p-8 space-y-8">
            <h3 className="text-xl font-bold text-slate-800">General Information</h3>
            <Form {...form}>
              <form className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-800 font-bold">Product Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Type product name here." 
                          className="h-12 border-slate-200 rounded-xl bg-white shadow-none focus-visible:ring-[#38B475]/10"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <FormLabel className="text-slate-800 font-bold">Set Prices</FormLabel>
                  <div className="flex flex-wrap items-center gap-6">
                    <div className="flex items-center gap-3">
                      <Input {...form.register("unit")} className="w-24 h-12 text-center font-bold rounded-lg border-slate-200 bg-white" />
                      <span className="text-slate-600 font-bold">Unit</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-xs tracking-wide text-slate-400">CFA</span>
                        <Input {...form.register("price")} className="w-32 h-12 pl-14 text-center font-bold rounded-lg border-slate-200 bg-white" />
                      </div>
                      <span className="text-slate-600 font-bold">Price</span>
                    </div>

                    <Button 
                      type="button" 
                      className="bg-gradient-to-r from-[#38B475] to-[#4B66F1] h-12 px-10 rounded-xl font-bold text-white ml-auto transition-transform active:scale-95"
                      onClick={() => toast.success("Price set successfully")}
                    >
                      Set
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <FormLabel className="text-slate-800 font-bold">Total Amount (CFA)</FormLabel>
                  <Input 
                    disabled 
                    value={formatCfa(totalAmount, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    className="h-12 bg-slate-50 border-slate-200 rounded-xl font-bold text-[#38B475] opacity-100 cursor-not-allowed" 
                  />
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="bg-white/40 border-slate-100 rounded-[24px] shadow-sm backdrop-blur-sm">
          <CardContent className="p-8 space-y-6">
            <h3 className="text-xl font-bold text-slate-800">Product Image</h3>
            <div className="space-y-4">
              <p className="text-slate-800 font-bold text-sm">Photo</p>
              <div className="aspect-[4/3] rounded-3xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center gap-4 bg-white relative overflow-hidden group">
                {imagePreview ? (
                  <>
                    <img src={imagePreview} className="w-full h-full object-cover" alt="Product" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <label className="cursor-pointer bg-white text-slate-800 px-4 py-2 rounded-lg font-bold text-sm shadow-xl hover:bg-slate-50 active:scale-95 transition-all">
                        Change Image
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) setImagePreview(URL.createObjectURL(file))
                        }} />
                      </label>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-14 h-14 rounded-full bg-[#4B66F1]/10 flex items-center justify-center text-[#4B66F1]">
                      <ImageIcon className="w-7 h-7" />
                    </div>
                    <p className="text-xs text-slate-400 font-medium text-center px-6 leading-relaxed">
                      Drag and drop image here, or click add image
                    </p>
                    <label className="cursor-pointer bg-[#38B475] hover:bg-[#2e9460] text-white px-6 py-2 rounded-xl font-bold text-sm transition-colors active:scale-95">
                      Add Image
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) setImagePreview(URL.createObjectURL(file))
                      }} />
                    </label>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
