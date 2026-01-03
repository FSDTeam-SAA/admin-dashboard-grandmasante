"use client"

import { useMemo, useState, Suspense } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter, ChevronLeft, ChevronRight } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

/**
 * Custom Pagination Helper
 * Generates an array like [1, 2, 3, "...", 17]
 */
function getPageNumbers(current: number, total: number) {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: (number | "...")[] = []
  const left = Math.max(2, current - 1)
  const right = Math.min(total - 1, current + 1)

  pages.push(1)
  if (left > 2) pages.push("...")
  for (let p = left; p <= right; p++) pages.push(p)
  if (right < total - 1) pages.push("...")
  pages.push(total)

  return pages
}

function OrderListContent() {
  const status = "ongoing"
  const queryClient = useQueryClient()

  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const limit = 10

  const { data: ordersRaw, isLoading } = useQuery({
    queryKey: ["orders", status],
    queryFn: async () => {
      const res = await apiClient.get(`/orders/status/${status}`)
      return (res.data?.data ?? []) as any[]
    },
  })

  const confirmMutation = useMutation({
    mutationFn: (orderId: string) => apiClient.patch(`/orders/${orderId}/confirm`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      toast.success("Delivery confirmed successfully")
    },
  })

  // 1) Search Filter Logic
  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return ordersRaw ?? []

    return (ordersRaw ?? []).filter((o) => {
      const orderId = String(o.orderId ?? "").toLowerCase()
      const name = String(o.user?.name ?? "").toLowerCase()
      const email = String(o.user?.email ?? "").toLowerCase()
      const total = String(o.total ?? "").toLowerCase()
      return orderId.includes(q) || name.includes(q) || email.includes(q) || total.includes(q)
    })
  }, [ordersRaw, search])

  // 2) Pagination Calculations
  const totalResults = filteredOrders.length
  const totalPages = Math.max(1, Math.ceil(totalResults / limit))
  const safePage = Math.min(page, totalPages)
  const startIndex = (safePage - 1) * limit
  const pagedOrders = filteredOrders.slice(startIndex, startIndex + limit)

  const from = totalResults === 0 ? 0 : startIndex + 1
  const to = Math.min(startIndex + limit, totalResults)
  const pageButtons = useMemo(() => getPageNumbers(safePage, totalPages), [safePage, totalPages])

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-1">
        <h1 className="text-4xl font-bold text-[#38B475]">Order Lists</h1>
        <div className="text-sm font-semibold text-slate-400 flex items-center gap-2">
          Admin <span className="text-slate-300">/</span> Order
        </div>
      </div>

      {/* Controls Section */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Search order / customer..."
            className="pl-12 h-12 bg-white/60 border-none rounded-xl shadow-sm focus-visible:ring-1 focus-visible:ring-[#38B475]/30"
          />
        </div>

        <Button className="h-12 rounded-xl border-none bg-white/60 shadow-sm hover:bg-white px-6 gap-2 text-slate-600 font-bold">
          <Filter className="w-5 h-5 text-[#38B475]" />
          Filters
        </Button>
      </div>

      {/* Frosted Table Section */}
      <div className="bg-white/30 backdrop-blur-md rounded-[32px] overflow-hidden shadow-sm border border-white/40">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-white/40 hover:bg-transparent">
              <TableHead className="w-16 px-6">
                <Checkbox className="border-slate-300 data-[state=checked]:bg-[#38B475] data-[state=checked]:border-[#38B475]" />
              </TableHead>
              <TableHead className="text-slate-500 font-bold text-base py-6">Order Id</TableHead>
              <TableHead className="text-slate-500 font-bold text-base">Product</TableHead>
              <TableHead className="text-slate-500 font-bold text-base">Date</TableHead>
              <TableHead className="text-slate-500 font-bold text-base">Customer</TableHead>
              <TableHead className="text-slate-500 font-bold text-base">Total</TableHead>
              <TableHead className="text-slate-500 font-bold text-base text-right px-6">Confirmation</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <TableRow key={i}><TableCell colSpan={7}><Skeleton className="h-20 w-full opacity-50" /></TableCell></TableRow>
              ))
            ) : pagedOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-16 text-center text-slate-500 font-semibold">No orders found</TableCell>
              </TableRow>
            ) : (
              pagedOrders.map((order: any) => (
                <TableRow key={order._id} className="border-b border-white/20 hover:bg-white/20 transition-colors">
                  <TableCell className="px-6">
                    <Checkbox className="border-slate-300 data-[state=checked]:bg-[#38B475] data-[state=checked]:border-[#38B475]" />
                  </TableCell>
                  <TableCell className="font-bold text-slate-700">
                    #{order.orderId || order._id.slice(-6).toUpperCase()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-white/50 p-1 border border-white/60 shadow-sm flex-shrink-0">
                        <img src={order.products?.[0]?.product?.avatar?.url || "/placeholder.png"} alt="Product" className="w-full h-full object-contain" />
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-slate-800 text-sm">{order.products?.[0]?.product?.name || "Tech Products"}</div>
                        <div className="text-[11px] text-slate-500 font-medium line-clamp-1">Quality assurance guaranteed</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-500 font-bold text-sm">
                    {new Date(order.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                  </TableCell>
                  <TableCell>
                    <div className="text-left">
                      <div className="font-bold text-slate-800 text-sm">{order.user?.name || "Customer"}</div>
                      <div className="text-[11px] text-slate-500 font-medium">{order.user?.email}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-black text-slate-800 text-sm">${Number(order.total ?? 0).toFixed(2)}</TableCell>
                  <TableCell className="text-right px-6">
                    <Button
                      size="sm"
                      onClick={() => confirmMutation.mutate(order._id)}
                      disabled={confirmMutation.isPending}
                      className="bg-gradient-to-r from-[#38B475] to-[#4B66F1] hover:opacity-90 rounded-full px-6 font-bold h-9 text-xs shadow-md shadow-green-200"
                    >
                      {confirmMutation.isPending ? "Confirming..." : "Confirm Delivery"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Custom Pagination Footer */}
      <div className="flex items-center justify-between pt-4">
        <div className="text-[#38B475] font-bold text-sm">
          Showing {from} to {to} of {totalResults} results
        </div>

        <div className="flex items-center gap-2">
          {/* Previous */}
          <Button
            variant="outline"
            className="w-10 h-10 p-0 rounded-lg bg-white/60 border-none shadow-sm disabled:opacity-50"
            disabled={safePage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="w-5 h-5 text-slate-400" />
          </Button>

          {/* Page Numbers */}
          {pageButtons.map((p, idx) =>
            p === "..." ? (
              <div key={`dots-${idx}`} className="w-10 h-10 flex items-center justify-center text-slate-400 font-bold">…</div>
            ) : (
              <Button
                key={p}
                variant="outline"
                onClick={() => setPage(p)}
                className={cn(
                  "w-10 h-10 p-0 rounded-lg border-none shadow-sm font-bold text-sm transition-all",
                  p === safePage ? "bg-[#B4E4C8] text-white" : "bg-white/60 text-slate-600 hover:bg-white"
                )}
              >
                {p}
              </Button>
            )
          )}

          {/* Next */}
          <Button
            variant="outline"
            className="w-10 h-10 p-0 rounded-lg bg-white/60 border-none shadow-sm disabled:opacity-50"
            disabled={safePage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function OrderListPage() {
  return (
    <Suspense fallback={<div className="p-8"><Skeleton className="h-[600px] w-full rounded-[32px]" /></div>}>
      <OrderListContent />
    </Suspense>
  )
}