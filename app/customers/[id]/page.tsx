// app/customers/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Customer, Inquiry } from "@/lib/types";
import Link from "next/link";

export default function CustomerDetailPage() {
  const params = useParams();
  const customerId = params?.id as string;

  const [customer, setCustomer] = useState<Customer>();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);

  useEffect(() => {
    if (!customerId) return;

    const fetchCustomer = async () => {
      const { data, error } = await supabase
        .from("customers")
        .select(
          `
          id,
          company_name,
          contact_name,
          email,
          phone,
          country,
          user_id:users(
            id,
            name
          )
        `
        )
        .eq("id", customerId)
        .single();

      if (!error) {
        setCustomer(data as unknown as Customer);
        console.log("customer data", data);
      }

      // 查询客户的所有询盘
      const { data: inquiryData, error: inquiryError } = await supabase
        .from("inquiries")
        .select("*")
        .eq("customer_id", customerId)
        .order("created_at", { ascending: false });

      if (!inquiryError) setInquiries(inquiryData);
    };

    fetchCustomer();
  }, [customerId]);

  if (!customer) return <div className="p-6">加载中...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* 客户信息 */}
      <div className="bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold mb-2">{customer.company_name || customer.contact_name}</h1>
        <p>
          <span className="font-semibold">联系人：</span>{" "}
          {customer.contact_name || "无"}
        </p>
        <p>
          {/* <span className="font-semibold">邮箱：</span> {customer.email || "无"} */}
          <span className="font-semibold">邮箱：</span> {"~"}
        </p>
        <p>
          {/* <span className="font-semibold">电话：</span> {customer.phone || "无"} */}
          <span className="font-semibold">电话：</span> {"-"}
        </p>
        <p>
          <span className="font-semibold">国家：</span>{" "}
          {customer.country || "无"}
        </p>
        <Link href={`/customers?user_id=${customer.user_id?.id}`}>
            <p className="hover:text-blue-800">
            <span className="font-semibold mt-6">客户属于：</span>{" "}
            {customer.user_id?.name || "无"}
            </p>
        </Link>
      </div>

      {/* 关联询盘 */}
      <div>
        <h2 className="text-xl font-semibold mb-3">关联的询盘记录</h2>
        {inquiries.length === 0 ? (
          <p className="text-gray-500">暂无询盘记录。</p>
        ) : (
          <ul className="space-y-4">
            {inquiries.map((inquiry) => (
              <li key={inquiry.id} className="bg-white p-4 rounded shadow">
                <Link href={`/inquiries/${inquiry.id}`}>
                  <div className="cursor-pointer">
                    <p className="text-lg font-semibold">
                      {inquiry.subject || "无主题"}
                    </p>
                    <p>
                      <span className="font-medium">产品：</span>
                      {inquiry.product_name}
                    </p>
                    <p>
                      <span className="font-medium">数量：</span>
                      {inquiry.quantity}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      创建时间：{new Date(inquiry.created_at).toLocaleString()}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
