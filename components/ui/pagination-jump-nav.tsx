"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface PaginationJumpNavProps {
  currentPage: number
  totalCount: number
  pageSize: number
  onPageChange: (page: number) => void
  siblingCount?: number
}

export function PaginationJumpNav({
  currentPage,
  totalCount,
  pageSize,
  onPageChange,
  siblingCount = 1,
}: PaginationJumpNavProps) {
  const totalPages = Math.ceil(totalCount / pageSize)
  const [inputPage, setInputPage] = useState("")

  const range = (start: number, end: number) => {
    return Array.from({ length: end - start + 1 }, (_, i) => i + start)
  }

  const generatePageNumbers = () => {
    const totalNumbers = siblingCount * 2 + 5
    const totalBlocks = totalNumbers + 2

    if (totalPages <= totalBlocks) {
      return range(1, totalPages)
    }

    const leftSibling = Math.max(currentPage - siblingCount, 1)
    const rightSibling = Math.min(currentPage + siblingCount, totalPages)

    const showLeftDots = leftSibling > 2
    const showRightDots = rightSibling < totalPages - 1

    const pages: (number | string)[] = []

    if (!showLeftDots && showRightDots) {
      const leftItems = range(1, 3 + 2 * siblingCount)
      return [...leftItems, "...", totalPages]
    }

    if (showLeftDots && !showRightDots) {
      const rightItems = range(totalPages - (2 * siblingCount + 2), totalPages)
      return [1, "...", ...rightItems]
    }

    if (showLeftDots && showRightDots) {
      const middleItems = range(leftSibling, rightSibling)
      return [1, "...", ...middleItems, "...", totalPages]
    }

    return []
  }

  const handleJump = () => {
    const page = parseInt(inputPage)
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      onPageChange(page)
      setInputPage("")
    }
  }

  if (totalPages <= 1) return null

  return (
    <div className="flex flex-col md:flex-row items-center justify-between mt-6 gap-4">
      <div className="text-sm text-gray-500">
        共 {totalCount} 条记录，当前第 {currentPage} / {totalPages} 页
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          上一页
        </Button>

        {generatePageNumbers().map((page, index) =>
          page === "..." ? (
            <span key={index} className="px-2 text-gray-400 select-none">...</span>
          ) : (
            <Button
              key={page}
              variant={page === currentPage ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(Number(page))}
              className={cn("w-8 h-8 p-0 text-sm", {
                "bg-primary text-white": page === currentPage,
              })}
            >
              {page}
            </Button>
          )
        )}

        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          下一页
        </Button>

        <div className="flex items-center gap-1 ml-2">
          <Input
            type="number"
            placeholder="页码"
            value={inputPage}
            onChange={(e) => setInputPage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleJump()
            }}
            className="w-20 h-8 px-2 text-sm"
          />
          <Button size="sm" onClick={handleJump}>
            跳转
          </Button>
        </div>
      </div>
    </div>
  )
}
