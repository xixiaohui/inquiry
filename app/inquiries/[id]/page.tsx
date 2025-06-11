// app/inquiries/[id]/page.tsx
"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Inquiry, FollowUp } from "@/lib/types";
import AddFollowUpDialog from "@/components/AddFollowUpDialog";
import FollowUpTimeline from "@/components/FollowUpTimeline";

import Link from "next/link";
import { toast } from "sonner"


export default function InquiryPage() {
  const params = useParams();
  const inquiryId = params?.id as string;

  console.log("inquiryId = ", inquiryId);

  const [inquiry, setInquiry] = useState<Inquiry | null>(null);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);

  const [statusOptions, setStatusOptions] = useState<{ id: string; name: string;color: string }[]>([]);

  useEffect(() => {
    if (!inquiryId) return;

    const fetchData = async () => {
      setLoading(true);

      const { data: inquiryData, error: inquiryError } = await supabase
        .from("inquiries")
        .select(
          `
            *,
            status:inquiry_status (
                id,
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
        .eq("id", inquiryId)
        .single();

      const { data: followUpsData, error: followUpsError } = await supabase
        .from("follow_ups")
        .select("*")
        .eq("inquiry_id", inquiryId)
        .order("created_at", { ascending: true });

      if (!inquiryError) setInquiry(inquiryData);
      if (!followUpsError) setFollowUps(followUpsData || []);

      setLoading(false);
    };

    fetchData();
  }, [inquiryId]);


  useEffect(() => {
    const fetchStatusOptions = async () => {
      const { data, error } = await supabase.from("inquiry_status").select("id, name,color");
      if (!error) setStatusOptions(data || []);
    };
    fetchStatusOptions();
  }, []);

  

  if (loading) return <div className="p-6 text-center">加载中...</div>;
  if (!inquiry)
    return <div className="p-6 text-red-500 text-center">未找到该询盘。</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-3xl font-bold mb-4">{inquiry.subject || "无主题"}</h1>
      <div
        className="inline-block px-2 py-1 text-white rounded m-4"
        style={{ backgroundColor: inquiry.status?.color }}
      >
        {inquiry.status?.name}
      </div>

      

      <div className="mb-6 space-y-2 text-gray-700">
        <p>
          <span className="font-semibold">产品名称：</span>
          {inquiry.product_name}
        </p>
        <p>
          <span className="font-semibold">数量：</span>
          {inquiry.quantity}
        </p>
        {inquiry.message && (
          <p>
            <span className="font-semibold">留言内容：</span>
            {inquiry.message}
          </p>
        )}
        <p>
          <span className="font-semibold">渠道：</span>
          {inquiry.channel || "未知"}
        </p>
        

        <Link
          href={`/customers/${inquiry.customer?.id}`}
          className="hover:text-blue-800 cursor-pointer"
        >
          <div className="cursor-pointer">
            <span className="font-medium">来自客户：</span>
            {inquiry.customer?.company_name}
          </div>
        </Link>

        <p className="text-sm text-gray-400">
          创建时间：{new Date(inquiry.created_at).toLocaleString()}
        </p>
      </div>

      <hr className="my-6" />
      <div className="mb-4">
        <label className="font-semibold mr-2">修改状态：</label>
        <select
          value={inquiry.status?.id || ""}
          onChange={async (e) => {
            const newStatusId = e.target.value;
            const { error } = await supabase
              .from("inquiries")
              .update({ status: newStatusId })
              .eq("id", inquiryId);

            if (error) {
              toast.error("状态更新失败：" + error.message);
            } else {
              // 更新本地 state
              setInquiry(prev => {
                if (!prev) return null;
              
                const newStatus = statusOptions.find(s => s.id === newStatusId);
                if (!newStatus) return prev;
              
                // 用类型断言告诉 TS 这个对象就是 Inquiry
                return {
                  ...prev,
                  status: newStatus,
                } as Inquiry;
              });
            }
          }}
          className="border rounded px-2 py-1"
        >
          <option value="">请选择状态</option>
          {statusOptions.map((status) => (
            <option key={status.id} value={status.id}>
              {status.name}
            </option>
          ))}
        </select>
      </div>
      <hr className="my-6" />
      
      <h2 className="text-2xl font-semibold mb-3">跟进记录</h2>
      {followUps.length > 0 ? (
        <FollowUpTimeline followUps={followUps} />
      ) : (
        <p className="text-gray-500">暂无跟进记录。</p>
      )}
      <div className="mt-6">
        <AddFollowUpDialog inquiryId={inquiryId} />
      </div>
    </div>
  );
}
