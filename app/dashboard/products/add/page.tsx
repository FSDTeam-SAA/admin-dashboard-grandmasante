"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"
import { useMutation } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, Image as ImageIcon, Save } from "lucide-react"

const productSchema = z.object({
  name: z.string().min(2, "Product name is required"),
  unit: z.string().refine((val) => !isNaN(Number(val)), "Must be a number"),
  price: z.string().refine((val) => !isNaN(Number(val)), "Must be a number"),
})

export default function AddProductPage() {
  const router = useRouter()
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: { name: "", unit: "0", price: "0" },
  })

  const unit = form.watch("unit")
  const price = form.watch("price")
  const totalAmount = (Number(unit) || 0) * (Number(price) || 0)

  const createProductMutation = useMutation({
    mutationFn: async (values: z.infer<typeof productSchema>) => {
      const response = await apiClient.post("/admin/products", {
        name: values.name,
        quantity: Number(values.unit),
        price: Number(values.price),
      })
      return response.data
    },
    onSuccess: () => {
      toast.success("Product added successfully!")
      router.push("/dashboard/products")
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
          onClick={form.handleSubmit((v) => createProductMutation.mutate(v))}
          className="bg-gradient-to-r from-[#38B475] to-[#4B66F1] hover:opacity-90 h-11 px-8 rounded-xl flex items-center gap-2 font-bold text-white"
        >
          <Save className="w-5 h-5" />
          Save
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: General Info */}
        <Card className="lg:col-span-2 bg-white/40 border-slate-100 rounded-[24px] shadow-sm">
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
                    {/* Unit Input */}
                    <div className="flex items-center gap-3">
                      <Input {...form.register("unit")} className="w-24 h-12 text-center font-bold rounded-lg border-slate-200" />
                      <span className="text-slate-600 font-bold">Unit</span>
                    </div>

                    {/* Price Input */}
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-500">$</span>
                        <Input {...form.register("price")} className="w-24 h-12 pl-8 text-center font-bold rounded-lg border-slate-200" />
                      </div>
                      <span className="text-slate-600 font-bold">Price</span>
                    </div>

                    <Button type="button" className="bg-gradient-to-r from-[#38B475] to-[#4B66F1] h-12 px-10 rounded-xl font-bold text-white ml-auto">
                      Set
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
                  <img src={imagePreview} className="w-full h-full object-cover" />
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
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) setImagePreview(URL.createObjectURL(file))
                        }} 
                      />
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