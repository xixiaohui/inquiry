"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

import Link from "next/link"

type Company = {
  id: string
  name: string
  created_at: string
}

type User = {
  id: string
  name: string
  email: string
  company_id: string
}

export default function CompanyListPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      const { data: companyData } = await supabase.from("companies").select("*").order("created_at", { ascending: false })
      if (companyData) setCompanies(companyData)

      const { data: userData } = await supabase.from("users").select("*")
      if (userData) setUsers(userData)
    }

    fetchData()
  }, [])

  const handleAdd = async () => {
    if (!name.trim()) return toast.error("请输入公司名称")
    const { error } = await supabase.from("companies").insert({ name })
    if (error) return toast.error("添加失败：" + error.message)
    toast.success("公司添加成功")
    setName("")
    setOpen(false)
    const { data } = await supabase.from("companies").select("*").order("created_at", { ascending: false })
    if (data) setCompanies(data)
  }

  const getUsersByCompany = (companyId: string) =>
    users.filter((u) => u.company_id === companyId)

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">公司列表</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>➕ 添加公司</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>添加公司</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Label>公司名称</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="请输入公司名称" />
            </div>
            <DialogFooter>
              <Button onClick={handleAdd}>提交</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-0 sm:grid-cols-1 md:grid-cols-2 gap-6">
        {companies.map((company) => {
          const companyUsers = getUsersByCompany(company.id)
          return (
            <Card key={company.id}>
              <CardHeader>
                <CardTitle className="text-lg">{company.name}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                创建时间：{new Date(company.created_at).toLocaleString()}
                <div className="mt-4 text-black">
                  <h4 className="font-semibold mb-2">业务员列表：</h4>
                  <ul className="space-y-1">
                    {companyUsers.length > 0 ? (
                      companyUsers.map((user) => (
                        <li key={user.id} className="mb-4">
                          👤 {user.name} ({user.email})

                          <Link href={`/users-customers?user_id=${user.id}`}>
                            <Button className="ml-4" variant="outline">查看客户</Button>
                          </Link>
                        </li>
                        
                      ))
                    ) : (
                      <li className="text-gray-500">暂无业务员</li>
                    )}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
