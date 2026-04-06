"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  categoriesApi,
  groupsApi,
  subGroupsApi,
  tasksApi,
  usersApi,
  newsBannersApi,
  charactersApi,
  weaponsApi,
  itemsApi,
} from "@/lib/api";
import {
  TrendingUp,
  Users,
  CalendarCheck,
  Layers,
  LayoutGrid,
  FileText,
  Activity,
  ChevronRight,
  Loader2,
} from "lucide-react";

interface DashboardStats {
  users: number;
  news: number;
  categories: number;
  groups: number;
  subGroups: number;
  tasks: number;
  characters: number;
  weapons: number;
  items: number;
}

const initialStats: DashboardStats = {
  users: 0,
  news: 0,
  categories: 0,
  groups: 0,
  subGroups: 0,
  tasks: 0,
  characters: 0,
  weapons: 0,
  items: 0,
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEverything = async () => {
      setLoading(true);
      try {
        const [
          usersRes,
          newsRes,
          catsRes,
          charsRes,
          weapsRes,
          itemsRes,
        ] = await Promise.all([
          usersApi.getAll(),
          newsBannersApi.getAll(),
          categoriesApi.getAll(),
          charactersApi.getAll(),
          weaponsApi.getAll(),
          itemsApi.getAll(),
        ]);

        const cats = catsRes.data ?? [];
        
        // Groups, SubGroups, and Tasks are usually fetched based on categories
        // We'll fetch all groups for all categories to get a total count
        const groupArrays = await Promise.all(
          cats.map((c) => groupsApi.getByCategoryId(c.id))
        );
        const allGroups = groupArrays.flatMap(r => r.data ?? []);

        const [subArrays, taskArrays] = await Promise.all([
          Promise.all(allGroups.map((g) => subGroupsApi.getByGroupId(g.id))),
          Promise.all(allGroups.map((g) => tasksApi.getByGroupId(g.id))),
        ]);

        const allSubs = subArrays.flatMap(r => r.data ?? []);
        const allTasks = taskArrays.flatMap(r => r.data ?? []);

        setStats({
          users: usersRes.data?.length ?? 0,
          news: newsRes.data?.length ?? 0,
          categories: cats.length,
          groups: allGroups.length,
          subGroups: allSubs.length,
          tasks: allTasks.length,
          characters: charsRes.data?.length ?? 0,
          weapons: weapsRes.data?.length ?? 0,
          items: itemsRes.data?.length ?? 0,
        });
      } catch (err) {
        console.error("Dashboard data fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEverything();
  }, []);

  return (
    <div className="relative min-h-full">
      {/* Background Decor */}
      <div className="absolute -top-10 -right-10 w-64 h-64 bg-yellow-400/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-20 -left-10 w-96 h-96 bg-yellow-400/5 blur-[120px] pointer-events-none" />

      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 relative"
      >
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-1 bg-yellow-300" />
          <span className="text-[10px] font-mono tracking-[0.3em] text-yellow-300 uppercase">System Overview</span>
        </div>
        <h1 className="text-4xl font-black text-white tracking-tight uppercase italic flex items-baseline gap-3">
          Control Center
          <span className="text-zinc-700 text-lg font-mono tracking-tighter not-italic">v1.0</span>
        </h1>
        <p className="text-zinc-500 mt-2 font-mono text-xs max-w-lg leading-relaxed uppercase tracking-widest">
          EndLife Administrative Interface
        </p>
      </motion.div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-4 opacity-50">
          <Loader2 className="animate-spin text-yellow-300" size={40} />
          <span className="text-xs font-mono tracking-widest uppercase">Synchronizing Neural Links...</span>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-12 pb-20"
        >
          {/* Main Stats Grid */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <Activity size={16} className="text-yellow-300" />
              <h2 className="text-sm font-mono uppercase tracking-[0.2em] text-zinc-400">Core Metrics</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <StatCard 
                label="Registered Personnel" 
                value={stats.users} 
                icon={<Users />} 
                desc="Active directory users"
                color="yellow"
              />
              <StatCard 
                label="News Broadcasts" 
                value={stats.news} 
                icon={<FileText />} 
                desc="Published banners & alerts"
                color="yellow"
              />
              <StatCard 
                label="System Health" 
                value="98.2" 
                unit="%" 
                icon={<TrendingUp />} 
                desc="Uptime & processing speed"
                color="emerald"
              />
            </div>
          </section>

          {/* Master Data Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <section>
              <div className="flex items-center gap-2 mb-6">
                <CalendarCheck size={16} className="text-yellow-300" />
                <h2 className="text-sm font-mono uppercase tracking-[0.2em] text-zinc-400">Daily Checklist Master Data</h2>
              </div>
              <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-md">
                <div className="p-6 grid grid-cols-2 gap-8 relative">
                  <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <LayoutGrid size={120} />
                  </div>
                  <MiniStat label="Categories" value={stats.categories} />
                  <MiniStat label="Groups" value={stats.groups} />
                  <MiniStat label="Sub-Groups" value={stats.subGroups} />
                  <MiniStat label="Total Tasks" value={stats.tasks} />
                </div>
                <div className="px-6 py-4 bg-white/5 border-t border-white/5 flex justify-between items-center group cursor-pointer hover:bg-white/10 transition-colors">
                  <span className="text-[10px] font-mono uppercase text-zinc-500">Configure checklist structure</span>
                  <ChevronRight size={14} className="text-zinc-600 group-hover:text-yellow-300 transition-colors" />
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-6">
                <Layers size={16} className="text-yellow-300" />
                <h2 className="text-sm font-mono uppercase tracking-[0.2em] text-zinc-400">General Master Data</h2>
              </div>
              <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-md">
                <div className="p-6 grid grid-cols-3 gap-6 relative">
                  <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <Layers size={100} />
                  </div>
                  <MiniStat label="Characters" value={stats.characters} />
                  <MiniStat label="Weapons" value={stats.weapons} />
                  <MiniStat label="Materials" value={stats.items} />
                </div>
                <div className="px-6 py-4 bg-white/5 border-t border-white/5 flex justify-between items-center group cursor-pointer hover:bg-white/10 transition-colors">
                  <span className="text-[10px] font-mono uppercase text-zinc-500">Manage assets library</span>
                  <ChevronRight size={14} className="text-zinc-600 group-hover:text-yellow-300 transition-colors" />
                </div>
              </div>
            </section>
          </div>

          {/* Quick Actions / Status Footer */}
          <footer className="mt-12 flex flex-wrap gap-4 items-center pt-8 border-t border-white/5">
             <p className="text-[10px] font-mono text-zinc-700">© 2026 ENDLIFE ADMIN PROTOCOL // ALL RIGHTS RESERVED to ARKNIGHTS: ENDFIELD</p>
          </footer>
        </motion.div>
      )}
    </div>
  );
}

