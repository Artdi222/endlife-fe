import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Loader2, Sword, Filter, CheckCircle2 } from "lucide-react";
import type { Weapon } from "@/lib/types";
import type { AddUserWeaponDTO } from "@/lib/types/ascension/userPlanner.types";
import { weaponsApi } from "@/lib/api/ascension/weapon.api";
import Image from "next/image";

interface AddWeaponModalProps {
  existingIds: number[];
  onClose: () => void;
  onAdd: (dto: AddUserWeaponDTO) => Promise<void>;
}

const GET_RARITY_GRADIENT = (rarity: number) => {
  if (rarity === 6) return "linear-gradient(135deg, #FF9D2E 0%, #852D00 100%)";
  if (rarity === 5) return "linear-gradient(135deg, #FBE041 0%, #B58400 100%)";
  if (rarity === 4) return "linear-gradient(135deg, #A35DFF 0%, #4A148C 100%)";
  return "linear-gradient(135deg, #E0E0E0 0%, #9E9E9E 100%)";
};

const RARITIES = [6, 5, 4, 3];

export default function AddWeaponModal({
  existingIds,
  onClose,
  onAdd,
}: AddWeaponModalProps) {
  const [weapons, setWeapons] = useState<Weapon[]>([]);
  const [search, setSearch] = useState("");
  const [rarityFilter, setRarityFilter] = useState<number | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);

  const [selected, setSelected] = useState<Weapon | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    weaponsApi
      .getAll()
      .then((res) => setWeapons(res.data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (searchRef.current) searchRef.current.focus();
  }, [loading]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  const weaponTypes = useMemo(() => {
    const types = new Set(weapons.map(w => w.type));
    return Array.from(types).sort();
  }, [weapons]);

  const available = useMemo(() => {
    return weapons
      .filter((w) => !existingIds.includes(w.id))
      .filter((w) => {
        const matchesSearch = !search || w.name.toLowerCase().includes(search.toLowerCase());
        const matchesRarity = !rarityFilter || w.rarity === rarityFilter;
        const matchesType = !typeFilter || w.type === typeFilter;
        return matchesSearch && matchesRarity && matchesType;
      });
  }, [weapons, existingIds, search, rarityFilter, typeFilter]);

  const handleAdd = async () => {
    if (!selected) return;
    setAdding(true);
    setError(null);
    try {
      await onAdd({ weapon_id: selected.id });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add weapon");
    } finally {
      setAdding(false);
    }
  };

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
      className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border flex items-center gap-2 whitespace-nowrap
        ${active 
          ? "bg-zinc-900 border-zinc-900 text-white shadow-md scale-105" 
          : "bg-zinc-50 border-zinc-200 text-zinc-400 hover:bg-white hover:border-zinc-300"}`}
    >
      {label}
    </button>
  );

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.18 }}
        className="bg-white rounded-4xl w-full max-w-5xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-zinc-100 shrink-0 bg-zinc-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center text-white shadow-lg shadow-zinc-200">
               <Sword size={24} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                Armory Intel
              </p>
              <h2 className="text-xl font-black text-zinc-900">
                Deploy Combat Asset
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-2xl text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-all border border-transparent hover:border-zinc-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search & Filters */}
        <div className="px-8 py-5 border-b border-zinc-100 shrink-0 bg-white space-y-4">
          <div className="relative group">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-600 transition-colors"
            />
            <input
              ref={searchRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by weapon model..."
              className="w-full bg-zinc-100/50 border-2 border-zinc-100 rounded-2xl pl-12 pr-4 py-3 text-sm font-semibold text-zinc-800 placeholder-zinc-400 outline-none focus:border-zinc-300 focus:bg-white transition-all shadow-sm"
            />
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mr-2 shrink-0">Grade:</span>
              <FilterPill active={rarityFilter === null} onClick={() => setRarityFilter(null)} label="All" />
              {RARITIES.map(r => (
                <FilterPill key={r} active={rarityFilter === r} onClick={() => setRarityFilter(r)} label={`${r}★`} />
              ))}
              
              <div className="w-px h-4 bg-zinc-200 mx-2 shrink-0" />
              
              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mr-2 shrink-0">Type:</span>
              <FilterPill active={typeFilter === null} onClick={() => setTypeFilter(null)} label="All" />
              {weaponTypes.map(t => (
                <FilterPill 
                  key={t} 
                  active={typeFilter === t} 
                  onClick={() => setTypeFilter(t)} 
                  label={t} 
                />
              ))}
            </div>
          </div>
        </div>

        {/* Weapon list */}
        <div className="overflow-y-auto flex-1 px-8 py-6 custom-scrollbar bg-zinc-50/30">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 size={32} className="animate-spin text-zinc-400" />
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Accessing Armory Database...</p>
            </div>
          ) : available.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
               <div className="w-16 h-16 rounded-3xl bg-zinc-100 flex items-center justify-center text-zinc-300">
                  <Filter size={32} />
               </div>
               <div>
                  <h3 className="text-base font-black text-zinc-400 uppercase tracking-tighter">No Assets Found</h3>
                  <p className="text-xs text-zinc-400 mt-1">Adjust filters to find available combat gear.</p>
               </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
              <AnimatePresence mode="popLayout">
                {available.map((w) => (
                  <motion.button
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    key={w.id}
                    onClick={() => setSelected(w)}
                    className={`group relative flex flex-col rounded-xl overflow-hidden border-2 transition-all text-left bg-white
                      ${selected?.id === w.id 
                        ? "border-zinc-900 shadow-lg shadow-zinc-900/10 -translate-y-1" 
                        : "border-zinc-100 hover:border-zinc-300 hover:-translate-y-0.5"}`}
                  >
                    {/* Visual Area */}
                    <div 
                      className="aspect-square relative flex items-center justify-center p-3 overflow-hidden"
                      style={{ background: GET_RARITY_GRADIENT(w.rarity) }}
                    >
                       {/* Type Overlay */}
                       <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-black/30 backdrop-blur-md border border-white/10 rounded-[4px] text-[7px] text-white font-black uppercase tracking-widest opacity-90">
                        {w.type}
                      </div>

                      {w.icon ? (
                        <img
                          src={w.icon}
                          alt={w.name}
                          className="w-full h-full object-contain filter drop-shadow-2xl transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <Sword size={32} className="text-white/20" />
                      )}

                      <div className="absolute bottom-1 right-1 flex gap-0.5">
                        {Array.from({ length: w.rarity }).map((_, i) => (
                          <img key={i} src="/icon/star-icon.png" alt="" className="w-2 h-2 filter brightness-200 shrink-0" />
                        ))}
                      </div>

                      {/* Selected Indicator */}
                      {selected?.id === w.id && (
                        <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-[1px] flex items-center justify-center">
                           <div className="bg-white text-zinc-900 rounded-full p-1.5 shadow-2xl">
                              <CheckCircle2 size={18} strokeWidth={3} />
                           </div>
                        </div>
                      )}
                    </div>

                    {/* Meta Area */}
                    <div className="p-2 border-t border-zinc-50">
                       <h4 className={`text-[11px] font-black truncate tracking-tight transition-colors ${selected?.id === w.id ? "text-zinc-900" : "text-zinc-800"}`}>
                        {w.name}
                       </h4>
                       <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">
                         {w.type}
                       </p>
                    </div>
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-4 px-8 py-5 border-t border-zinc-100 shrink-0 bg-zinc-50/80 backdrop-blur-md">
          {error && (
             <div className="flex-1 text-xs text-red-500 font-bold bg-red-50 px-4 py-3 rounded-2xl border border-red-100 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                {error}
             </div>
          )}
          <div className="flex gap-3 ml-auto w-full max-w-sm">
            <button
              onClick={onClose}
              className="flex-1 py-3.5 rounded-2xl border-2 border-zinc-200 text-zinc-500 text-xs font-black uppercase tracking-widest hover:bg-white transition-all active:scale-95"
            >
              Cancel
            </button>
            <motion.button
              onClick={handleAdd}
              disabled={!selected || adding}
              whileHover={selected ? { scale: 1.02 } : {}}
              whileTap={selected ? { scale: 0.98 } : {}}
              className="flex-2 py-3.5 px-8 rounded-2xl bg-zinc-900 text-white text-xs font-black uppercase tracking-widest hover:bg-zinc-800 transition-all flex items-center justify-center gap-3 disabled:opacity-40 shadow-xl shadow-zinc-900/20 active:shadow-none"
            >
              {adding ? <Loader2 size={16} className="animate-spin" /> : null}
              Confirm
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
