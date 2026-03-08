"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, CalendarCheck } from "lucide-react";
import { motion } from "framer-motion";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Daily", href: "/dashboard/daily", icon: CalendarCheck },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 bg-white border-r border-yellow-200 flex flex-col z-50">
      {/* Logo */}
      <div className="px-6 py-7 border-b border-yellow-100">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl text-yellow-300">⬡</span>
          <span className="text-lg font-extrabold text-zinc-900 tracking-tight">
            EndLife
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 flex flex-col gap-1">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href}>
              <motion.div
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.97 }}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  active
                    ? "bg-yellow-300 text-zinc-900 shadow-sm"
                    : "text-zinc-500 hover:bg-yellow-50 hover:text-zinc-900"
                }`}
              >
                <Icon size={17} strokeWidth={2.2} />
                {label}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      {/* Logout */}
      <div className="p-3 border-t border-zinc-800">
        <button
          onClick={() => {
            localStorage.removeItem("admin_role");
            router.push("/login");
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-zinc-400 hover:text-red-400 hover:bg-red-400/10 transition-all"
        >
          <span>⏻</span> Logout
        </button>
      </div>
      {/* <div className="px-6 py-5 border-t border-yellow-100">
        <p className="text-[10px] font-mono text-zinc-300 uppercase tracking-widest">
          © EndLife
        </p>
      </div> */}
    </aside>
  );
}
