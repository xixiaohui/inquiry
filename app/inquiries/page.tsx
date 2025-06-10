// app/inquiries/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Inquiry } from "@/lib/types";
import Link from "next/link";

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInquiries = async () => {
      const { data, error } = await supabase
        .from("inquiries")
        .select(
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
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("获取询盘失败:", error.message);
      } else {
        setInquiries(data || []);
      }

      setLoading(false);
    };

    fetchInquiries();
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-4">所有询盘列表</h1>

      {loading && <p>加载中...</p>}

      {!loading && inquiries.length === 0 && (
        <p className="text-gray-500">暂无询盘记录。</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {inquiries.map((inquiry) => (
          <div
            key={inquiry.id}
            className="border rounded-lg p-4 shadow hover:shadow-lg transition  bg-white"
          >
            <Link href={`/inquiries/${inquiry.id}`} className="cursor-pointer">
              <div>
                <div className="text-lg font-semibold mb-2">
                  {inquiry.subject || "（无主题）"}
                  <div
                    className="inline-block px-2 py-1 text-white rounded m-4"
                    style={{ backgroundColor: inquiry.status?.color }}
                  >
                    {inquiry.status?.name}
                  </div>
                </div>
              </div>
            </Link>
            <p>
              <span className="font-medium">产品名称：</span>
              {inquiry.product_name}
            </p>
            <p>
              <span className="font-medium">数量：</span>
              {inquiry.quantity}
            </p>
            <p>
              <span className="font-medium">渠道：</span>
              {inquiry.channel || "未知"}
            </p>
            <Link href={`/customers/${inquiry.customer?.id}`} className="hover:text-blue-800 cursor-pointer">
                <div className="cursor-pointer">
                <span className="font-medium">来自客户：</span>
                {inquiry.customer?.company_name}
                </div>
            </Link>
            

            <p className="text-sm text-gray-500 mt-2">
              创建时间：{new Date(inquiry.created_at).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
