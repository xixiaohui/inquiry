"use client"

import { Button } from "@/components/ui/button"

interface PaginationProps {
  currentPage: number
  totalCount: number
  pageSize: number
  onPageChange: (page: number) => void
}

export function Pagination({ currentPage, totalCount, pageSize, onPageChange }: PaginationProps) {
  const totalPages = Math.ceil(totalCount / pageSize)

  if (totalPages <= 1) return null

  return (
    <div className="flex justify-between items-center mt-4">
      <div className="font-semibold text-sm text-gray-500">
        共 {totalCount} 条记录，当前第 {currentPage} / {totalPages} 页
      </div>
      <div className="space-x-2 font-semibold">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          上一页
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          下一页
        </Button>
      </div>
    </div>
  )
}
