"use client"

import { useState } from "react"
import Papa from "papaparse"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Customer } from "@/lib/types"

export default function ImportCustomersPage() {
  const [parsedData, setParsedData] = useState<Customer[]>([])
  const [fileReady, setFileReady] = useState(false)

  const downloadTemplate = () => {
    const headers = [
      "company_name",
      "contact_name",
      "email",
      "phone",
      "country",
      "source",
      "status",
      "user_id",
      "created_at"

    ]
    const csvContent = "\uFEFF" + headers.join(",") + "\n"; // ← 关键是加了 \uFEFF BOM
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "customers_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
  
    const reader = new FileReader();
  
    reader.onload = function (event) {
      const csvText = event.target?.result;
      if (typeof csvText !== "string") return;
  
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: function (results: Papa.ParseResult<Customer>) {
          const records = results.data.map((row: Customer) => ({
            company_name: row.company_name,
            contact_name: row.contact_name || null,
            email: row.email || null,
            phone: row.phone || null,
            country: row.country || null,
            source: row.source || null,
            status: row.status || "潜在",
            user_id: row.user_id || null,
            created_at: row.created_at || null,
          }));
          setParsedData(records as Customer[]);
          setFileReady(true);
          toast.success("文件解析成功，请点击提交导入");
        },
        error: function (err: { message: string }) {
          toast.error("文件解析失败：" + err.message);
        },
      });
    };
  
    // ✅ 显式指定读取为 UTF-8 编码
    reader.readAsText(file, "utf-8");
  };
  

  const handleSubmit = async () => {
    if (parsedData.length === 0) {
      toast.error("没有可提交的数据")
      return
    }

    const { error } = await supabase.from("customers").insert(parsedData)

    if (error) {
      toast.error("提交失败：" + error.message)
    } else {
      toast.success(`成功导入 ${parsedData.length} 条客户记录`)
      setParsedData([])
      setFileReady(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 space-y-6 p-4 bg-white rounded-xl shadow">
      <h1 className="text-2xl font-semibold">导入客户</h1>

      <Button onClick={downloadTemplate}>📄 下载 CSV 模板</Button>

      <div>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
      </div>

      {fileReady && (
        <Button onClick={handleSubmit}>✅ 提交导入</Button>
      )}
    </div>
  )
}
