"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";


const ALLOWED_EMAILS = ["sales@tfcomposite.com", "sales2@tfcomposite.com", "sales5@tfcomposite.com","sales3@tfcomposite.com","sales6@tfcomposite.com"];


export default function AuthCallback() {
    const router = useRouter();
    const supabase = createClientComponentClient();
  
    useEffect(() => {
      const checkAccess = async () => {
        const {
          data: { user },
        } = await supabase.auth.getUser();
  
        if (!user || !ALLOWED_EMAILS.includes(user.email ?? "")) {
          await supabase.auth.signOut();
          router.push("/unauthorized"); // 自定义未授权页面
        } else {
          router.push("/dashboard"); // 合法用户跳转
        }
      };
  
      checkAccess();
    }, [router, supabase]);
  
    return <p>正在校验权限...</p>;
  }
