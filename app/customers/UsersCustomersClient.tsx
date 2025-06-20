"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Customer, Inquiry } from "@/lib/types";
import Link from "next/link";

export default function UsersCustomersClient() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("user_id");

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      const { data: customerData, error } = await supabase
        .from("customers")
        .select("*")
        .eq("user_id", userId);

      if (error) {
        console.error("查询失败", error.message);
      } else {
        setCustomers(customerData);
        console.log("customerData", customerData);
      }

      const { data: inquiryData} = await supabase
        .from("inquiries")
        .select(
          `
            *,
            inquiry_status (
                name,
                color
            )
        `
        )
        .in("customer_id", customerData?.map((c) => c.id) ?? []);

      if (inquiryData) {
        setInquiries(inquiryData);
        console.log("inquiryData", inquiryData);
      }

    };

    fetchData();
  }, [userId]);

  return (
    <>
      {customers.map((customer) => (
        <div key={customer.id} className="border rounded p-4 shadow">
          <h2 className="text-xl font-semibold mb-3">
            {customer.company_name || customer.contact_name}
          </h2>
          

          <ul className="space-y-4">
            {inquiries
              .filter((inquiry) => inquiry.customer_id === customer.id)
              .map((inquiry) => (
                <li key={inquiry.id}>
                  <Link
                    href={`/inquiries/${inquiry.id}`}
                    className="block cursor-pointer border rounded-lg p-4 bg-white shadow hover:shadow-lg transition"
                  >
                    <div
                        className="inline-block px-2 py-1 text-white rounded m-4"
                        style={{ backgroundColor: inquiry.status?.color }}
                        >
                        {inquiry.status?.name}
                    </div>
                    <p className="text-lg font-semibold mb-1">
                      {inquiry.subject || "(无主题)"}
                    </p>
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
                    <p className="text-sm text-gray-500 mt-2">
                      {new Date(inquiry.created_at).toLocaleString()}
                    </p>
                  </Link>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </>
  );
}
