/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Inquiry } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

export default function InquiryListPage() {
  const router = useRouter()

  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [statusOptions, setStatusOptions] = useState<{ id: string; name: string; color: string }[]>([])
  const [loading, setLoading] = useState(true)

  const [filterStatusId, setFilterStatusId] = useState("")
  const [keyword, setKeyword] = useState("")
  const [selectedMonth, setSelectedMonth] = useState<string>("")

  const fetchStatusOptions = useCallback(async () => {
    const { data } = await supabase.from("inquiry_status").select("id, name, color")
    if (data) setStatusOptions(data)
  }, [])

  const fetchInquiries = useCallback(async () => {
    setLoading(true)

    let query = supabase
      .from("inquiries")
      .select(`*, status:inquiry_status(id, name, color), customer:customers(id, company_name, contact_name)`)
      .order("created_at", { ascending: false })

    if (filterStatusId) {
      query = query.eq("status", filterStatusId)
    }

    // 根据 selectedMonth 过滤月份
    if (selectedMonth !== "2025-all") {
      if (selectedMonth) {
        // 如果 selectedMonth 不是 "2025-all"，则按月份筛选
        const [year, month] = selectedMonth.split('-')
        query = query
          .gte("created_at", `${year}-${month}-01`)
          .lt("created_at", `${year}-${parseInt(month, 10) + 1}-01`) // 下一个月的 1 号作为结束日期
      }
    } else {
      // 处理2025年全部月份的查询
      query = query.gte("created_at", "2025-01-01").lte("created_at", "2025-12-31")
    }

    const { data, error } = await query

    const filtered = (data || []).filter((inquiry) => {
      if (!keyword) return true
      const company = inquiry.customer?.company_name?.toLowerCase() || ""
      const contact = inquiry.customer?.contact_name?.toLowerCase() || ""
      const product = inquiry.product_name?.toLowerCase() || ""
      return (
        company.includes(keyword.toLowerCase()) ||
        contact.includes(keyword.toLowerCase()) ||
        product.includes(keyword.toLowerCase())
      )
    })

    if (!error) {
      setInquiries(filtered)
    }

    setLoading(false)
  }, [filterStatusId, keyword, selectedMonth])

  useEffect(() => {
    fetchStatusOptions()
  }, [])

  useEffect(() => {
    fetchInquiries()
  }, [filterStatusId, keyword, selectedMonth])

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">所有询盘</h1>

      {/* 筛选区域 */}
      <div className="flex flex-col md:flex-row gap-4 items-center mb-6">
        <Select value={filterStatusId} onValueChange={setFilterStatusId}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="按状态筛选" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            {statusOptions.map((status) => (
              <SelectItem key={status.id} value={status.id}>
                {status.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="按月份筛选" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2025-all">2025年全部月份</SelectItem>
            {Array.from({ length: 12 }, (_, i) => {
              const month = (i + 1).toString().padStart(2, "0")
              return (
                <SelectItem key={month} value={`2025-${month}`}> {/* 使用你想要的年份 */}
                  {`${month} 月`}
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>

        <Input
          type="text"
          placeholder="客户/产品关键词"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="w-full md:w-[300px]"
        />

        <Button onClick={fetchInquiries}>搜索</Button>
        <Button
          variant="outline"
          onClick={() => {
            setFilterStatusId("")
            setKeyword("")
            fetchInquiries()
          }}
        >
          重置
        </Button>
      </div>

      {/* 表格 */}
      <Card className="overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold">客户</TableHead>
              <TableHead className="font-semibold">产品名称</TableHead>
              <TableHead className="font-semibold">数量</TableHead>
              <TableHead className="font-semibold">渠道</TableHead>
              <TableHead className="font-semibold">创建时间</TableHead>
              <TableHead className="font-semibold">状态</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6">
                  <Loader2 className="animate-spin inline-block mr-2" />
                  正在加载...
                </TableCell>
              </TableRow>
            ) : inquiries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-gray-500">暂无数据</TableCell>
              </TableRow>
            ) : (
              inquiries.map((inquiry) => (
                <TableRow
                  key={inquiry.id}
                  className="cursor-pointer hover:bg-blue-100"
                  onClick={() => router.push(`/inquiries/${inquiry.id}`)}
                >
                  <TableCell>{inquiry.customer?.company_name || inquiry.customer?.contact_name || "-"}</TableCell>
                  <TableCell>{inquiry.product_name}</TableCell>
                  <TableCell>{inquiry.quantity}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{inquiry.channel || "未知"}</Badge>
                  </TableCell>
                  <TableCell>{new Date(inquiry.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className="text-white"
                      style={{ backgroundColor: inquiry.status?.color || "#999" }}
                    >
                      {inquiry.status?.name || "未设置"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
