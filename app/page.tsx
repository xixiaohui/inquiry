"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Customer, FollowUp, Inquiry } from "@/lib/types";
import AddFollowUpDialog from "@/components/AddFollowUpDialog";
import FollowUpTimeline from "@/components/FollowUpTimeline";

export default function HomePage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: customerData } = await supabase.from("customers").select("*");
      if (customerData) setCustomers(customerData);

      const { data: inquiryData } = await supabase.from("inquiries").select("*");
      if (inquiryData) setInquiries(inquiryData);

      const { data: followUpData } = await supabase.from("follow_ups").select("*");
      if (followUpData) setFollowUps(followUpData);
    };

    fetchData();
  }, []);

  return (
    <div className="grid grid-cols-12 gap-4 px-4">
      <div className="col-span-12 md:col-span-7 md:col-start-4 bg-white shadow p-6">
        <h1 className="text-xl font-semibold mb-4">客户列表</h1>
        <ul className="m-4">
          {customers.map((customer) => {
            const customerInquiries = inquiries.filter(
              (inquiry) => inquiry.customer_id === customer.id
            );

            return (
              <li key={customer.id} className="mb-10">
                <h2 className="m-4 text-3xl">{customer.company_name}</h2>

                {customerInquiries.length === 0 ? (
                  <p className="text-gray-500 text-sm mx-4">暂无询盘</p>
                ) : (
                  customerInquiries.map((inquiry) => {
                    const inquiryFollowUps = followUps.filter(
                      (f) => f.inquiry_id === inquiry.id
                    );

                    return (
                      <div
                        key={inquiry.id}
                        className="bg-gray-50 border rounded p-4 mb-6"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-lg font-semibold">
                            询盘：{inquiry.subject || "（无标题）"}
                          </h3>
                          <AddFollowUpDialog inquiryId={inquiry.id} />
                        </div>
                        <FollowUpTimeline followUps={inquiryFollowUps} />
                      </div>
                    );
                  })
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
