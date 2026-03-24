"use client";
import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { X, Package, Loader2, Search } from "lucide-react";
import type { SummaryMaterial } from "@/lib/types/ascension/userPlanner.types";
import { MATERIAL_CATEGORY_ORDER } from "./constants";

interface InventoryModalProps {
  materials: SummaryMaterial[]; // from summary — shows only what's needed
  onClose: () => void;
  onSave: (
    items: Array<{ item_id: number; quantity: number }>,
  ) => Promise<void>;
}

export default function InventoryModal({
  materials,
  onClose,
  onSave,
}: InventoryModalProps) {
  // Local quantities keyed by item_id — start with what user already has
  const [quantities, setQuantities] = useState<Record<number, number>>(() =>
    Object.fromEntries(materials.map((m) => [m.item_id, m.have])),
  );
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  const set = useCallback((itemId: number, val: number) => {
    setQuantities((p) => ({ ...p, [itemId]: Math.max(0, val) }));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const items = Object.entries(quantities).map(([id, qty]) => ({
        item_id: Number(id),
        quantity: qty,
      }));
      await onSave(items);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  useCallback(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  // Group and filter
  const grouped = (() => {
    const map = new Map<string, SummaryMaterial[]>();
    for (const m of materials) {
      if (search && !m.name.toLowerCase().includes(search.toLowerCase()))
        continue;
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
        className="bg-white rounded-2xl w-full max-w-lg shadow-xl border border-zinc-200 overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 shrink-0">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400">
              [ INVENTORY ]
            </p>
            <h2 className="text-base font-black text-zinc-900">
              Set Owned Quantities
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-zinc-100 shrink-0">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter materials…"
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3 py-2 text-sm text-zinc-800 placeholder-zinc-400 outline-none focus:border-yellow-400 transition-colors"
            />
          </div>
        </div>

        {/* Material list */}
        <div className="overflow-y-auto flex-1 px-5 py-3">
          {materials.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Package size={24} className="text-zinc-200 mb-2" />
              <p className="text-sm text-zinc-400">
                No materials in your plan yet
              </p>
            </div>
          ) : grouped.length === 0 ? (
            <p className="text-sm text-zinc-400 text-center py-8">No results</p>
          ) : (
            grouped.map(([cat, mats]) => (
              <div key={cat} className="mb-4">
                <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-zinc-400 mb-2 pb-1 border-b border-zinc-100">
                  {cat}
                </p>
                <div className="flex flex-col gap-1.5">
                  {mats.map((m) => {
                    const qty = quantities[m.item_id] ?? 0;
                    const done = qty >= m.total_needed;
                    return (
                      <div key={m.item_id} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-zinc-100 shrink-0 overflow-hidden border border-zinc-200">
                          {m.image ? (
                            <img
                              src={m.image}
                              alt={m.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package size={12} className="text-zinc-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-zinc-700 truncate">
                            {m.name}
                          </p>
                          <p className="text-[10px] font-mono text-zinc-400">
                            Need: {m.total_needed.toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => set(m.item_id, qty - 1)}
                            className="w-6 h-6 rounded-lg bg-zinc-100 text-zinc-500 hover:bg-zinc-200 text-sm font-bold transition-colors flex items-center justify-center"
                          >
                            −
                          </button>
                          <input
                            type="number"
                            min={0}
                            value={qty}
                            onChange={(e) =>
                              set(m.item_id, Number(e.target.value))
                            }
                            className={`w-16 text-center text-xs font-mono border rounded-lg px-1 py-1 outline-none transition-colors ${
                              done
                                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                : "bg-zinc-50 border-zinc-200 text-zinc-800 focus:border-yellow-400"
                            }`}
                          />
                          <button
                            onClick={() => set(m.item_id, qty + 1)}
                            className="w-6 h-6 rounded-lg bg-zinc-100 text-zinc-500 hover:bg-zinc-200 text-sm font-bold transition-colors flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-5 py-4 border-t border-zinc-100 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-zinc-200 text-zinc-500 text-sm font-semibold hover:border-zinc-300 transition-all"
          >
            Cancel
          </button>
          <motion.button
            onClick={handleSave}
            disabled={saving}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="flex-1 py-2.5 rounded-xl bg-yellow-300 text-zinc-900 text-sm font-bold hover:bg-yellow-400 transition-all flex items-center justify-center gap-2 disabled:opacity-40"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : null}
            Save Inventory
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
