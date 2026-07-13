"use client"

import { useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { cn, formatCfa } from "@/lib/utils"
import { toast } from "sonner"
import { Search, Filter, ChevronLeft, ChevronRight, Trash2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type OrderProduct = {
  product: {
    name?: string
    avatar?: {
      url?: string
    }
  } | null
  quantity: number
}

type OrderUser = {
  _id: string
  name: string
  email: string
  phone?: string
}

export type Order = {
  _id: string
  orderId?: string
  products: OrderProduct[]
  user?: OrderUser
  total: number
  status: string
  createdAt: string
  updatedAt?: string
}

type OrderStatusTableProps = {
  status: string
  title: string
  breadcrumb: string
  description?: string
  emptyMessage?: string
  showConfirmButton?: boolean
  confirmStatus?: string
  confirmLabel?: string
  enableDelete?: boolean
}

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

export function OrderStatusTable({
  status,
  title,
  breadcrumb,
  description,
  emptyMessage = "No orders found for this segment",
  showConfirmButton = false,
  confirmStatus = "delivered",
  confirmLabel = "Confirm Delivery",
  enableDelete = false,
}: OrderStatusTableProps) {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const limit = 10
  const queryClient = useQueryClient()

  const { data: ordersRaw, isLoading, isFetching, isError } = useQuery({
    queryKey: ["orders", status],
    queryFn: async () => {
      const res = await apiClient.get(`/orders/status/${status}`)
      return (res.data?.data ?? []) as Order[]
    },
    retry: 1,
  })

  const confirmMutation = useMutation({
    mutationFn: (orderId: string) => apiClient.put(`/orders/${orderId}`, { status: confirmStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders", status] })
      toast.success(`Order marked as ${confirmStatus}`)
    },
    onError: () => {
      toast.error("Failed to update order status")
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (orderId: string) => apiClient.delete(`/orders/${orderId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders", status] })
      toast.success("Order deleted successfully")
    },
    onError: () => {
      toast.error("Failed to delete order")
    },
  })

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return ordersRaw ?? []

    return (ordersRaw ?? []).filter((order) => {
      const orderId = String(order.orderId ?? "").toLowerCase()
      const name = String(order.user?.name ?? "").toLowerCase()
      const email = String(order.user?.email ?? "").toLowerCase()
      const total = String(order.total ?? "").toLowerCase()
      const statusValue = String(order.status ?? "").toLowerCase()
      return orderId.includes(q) || name.includes(q) || email.includes(q) || total.includes(q) || statusValue.includes(q)
    })
  }, [ordersRaw, search])

  const totalResults = filteredOrders.length
  const totalPages = Math.max(1, Math.ceil(totalResults / limit))
  const safePage = Math.min(page, totalPages)
  const startIndex = (safePage - 1) * limit
  const pagedOrders = filteredOrders.slice(startIndex, startIndex + limit)
  const from = totalResults === 0 ? 0 : startIndex + 1
  const to = Math.min(startIndex + limit, totalResults)
  const pageButtons = useMemo(() => getPageNumbers(safePage, totalPages), [safePage, totalPages])

  return (
    <div className="space-y-6 py-6 lg:py-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-[#38B475] sm:text-4xl">{title}</h1>
        <div className="text-sm font-semibold text-slate-400 flex items-center gap-2">{breadcrumb}</div>
        {description && <p className="text-slate-500">{description}</p>}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="relative w-full sm:max-w-md sm:flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
            placeholder="Search order / customer..."
            className="pl-12 h-12 bg-white/60 border-none rounded-xl shadow-sm focus-visible:ring-1 focus-visible:ring-[#38B475]/30"
          />
        </div>
        <Button className="h-12 w-full rounded-xl border-none bg-white/60 shadow-sm hover:bg-white px-6 gap-2 text-slate-600 font-bold sm:w-auto">
          <Filter className="w-5 h-5 text-[#38B475]" />
          Filters
        </Button>
      </div>

      <div className={cn("bg-white/30 backdrop-blur-md rounded-2xl overflow-hidden shadow-sm border border-white/40 lg:rounded-[32px]", isFetching && !isLoading && "opacity-80")}>
        <Table className="min-w-[980px]">
          <TableHeader>
            <TableRow className="border-b border-white/40 hover:bg-transparent">
              <TableHead className="w-16 px-6">
                <Checkbox className="border-slate-300 data-[state=checked]:bg-[#38B475] data-[state=checked]:border-[#38B475]" />
              </TableHead>
              <TableHead className="text-slate-500 font-bold text-base py-6">Order Id</TableHead>
              <TableHead className="text-slate-500 font-bold text-base">Product</TableHead>
              <TableHead className="text-slate-500 font-bold text-base">Date</TableHead>
              <TableHead className="text-slate-500 font-bold text-base">Customer</TableHead>
              <TableHead className="text-slate-500 font-bold text-base">Total (CFA)</TableHead>
              <TableHead className="text-slate-500 font-bold text-base text-center">Status</TableHead>
              {showConfirmButton && <TableHead className="text-slate-500 font-bold text-base text-right px-6">Action</TableHead>}
              {enableDelete && <TableHead className="text-slate-500 font-bold text-base text-right px-6">Delete</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <TableRow key={`skeleton-${i}`}>
                  <TableCell colSpan={showConfirmButton && enableDelete ? 9 : showConfirmButton || enableDelete ? 8 : 7}>
                    <Skeleton className="h-20 w-full opacity-50" />
                  </TableCell>
                </TableRow>
              ))
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={showConfirmButton && enableDelete ? 9 : showConfirmButton || enableDelete ? 8 : 7} className="py-16 text-center text-red-500 font-semibold">
                  Unable to load orders right now.
                </TableCell>
              </TableRow>
            ) : pagedOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={showConfirmButton && enableDelete ? 9 : showConfirmButton || enableDelete ? 8 : 7} className="py-16 text-center text-slate-500 font-semibold">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              pagedOrders.map((order) => (
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
                        <img
                          src={
                            order.products?.[0]?.product?.avatar?.url
                            || "/placeholder.png"
                          }
                          alt="Product"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-slate-800 text-sm">{order.products?.[0]?.product?.name || "Order Products"}</div>
                        <div className="text-[11px] text-slate-500 font-medium line-clamp-1">
                          Qty: {order.products?.[0]?.quantity ?? 0}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-500 font-bold text-sm">
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "N/A"}
                  </TableCell>
                  <TableCell>
                    <div className="text-left">
                      <div className="font-bold text-slate-800 text-sm">{order.user?.name || "Customer"}</div>
                      <div className="text-[11px] text-slate-500 font-medium">{order.user?.email || "N/A"}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-black text-slate-800 text-sm">
                    {formatCfa(order.total, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={cn(
                      "px-4 py-1 rounded-full text-xs font-bold shadow-sm uppercase",
                      order.status === "delivered" ? "bg-[#E3F8E9] text-[#38B475]" : "bg-[#FDE7E4] text-[#FF5D47]"
                    )}>
                      {order.status || status}
                    </span>
                  </TableCell>
                  {showConfirmButton && (
                    <TableCell className="text-right px-6">
                      <Button
                        size="sm"
                        onClick={() => confirmMutation.mutate(order._id)}
                        disabled={confirmMutation.isPending}
                        className="bg-gradient-to-r from-[#38B475] to-[#4B66F1] hover:opacity-90 rounded-full px-6 font-bold h-9 text-xs shadow-md shadow-green-200 disabled:opacity-70"
                      >
                        {confirmMutation.isPending ? "Updating..." : confirmLabel}
                      </Button>
                    </TableCell>
                  )}
                  {enableDelete && (
                    <TableCell className="text-right px-6">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full border-none bg-white/60 hover:bg-red-50 text-red-500 shadow-sm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-white rounded-3xl border-none">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-slate-900 text-lg">Delete order?</AlertDialogTitle>
                            <AlertDialogDescription className="text-slate-500">
                              This action cannot be undone. Are you sure you want to remove order #{order.orderId || order._id.slice(-6).toUpperCase()}?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="gap-2">
                            <AlertDialogCancel className="rounded-full px-6">No</AlertDialogCancel>
                            <AlertDialogAction
                              className="rounded-full bg-[#FF5D47] hover:bg-[#e24e3a]"
                              onClick={() => deleteMutation.mutate(order._id)}
                              disabled={deleteMutation.isPending}
                            >
                              Yes
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-4 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-[#38B475] font-bold text-sm">
          Showing {from} to {to} of {totalResults} results
        </div>

        <div className="flex max-w-full items-center gap-2 overflow-x-auto pb-1">
          <Button
            variant="outline"
            className="w-10 h-10 p-0 rounded-lg bg-white/60 border-none shadow-sm disabled:opacity-50"
            disabled={safePage <= 1}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          >
            <ChevronLeft className="w-5 h-5 text-slate-400" />
          </Button>

          {pageButtons.map((p, idx) =>
            p === "..." ? (
              <div key={`dots-${idx}`} className="w-10 h-10 flex items-center justify-center text-slate-400 font-bold">...</div>
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

          <Button
            variant="outline"
            className="w-10 h-10 p-0 rounded-lg bg-white/60 border-none shadow-sm disabled:opacity-50"
            disabled={safePage >= totalPages}
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
          >
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </Button>
        </div>
      </div>
    </div>
  )
}
