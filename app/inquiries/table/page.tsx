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
  }, [filterStatusId, keyword])

  useEffect(() => {
    fetchStatusOptions()
  }, [])

  useEffect(() => {
    fetchInquiries()
  }, [filterStatusId])

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
              <TableHead>客户</TableHead>
              <TableHead>产品名称</TableHead>
              <TableHead>数量</TableHead>
              <TableHead>渠道</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead>状态</TableHead>
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
