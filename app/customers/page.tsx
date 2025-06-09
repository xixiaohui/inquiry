import { Suspense } from "react";
import UsersCustomersClient from "./UsersCustomersClient";

export default function UsersCustomersPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-4">客户及其询盘列表</h1>
      <Suspense fallback={<div>加载中...</div>}>
        <UsersCustomersClient />
      </Suspense>
    </div>
  );
}
