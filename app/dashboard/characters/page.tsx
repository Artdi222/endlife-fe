"use client"
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Search, Filter, ArrowUpDown, ChevronDown } from "lucide-react";
import { charactersApi } from "@/lib/api/ascension/character.api";
import type { Character } from "@/lib/types";

export default function CharactersPage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Filters
  const [rarityFilter, setRarityFilter] = useState<string>("all");
  const [classFilter, setClassFilter] = useState<string>("all");
  const [elementFilter, setElementFilter] = useState<string>("all");

  // Sorting
  const [sortBy, setSortBy] = useState<string>("default");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    charactersApi
      .getAll()
      .then((res: any) => {
        setCharacters(res.data as Character[]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredAndSorted = useMemo(() => {
    let result = [...characters];

    // Filter by name
    if (searchQuery) {
      result = result.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by rarity
    if (rarityFilter !== "all") {
      result = result.filter((c) => c.rarity === parseInt(rarityFilter));
    }

    // Filter by class
    if (classFilter !== "all") {
      result = result.filter((c) => c.class?.toLowerCase() === classFilter.toLowerCase());
    }

    // Filter by element
    if (elementFilter !== "all") {
      result = result.filter((c) => c.element?.toLowerCase() === elementFilter.toLowerCase());
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
  }, [characters, searchQuery, rarityFilter, classFilter, elementFilter, sortBy, sortOrder]);

const GET_RARITY_GRADIENT = (rarity: number) => {
  if (rarity === 6) return "linear-gradient(135deg, #FF9D2E 0%, #852D00 100%)";
  if (rarity === 5) return "linear-gradient(135deg, #FBE041 0%, #B58400 100%)";
  if (rarity === 4) return "linear-gradient(135deg, #A35DFF 0%, #4A148C 100%)";
  return "linear-gradient(135deg, #E0E0E0 0%, #9E9E9E 100%)";
};

const CLASSES = ["Vanguard", "Striker", "Guard", "Defender", "Caster", "Supporter"];
const ELEMENTS = ["Physical", "Heat", "Cryo", "Electric", "Nature"];
const RARITIES = [6, 5, 4];

  const FilterPill = ({ 
    active, 
    onClick, 
    label, 
    icon 
  }: { 
    active: boolean; 
    onClick: () => void; 
    label: string | number; 
    icon?: string 
  }) => (
    <button
      onClick={onClick}
      className={`pl-3 pr-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border flex items-center gap-2 whitespace-nowrap
        ${active 
          ? "bg-yellow-400 border-yellow-500 text-zinc-900 shadow-md shadow-yellow-400/20 scale-105" 
          : "bg-zinc-50 border-zinc-200 text-zinc-400 hover:bg-white hover:border-zinc-300"}`}
    >
      {icon && <img src={icon} alt="" className="w-3.5 h-3.5 object-contain" />}
      {label}
    </button>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 relative p-10 pb-20">
      {/* Dynamic technical background highlights */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-zinc-200/40 blur-[130px] pointer-events-none" />

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
            Operator Database / Field Intel
          </span>
        </div>
        
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <h1 className="text-5xl font-black text-zinc-900 tracking-tighter leading-none mb-4">
              Operators
            </h1>
            <p className="text-zinc-500 text-sm max-w-xl leading-relaxed">
              There are <span className="text-zinc-900 font-bold">{characters.length} Operators</span> currently indexed. Each character offering a unique playstyle via their roles and weapons, as well as an <span className="text-yellow-600 font-semibold underline decoration-yellow-400/30">elemental specialty</span>.
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
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-yellow-500 transition-colors"
            />
            <input
              type="text"
              placeholder="Search by Name, Description, etc..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-zinc-50 border-2 border-zinc-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-yellow-400/5 focus:border-yellow-400/50 transition-all font-bold"
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
               <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest shrink-0">Class:</span>
               <FilterPill active={classFilter === "all"} onClick={() => setClassFilter("all")} label="All Class" />
               {CLASSES.map(c => (
                 <FilterPill 
                   key={c} 
                   active={classFilter.toLowerCase() === c.toLowerCase()} 
                   onClick={() => setClassFilter(c.toLowerCase())} 
                   label={c} 
                   icon={`/class/${c.toLowerCase()}.webp`}
                 />
               ))}
            </div>

            <div className="flex items-center gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
               <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest shrink-0">Element:</span>
               <FilterPill active={elementFilter === "all"} onClick={() => setElementFilter("all")} label="All Element" />
               {ELEMENTS.map(e => (
                 <FilterPill 
                   key={e} 
                   active={elementFilter.toLowerCase() === e.toLowerCase()} 
                   onClick={() => setElementFilter(e.toLowerCase())} 
                   label={e} 
                   icon={`/element/${e.toLowerCase()}.webp`}
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
            Character Found : {filteredAndSorted.length}
          </div>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-lg animate-spin" />
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest animate-pulse">Initializing Data...</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredAndSorted.map((char, i) => (
              <motion.div
                layout
                key={char.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2, delay: i * 0.02 }}
              >
                <Link href={`/dashboard/characters/${char.id}`}>
                  <div className="group relative bg-white border border-zinc-200 rounded-lg overflow-hidden hover:shadow-xl hover:shadow-yellow-400/5 hover:-translate-y-1 transition-all duration-300">
                    {/* Image Container */}
                    <div 
                      className="aspect-4/5 relative p-0 flex items-center justify-center overflow-hidden"
                      style={{ background: GET_RARITY_GRADIENT(char.rarity) }}
                    >
                      {/* Technical Detail Overlays */}
                      <div className="absolute top-0 right-0 p-1.5 z-20 flex flex-col gap-1">
                        {char.class && (
                          <div className="w-6 h-6 rounded-lg flex items-center justify-center">
                            <img
                              src={`/class/${char.class.toLowerCase()}.webp`}
                              alt={char.class}
                              className="w-full h-full object-contain filter brightness-200"
                            />
                          </div>
                        )}
                        {char.element && (
                          <div className="w-6 h-6 rounded-lg flex items-center justify-center">
                            <img
                              src={`/element/${char.element.toLowerCase()}.webp`}
                              alt={char.element}
                              className="w-full h-full object-contain"
                            />
                          </div>
                        )}
                      </div>

                      {/* Character Icon */}
                      {char.icon ? (
                        <img
                          src={char.icon}
                          alt={char.name}
                          className="absolute px-2 pt-2 inset-0 w-full h-full object-cover mix-blend-normal group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="text-white/20 font-black text-6xl">?</div>
                      )}

                      {/* Bottom Grade bar */}
                      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-linear-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                      
                      {/* Star rating overlay moved into image */}
                      <div className="absolute bottom-2 left-2 flex items-center gap-0.5 z-20">
                        {Array.from({ length: char.rarity }).map((_, st) => (
                          <img
                            key={st}
                            src="/icon/star-icon.png"
                            alt="star"
                            className="w-2.5 h-2.5 drop-shadow-lg filter brightness-200"
                          />
                        ))}
                      </div>
                    </div>

                    {/* Info block */}
                    <div className="p-3 bg-white flex flex-col gap-1 border-t border-white/5">
                      <div className="flex items-center gap-1.5">
                         {char.element && (
                          <img
                            src={`/element/${char.element.toLowerCase()}.webp`}
                            alt={char.element}
                            className="w-3.5 h-3.5 object-contain"
                          />
                        )}
                        <h3 className="font-bold text-sm text-zinc-800 group-hover:text-yellow-400 transition-colors line-clamp-1 tracking-tight">
                          {char.name}
                        </h3>
                      </div>
                      
                      <div className="mt-1 flex items-center justify-between opacity-60">
                        <span className="text-[9px] uppercase text-zinc-400 font-bold tracking-wider truncate">
                          {char.class} • {char.faction || "ENDFIELD"}
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
            <Filter size={24} className="text-zinc-300" />
          </div>
          <h3 className="text-lg font-bold text-zinc-900">No Operators Match Your Intel</h3>
          <p className="text-zinc-500 text-sm max-w-xs mt-1">Adjust your filters or try a different search term to find hidden registered personnel.</p>
          <button 
            onClick={() => {
              setSearchQuery("");
              setRarityFilter("all");
              setClassFilter("all");
              setElementFilter("all");
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
