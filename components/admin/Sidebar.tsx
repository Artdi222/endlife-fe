"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeftCircle } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

interface NavGroup {
  label: string;
  icon: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: "User Master",
    icon: "◉",
    items: [{ label: "Users", href: "/admin/users", icon: "→" }],
  },
  {
    label: "Daily Master",
    icon: "◈",
    items: [
      { label: "Categories", href: "/admin/categories", icon: "→" },
      { label: "Groups", href: "/admin/groups", icon: "→" },
      { label: "Sub Groups", href: "/admin/sub-groups", icon: "→" },
      { label: "Tasks", href: "/admin/tasks", icon: "→" },
    ],
  },
  {
    label: "General Master",
    icon: "◇",
    items: [
      { label: "Characters", href: "/admin/characters", icon: "→" },
      { label: "Weapons", href: "/admin/weapons", icon: "→" },
      { label: "Gears", href: "/admin/gears", icon: "→" },
      { label: "Items", href: "/admin/items", icon: "→" },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  // Track which groups are open — Daily Master open by default
  const [open, setOpen] = useState<Record<string, boolean>>({
    "Daily Master": true,
  });

  const toggle = (label: string) =>
    setOpen((prev) => ({ ...prev, [label]: !prev[label] }));

  // Check if any item in a group is active
  const groupHasActive = (group: NavGroup) =>
    group.items.some((item) => pathname === item.href);

  return (
    <aside className="fixed top-0 left-0 h-screen w-56 bg-zinc-900 border-r border-zinc-800 flex flex-col z-50">
      {/* Brand */}
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

      {/* Dashboard — standalone, always visible */}
      <div className="px-3 pt-3">
        <Link
          href="/admin"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all
            ${
              pathname === "/admin"
                ? "bg-yellow-300/10 text-yellow-300"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800"
            }`}
        >
          <span className="text-base w-5 text-center">▣</span>
          Dashboard
        </Link>
      </div>

      {/* Collapsible groups */}
      <nav className="flex-1 flex flex-col gap-1 p-3 overflow-y-auto">
        {navGroups.map((group) => {
          const isOpen = open[group.label] ?? false;
          const hasActive = groupHasActive(group);

          return (
            <div key={group.label}>
              {/* Group header */}
              <button
                onClick={() => toggle(group.label)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold transition-all
                  ${
                    hasActive
                      ? "text-yellow-300"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-base w-5 text-center">
                    {group.icon}
                  </span>
                  <span>{group.label}</span>
                </div>
                <span
                  className={`text-xs transition-transform duration-200 ${isOpen ? "rotate-90" : "rotate-0"}`}
                >
                  ›
                </span>
              </button>

              {/* Group items */}
              <div
                className={`overflow-hidden transition-all duration-200 ease-in-out ${
                  isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="ml-4 pl-4 border-l border-zinc-800 mt-1 mb-1 flex flex-col gap-0.5">
                  {group.items.map((item) => {
                    const active = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all
                          ${
                            active
                              ? "bg-yellow-300/10 text-yellow-300 font-semibold"
                              : "text-zinc-500 hover:text-white hover:bg-zinc-800"
                          }`}
                      >
                        <span className="text-xs opacity-40">—</span>
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-zinc-800">
        <button
          onClick={() => {
            localStorage.removeItem("admin_token");
            localStorage.removeItem("admin_role");
            router.push("/login");
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-zinc-400 hover:text-red-400 hover:bg-red-400/10 transition-all"
        >
          <ArrowLeftCircle size={17} strokeWidth={2.2} /> Logout
        </button>
      </div>
    </aside>
  );
}
