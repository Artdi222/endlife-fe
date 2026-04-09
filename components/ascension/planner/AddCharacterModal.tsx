import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Loader2, User, Filter, CheckCircle2 } from "lucide-react";
import type { Character } from "@/lib/types";
import type { AddUserCharacterDTO } from "@/lib/types/ascension/userPlanner.types";
import { charactersApi } from "@/lib/api/ascension/character.api";
import Image from "next/image";

interface AddCharacterModalProps {
  existingIds: number[];
  onClose: () => void;
  onAdd: (dto: AddUserCharacterDTO) => Promise<void>;
}

const GET_RARITY_GRADIENT = (rarity: number) => {
  if (rarity === 6) return "linear-gradient(135deg, #FF9D2E 0%, #852D00 100%)";
  if (rarity === 5) return "linear-gradient(135deg, #FBE041 0%, #B58400 100%)";
  if (rarity === 4) return "linear-gradient(135deg, #A35DFF 0%, #4A148C 100%)";
  return "linear-gradient(135deg, #E0E0E0 0%, #9E9E9E 100%)";
};

const CLASSES = [
  "Vanguard",
  "Striker",
  "Guard",
  "Defender",
  "Caster",
  "Supporter",
];
const ELEMENTS = ["Physical", "Heat", "Cryo", "Electric", "Nature"];
const RARITIES = [6, 5, 4];

