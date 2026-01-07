"use client"

import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { OrderStatusTable } from "@/components/orders/order-status-table"

export default function DeliveredOrdersPage() {
  return (
    <Suspense fallback={<div className="p-8"><Skeleton className="h-[600px] w-full rounded-[32px]" /></div>}>
      <OrderStatusTable
        status="delivered"
        title="Delivered Orders"
        breadcrumb="Admin / Delivered Orders"
        description="Browse the orders that have been fulfilled and delivered to customers."
        emptyMessage="No delivered orders found yet."
        enableDelete
      />
    </Suspense>
  )
}
