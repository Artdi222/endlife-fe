"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Search, X, Loader2, User } from "lucide-react";
import type { Character } from "@/lib/types";
import type { AddUserCharacterDTO } from "@/lib/types/ascension/userPlanner.types";
import { charactersApi } from "@/lib/api/ascension/character.api";
import Image from "next/image";

interface AddCharacterModalProps {
  existingIds: number[];
  onClose: () => void;
  onAdd: (dto: AddUserCharacterDTO) => Promise<void>;
}

const RARITY_COLOR: Record<number, string> = {
  6: "text-yellow-500",
  5: "text-orange-400",
  4: "text-purple-400",
  3: "text-blue-400",
};

export default function AddCharacterModal({
  existingIds,
  onClose,
  onAdd,
}: AddCharacterModalProps) {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    charactersApi
      .getAll()
      .then((res) => setCharacters(res.data))
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

  const available = characters
    .filter((c) => !existingIds.includes(c.id))
    .filter(
      (c) =>
        !search ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.element?.toLowerCase().includes(search.toLowerCase()) ||
        c.class?.toLowerCase().includes(search.toLowerCase()),
    );

  const [error, setError] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!selected) return;
    setAdding(true);
    setError(null);
    try {
      await onAdd({ character_id: selected.id });
      onClose();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to add operator. Please try again.");
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
              [ ADD OPERATOR ]
            </p>
            <h2 className="text-base font-black text-zinc-900">
              Select Operator
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
              placeholder="Search operator, element, class…"
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3 py-2 text-sm text-zinc-800 placeholder-zinc-400 outline-none focus:border-yellow-400 transition-colors"
            />
          </div>
        </div>

        {/* Character list */}
        <div className="overflow-y-auto max-h-72 px-3 py-2">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 size={20} className="animate-spin text-zinc-300" />
            </div>
          ) : available.length === 0 ? (
            <p className="text-sm text-zinc-400 text-center py-8">
              No operators found
            </p>
          ) : (
            available.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelected(c)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all mb-1 ${
                  selected?.id === c.id
                    ? "bg-yellow-50 border border-yellow-300"
                    : "hover:bg-zinc-50 border border-transparent"
                }`}
              >
                <div className="w-9 h-9 rounded-lg overflow-hidden bg-zinc-100 shrink-0 border border-zinc-200">
                  {c.icon ? (
                    <Image
                      width={128}
                      height={128}
                      src={c.icon}
                      alt={c.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User size={14} className="text-zinc-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-zinc-900 truncate">
                    {c.name}
                  </p>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-mono ${RARITY_COLOR[c.rarity] ?? "text-zinc-400"}`}
                    >
                      {Array.from({ length: c.rarity }).map(
                        (_, i) => (
                          <Image
                            width={16}
                            height={16}
                            key={i}
                            src="/icon/star-icon.png"
                            alt="star"
                            className="inline w-4 h-4"
                          />
                        ),
                      )}
                    </span>
                    {c.element && (
                      <span className="text-[10px] font-mono text-zinc-400">
                        {c.element}
                      </span>
                    )}
                    {c.class && (
                      <span className="text-[10px] font-mono px-1 rounded bg-zinc-100 text-zinc-500">
                        {c.class}
                      </span>
                    )}
                  </div>
                </div>
                {selected?.id === c.id && (
                  <span className="text-yellow-500 text-sm shrink-0">✓</span>
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
            className="flex-1 py-2.5 rounded-xl bg-yellow-300 text-zinc-900 text-sm font-bold hover:bg-yellow-400 transition-all flex items-center justify-center gap-2 disabled:opacity-40"
          >
            {adding ? <Loader2 size={14} className="animate-spin" /> : null}
            Add to Plan
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
