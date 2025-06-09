// 功能说明：

// 点击按钮 ➕ 打开对话框
// 填写跟进类型、内容、下次跟进时间
// 支持提交并发送到 Supabase


"use client"

import { useState } from "react"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase"


export default function AddFollowUpDialog({ inquiryId }: { inquiryId: string }) {
  const [open, setOpen] = useState(false)
  const [method, setMethod] = useState("电话")
  const [content, setContent] = useState("")
  const [nextDate, setNextDate] = useState("")
  const [actionDate, setActionDate] = useState("")

  const handleSubmit = async () => {
    if (!content) {
      toast.error("请填写跟进内容")
      return
    }

    console.log("📤 尝试提交的数据：", {
      inquiry_id: inquiryId,
      method,
      content,
      action_date: actionDate,
      next_action: nextDate || null,
    })

    const { error } = await supabase.from("follow_ups").insert({
      inquiry_id: inquiryId,
      method,
      content,
      next_action: nextDate || null,
    })

    if (error) {
     
      console.error("插入失败错误：", error)
      toast.error("提交失败：" + error.message)
    } else {
      toast.success("跟进事件已添加")
      setOpen(false)
      setContent("")
      setNextDate("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">➕ 添加跟进事件</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>添加跟进事件</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>跟进类型</Label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full border p-2 rounded"
            >
              <option>电话</option>
              <option>邮件</option>
              <option>WhatsApp</option>
              <option>报价</option>
              <option>样品</option>
              <option>拜访</option>
              <option>其他</option>
            </select>
          </div>

          <div>
            <Label>内容</Label>
            <Textarea
              placeholder="请输入跟进内容..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
          <div>
            <Label>本次跟进日期</Label>
            <Input
              type="date"
              value={actionDate}
              onChange={(e) => setActionDate(e.target.value)}
            />
          </div>
          <div>
            <Label>下次跟进日期（可选）</Label>
            <Input
              type="date"
              value={nextDate}
              onChange={(e) => setNextDate(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit}>提交</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
