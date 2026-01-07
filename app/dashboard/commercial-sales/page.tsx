import { Suspense } from "react"
import { PendingUserTable } from "@/components/users/pending-user-table"
import { Skeleton } from "@/components/ui/skeleton"

export default function CommercialSalesPage() {
  return (
    <Suspense fallback={<div className="p-8"><Skeleton className="h-[500px] w-full rounded-[32px]" /></div>}>
      <PendingUserTable
        role="commercial"
        title="Commercial Sales"
        description="Monitor the commercial team requests and approve verified partners."
      />
    </Suspense>
  )
}
