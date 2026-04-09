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
  Newspaper,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { authApi } from "@/lib/api/auth.api";
import { useAuth } from "@/lib/hooks/useAuth";
import type { AuthUser } from "@/lib/types";

const navGroups = [
  {
    label: "Main",
    items: [
      { label: "Home", href: "/dashboard", icon: Home },
      { label: "Planner", href: "/dashboard/planner", icon: TrendingUp, activeColor: "bg-yellow-300", highlight: true },
    ],
  },
  {
    label: "Game Data",
    items: [
      { label: "Characters", href: "/dashboard/characters", icon: Users },
      { label: "Weapons", href: "/dashboard/weapons", icon: Sword },
    ],
  },
  {
    label: "Community & Tools",
    items: [
      { label: "Daily Tasks", href: "/dashboard/daily", icon: CalendarCheck },
      { label: "News", href: "/dashboard/news/latest", icon: Newspaper },
    ],
  },
];

const NavContent = ({
  pathname,
  onNavigate,
  handleLogout,
  user,
}: {
  pathname: string;
  onNavigate?: () => void;
  handleLogout: () => void;
  user?: AuthUser | null;
}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <>
      <nav className="flex-1 px-3 py-5 flex flex-col gap-6 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx}>
            <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">
              {group.label}
            </p>
            <div className="flex flex-col gap-1">
              {group.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                const isExact = item.href === "/dashboard" ? pathname === item.href : active;
                const activeClasses = item.activeColor ? `${item.activeColor} text-zinc-900 shadow-sm` : "bg-yellow-100 text-yellow-900 shadow-sm";

                return (
                  <Link key={item.href} href={item.href} onClick={onNavigate}>
                    <motion.div
                      whileHover={{ x: 3 }}
                      whileTap={{ scale: 0.97 }}
                      className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer
                        ${
                          isExact
                            ? activeClasses
                            : "text-zinc-500 hover:bg-zinc-100/70 hover:text-zinc-900"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon size={17} strokeWidth={2.2} className={item.highlight && !isExact ? "text-yellow-500" : ""} />
                        {item.label}
                      </div>
                      {item.highlight && !isExact && (
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.8)]" />
                      )}
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-zinc-100 flex flex-col gap-2 bg-zinc-50/50">
        {user ? (
          <div className="relative">
            <motion.div
              whileHover={{ y: -2 }}
              onClick={() => setUserMenuOpen((v) => !v)}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-white transition-all cursor-pointer border border-transparent hover:border-zinc-200 hover:shadow-sm"
            >
              <div className="w-10 h-10 rounded-full bg-yellow-100 border-2 border-yellow-300 overflow-hidden shrink-0 flex items-center justify-center">
                {user.profile_image ? (
                  <img src={user.profile_image} alt="User Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-yellow-600 font-bold uppercase">{user.username.substring(0, 2)}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-zinc-900 truncate">{user.username}</p>
                <p className="text-xs text-zinc-500 font-mono truncate">{user.email}</p>
              </div>
            </motion.div>

            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 5, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 5, scale: 0.95 }}
                  className="absolute bottom-[calc(100%+8px)] left-0 right-0 bg-white border border-zinc-200 rounded-xl shadow-xl overflow-hidden p-1 z-50 origin-bottom"
                >
                  <Link href="/dashboard/profile" onClick={() => { setUserMenuOpen(false); onNavigate?.(); }}>
                    <div className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 rounded-lg cursor-pointer transition-colors">
                      <UserIcon size={16} className="text-zinc-400" />
                      Edit Profile
                    </div>
                  </Link>
                  <div className="h-px bg-zinc-100 my-1 mx-2" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 w-full px-3 py-2 text-sm font-semibold text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
          >
            <ArrowLeftCircle size={15} strokeWidth={2.2} /> Sign In
          </button>
        )}
      </div>
    </>
  );
};

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
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
        <NavContent pathname={pathname} handleLogout={handleLogout} user={user} />
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
                  user={user}
                />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
