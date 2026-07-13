"use client"

import { cn, formatCfa } from "@/lib/utils"
import { Suspense, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, ChevronLeft, ChevronRight, Trash2, Filter } from "lucide-react"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"

function UserListContent() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const queryClient = useQueryClient()

  const { data: userData, isLoading } = useQuery({
    queryKey: ["users", page, search],
    queryFn: async () => {
      const res = await apiClient.get("/user/users", {
        params: { page, limit: 10, search },
      })
      return res.data.data
    },
  })

  const acceptMutation = useMutation({
    mutationFn: (userId: string) => apiClient.post("/user/accept-user", { userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      toast.success("User accepted")
    },
  })

  return (
    <div className="space-y-6 py-6 lg:py-10">
      {/* Search and Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            placeholder="Search category..."
            className="pl-12 h-12 bg-white/60 border-none rounded-xl shadow-sm focus-visible:ring-1 focus-visible:ring-[#38B475]/30"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" className="h-12 w-full rounded-xl border-none bg-white/60 shadow-sm hover:bg-white px-6 gap-2 text-slate-600 font-bold sm:w-auto">
          <Filter className="w-5 h-5 text-[#38B475]" />
          Filters
        </Button>
      </div>

      {/* Table Container */}
      <div className="bg-white/30 backdrop-blur-md rounded-2xl overflow-hidden shadow-sm border border-white/40 lg:rounded-[32px]">
        <Table className="min-w-[860px]">
          <TableHeader>
            <TableRow className="border-b border-white/40 hover:bg-transparent">
              <TableHead className="py-6 px-6 text-slate-500 font-bold text-base text-center">Name</TableHead>
              <TableHead className="text-slate-500 font-bold text-base text-center">Email</TableHead>
              <TableHead className="text-slate-500 font-bold text-base text-center">Joined Date</TableHead>
              <TableHead className="text-slate-500 font-bold text-base text-center">Spent on Subscription (CFA)</TableHead>
              <TableHead className="text-slate-500 font-bold text-base text-center">Status</TableHead>
              <TableHead className="text-slate-500 font-bold text-base text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(6).fill(0).map((_, i) => (
                <TableRow key={i}><TableCell colSpan={6}><Skeleton className="h-20 w-full opacity-50" /></TableCell></TableRow>
              ))
            ) : (
              userData?.docs.map((user: any) => (
                <TableRow key={user._id} className="border-b border-white/20 hover:bg-white/20 transition-colors">
                  <TableCell className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
                        <AvatarImage src={user.avatar || "/avatar.png"} />
                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="text-left">
                        <div className="font-bold text-slate-800 text-base">{user.name}</div>
                        <div className="text-xs text-slate-500 font-medium">#{user._id.slice(-5)}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-slate-500 font-medium text-sm">{user.email}</TableCell>
                  <TableCell className="text-center text-slate-500 font-medium text-sm">{user.createdAt?.split('T')[0] || "2023-06-08"}</TableCell>
                  <TableCell className="text-center text-slate-500 font-bold text-sm">{formatCfa(user.spent || 200)}</TableCell>
                  <TableCell className="text-center">
                    <span className={cn(
                      "px-6 py-2 rounded-full text-xs font-bold shadow-sm",
                      user.status === "pending" ? "bg-[#FDE7E4] text-[#FF5D47]" : "bg-[#E3F8E9] text-[#38B475]"
                    )}>
                      {user.status === "pending" ? "Pending" : "Accepted"}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    {user.status === "pending" ? (
                      <Button 
                        size="sm" 
                        onClick={() => acceptMutation.mutate(user._id)}
                        className="bg-gradient-to-r from-[#38B475] to-[#4B66F1] hover:opacity-90 rounded-full px-8 font-bold"
                      >
                        Accept
                      </Button>
                    ) : (
                      <button className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Section */}
      <div className="flex flex-col gap-4 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-[#38B475] font-bold text-sm">
          Showing 1 to 10 of {userData?.totalDocs || 120} results
        </div>
        <div className="flex max-w-full items-center gap-2 overflow-x-auto pb-1">
          <Button variant="outline" className="w-10 h-10 p-0 rounded-lg bg-white/60 border-none shadow-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
            <ChevronLeft className="w-5 h-5 text-slate-400" />
          </Button>
          {[1, 2, 3, "...", 17].map((item, i) => (
            <Button
              key={i}
              variant="outline"
              className={cn(
                "w-10 h-10 p-0 rounded-lg border-none shadow-sm font-bold text-sm",
                item === page ? "bg-[#B4E4C8] text-white" : "bg-white/60 text-slate-600"
              )}
              onClick={() => typeof item === 'number' && setPage(item)}
            >
              {item}
            </Button>
          ))}
          <Button variant="outline" className="w-10 h-10 p-0 rounded-lg bg-white/60 border-none shadow-sm" onClick={() => setPage(p => p + 1)}>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function UserListPage() {
  return (
    <Suspense fallback={<div className="p-8"><Skeleton className="h-[600px] w-full rounded-[32px]" /></div>}>
      <UserListContent />
    </Suspense>
  )
}
