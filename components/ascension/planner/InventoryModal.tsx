"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Package, Loader2, Search, Plus, Minus } from "lucide-react";
import type { SummaryMaterial } from "@/lib/types/ascension/userPlanner.types";
import type { Item } from "@/lib/types";
import { MATERIAL_CATEGORY_ORDER } from "./constants";

interface InventoryModalProps {
  materials: SummaryMaterial[];
  creditItem: Item | null;
  creditOwned: number;
  creditNeeded: number;
  onClose: () => void;
  onSave: (
    items: Array<{ item_id: number; quantity: number }>,
  ) => Promise<void>;
}

export default function InventoryModal({
  materials,
  creditItem,
  creditOwned,
  creditNeeded,
  onClose,
  onSave,
}: InventoryModalProps) {
  const [quantities, setQuantities] = useState<Record<number, number>>(() =>
    Object.fromEntries(materials.map((m) => [m.item_id, m.have])),
  );

  const [localCreditOwned, setLocalCreditOwned] = useState(creditOwned)
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  useEffect(() => setLocalCreditOwned(creditOwned), [creditOwned]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const items: Array<{ item_id: number; quantity: number }> =
        Object.entries(quantities).map(([id, qty]) => ({
          item_id: Number(id),
          quantity: qty,
        }));
      if (creditItem) {
        const existing = items.findIndex((i) => i.item_id === creditItem.id);
        if (existing >= 0) items[existing].quantity = localCreditOwned;
        else items.push({ item_id: creditItem.id, quantity: localCreditOwned });
      }
      await onSave(items);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const filteredMaterials = (catItems: SummaryMaterial[]) => {
    return catItems.filter((m) =>
      m.name.toLowerCase().includes(search.toLowerCase())
    );
  };

  const HighlightText = ({ text, highlight }: { text: string; highlight: string }) => {
    if (!highlight.trim()) return <>{text}</>;
    const regex = new RegExp(`(${highlight})`, "gi");
    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <span key={i} className="bg-yellow-200 text-zinc-900 rounded-sm px-0.5">
              {part}
            </span>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </>
    );
  };

  const grouped = (() => {
    const map = new Map<string, SummaryMaterial[]>();
    for (const m of materials) {
      if (m.category === "Currency") continue;
      const list = map.get(m.category) ?? [];
      list.push(m);
      map.set(m.category, list);
    }
    const ordered: Array<[string, SummaryMaterial[]]> = [];
    for (const cat of MATERIAL_CATEGORY_ORDER) {
      if (map.has(cat)) ordered.push([cat, map.get(cat)!]);
    }
    for (const [cat, mats] of map) {
      if (!MATERIAL_CATEGORY_ORDER.includes(cat)) ordered.push([cat, mats]);
    }
    return ordered;
  })();

  const Stepper = ({
    value,
    onChange,
    needed,
  }: {
    value: number;
    onChange: (v: number) => void;
    needed: number;
  }) => {
    const [tempValue, setTempValue] = useState<string>(value.toString());
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const done = value >= needed;

    // Keep tempValue in sync with external value changes (e.g. from +/- buttons)
    useEffect(() => {
      setTempValue(value.toString());
    }, [value]);

    const handleCommit = () => {
      const parsed = Math.max(0, parseInt(tempValue) || 0);
      onChange(parsed);
      setTempValue(parsed.toString());
    };

    const stopCounter = useCallback(() => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }, []);

    const startCounter = useCallback((dir: number) => {
      stopCounter();
      onChange(Math.max(0, value + dir));
      let currentVal = value + dir;
      let count = 0;
      timerRef.current = setInterval(() => {
        count++;
        // Speed up over time
        const step = count > 10 ? 5 : 1;
        currentVal = Math.max(0, currentVal + (dir * step));
        onChange(currentVal);
      }, 100);
    }, [onChange, stopCounter, value]);

    useEffect(() => {
      return () => stopCounter();
    }, [stopCounter]);

    return (
      <div className="flex items-center bg-zinc-100/80 p-0.5 rounded-xl border border-zinc-200 shadow-sm group min-w-[124px]">
        <button
          onMouseDown={() => startCounter(-1)}
          onMouseUp={stopCounter}
          onMouseLeave={stopCounter}
          className="w-8 h-8 rounded-lg bg-white text-zinc-500 hover:text-red-500 hover:shadow-sm active:scale-95 transition-all flex items-center justify-center border border-zinc-100"
        >
          <Minus size={12} strokeWidth={3} />
        </button>
        <input
          type="number"
          min={0}
          value={tempValue}
          onWheel={(e) => {
             e.preventDefault();
             const dir = e.deltaY < 0 ? 1 : -1;
             onChange(Math.max(0, value + dir));
          }}
          onChange={(e) => setTempValue(e.target.value)}
          onBlur={handleCommit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleCommit();
              (e.target as HTMLInputElement).blur();
            }
          }}
          className={`flex-1 min-w-[60px] max-w-[80px] text-center text-[13px] font-black bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-colors px-1
            ${done ? "text-emerald-600" : "text-zinc-800"}`}
        />
        <button
          onMouseDown={() => startCounter(1)}
          onMouseUp={stopCounter}
          onMouseLeave={stopCounter}
          className="w-8 h-8 rounded-lg bg-white text-zinc-500 hover:text-emerald-500 hover:shadow-sm active:scale-95 transition-all flex items-center justify-center border border-zinc-100"
        >
          <Plus size={12} strokeWidth={3} />
        </button>
      </div>
    );
  };

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
        className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-zinc-100 shrink-0 bg-zinc-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-yellow-400 flex items-center justify-center text-zinc-900 shadow-lg shadow-yellow-200">
               <Package size={24} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-600">
                Logistics Hub
              </p>
              <h2 className="text-xl font-black text-zinc-900">
                Material Inventory
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

        {/* Search */}
        <div className="px-8 py-4 border-b border-zinc-100 shrink-0 bg-white">
          <div className="relative group">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-yellow-500 transition-colors"
            />
            <input
              ref={searchInputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search assets by name..."
              className="w-full bg-zinc-100/50 border-2 border-zinc-100 rounded-2xl pl-12 pr-4 py-3 text-sm font-semibold text-zinc-800 placeholder-zinc-400 outline-none focus:border-yellow-300 focus:bg-white transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 px-8 py-6 space-y-10 custom-scrollbar">
          {/* Currency Section */}
          <AnimatePresence mode="popLayout">
            {creditItem && (!search || creditItem.name.toLowerCase().includes(search.toLowerCase())) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="h-px bg-zinc-100" />
                  <p className="text-l font-black uppercase text-zinc-800">
                    Currency
                  </p>
                  <div className="h-px bg-zinc-100" />
                </div>
                
                <div className="p-4 rounded-3xl border-2 border-zinc-100 hover:border-yellow-200 bg-white transition-all group">
                   <div className="flex items-center gap-4">
                     <div className="w-14 h-14 rounded-2xl bg-zinc-50 shrink-0 overflow-hidden border border-zinc-100 p-1 group-hover:scale-105 transition-transform">
                        {creditItem.image ? (
                          <img
                            src={creditItem.image}
                            alt={creditItem.name}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl font-black text-zinc-300">₵</div>
                        )}
                     </div>
                     <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-zinc-900 truncate group-hover:text-yellow-600 transition-colors">
                          <HighlightText text={creditItem.name} highlight={search} />
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-black bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-full uppercase tracking-wider">Need: {creditNeeded.toLocaleString()}</span>
                        </div>
                     </div>
                     <Stepper
                        value={localCreditOwned}
                        onChange={setLocalCreditOwned}
                        needed={creditNeeded}
                     />
                   </div>
                   {/* Progress Bar */}
                   <div className="mt-4 h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (localCreditOwned / creditNeeded) * 100)}%` }}
                        className={`h-full transition-all ${localCreditOwned >= creditNeeded ? "bg-emerald-400" : "bg-yellow-400"}`}
                      />
                   </div>
                </div>
              </motion.div>
            )}

            {/* Other Materials Grouped by Category */}
            {grouped.map(([cat, mats]) => {
              const filtered = filteredMaterials(mats);
              if (filtered.length === 0) return null;

              return (
                <div key={cat} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-px bg-zinc-100" />
                    <p className="text-l font-black uppercase text-zinc-800">
                      {cat}
                    </p>
                    <div className="h-px bg-zinc-100" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filtered.map((m) => {
                      const qty = quantities[m.item_id] ?? 0;
                      const done = qty >= m.total_needed;
                      return (
                        <motion.div
                          key={m.item_id}
                          layout
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className={`p-4 rounded-3xl border-2 transition-all flex flex-col group relative overflow-hidden
                            ${done ? "bg-emerald-50/30 border-emerald-100" : "bg-white border-zinc-100 hover:border-yellow-200"}`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-zinc-50 shrink-0 overflow-hidden border border-zinc-100 p-1 group-hover:scale-105 transition-transform">
                              {m.image ? (
                                <img
                                  src={m.image}
                                  alt={m.name}
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package size={20} className="text-zinc-200" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-bold text-zinc-900 truncate group-hover:text-yellow-600 transition-colors tracking-tight">
                                <HighlightText text={m.name} highlight={search} />
                              </h4>
                              <p className="text-[10px] font-black text-zinc-400 mt-0.5 uppercase tracking-widest">
                                Need: <span className="text-zinc-600">{m.total_needed.toLocaleString()}</span>
                              </p>
                            </div>
                            <Stepper
                              value={qty}
                              onChange={(v) => setQuantities(prev => ({ ...prev, [m.item_id]: v }))}
                              needed={m.total_needed}
                            />
                          </div>
                          
                          {/* Progress bar info overlay */}
                          {qty > 0 && (
                            <div className="mt-3 relative h-1 bg-zinc-100 rounded-full overflow-hidden">
                               <motion.div 
                                 className={`absolute left-0 top-0 h-full ${done ? "bg-emerald-400" : "bg-yellow-400 shadow-[0_0_8px_rgba(234,179,8,0.5)]"}`}
                                 initial={{ width: 0 }}
                                 animate={{ width: `${Math.min(100, (qty / m.total_needed) * 100)}%` }}
                               />
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Empty State */}
            {materials.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-200 border border-zinc-100">
                  <Package size={40} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-zinc-400 uppercase tracking-tighter">Manifest Empty</h3>
                  <p className="text-xs font-semibold text-zinc-400 mt-1">No tracked logistics materials in current plan.</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex gap-4 px-8 py-6 border-t border-zinc-100 shrink-0 bg-zinc-50/80 backdrop-blur-md">
          <button
            onClick={onClose}
            className="flex-1 py-4 rounded-2xl border-2 border-zinc-200 text-zinc-500 text-sm font-black uppercase tracking-widest hover:bg-white hover:border-zinc-300 transition-all active:scale-95"
          >
            Cancel
          </button>
          <motion.button
            onClick={handleSave}
            disabled={saving}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 py-4 rounded-2xl bg-yellow-400 text-zinc-900 text-sm font-black uppercase tracking-widest hover:bg-yellow-300 transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl shadow-yellow-400/20 active:shadow-none"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : null}
            Save Inventory
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