function StatCard({ label, value, unit, icon, desc, color }: any) {
  const colorMap = {
    yellow: "text-yellow-300 border-yellow-300/20",
    emerald: "text-emerald-400 border-emerald-400/20",
  };
  
  return (
    <motion.div 
      whileHover={{ y: -4, borderColor: "rgba(253, 224, 71, 0.3)" }}
      className="bg-zinc-900/80 border border-white/5 rounded-2xl p-6 relative overflow-hidden backdrop-blur-xl transition-all"
    >
      <div className="flex justify-between items-start mb-6">
        <div className={`p-2.5 rounded-xl bg-white/5 ${colorMap[color as keyof typeof colorMap]?.split(' ')[0]}`}>
           {React.cloneElement(icon as any, { size: 20 })}
        </div>
        <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-600">Metric_ID: {(Math.random() * 1000).toFixed(0)}</div>
      </div>
      
      <div className="space-y-1">
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500">{label}</div>
        <div className="text-5xl font-black text-white flex items-baseline gap-1">
          {value}
          {unit && <span className="text-xl text-zinc-700 font-mono tracking-tighter italic">{unit}</span>}
        </div>
      </div>
      
      <p className="mt-4 text-[10px] font-mono text-zinc-600 uppercase tracking-wide leading-relaxed border-t border-white/5 pt-4">
        {desc}
      </p>

      {/* Decorative lines */}
      <div className="absolute bottom-0 right-0 w-24 h-24 border-b-2 border-r-2 border-white/5 rounded-br-2xl pointer-events-none" />
    </motion.div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1">
      <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-600">{label}</div>
      <div className="text-3xl font-black text-white group cursor-default">
        {String(value).padStart(2, '0')}
        <span className="inline-block w-1.5 h-1.5 bg-yellow-300 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
}
