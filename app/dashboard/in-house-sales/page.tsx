import { Suspense } from "react"
import { PendingUserTable } from "@/components/users/pending-user-table"
import { Skeleton } from "@/components/ui/skeleton"

export default function InHouseSalesPage() {
  return (
    <Suspense fallback={<div className="p-8"><Skeleton className="h-[500px] w-full rounded-[32px]" /></div>}>
      <PendingUserTable
        role="in_house"
        title="In House Sales"
        description="Review pending in-house user accounts that need onboarding approval."
      />
    </Suspense>
  )
}
