# customer_follow_ups
为了追踪外贸客户的所有跟进行为（如电话、邮件、WhatsApp、发送样品、报价等），我们需要设计一张关联客户的 客户跟进动作事件表（customer_follow_ups）。

每一条跟进记录都包含以下信息：

对应客户（customer_id）

跟进类型（如：电话、邮件、报价、发样品、其他）

具体内容或备注

跟进时间（可自动记录）

跟进人（可选，若有用户系统）

下次跟进时间（提醒用）

是否重要（如标记重要事件）



create table customer_follow_ups (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  type text not null check (type in ('电话', '邮件', 'WhatsApp', '报价', '样品', '拜访', '其他')),
  content text, -- 跟进内容、简要说明
  follow_up_time timestamp with time zone default now(),
  next_follow_up_date date, -- 下次联系提醒（可选）
  is_important boolean default false, -- 是否标记为重要节点
  created_by text, -- 跟进人（可选，如系统中有用户）
  created_at timestamp with time zone default now()
);


# follow_ups 

CREATE TABLE follow_ups (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  inquiry_id uuid REFERENCES inquiries(id) ON DELETE CASCADE,
  action_date timestamptz NOT NULL,
  method text CHECK (method IN ('邮件', '电话', 'WhatsApp', '其他')) NOT NULL,
  content text NOT NULL,
  next_action date,
  user_id uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

type FollowUp = {
  id: string                // 跟进记录唯一ID
  inquiry_id: string        // 关联的询盘ID
  action_date: string       // 跟进时间（ISO字符串，如 2025-06-05T08:00:00Z）
  method: '邮件' | '电话' | 'WhatsApp' | '其他' // 跟进方式
  content: string           // 跟进内容
  next_action?: string      // 下次跟进时间（可选）
  user_id?: string          // 执行该跟进的用户ID（可选）
  created_at: string        // 创建时间
}

const followUps: FollowUp[] = [
  {
    id: "1",
    inquiry_id: "a123",
    action_date: "2025-06-01T10:00:00Z",
    method: "电话",
    content: "客户电话确认规格，答复我们报价。",
    next_action: "2025-06-05",
    user_id: "user-001",
    created_at: "2025-06-01T10:00:10Z"
  },
  {
    id: "2",
    inquiry_id: "a123",
    action_date: "2025-06-03T14:30:00Z",
    method: "邮件",
    content: "已发送正式报价并附PDF。",
    created_at: "2025-06-03T14:30:05Z"
  }
]