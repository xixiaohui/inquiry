// components/CustomerList.tsx
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

import { Customer } from "@/lib/types"

interface CustomerListProps {
    customers: Customer[]
  }

export default function CustomerList({ customers }:CustomerListProps) {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {customers.map((customer) => (
        <Card key={customer.id} className="rounded-2xl shadow-md p-4">
          <CardContent className="space-y-2">
            <div className="text-xl font-semibold">{customer.company_name}</div>
            <div className="text-sm text-muted-foreground">{customer.contact_name} | {customer.country}</div>
            <div className="text-sm">状态：<span className="font-medium">{customer.status}</span></div>
            <Link href={`/customers/${customer.id}`}>
              <Button variant="outline" size="sm">查看详情</Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
