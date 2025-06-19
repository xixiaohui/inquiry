// components/LayoutWrapper.tsx
"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Footer from "./Footer";

export default function LayoutWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <>
      {children}
      {!isHome && <Footer />}
    </>
  );
}
