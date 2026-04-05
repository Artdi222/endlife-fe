"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  CalendarCheck,
  ArrowLeftCircle,
  Menu,
  X,
  TrendingUp,
  Users,
  Sword,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { authApi } from "@/lib/api/auth.api";

const navItems = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Characters", href: "/dashboard/characters", icon: Users },
  { label: "Weapons", href: "/dashboard/weapons", icon: Sword },
  { label: "Daily", href: "/dashboard/daily", icon: CalendarCheck },
  { label: "Planner", href: "/dashboard/planner", icon: TrendingUp },
];

const NavContent = ({
  pathname,
  onNavigate,
  handleLogout,
}: {
  pathname: string;
  onNavigate?: () => void;
  handleLogout: () => void;
}) => (
  <>
    <nav className="flex-1 px-3 py-5 flex flex-col gap-1">
      {navItems.map(({ label, href, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link key={href} href={href} onClick={onNavigate}>
            <motion.div
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.97 }}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer
                ${
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

    <div className="p-3 border-t border-zinc-100 flex flex-col">
      <button
        onClick={handleLogout}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-zinc-400 hover:text-red-400 hover:bg-red-400/10 transition-all"
      >
        <ArrowLeftCircle size={17} strokeWidth={2.2} /> Logout
      </button>
    </div>
  </>
);

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    authApi.logout();
    router.replace("/sign-in");
  };

 

  return (
    <>
      {/* Desktop */}
      <aside className="fixed left-0 top-0 h-screen w-56 bg-white border-r border-yellow-200 flex-col z-50 hidden lg:flex">
        <div className="px-6 py-7 border-b border-yellow-100">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl text-yellow-300">⬡</span>
            <span className="text-lg font-extrabold text-zinc-900 tracking-tight">
              EndLife
            </span>
          </div>
        </div>
        <NavContent pathname={pathname} handleLogout={handleLogout} />
      </aside>

      {/* Mobile topbar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-yellow-200 flex items-center gap-3 px-4 py-3">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setMobileOpen((v) => !v)}
          className="p-2 rounded-xl text-zinc-500 hover:bg-yellow-50 hover:text-zinc-900 transition-colors"
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <X size={22} strokeWidth={2.2} />
          ) : (
            <Menu size={22} strokeWidth={2.2} />
          )}
        </motion.button>
        <div className="flex items-center gap-2.5">
          <span className="text-2xl text-yellow-300">⬡</span>
          <span className="text-lg font-extrabold text-zinc-900 tracking-tight">
            EndLife
          </span>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="lg:hidden fixed left-0 top-0 h-screen w-56 bg-white border-r border-yellow-200 flex flex-col z-50"
            >
              <div className="px-6 py-7 border-b border-yellow-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl text-yellow-300">⬡</span>
                  <span className="text-lg font-extrabold text-zinc-900 tracking-tight">
                    EndLife
                  </span>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setMobileOpen(false)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
                >
                  <X size={18} strokeWidth={2.2} />
                </motion.button>
              </div>
              <NavContent
                pathname={pathname}
                handleLogout={handleLogout}
                onNavigate={() => setMobileOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
