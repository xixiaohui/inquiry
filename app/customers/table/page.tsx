"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Customer } from "@/lib/types";
import { useRouter } from "next/navigation";

export default function CustomerListPage() {
  const router = useRouter();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("2025-all"); // 新增的月份选择

  const [userOptions, setUserOptions] = useState<
    { id: string; name: string }[]
  >([]);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("customers")
      .select(
        `
        *,
        user_id:users(
          id,
          name
        )
      `
      )
      .order("created_at", { ascending: false });

    if (!error && data) {
      setCustomers(data);
      setFilteredCustomers(data);
    }

    setLoading(false);
  }, []);

  const fetchUsers = useCallback(async () => {
    const { data, error } = await supabase.from("users").select("id, name");

    if (!error && data) {
      setUserOptions(data);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
    fetchUsers();
  }, [fetchCustomers, fetchUsers]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const filtered = customers.filter((c) => {
        const matchesSearch =
          c.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (c.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ??
            false);

        const matchesUser =
          selectedUser === "all" || c.user_id?.id === selectedUser;

        // 获取customer的月份
      const customerDate = new Date(c.created_at);
      const customerMonth = `${customerDate.getFullYear()}-${(customerDate.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`;

      // 新增的月份过滤逻辑
      const matchesMonth =
        selectedMonth === "2025-all" || !selectedMonth || customerMonth === selectedMonth;

        return matchesSearch && matchesUser && matchesMonth;
      });

      setFilteredCustomers(filtered);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedUser, selectedMonth, customers]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
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

        {/* 月份选择 */}
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-full md:w-1/3">
            <SelectValue placeholder="按月份筛选" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2025-all">2025年全部月份</SelectItem>
            {Array.from({ length: 12 }).map((_, i) => {
              const month = (i + 1).toString().padStart(2, "0");
              return (
                <SelectItem key={month} value={`2025-${month}`}>
                  {`2025年${month}月`}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      <Card className="overflow-auto">
        <Table>
          <TableHeader>
            <TableRow >
              <TableHead className="font-semibold">公司名称 ({filteredCustomers.length})</TableHead>
              <TableHead className="font-semibold">联系人</TableHead>
              <TableHead className="font-semibold">邮箱</TableHead>
              <TableHead className="font-semibold">电话</TableHead>
              <TableHead className="font-semibold">国家</TableHead>
              <TableHead className="font-semibold">来源</TableHead>
              <TableHead className="font-semibold">业务负责</TableHead>
              <TableHead className="font-semibold">创建时间</TableHead>
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
                <TableCell
                  colSpan={8}
                  className="text-center py-6 text-gray-500"
                >
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
                  
                  {/* <TableCell>{ "hiden" || customer.email || "-"}</TableCell> */}
                  {/* <TableCell>{customer.phone || "-"}</TableCell> */}
                  <TableCell>{"~"}</TableCell>
                  <TableCell>{"-"}</TableCell>
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
  );
}