export default function AddCharacterModal({
  existingIds,
  onClose,
  onAdd,
}: AddCharacterModalProps) {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [search, setSearch] = useState("");
  const [rarityFilter, setRarityFilter] = useState<number | null>(null);
  const [classFilter, setClassFilter] = useState<string | null>(null);
  const [elementFilter, setElementFilter] = useState<string | null>(null);

  const [selected, setSelected] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    charactersApi
      .getAll()
      .then((res) => setCharacters(res.data))
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

  const available = useMemo(() => {
    return characters
      .filter((c) => !existingIds.includes(c.id))
      .filter((c) => {
        const matchesSearch =
          !search || c.name.toLowerCase().includes(search.toLowerCase());
        const matchesRarity = !rarityFilter || c.rarity === rarityFilter;
        const matchesClass = !classFilter || c.class === classFilter;
        const matchesElement = !elementFilter || c.element === elementFilter;
        return matchesSearch && matchesRarity && matchesClass && matchesElement;
      });
  }, [
    characters,
    existingIds,
    search,
    rarityFilter,
    classFilter,
    elementFilter,
  ]);

  const handleAdd = async () => {
    if (!selected) return;
    setAdding(true);
    setError(null);
    try {
      await onAdd({ character_id: selected.id });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add operator");
    } finally {
      setAdding(false);
    }
  };

  const FilterPill = ({
    active,
    onClick,
    label,
    icon,
  }: {
    active: boolean;
    onClick: () => void;
    label: string | number;
    icon?: string;
  }) => (
    <button
      onClick={onClick}
      className={`pl-3 pr-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border flex items-center gap-2 whitespace-nowrap
        ${
          active
            ? "bg-yellow-400 border-yellow-500 text-zinc-900 shadow-md shadow-yellow-400/20 scale-105"
            : "bg-zinc-50 border-zinc-200 text-zinc-400 hover:bg-white hover:border-zinc-300"
        }`}
    >
      {icon && <img src={icon} alt="" className="w-3.5 h-3.5 object-contain" />}
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
            <div className="w-12 h-12 rounded-2xl bg-yellow-400 flex items-center justify-center text-zinc-900 shadow-lg shadow-yellow-200">
              <User size={24} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-600">
                Personnel Roster
              </p>
              <h2 className="text-xl font-black text-zinc-900">
                Register Operator
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
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-yellow-500 transition-colors"
            />
            <input
              ref={searchRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by code name..."
              className="w-full bg-zinc-100/50 border-2 border-zinc-100 rounded-2xl pl-12 pr-4 py-3 text-sm font-semibold text-zinc-800 placeholder-zinc-400 outline-none focus:border-yellow-300 focus:bg-white transition-all shadow-sm"
            />
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mr-2 shrink-0">
                Grade:
              </span>
              <FilterPill
                active={rarityFilter === null}
                onClick={() => setRarityFilter(null)}
                label="All"
              />
              {RARITIES.map((r) => (
                <FilterPill
                  key={r}
                  active={rarityFilter === r}
                  onClick={() => setRarityFilter(r)}
                  label={`${r}★`}
                />
              ))}

              <div className="w-px h-4 bg-zinc-200 mx-2 shrink-0" />

              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mr-2 shrink-0">
                Class:
              </span>
              <FilterPill
                active={classFilter === null}
                onClick={() => setClassFilter(null)}
                label="All"
              />
              {CLASSES.map((c) => (
                <FilterPill
                  key={c}
                  active={classFilter === c}
                  onClick={() => setClassFilter(c)}
                  label={c}
                  icon={`/class/${c.toLowerCase()}.webp`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mr-2 shrink-0">
                Element:
              </span>
              <FilterPill
                active={elementFilter === null}
                onClick={() => setElementFilter(null)}
                label="All"
              />
              {ELEMENTS.map((e) => (
                <FilterPill
                  key={e}
                  active={elementFilter === e}
                  onClick={() => setElementFilter(e)}
                  label={e}
                  icon={`/element/${e.toLowerCase()}.webp`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Character list */}
        <div className="overflow-y-auto flex-1 px-8 py-6 custom-scrollbar bg-zinc-50/30">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 size={32} className="animate-spin text-yellow-400" />
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">
                Synchronizing Intel...
              </p>
            </div>
          ) : available.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
              <div className="w-16 h-16 rounded-3xl bg-zinc-100 flex items-center justify-center text-zinc-300">
                <Filter size={32} />
              </div>
              <div>
                <h3 className="text-base font-black text-zinc-400 uppercase tracking-tighter">
                  No Matches Found
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Adjust filters to find available operators.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
              <AnimatePresence mode="popLayout">
                {available.map((c) => (
                  <motion.button
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    key={c.id}
                    onClick={() => setSelected(c)}
                    className={`group relative flex flex-col rounded-xl overflow-hidden border-2 transition-all text-left bg-white
                      ${
                        selected?.id === c.id
                          ? "border-yellow-400 shadow-lg shadow-yellow-400/10 -translate-y-1"
                          : "border-zinc-100 hover:border-yellow-200 hover:-translate-y-0.5"
                      }`}
                  >
                    {/* Portrait Area */}
                    <div
                      className="aspect-4/5 pt-1 px-1 relative overflow-hidden"
                      style={{ background: GET_RARITY_GRADIENT(c.rarity) }}
                    >
                      {c.icon ? (
                        <img
                          src={c.icon}
                          alt={c.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/30 font-black text-2xl">
                          ?
                        </div>
                      )}

                      {/* Overlays */}
                      <div className="absolute top-1 right-1 flex flex-col gap-1">
                        {c.class && (
                          <div className="w-5 h-5 rounded-md bg-black/20 backdrop-blur-md flex items-center justify-center p-0.5 border border-white/10">
                            <img
                              src={`/class/${c.class.toLowerCase()}.webp`}
                              alt=""
                              className="w-full h-full object-contain filter brightness-200"
                            />
                          </div>
                        )}
                        {c.element && (
                          <div className="w-5 h-5 rounded-md bg-black/20 backdrop-blur-md flex items-center justify-center p-0.5 border border-white/10">
                            <img
                              src={`/element/${c.element.toLowerCase()}.webp`}
                              alt=""
                              className="w-full h-full object-contain"
                            />
                          </div>
                        )}
                      </div>

                      {/* Bottom Grade bar */}
                      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-linear-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                      {/* Star rating overlay moved into image */}
                      <div className="absolute bottom-2 left-2 flex items-center gap-0.5 z-20">
                        {Array.from({ length: c.rarity }).map((_, st) => (
                          <img
                            key={st}
                            src="/icon/star-icon.png"
                            alt="star"
                            className="w-2.5 h-2.5 drop-shadow-lg filter brightness-200"
                          />
                        ))}
                      </div>

                      {/* Selected Indicator */}
                      {selected?.id === c.id && (
                        <div className="absolute inset-0 bg-yellow-400/20 backdrop-blur-[1px] flex items-center justify-center">
                          <div className="bg-yellow-400 text-zinc-900 rounded-full p-1.5 shadow-2xl">
                            <CheckCircle2 size={18} strokeWidth={3} />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Meta Area */}
                    <div className="p-2 border-t border-zinc-50">
                      <h4
                        className={`text-[11px] font-black truncate tracking-tight transition-colors ${selected?.id === c.id ? "text-yellow-600" : "text-zinc-800"}`}
                      >
                        {c.name}
                      </h4>
                      <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">
                        {c.class}
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
              className="flex-2 py-3.5 px-8 rounded-2xl bg-yellow-400 text-zinc-900 text-xs font-black uppercase tracking-widest hover:bg-yellow-300 transition-all flex items-center justify-center gap-3 disabled:opacity-40 shadow-xl shadow-yellow-400/20 active:shadow-none"
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
