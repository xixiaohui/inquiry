"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import { Inquiry } from "@/lib/types"
import { useRouter } from "next/navigation"


export default function InquiryListPage() {
  const router = useRouter()


  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchInquiries = async () => {
      const { data, error } = await supabase.from("inquiries").select(
        
        `
            *,
            status:inquiry_status (
                name,
                color
            ),
            customer:customers(
                id,
                company_name,
                contact_name
            )
        `
      ).order("created_at", { ascending: false })
      if (!error && data) {
        setInquiries(data)
      }
      setLoading(false)
    }

    fetchInquiries()
  }, [])

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">所有询盘</h1>

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
                <TableCell colSpan={5} className="text-center py-6">
                  <Loader2 className="animate-spin inline-block mr-2" />
                  正在加载...
                </TableCell>
              </TableRow>
            ) : inquiries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-gray-500">暂无数据</TableCell>
              </TableRow>
            ) : (
              inquiries.map((inquiry) => (
                
                  <TableRow key={inquiry.id}
                  className="cursor-pointer hover:bg-blue-100"
                  onClick={() => router.push(`/inquiries/${inquiry.id}`)}
                  >

                      <TableCell>{inquiry.customer?.company_name || inquiry.customer?.contact_name}</TableCell>
                      <TableCell>{inquiry.product_name}</TableCell>
                      <TableCell>{inquiry.quantity}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{inquiry.channel || "未知"}</Badge>
                      </TableCell>
                      <TableCell>{new Date(inquiry.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-white" style={{ backgroundColor: inquiry.status?.color }}>{inquiry.status?.name || "未设置"}</Badge>
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
