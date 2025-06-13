"use client"

import { useState } from "react"
import Papa from "papaparse"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Inquiry } from "@/lib/types"

export default function ImportInquiriesPage() {
  const [file, setFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<Inquiry[]>([])

  // 下载模板 CSV 文件
  const downloadTemplate = () => {
    const headers = [
      "customer_id",
      "product_name",
      "quantity",
      "message",
      "channel",
      "subject",
      "status",
      "created_at"
    ]
    const csvContent = headers.join(",") + "\n"
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", "inquiries_template.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // 处理上传的文件并解析 CSV
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)

    Papa.parse(f, {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        setParsedData(results.data as Inquiry[])
      }
    })
  }

  // 提交上传的数据到 Supabase
  const handleSubmit = async () => {
    if (!parsedData.length) {
      toast.error("没有有效的数据可提交")
      return
    }

    const records = parsedData.map(row => ({
      customer_id: row.customer_id,
      product_name: row.product_name,
      quantity: row.quantity,
      message: row.message || null,
      channel: row.channel || null,
      subject: row.subject || null,
      status: row.status || null,
      created_at: row.created_at || null,
    }))

    const { error } = await supabase.from("inquiries").insert(records)

    if (error) {
      toast.error("导入失败：" + error.message)
    } else {
      toast.success(`成功导入 ${records.length} 条记录`)
      setFile(null)
      setParsedData([])
    }
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow rounded space-y-6">
      <h1 className="text-2xl font-semibold">批量导入询盘</h1>

      <Button onClick={downloadTemplate}>📄 下载 CSV 模板</Button>

      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="block mt-4 w-full text-sm text-gray-600
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-blue-50 file:text-blue-700
          hover:file:bg-blue-100"
      />

      {file && (
        <div className="text-sm text-gray-500">已选择文件：{file.name}</div>
      )}

      <Button
        onClick={handleSubmit}
        disabled={!file}
        className="bg-green-600 hover:bg-green-700 text-white"
      >
        📤 提交导入
      </Button>
    </div>
  )
}
