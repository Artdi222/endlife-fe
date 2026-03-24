"use client";
import { useAuth } from "@/lib/hooks/useAuth";
import Sidebar from "@/components/dashboard/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen bg-zinc-50 text-zinc-900">
      <Sidebar />
      <main className="flex-1 pt-14 lg:pt-0 lg:ml-56 p-6 lg:p-10">
        {children}
      </main>
    </div>
  );
}
