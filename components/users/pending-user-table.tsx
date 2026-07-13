"use client"

import { useMemo, useState } from "react"
import type { AxiosError } from "axios"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { toast } from "sonner"
import { cn, formatCfa } from "@/lib/utils"
import { Search, Filter, ChevronLeft, ChevronRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"

type PendingUserTableProps = {
  role: "commercial" | "in_house"
  title: string
  description?: string
}

type PendingUser = {
  _id: string
  name: string
  email: string
  credit: number
  role: string
  status: string
  createdAt?: string
  avatar?: {
    url?: string
  } | string
}

type PendingUserResponse = {
  docs: PendingUser[]
  totalDocs: number
  totalPages: number
  page: number
  limit: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

const PAGE_SIZE = 10

export function PendingUserTable({ role, title, description }: PendingUserTableProps) {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const queryClient = useQueryClient()

  const { data, isLoading, isFetching, isError, error } = useQuery<PendingUserResponse, AxiosError<{ message?: string }>>({
    queryKey: ["pending-users", role, page, search],
    queryFn: async () => {
      const res = await apiClient.get("/user/users", {
        params: {
          page,
          limit: PAGE_SIZE,
          role,
          status: "pending",
          search: search.trim() || undefined,
        },
      })

      return res.data.data
    },
    retry: 1,
  })

  const acceptMutation = useMutation({
    mutationFn: (userId: string) => apiClient.post("/user/accept-user", { userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-users", role] })
      toast.success("User accepted")
    },
    onError: (mutationError: AxiosError<{ message?: string }>) => {
      toast.error(mutationError.response?.data?.message || "Failed to accept user")
    },
  })

  const totalPages = data?.totalPages ?? 1
  let startIndex = 0
  let endIndex = 0
  if (data && data.docs.length) {
    startIndex = (data.page - 1) * data.limit + 1
    endIndex = startIndex + data.docs.length - 1
  }
  const pagingLabel = data ? `Showing ${startIndex}-${endIndex} of ${data.totalDocs} results` : "Showing results"

  const paginationSlots = useMemo<(number | string)[]>(() => {
    if (!totalPages || totalPages <= 1) return [1]

    const slots: (number | string)[] = []
    for (let i = 1; i <= totalPages; i += 1) {
      if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) {
        slots.push(i)
      } else if (slots[slots.length - 1] !== "...") {
        slots.push("...")
      }
    }
    return slots
  }, [page, totalPages])

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1 || (totalPages && nextPage > totalPages)) return
    setPage(nextPage)
  }

  const renderTableRows = () => {
    if (isLoading) {
      return Array.from({ length: 5 }).map((_, index) => (
        <TableRow key={`skeleton-${index}`}>
          <TableCell colSpan={6}>
            <Skeleton className="h-20 w-full opacity-60" />
          </TableCell>
        </TableRow>
      ))
    }

    if (isError) {
      return (
        <TableRow>
          <TableCell colSpan={6} className="text-center text-red-500 font-semibold py-10">
            {error?.response?.data?.message || "Unable to fetch pending users"}
          </TableCell>
        </TableRow>
      )
    }

    if (!data || !data.docs.length) {
      return (
        <TableRow>
          <TableCell colSpan={6} className="text-center text-slate-500 font-semibold py-10">
            No pending users found for this segment.
          </TableCell>
        </TableRow>
      )
    }

    return data.docs.map((user) => {
      const joinedDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "N/A"
      const avatarSrc = typeof user.avatar === "string" ? user.avatar : user.avatar?.url

      return (
        <TableRow key={user._id} className="border-b border-white/20 hover:bg-white/20 transition-colors">
          <TableCell className="py-4 px-6">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
                <AvatarImage src={avatarSrc || "/avatar.png"} alt={user.name} />
                <AvatarFallback>{user.name?.[0]?.toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
              <div className="text-left">
                <div className="font-bold text-slate-800 text-base capitalize">{user.name || "Unknown user"}</div>
                <div className="text-xs text-slate-500 font-medium">#{user._id.slice(-5)}</div>
              </div>
            </div>
          </TableCell>
          <TableCell className="text-center text-slate-500 font-medium text-sm">{user.email}</TableCell>
          <TableCell className="text-center text-slate-500 font-medium text-sm">{joinedDate}</TableCell>
          <TableCell className="text-center text-slate-500 font-bold text-sm">{formatCfa(user.credit)}</TableCell>
          <TableCell className="text-center">
            <span className="px-6 py-2 rounded-full text-xs font-bold shadow-sm bg-[#FDE7E4] text-[#FF5D47]">
              {user.status?.toUpperCase() || "PENDING"}
            </span>
          </TableCell>
          <TableCell className="text-center">
            <Button
              size="sm"
              onClick={() => acceptMutation.mutate(user._id)}
              disabled={acceptMutation.isPending}
              className="bg-gradient-to-r from-[#38B475] to-[#4B66F1] hover:opacity-90 rounded-full px-8 font-bold disabled:opacity-80"
            >
              {acceptMutation.isPending ? "Processing..." : "Accept"}
            </Button>
          </TableCell>
        </TableRow>
      )
    })
  }

  return (
    <div className="space-y-6 py-6 lg:py-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#38B475] sm:text-4xl">{title}</h1>
          <p className="text-slate-500 font-medium mt-1">{description || "Review users awaiting approval before accessing the platform."}</p>
        </div>
        <div className="flex w-full flex-col gap-3 sm:flex-row md:w-auto">
          <div className="relative flex-1 md:flex-none md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search users..."
              className="pl-12 h-12 bg-white/60 border-none rounded-xl shadow-sm focus-visible:ring-1 focus-visible:ring-[#38B475]/30"
              value={search}
              onChange={(event) => {
                setPage(1)
                setSearch(event.target.value)
              }}
            />
          </div>
          <Button
            variant="outline"
            className="h-12 rounded-xl border-none bg-white/60 shadow-sm hover:bg-white px-6 gap-2 text-slate-600 font-bold"
          >
            <Filter className="w-5 h-5 text-[#38B475]" />
            Filters
          </Button>
        </div>
      </div>

      <div className={cn("bg-white/30 backdrop-blur-md rounded-2xl overflow-hidden shadow-sm border border-white/40 lg:rounded-[32px]", isFetching && !isLoading && "opacity-80")}>
        <Table className="min-w-[860px]">
          <TableHeader>
            <TableRow className="border-b border-white/40 hover:bg-transparent">
              <TableHead className="py-5 px-6 text-slate-500 font-bold text-base text-center">Name</TableHead>
              <TableHead className="text-slate-500 font-bold text-base text-center">Email</TableHead>
              <TableHead className="text-slate-500 font-bold text-base text-center">Joined Date</TableHead>
              <TableHead className="text-slate-500 font-bold text-base text-center">Credit (CFA)</TableHead>
              <TableHead className="text-slate-500 font-bold text-base text-center">Status</TableHead>
              <TableHead className="text-slate-500 font-bold text-base text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>{renderTableRows()}</TableBody>
        </Table>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-2">
        <div className="text-[#38B475] font-semibold text-sm">{pagingLabel}</div>
        <div className="flex max-w-full items-center gap-2 overflow-x-auto pb-1">
          <Button
            variant="outline"
            className="w-10 h-10 p-0 rounded-lg bg-white/60 border-none shadow-sm"
            disabled={page === 1}
            onClick={() => handlePageChange(page - 1)}
          >
            <ChevronLeft className="w-5 h-5 text-slate-400" />
          </Button>
          {paginationSlots.map((slot, index) => (
            <Button
              key={`${slot}-${index}`}
              variant="outline"
              disabled={slot === "..."}
              className={cn(
                "w-10 h-10 p-0 rounded-lg border-none shadow-sm font-bold text-sm",
                slot === page ? "bg-[#B4E4C8] text-white" : "bg-white/60 text-slate-600"
              )}
              onClick={() => typeof slot === "number" && handlePageChange(slot)}
            >
              {slot}
            </Button>
          ))}
          <Button
            variant="outline"
            className="w-10 h-10 p-0 rounded-lg bg-white/60 border-none shadow-sm"
            disabled={!!totalPages && page >= totalPages}
            onClick={() => handlePageChange(page + 1)}
          >
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </Button>
        </div>
      </div>
    </div>
  )
}
