"use client";
import { useEffect, useState } from "react";
import { motion} from "framer-motion";
import { categoriesApi, groupsApi, subGroupsApi, tasksApi } from "@/lib/api";

const statDefs = [
  { label: "Categories", icon: "◈", key: "categories" },
  { label: "Groups", icon: "◫", key: "groups" },
  { label: "Sub Groups", icon: "◧", key: "subGroups" },
  { label: "Tasks", icon: "✦", key: "tasks" },
] as const;

export default function AdminDashboard() {
  const [counts, setCounts] = useState({
    categories: 0,
    groups: 0,
    subGroups: 0,
    tasks: 0,
  });

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const catRes = await categoriesApi.getAll();
        const cats = catRes.data ?? [];
        const groupArrays = await Promise.all(
          cats.map((c) => groupsApi.getByCategoryId(c.id)),
        );
        const allGroups = groupArrays.flatMap((r) => r.data ?? []);
        const subArrays = await Promise.all(
          allGroups.map((g) => subGroupsApi.getByGroupId(g.id)),
        );
        const allSubs = subArrays.flatMap((r) => r.data ?? []);
        const taskArrays = await Promise.all(
          allGroups.map((g) => tasksApi.getByGroupId(g.id)),
        );
        const allTasks = taskArrays.flatMap((r) => r.data ?? []);
        setCounts({
          categories: cats.length,
          groups: allGroups.length,
          subGroups: allSubs.length,
          tasks: allTasks.length,
        });
      } catch (e) {
        console.error("Failed to load dashboard counts", e);
      }
    };
    fetchAll();
  }, []);

  return (
    <>
      {/* Dashboard */}
      <motion.div
        initial={{ opacity: 0 }}
        transition={{ duration: 0.7 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Dashboard
          </h1>
          <p className="text-zinc-500 text-sm mt-1 font-mono">
            Endfield checklist data overview
          </p>
        </div>

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-10">
          {statDefs.map((s, i) => (
            <motion.div
              key={s.key}
              initial={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="relative bg-zinc-900 border border-zinc-800 rounded-xl p-6 overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-yellow-300" />
              <div className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-3">
                {s.label}
              </div>
              <div className="text-5xl font-extrabold text-yellow-300">
                {counts[s.key]}
              </div>
              <div className="absolute top-4 right-4 text-3xl opacity-10">
                {s.icon}
              </div>
            </motion.div>
          ))}
        </div>

        <p className="text-zinc-600 text-sm font-mono">
          Use the sidebar to manage your checklist data.
        </p>
      </motion.div>
    </>
  );
}
