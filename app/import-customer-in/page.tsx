/* eslint-disable @typescript-eslint/no-explicit-any */
/* components/CsvImport.tsx */
"use client";

import { useState } from "react";
import Papa from "papaparse";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export default function CsvImport() {
  const [rows, setRows] = useState<any[]>([]);
  const [isImporting, setIsImporting] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".csv")) {
      toast.error("仅支持 CSV 文件");
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        setRows(results.data as any[]);
        toast.success("文件读取成功，准备提交");
      },
    });
  };

  const handleSubmit = async () => {
    if (!rows.length) {
      toast.error("请先选择 CSV 文件");
      return;
    }

    setIsImporting(true);
    let successCount = 0;

    for (const row of rows) {
      if (!row.contact_name) {
        toast.error("缺少必要字段，跳过某行");
        continue;
      }

      try {
        const { data: customer, error: customerError } = await supabase
          .from("customers")
          .insert([
            {
              company_name: row.company_name,
              contact_name: row.contact_name,
              email: row.email,
              phone: row.phone,
              country: row.country,
              source: row.source,
              website: row.website,
              user_id: row.user_id,
              created_at: row.created_at,
            },
          ])
          .select("id")
          .single();

        if (customerError || !customer) {
          toast.error(`客户导入失败: ${row.company_name}`);
          continue;
        }

        const { error: inquiryError } = await supabase
          .from("inquiries")
          .insert([
            {
              customer_id: customer.id,
              product_name: row.product_name,
              quantity: row.quantity,
              message: row.message,
              channel: row.source,
              subject: row.subject,
              status: row.status,
              created_at: row.created_at,
            },
          ]);

        if (inquiryError) {
          toast.error(`询盘导入失败: ${row.product_name}`);
          continue;
        }

        successCount++;
      } catch (err) {
        toast.error("网络异常，跳过一行" + err);
      }
    }

    toast.success(`成功导入 ${successCount} 条客户和询盘数据。`);
    setIsImporting(false);
  };

  return (
    <div className="p-4 border rounded-lg shadow-md w-full max-w-xl mx-auto mb-50 mt-50">
      <h2 className="text-xl font-bold mb-2">CSV 导入客户 + 询盘</h2>
      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        disabled={isImporting}
        className="block mt-4 w-full text-sm text-gray-600
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-blue-50 file:text-blue-700
          hover:file:bg-blue-100"
      />
      <button
        onClick={handleSubmit}
        disabled={isImporting || rows.length === 0}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {isImporting ? "导入中..." : "提交导入"}
      </button>
    </div>
  );
}
