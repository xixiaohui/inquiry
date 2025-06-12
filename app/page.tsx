
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User, Customer, Inquiry , FollowUp , Inquiry_Status} from "@/lib/types";

import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import FollowUpTimeline from "@/components/FollowUpTimeline";
import AddFollowUpDialog from "@/components/AddFollowUpDialog";

import { toast } from "sonner"

type Selection =
  | { type: "user"; data: User }
  | { type: "customer"; data: Customer }
  | { type: "inquiry"; data: Inquiry }
  | null;



export default function DashboardPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [selected, setSelected] = useState<Selection>(null);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);

  const [statuses, setStatuses] = useState<Inquiry_Status[]>([]);




  useEffect(() => {
    const fetchData = async () => {
      const { data: usersData } = await supabase
        .from("users")
        .select("id, name");
      const { data: customersData } = await supabase.from("customers").select(`
          id, 
          contact_name,
          user_id:users(
              id,
              name
            )
          `);
      const { data: inquiriesData } = await supabase
        .from("inquiries")
        .select(
            `
            id, 
            product_name, 
            quantity,
            message,
            channel,
            subject,
            customer:customers(
              id, 
              company_name, 
              contact_name,
              user_id:users(id, name)
            ),
            status:inquiry_status (
                id,
                name,
                color
            )
          `
        );

      const { data: statusData } = await supabase.from("inquiry_status").select("*");

      if (usersData) setUsers(usersData as User[]);
      if (customersData) setCustomers(customersData as unknown as Customer[]);
      if (inquiriesData) setInquiries(inquiriesData as unknown as Inquiry[]);

      if (statusData) setStatuses(statusData);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchFollowUps = async () => {
      if (selected?.type === "inquiry") {
        const { data } = await supabase
          .from("follow_ups")
          .select("*")
          .eq("inquiry_id", selected.data.id);
  
        if (data) setFollowUps(data as FollowUp[]);
      } else {
        setFollowUps([]);
      }
    };
  
    fetchFollowUps();
  }, [selected]);


  const updateInquiryStatus = async (newStatusId: string) => {
    if (selected?.type !== "inquiry") return;

    const { error } = await supabase
      .from("inquiries")
      .update({ status: newStatusId  })
      .eq("id", selected.data.id);

    if (error) {
      toast.error("更新状态失败");
    } else {
      toast.success("状态更新成功");
      const statusObj = statuses.find((s) => s.id === newStatusId);
      setSelected({
        type: "inquiry",
        data: {
          ...selected.data,
          status: statusObj ?? {
            id: newStatusId,
            name: "未知状态",
            color: "#999",
            description: "",
            color_index: 0,
            created_at: ""
          },
        },
      });
    }
  };

   // 计算当前选中用户 id 和客户 id
   const selectedUserId = (() => {
    if (!selected) return null;
    if (selected.type === "user") return selected.data.id;
    if (selected.type === "customer") return selected.data.user_id?.id || null;
    if (selected.type === "inquiry") return selected.data.customer?.user_id?.id || null; // 询盘对应的客户的用户ID（注意你的查询里要返回这个）
    return null;
  })();

  const selectedCustomerId = (() => {
    if (!selected) return null;
    if (selected.type === "customer") return selected.data.id;
    if (selected.type === "inquiry") return selected.data.customer?.id || null;
    return null;
  })();

  return (
    <div className="p-6 h-[90vh]">
      <PanelGroup direction="horizontal" className="h-full rounded-xl overflow-hidden border">
        {/* 用户列 */}
        <Panel defaultSize={20} minSize={10}>
          <Card className="h-full overflow-y-auto rounded-none border-none">
            <CardHeader><CardTitle>所有用户</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {users.map((user) => (
                <div
                  key={user.id}
                  className={`p-2 border rounded-md hover:bg-gray-100 cursor-pointer ${
                    selectedUserId === user.id ? "bg-blue-100" : ""
                  }`}
                  onClick={() => setSelected({ type: "user", data: user })}
                >
                  {user.name}
                </div>
              ))}
            </CardContent>
          </Card>
        </Panel>

        <PanelResizeHandle className="w-1 bg-muted cursor-col-resize" />

        {/* 客户列 */}
        <Panel defaultSize={20} minSize={10}>
          <Card className="h-full overflow-y-auto rounded-none border-none">
            <CardHeader><CardTitle>所有客户</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {selectedUserId ? (
                customers
                  .filter((c) => c.user_id?.id === selectedUserId)
                  .map((c) => (
                    <div
                      key={c.id}
                      className={`p-2 border rounded-md hover:bg-gray-100 cursor-pointer ${
                        selectedCustomerId === c.id ? "bg-blue-100" : ""
                      }`}
                      onClick={() => setSelected({ type: "customer", data: c })}
                    >
                      {c.contact_name}
                    </div>
                  ))
              ) : (
                <p className="text-muted-foreground">请先选择用户</p>
              )}
            </CardContent>
          </Card>
        </Panel>

        <PanelResizeHandle className="w-1 bg-muted cursor-col-resize" />

        {/* 询盘列 */}
        <Panel defaultSize={20} minSize={10}>
          <Card className="h-full overflow-y-auto rounded-none border-none">
            <CardHeader><CardTitle>所有询盘</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {selectedCustomerId ? (
                inquiries
                  .filter((inq) => inq.customer?.id === selectedCustomerId)
                  .map((inq) => (
                    <div
                      key={inq.id}
                      className={`p-2 border rounded-md hover:bg-gray-100 cursor-pointer ${
                        selected?.type === "inquiry" && inq.id === selected.data.id
                          ? "bg-blue-100"
                          : ""
                      }`}
                      onClick={async () => {
                        const { data: updatedInquiry } = await supabase
                          .from("inquiries")
                          .select(`
                            id, 
                            product_name, 
                            quantity,
                            message,
                            channel,
                            subject,
                            customer:customers(id, company_name, contact_name, user_id:users(id, name)),
                            status:inquiry_status(id, name, color)
                          `)
                          .eq("id", inq.id)
                          .single();
                      
                        if (updatedInquiry) {
                          setSelected({ type: "inquiry", data: updatedInquiry as unknown as Inquiry });
                        } else {
                          toast.error("获取最新询盘信息失败");
                        }
                      }}
                    >
                      <div className="font-medium">{inq.subject}</div>
                      <div className="text-sm text-muted-foreground">数量: {inq.quantity}</div>
                    </div>
                  ))
              ) : (
                <p className="text-muted-foreground">请先选择客户</p>
              )}
            </CardContent>
          </Card>
        </Panel>

        <PanelResizeHandle className="w-1 bg-muted cursor-col-resize" />

        {/* 详情区 */}
        <Panel defaultSize={40} minSize={20}>
          <Card className="h-full overflow-y-auto rounded-none border-none">
            <CardHeader><CardTitle>详情区</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {selected ? (
                selected.type === "user" ? (
                  <>
                    <p className="font-semibold">用户姓名：</p>
                    <p>{selected.data.name}</p>
                  </>
                ) : selected.type === "customer" ? (
                  <>
                    <p className="font-semibold">客户联系人：</p>
                    <p>{selected.data.contact_name}</p>
                  </>
                ) : (
                  <div>
                    <p className="font-semibold">产品名称：</p>
                    <p>{selected.data.product_name}</p>
                    <p className="font-semibold">数量：</p>
                    <p>{selected.data.quantity}</p>
                    <p className="font-semibold">信息</p>
                    <p>{selected.data.message}</p>
                    <p className="font-semibold">沟通渠道：</p>
                    <p>{selected.data.channel}</p>

                    
                    <div
                      className="inline-block px-2 py-1 text-white rounded m-4"
                      style={{ backgroundColor: selected.data.status?.color }}
                    >
                      {selected.data.status?.name}
                    </div>

                    <hr className="my-6" />
                    <div className="mb-4">
                      <p className="font-semibold">修改状态：</p>
                      <Select
                        value={selected.data.status?.id} // ✅ 使用 id 而不是 name
                        onValueChange={updateInquiryStatus} // 会传 status.id
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="选择状态" />
                        </SelectTrigger>
                        <SelectContent>
                          {statuses.map((s) => (
                            <SelectItem key={s.id} value={s.id}> {/* ✅ value 为 status.id */}
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    

                    <hr className="my-6" />

                    <h2 className="text-2xl font-semibold mb-3">跟进记录</h2>
                    {followUps.length > 0 ? (
                      <FollowUpTimeline followUps={followUps} />
                    ) : (
                      <p className="text-gray-500">暂无跟进记录。</p>
                    )}
                    <div className="mt-6">
                      <AddFollowUpDialog inquiryId={selected.data.id} />
                    </div>
                  </div>
                )
              ) : (
                <p className="text-muted-foreground">点击左侧查看详情</p>
              )}
            </CardContent>
          </Card>
        </Panel>
      </PanelGroup>
    </div>
  );
}
