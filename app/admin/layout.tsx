"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import Sidebar from "@/components/admin/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // middleware.ts handles unauthenticated users before this renders.
    // This catches the edge case where a non-admin user navigates to /admin.
    if (isAuthenticated && !isAdmin) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isAdmin, router]);

  // Show nothing while store rehydrates or if not admin.
  // middleware.ts prevents the unauthenticated flash.
  if (!isAuthenticated || !isAdmin) return null;

  return (
    <div className="flex min-h-screen bg-zinc-950 text-white">
      <Sidebar />
      <main className="ml-56 flex-1 p-10">{children}</main>
    </div>
  );
}
