"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Customer, FollowUp } from "@/lib/types";
import AddFollowUpDialog from "@/components/AddFollowUpDialog";
import FollowUpTimeline from "@/components/FollowUpTimeline";

export default function HomePage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: customerData } = await supabase.from("customers").select("*");
      if (customerData) setCustomers(customerData);

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
          {customers.map((c) => (
            <li key={c.id} className="mb-8">
              <h2 className="m-4 text-3xl">{c.company_name}</h2>
              <AddFollowUpDialog inquiryId={c.id} />
              <FollowUpTimeline
                followUps={followUps.filter((f) => f.inquiry_id === c.id)}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
