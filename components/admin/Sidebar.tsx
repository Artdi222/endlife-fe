"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowLeftCircle,
  LayoutDashboard,
  Users,
  ChevronRight,
  CalendarCheck,
  Layers,
  Zap,
  Globe,
} from "lucide-react";
import { authApi } from "@/lib/api/auth.api";

interface NavItem {
  label: string;
  href: string;
}
interface NavGroup {
  label: string;
  icon: React.ReactNode;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: "User Master",
    icon: <Users size={15} />,
    items: [{ label: "Users", href: "/admin/users" }],
  },
  {
    label: "Daily Master",
    icon: <CalendarCheck size={15} />,
    items: [
      { label: "Categories", href: "/admin/categories" },
      { label: "Groups", href: "/admin/groups" },
      { label: "Sub Groups", href: "/admin/sub-groups" },
      { label: "Tasks", href: "/admin/tasks" },
    ],
  },
  {
    label: "General Master",
    icon: <Layers size={15} />,
    items: [
      { label: "Characters", href: "/admin/characters" },
      { label: "Weapons", href: "/admin/weapons" },
      { label: "Items", href: "/admin/items" },
      { label: "News Banners", href: "/admin/news" },
    ],
  },
  {
    label: "Ascension Master",
    icon: <Zap size={15} />,
    items: [
      { label: "Char. Stages", href: "/admin/ascension/character-stages" },
      { label: "Weapon Stages", href: "/admin/ascension/weapon-stages" },
      { label: "Skills", href: "/admin/ascension/skills" },
      { label: "Skill Levels", href: "/admin/ascension/skill-levels" },
      { label: "Level Costs", href: "/admin/ascension/level-costs" },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const toggle = (label: string) =>
    setOpen((prev) => ({ ...prev, [label]: !prev[label] }));

  const handleLogout = () => {
    authApi.logout();
    router.replace("/sign-in");
  };

  return (
    <aside className="fixed top-0 left-0 h-screen w-56 bg-zinc-900 border-r border-zinc-800 flex flex-col z-50">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-zinc-800">
        <span className="text-3xl text-yellow-300">⬡</span>
        <div>
          <div className="text-sm font-bold text-white tracking-wide">
            EndLife
          </div>
          <div className="text-xs text-zinc-500 font-mono uppercase tracking-widest">
            Admin
          </div>
        </div>
      </div>

      <div className="px-3 pt-3">
        <Link
          href="/admin"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all
            ${pathname === "/admin" ? "bg-yellow-300/10 text-yellow-300" : "text-zinc-400 hover:text-white hover:bg-zinc-800"}`}
        >
          <LayoutDashboard size={15} />
          Dashboard
        </Link>
      </div>

      <nav className="flex-1 flex flex-col gap-1 p-3 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {navGroups.map((group) => {
          const isOpen = open[group.label] ?? false;
          const hasActive = group.items.some((i) => pathname === i.href);
          return (
            <div key={group.label}>
              <button
                onClick={() => toggle(group.label)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-all
                  ${hasActive ? "text-yellow-300" : "text-zinc-400 hover:text-white hover:bg-zinc-800"}`}
              >
                <div className="flex items-center gap-2.5">
                  {group.icon}
                  <span>{group.label}</span>
                </div>
                <ChevronRight
                  size={13}
                  className={`transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-200 ease-in-out ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
              >
                <div className="ml-4 pl-4 border-l border-zinc-800 mt-1 mb-1 flex flex-col gap-0.5">
                  {group.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all
                        ${pathname === item.href ? "bg-yellow-300/10 text-yellow-300 font-semibold" : "text-zinc-500 hover:text-white hover:bg-zinc-800"}`}
                    >
                      <span className="text-xs opacity-40">—</span>
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/5 space-y-2">
        <Link
          href="/dashboard"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-zinc-400 hover:text-white hover:bg-white/5 transition-all border border-transparent hover:border-white/10"
        >
          <Globe size={16} strokeWidth={2.2} /> Public Home
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-zinc-500 hover:text-red-400 hover:bg-red-400/10 transition-all"
        >
          <ArrowLeftCircle size={16} strokeWidth={2.2} /> Logout
        </button>
      </div>
    </aside>
  );
}
