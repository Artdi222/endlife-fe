"use client"
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Sword, Search, Filter, ArrowUpDown } from "lucide-react";
import { weaponsApi } from "@/lib/api/ascension/weapon.api";
import type { Weapon } from "@/lib/types";

export default function WeaponsPage() {
  const [weapons, setWeapons] = useState<Weapon[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Filters
  const [rarityFilter, setRarityFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Sorting
  const [sortBy, setSortBy] = useState<string>("default");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    weaponsApi
      .getAll()
      .then((res: any) => {
        setWeapons(res.data as Weapon[]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredAndSorted = useMemo(() => {
    let result = [...weapons];

    // Filter by name
    if (searchQuery) {
      result = result.filter((w) =>
        w.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by rarity
    if (rarityFilter !== "all") {
      result = result.filter((w) => w.rarity === parseInt(rarityFilter));
    }

    // Filter by type
    if (typeFilter !== "all") {
      result = result.filter((w) => w.type?.toLowerCase() === typeFilter.toLowerCase());
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === "rarity") {
        comparison = b.rarity - a.rarity;
      } else {
        // Default to order_index
        comparison = a.order_index - b.order_index;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [weapons, searchQuery, rarityFilter, typeFilter, sortBy, sortOrder]);

const GET_RARITY_GRADIENT = (rarity: number) => {
  if (rarity === 6) return "linear-gradient(135deg, #FF9D2E 0%, #852D00 100%)";
  if (rarity === 5) return "linear-gradient(135deg, #FBE041 0%, #B58400 100%)";
  if (rarity === 4) return "linear-gradient(135deg, #A35DFF 0%, #4A148C 100%)";
  return "linear-gradient(135deg, #E0E0E0 0%, #9E9E9E 100%)";
};

const RARITIES = [6, 5, 4, 3];

  const weaponTypes = useMemo(() => {
    const types = new Set(weapons.map(w => w.type));
    return Array.from(types).sort();
  }, [weapons]);

  const FilterPill = ({ 
    active, 
    onClick, 
    label 
  }: { 
    active: boolean; 
    onClick: () => void; 
    label: string | number; 
  }) => (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border whitespace-nowrap
        ${active 
          ? "bg-zinc-900 border-zinc-900 text-white shadow-md scale-105" 
          : "bg-zinc-50 border-zinc-200 text-zinc-400 hover:bg-white hover:border-zinc-300"}`}
    >
      {label}
    </button>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 relative p-10 pb-20">
      {/* Dynamic technical background highlights */}
      <div className="absolute top-40 right-10 w-64 h-64 bg-yellow-400/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-10 left-20 w-80 h-80 bg-zinc-100/40 blur-[130px] pointer-events-none" />

      {/* Header */}
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-px bg-yellow-400" />
          <span
            style={{
              fontFamily: "monospace",
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.25em",
              textTransform: "uppercase",
              color: "#999",
            }}
          >
            Armory Database / Combat Assets
          </span>
        </div>
        
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <h1 className="text-5xl font-black text-zinc-900 tracking-tighter leading-none mb-4">
              Weapons
            </h1>
            <p className="text-zinc-500 text-sm max-w-xl leading-relaxed">
              Browse and access detailed intel on all registered <span className="text-zinc-900 font-bold">{weapons.length} Endfield weaponry</span>. High-performance gear designed for extreme environmental versatility.
            </p>
          </div>
        </div>
      </div>

      {/* Filter & Sort Bar */}
      <div className="bg-white/80 backdrop-blur-md border border-zinc-200 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col gap-6">
          {/* Search */}
          <div className="relative group">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors"
            />
            <input
              type="text"
              placeholder="Search by Weapons Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-zinc-50 border-2 border-zinc-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-900/50 transition-all font-bold"
            />
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
               <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest shrink-0">Grade:</span>
               <FilterPill active={rarityFilter === "all"} onClick={() => setRarityFilter("all")} label="All Grade" />
               {RARITIES.map(r => (
                 <FilterPill key={r} active={rarityFilter === r.toString()} onClick={() => setRarityFilter(r.toString())} label={`${r}★`} />
               ))}
            </div>

            <div className="flex items-center gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
               <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest shrink-0">Asset Type:</span>
               <FilterPill active={typeFilter === "all"} onClick={() => setTypeFilter("all")} label="All Types" />
               {weaponTypes.map(t => (
                 <FilterPill 
                   key={t} 
                   active={typeFilter.toLowerCase() === t.toLowerCase()} 
                   onClick={() => setTypeFilter(t.toLowerCase())} 
                   label={t} 
                 />
               ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-zinc-100 pt-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Sort By:</span>
              <select
                className="bg-zinc-100/50 border border-zinc-200 rounded-lg px-2 py-1 text-xs font-bold text-zinc-700 focus:outline-none cursor-pointer"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="default">Default</option>
                <option value="name">Name</option>
                <option value="rarity">Rarity</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Order:</span>
              <select
                className="bg-zinc-100/50 border border-zinc-200 rounded-lg px-2 py-1 text-xs font-bold text-zinc-700 focus:outline-none cursor-pointer"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
              >
                <option value="asc">ASC</option>
                <option value="desc">DESC</option>
              </select>
            </div>
          </div>

          <div className="text-[10px] font-mono text-zinc-400 bg-zinc-100 px-2 py-1 rounded">
            ASSET_COUNT: {filteredAndSorted.length}
          </div>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest animate-pulse">Scanning Armory...</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredAndSorted.map((weapon, i) => (
              <motion.div
                layout
                key={weapon.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2, delay: i * 0.02 }}
              >
                <Link href={`/dashboard/weapons/${weapon.id}`}>
                  <div className="group relative bg-white border border-zinc-200 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-yellow-400/5 hover:-translate-y-1 transition-all duration-300">
                    {/* Image Container */}
                    <div 
                      className="aspect-square relative p-4 flex items-center justify-center overflow-hidden"
                      style={{ background: GET_RARITY_GRADIENT(weapon.rarity) }}
                    >
                      {/* Technical Label Overlay */}
                      <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/30 backdrop-blur-md border border-white/10 rounded text-[8px] text-white font-mono uppercase tracking-widest opacity-90">
                        {weapon.type}
                      </div>

                      {/* Weapon Icon */}
                      {weapon.icon ? (
                        <img
                          src={weapon.icon}
                          alt={weapon.name}
                          className="w-full h-full object-contain filter drop-shadow-2xl group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="text-white/20 font-black text-6xl">?</div>
                      )}

                      {/* Star rating overlay */}
                      <div className="absolute bottom-2 right-2 flex items-center gap-0.5">
                        {Array.from({ length: weapon.rarity }).map((_, st) => (
                          <img
                            key={st}
                            src="/icon/star-icon.png"
                            alt="star"
                            className="w-2 h-2 drop-shadow-md filter brightness-200"
                          />
                        ))}
                      </div>
                    </div>

                    {/* Info block */}
                    <div className="p-3 bg-white border-t border-white/5">
                      <h3 className="font-bold text-sm text-zinc-900 group-hover:text-yellow-400 transition-colors line-clamp-1 tracking-tight">
                        {weapon.name}
                      </h3>
                      <div className="mt-1 flex items-center justify-between opacity-50">
                        <span className="text-[9px] uppercase text-zinc-400 font-bold tracking-wider">
                          {weapon.type}
                        </span>
                      </div>
                    </div>

                    {/* Hover indicator side bar */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {filteredAndSorted.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
            <Sword size={24} className="text-zinc-300" />
          </div>
          <h3 className="text-lg font-bold text-zinc-900">No Weapons Matches Records</h3>
          <p className="text-zinc-500 text-sm max-w-xs mt-1">Review your filtering parameters or attempt an alternative classification search.</p>
          <button 
            onClick={() => {
              setSearchQuery("");
              setRarityFilter("all");
              setTypeFilter("all");
            }}
            className="mt-6 px-4 py-2 bg-yellow-400 text-black text-xs font-black uppercase tracking-widest rounded-lg hover:bg-yellow-500 transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}
