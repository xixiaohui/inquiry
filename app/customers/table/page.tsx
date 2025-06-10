"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"

import {Customer} from "@/lib/types"
import { useRouter } from "next/navigation"

export default function CustomerListPage() {
  const router = useRouter()

  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCustomers = async () => {
      const { data, error } = await supabase.from("customers").select(
        `
          *,
          user_id:users(
            id,
            name
          )
        `
      ).order("created_at", { ascending: false })
      if (!error && data) {
        setCustomers(data)
      }
      setLoading(false)
    }

    fetchCustomers()
  }, [])

  return (
    <div className="p-6 max-w-8xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">客户列表</h1>

      <Card className="overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>公司名称</TableHead>
              <TableHead>联系人</TableHead>
              <TableHead>邮箱</TableHead>
              <TableHead>电话</TableHead>
              <TableHead>国家</TableHead>
              <TableHead>来源</TableHead>
              <TableHead>业务负责</TableHead>
              <TableHead>创建时间</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-6">
                  <Loader2 className="animate-spin inline-block mr-2" />
                  正在加载...
                </TableCell>
              </TableRow>
            ) : customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-6 text-gray-500">暂无客户数据</TableCell>
              </TableRow>
            ) : (
              customers.map((customer) => (
                <TableRow key={customer.id}
                  className="cursor-pointer hover:bg-blue-100"
                  onClick={() => router.push(`/customers/${customer.id}`)}
                >
                  <TableCell>{customer.company_name}</TableCell>
                  <TableCell>{customer.contact_name || "-"}</TableCell>
                  <TableCell>{customer.email || "-"}</TableCell>
                  <TableCell>{customer.phone || "-"}</TableCell>
                  <TableCell>{customer.country || "-"}</TableCell>
                  <TableCell>{customer.source || "-"}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{customer.user_id?.name|| "未知"}</Badge>
                  </TableCell>
                  <TableCell>{new Date(customer.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
