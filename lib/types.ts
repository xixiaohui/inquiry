// types.ts
export type Inquiry_Status ={
  id: string
  name: string
  description: string
  color: string
  color_index:number
  created_at:string
}

export type Customer = {
    id: string
    company_name: string
    contact_name: string
    email?: string
    phone?: string
    country: string
    source?: string
    status: '潜在' | '跟进中' | '报价中' | '样品中' | '成交' | '流失'
    created_at: string
    user_id?: User
  }
  
  export type Inquiry = {
    id: string
    customer_id: string
    product_name: string
    quantity: string
    message?: string
    channel?: string
    created_at: string
    subject?: string
    status?:Inquiry_Status
    customer?:Customer
  }
  
  

  export type FollowUp = {
    id: string
    inquiry_id: string
    action_date: string // ISO 日期字符串
    method: '邮件' | '电话' | 'WhatsApp' | '样品' | '报价' | '拜访'| '其他'
    content: string
    next_action?: string // ISO 日期字符串
    created_at: string
    user_id?: string
  }
  
  export type User = {
    id: string
    name: string
    email: string
    role: 'sales' | 'manager' | 'admin'
    created_at: string
  }
  