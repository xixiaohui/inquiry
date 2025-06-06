// components/CustomerDetail.tsx
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

import { Customer } from "@/lib/types"

  interface CustomerDetailProps {
    customer: Customer
  }

export default function CustomerDetail({ customer }: CustomerDetailProps) {
  return (
    <div className="space-y-4">
      <div className="text-2xl font-bold">{customer.company_name}</div>
      <div className="text-sm text-muted-foreground">{customer.contact_name} | {customer.email} | {customer.phone}</div>
      <Badge variant="outline">{customer.status}</Badge>
      <Separator />
      <div className="text-sm">来源：{customer.source}</div>
      <div className="text-sm">国家：{customer.country}</div>
    </div>
  )
}
