"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Search, X, Loader2, Sword } from "lucide-react";
import type { Weapon } from "@/lib/types";
import type { AddUserWeaponDTO } from "@/lib/types/ascension/userPlanner.types";
import { weaponsApi } from "@/lib/api/ascension/weapon.api";

interface AddWeaponModalProps {
  existingIds: number[];
  onClose: () => void;
  onAdd: (dto: AddUserWeaponDTO) => Promise<void>;
}

const RARITY_COLOR: Record<number, string> = {
  6: "text-yellow-500",
  5: "text-orange-400",
  4: "text-purple-400",
  3: "text-blue-400",
};

export default function AddWeaponModal({
  existingIds,
  onClose,
  onAdd,
}: AddWeaponModalProps) {
  const [weapons, setWeapons] = useState<Weapon[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Weapon | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    weaponsApi
      .getAll()
      .then((res) => setWeapons(res.data))
      .finally(() => setLoading(false));
    searchRef.current?.focus();
  }, []);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  const available = weapons
    .filter((w) => !existingIds.includes(w.id))
    .filter(
      (w) =>
        !search ||
        w.name.toLowerCase().includes(search.toLowerCase()) ||
        w.type?.toLowerCase().includes(search.toLowerCase()),
    );

  const [error, setError] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!selected) return;
    setAdding(true);
    setError(null);
    try {
      await onAdd({ weapon_id: selected.id });
      onClose();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to add weapon. Please try again.");
      }
    } finally {
      setAdding(false);
    }
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
        className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-zinc-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400">
              [ ADD WEAPON ]
            </p>
            <h2 className="text-base font-black text-zinc-900">
              Select Weapon
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
        <div className="px-5 py-3 border-b border-zinc-100">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            <input
              ref={searchRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search weapon or type…"
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3 py-2 text-sm text-zinc-800 placeholder-zinc-400 outline-none focus:border-yellow-400 transition-colors"
            />
          </div>
        </div>

        {/* Weapon list */}
        <div className="overflow-y-auto max-h-72 px-3 py-2">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 size={20} className="animate-spin text-zinc-300" />
            </div>
          ) : available.length === 0 ? (
            <p className="text-sm text-zinc-400 text-center py-8">
              No weapons found
            </p>
          ) : (
            available.map((w) => (
              <button
                key={w.id}
                onClick={() => setSelected(w)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all mb-1 ${
                  selected?.id === w.id
                    ? "bg-zinc-50 border border-zinc-300"
                    : "hover:bg-zinc-50 border border-transparent"
                }`}
              >
                <div className="w-9 h-9 rounded-lg overflow-hidden bg-zinc-100 shrink-0 border border-zinc-200 flex items-center justify-center">
                  {w.icon ? (
                    <img
                      src={w.icon}
                      alt={w.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Sword size={14} className="text-zinc-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-zinc-900 truncate">
                    {w.name}
                  </p>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-mono ${RARITY_COLOR[w.rarity] ?? "text-zinc-400"}`}
                    >
                      {Array.from({ length: w.rarity }).map((_, i) => (
                        <img
                          key={i}
                          src="/icon/star-icon.png"
                          alt="star"
                          className="inline w-4 h-4"
                        />
                      ))}
                    </span>
                    {w.type && (
                      <span className="text-[10px] font-mono px-1 rounded bg-zinc-100 text-zinc-500">
                        {w.type}
                      </span>
                    )}
                  </div>
                </div>
                {selected?.id === w.id && (
                  <span className="text-zinc-500 text-sm shrink-0">✓</span>
                )}
              </button>
            ))
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="px-5 pb-2">
            <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="flex gap-2 px-5 py-4 border-t border-zinc-100">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-zinc-200 text-zinc-500 text-sm font-semibold hover:border-zinc-300 transition-all"
          >
            Cancel
          </button>
          <motion.button
            onClick={handleAdd}
            disabled={!selected || adding}
            whileHover={selected ? { scale: 1.02 } : {}}
            whileTap={selected ? { scale: 0.97 } : {}}
            className="flex-1 py-2.5 rounded-xl bg-zinc-900 text-white text-sm font-bold hover:bg-zinc-700 transition-all flex items-center justify-center gap-2 disabled:opacity-40"
          >
            {adding ? <Loader2 size={14} className="animate-spin" /> : null}
            Add to Plan
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
