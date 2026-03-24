"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ChevronDown, ChevronUp, Package } from "lucide-react";
import type {
  PlannerSummary,
  SummaryMaterial,
} from "@/lib/types/ascension/userPlanner.types";
import { MATERIAL_CATEGORY_ORDER } from "./constants";

interface SummaryPanelProps {
  summary: PlannerSummary | null;
  loading: boolean;
  onEditInventory: () => void;
}

function MaterialRow({ mat }: { mat: SummaryMaterial }) {
  const pct =
    mat.total_needed > 0
      ? Math.min(100, (mat.have / mat.total_needed) * 100)
      : 100;
  const done = mat.remaining === 0;

  return (
    <div
      className={`flex items-center gap-2.5 py-2 border-b border-zinc-50 last:border-0 ${done ? "opacity-50" : ""}`}
    >
      {/* Item icon */}
      <div className="w-7 h-7 rounded-lg bg-zinc-100 shrink-0 overflow-hidden border border-zinc-200">
        {mat.image ? (
          <img
            src={mat.image}
            alt={mat.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={12} className="text-zinc-400" />
          </div>
        )}
      </div>

      {/* Name + progress bar */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-zinc-700 truncate">
          {mat.name}
        </p>
        <div className="h-1 mt-1 rounded-full bg-zinc-100 overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${done ? "bg-emerald-400" : "bg-yellow-400"}`}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Have / Need */}
      <div className="text-right shrink-0">
        <span
          className={`text-xs font-mono ${done ? "text-emerald-500" : mat.have > 0 ? "text-yellow-600" : "text-zinc-400"}`}
        >
          {mat.have.toLocaleString()}
        </span>
        <span className="text-xs font-mono text-zinc-300"> / </span>
        <span className="text-xs font-mono text-zinc-600 font-semibold">
          {mat.total_needed.toLocaleString()}
        </span>
      </div>
    </div>
  );
}

function CategorySection({
  category,
  materials,
}: {
  category: string;
  materials: SummaryMaterial[];
}) {
  const [open, setOpen] = useState(true);
  const done = materials.filter((m) => m.remaining === 0).length;

  return (
    <div className="mb-3">
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between py-1.5 group"
      >
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-zinc-400 group-hover:text-zinc-600 transition-colors">
            {category}
          </span>
          <span className="text-[10px] font-mono text-zinc-300">
            {done}/{materials.length}
          </span>
        </div>
        {open ? (
          <ChevronUp size={11} className="text-zinc-300" />
        ) : (
          <ChevronDown size={11} className="text-zinc-300" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            {materials.map((m) => (
              <MaterialRow key={m.item_id} mat={m} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SummaryPanel({
  summary,
  loading,
  onEditInventory,
}: SummaryPanelProps) {
  // Group materials by category in display order
  const grouped = (() => {
    if (!summary) return [];
    const map = new Map<string, SummaryMaterial[]>();
    for (const m of summary.materials) {
      const list = map.get(m.category) ?? [];
      list.push(m);
      map.set(m.category, list);
    }
    // Sort by defined order, then any remaining categories
    const ordered: Array<[string, SummaryMaterial[]]> = [];
    for (const cat of MATERIAL_CATEGORY_ORDER) {
      if (map.has(cat)) ordered.push([cat, map.get(cat)!]);
    }
    for (const [cat, mats] of map) {
      if (!MATERIAL_CATEGORY_ORDER.includes(cat)) ordered.push([cat, mats]);
    }
    return ordered;
  })();

  const totalRemaining =
    summary?.materials.reduce((s, m) => s + m.remaining, 0) ?? 0;

  return (
    <div className="flex flex-col h-full">
      {/* Panel header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400 mb-0.5">
            [ MATERIALS NEEDED ]
          </p>
          <h2 className="text-base font-black text-zinc-900">Summary</h2>
        </div>
        <motion.button
          onClick={onEditInventory}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 hover:text-yellow-600 transition-colors px-2 py-1 rounded-lg hover:bg-yellow-50"
        >
          Edit Inventory
        </motion.button>
      </div>

      {/* Credits + EXP totals */}
      {summary && (
        <div className="grid grid-cols-2 gap-2 mb-4">
          {[
            {
              label: "Credits",
              value: Number(summary.total_credits_needed).toLocaleString(),
            },
            {
              label: "EXP",
              value: Number(summary.total_exp_needed).toLocaleString(),
            },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="bg-zinc-50 border border-zinc-100 rounded-xl p-3"
            >
              <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-1">
                {label}
              </p>
              <p className="text-sm font-black text-zinc-900 font-mono">
                {value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Status line */}
      {summary && (
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 h-px bg-zinc-100" />
          <span
            className={`text-[10px] font-mono ${totalRemaining === 0 ? "text-emerald-500" : "text-zinc-400"}`}
          >
            {totalRemaining === 0
              ? "ALL MATERIALS READY"
              : `${totalRemaining.toLocaleString()} items needed`}
          </span>
          <div className="flex-1 h-px bg-zinc-100" />
        </div>
      )}

      {/* Material list */}
      <div className="flex-1 overflow-y-auto min-h-0 pr-1">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={20} className="animate-spin text-zinc-300" />
          </div>
        ) : !summary || summary.materials.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Package size={28} className="text-zinc-200 mb-3" />
            <p className="text-sm font-semibold text-zinc-300">
              No materials needed
            </p>
            <p className="text-xs text-zinc-300 mt-1">
              Add operators or weapons to see requirements
            </p>
          </div>
        ) : (
          grouped.map(([cat, mats]) => (
            <CategorySection key={cat} category={cat} materials={mats} />
          ))
        )}
      </div>
    </div>
  );
}
