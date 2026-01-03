"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  totalResults: number
}

export function CustomPagination({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  totalResults 
}: PaginationProps) {
  // Logic to handle "..." dots if totalPages is large
  const getPageNumbers = () => {
    const pages = []
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, "...", totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 2, totalPages - 1, totalPages)
      } else {
        pages.push(1, "...", currentPage, "...", totalPages)
      }
    }
    return pages
  }

  return (
    <div className="flex items-center justify-between pt-6 px-2">
      {/* Brand Green Result Count */}
      <div className="text-[#38B475] font-bold text-sm">
        Showing 1 to 10 of {totalResults} results
      </div>

      <div className="flex items-center gap-2">
        {/* Previous Button */}
        <Button
          variant="outline"
          className="w-10 h-10 p-0 rounded-lg bg-white/60 border-none shadow-sm hover:bg-white transition-all disabled:opacity-50"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="w-5 h-5 text-slate-400" />
        </Button>

        {/* Page Numbers */}
        {getPageNumbers().map((item, i) => (
          <Button
            key={i}
            variant="outline"
            disabled={item === "..."}
            className={cn(
              "w-10 h-10 p-0 rounded-lg border-none shadow-sm font-bold text-sm transition-all",
              item === currentPage 
                ? "bg-[#B4E4C8] text-white hover:bg-[#A3D9AC]" // Active: Light Green from design
                : "bg-white/60 text-slate-600 hover:bg-white", // Inactive: Glass effect
              item === "..." && "bg-transparent shadow-none"
            )}
            onClick={() => typeof item === 'number' && onPageChange(item)}
          >
            {item}
          </Button>
        ))}

        {/* Next Button */}
        <Button
          variant="outline"
          className="w-10 h-10 p-0 rounded-lg bg-white/60 border-none shadow-sm hover:bg-white transition-all disabled:opacity-50"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </Button>
      </div>
    </div>
  )
}