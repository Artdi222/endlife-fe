"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/user/Sidebar-user";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) router.push("/login");
  }, []);

  return (
    <div className="flex min-h-screen bg-zinc-950 text-white">
      
      <main className="ml-56 flex-1 p-10">{children}</main>
    </div>
  );
}
