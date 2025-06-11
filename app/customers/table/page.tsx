"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { Card } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { Customer } from "@/lib/types"
import { useRouter } from "next/navigation"

export default function CustomerListPage() {
  const router = useRouter()

  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState("")

  const [userOptions, setUserOptions] = useState<{ id: string; name: string }[]>([])

  const fetchCustomers = useCallback(async () => {
    setLoading(true)

    const { data, error } = await supabase
      .from("customers")
      .select(`
        *,
        user_id:users(
          id,
          name
        )
      `)
      .order("created_at", { ascending: false })

    if (!error && data) {
      setCustomers(data)
      setFilteredCustomers(data)
    }

    setLoading(false)
  }, [])

  const fetchUsers = useCallback(async () => {
    const { data, error } = await supabase
      .from("users")
      .select("id, name")

    if (!error && data) {
      setUserOptions(data)
    }
  }, [])

  useEffect(() => {
    fetchCustomers()
    fetchUsers()
  }, [fetchCustomers, fetchUsers])

  useEffect(() => {
    const timer = setTimeout(() => {
      const filtered = customers.filter((c) => {
        const matchesSearch =
          c.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (c.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  
        const matchesUser = selectedUser === "" || c.user_id?.id === selectedUser
  
        return matchesSearch && matchesUser
      })
  
      setFilteredCustomers(filtered)
    }, 300)
  
    return () => clearTimeout(timer)
  }, [searchTerm, selectedUser, customers])
  

  return (
    <div className="p-6 max-w-8xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">客户列表</h1>

      {/* 筛选区域 */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <Input
          placeholder="搜索公司名称或联系人"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/2"
        />
        <Select
          value={selectedUser}
          onValueChange={(val) => setSelectedUser(val)}
        >
          <SelectTrigger className="w-full md:w-1/3">
            <SelectValue placeholder="选择业务负责人" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部</SelectItem>
            {userOptions.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

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
            ) : filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-6 text-gray-500">
                  无匹配客户
                </TableCell>
              </TableRow>
            ) : (
              filteredCustomers.map((customer) => (
                <TableRow
                  key={customer.id}
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
                    <Badge variant="outline">
                      {customer.user_id?.name || "未知"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(customer.created_at).toLocaleDateString()}
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
