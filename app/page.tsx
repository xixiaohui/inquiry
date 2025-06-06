// app/page.tsx or pages/index.tsx
"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import type { Customer } from "@/lib/types"

export default function HomePage() {
  const [customers, setCustomers] = useState<Customer[]>([])

  useEffect(() => {
    const fetchCustomers = async () => {
      const { data } = await supabase.from("customers").select("*")
      if (data) setCustomers(data)
    }

    fetchCustomers()
  }, [])

  return (
    <div>
      <h1>客户列表</h1>
      <ul>
        {customers.map(c => (
          <li key={c.id}>{c.company_name}</li>
        ))}
      </ul>
    </div>
  )
}
