"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  ChevronDown,
  ChevronUp,
  Package,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import type {
  PlannerSummary,
  SummaryMaterial,
} from "@/lib/types/ascension/userPlanner.types";
import type { Item } from "@/lib/types";
import { MATERIAL_CATEGORY_ORDER } from "./constants";
import Image from "next/image";

interface SummaryPanelProps {
  summary: PlannerSummary | null;
  loading: boolean;
  creditItem: Item | null;
  creditOwned: number;
  onCreditChange: (qty: number) => void;
  onEditInventory: () => void;
}

function HeadlineInsight({
  totalRemaining,
  creditsRemaining,
  summary,
}: {
  totalRemaining: number;
  creditsRemaining: number;
  summary: PlannerSummary | null;
}) {
  if (!summary) return null;

  const isComplete = totalRemaining === 0 && creditsRemaining === 0;
  const totalItems =
    summary.materials.filter((m) => m.category !== "Currency").length +
    (Number(summary.total_credits_needed) > 0 ? 1 : 0);
  const itemsReady =
    summary.materials.filter(
      (m) => m.category !== "Currency" && m.remaining === 0,
    ).length + (creditsRemaining === 0 ? 1 : 0);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`mb-5 p-4 rounded-2xl border ${
        isComplete
          ? "bg-emerald-50/50 border-emerald-100 text-emerald-900"
          : "bg-zinc-50 border-zinc-100 text-zinc-900"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
            isComplete ? "bg-emerald-100 text-emerald-600" : "bg-white text-zinc-400"
          }`}
        >
          {isComplete ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold leading-tight">
            {isComplete ? "All Materials Ready" : "Missing Materials"}
          </h3>
          <p className="text-xs mt-1 text-zinc-500 leading-normal">
            {isComplete
              ? "You have everything needed for the current plan. Ready to upgrade!"
              : `${totalRemaining.toLocaleString()} units and ${creditsRemaining.toLocaleString()} credits still needed.`}
          </p>
          {!isComplete && (
            <div className="mt-3 flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full bg-zinc-200/50 overflow-hidden">
                <motion.div
                  className="h-full bg-yellow-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(itemsReady / totalItems) * 100}%` }}
                  transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
              <span className="text-[10px] font-mono font-bold text-zinc-400 shrink-0">
                {Math.round((itemsReady / totalItems) * 100)}%
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function MaterialRow({ mat }: { mat: SummaryMaterial }) {
  const pct =
    mat.total_needed > 0
      ? Math.min(100, (mat.have / mat.total_needed) * 100)
      : 100;
  const done = mat.remaining === 0;
  const criticallyMissing = mat.have === 0 && mat.total_needed > 0;

  return (
    <motion.div
      whileHover={{ scale: 1.01, x: 2 }}
      className={`flex items-center gap-2.5 py-2.5 px-2 -mx-2 rounded-xl transition-colors hover:bg-zinc-50 border-b border-transparent last:border-b-0 ${
        done ? "opacity-50" : ""
      }`}
    >
      <div className="w-8 h-8 rounded-lg bg-zinc-100 shrink-0 overflow-hidden border border-zinc-200 relative group-hover:border-zinc-300 transition-colors">
        {mat.image ? (
          <Image
            width={32}
            height={32}
            src={mat.image}
            alt={mat.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={14} className="text-zinc-400" />
          </div>
        )}
        {criticallyMissing && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-white rounded-full" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-xs font-semibold text-zinc-700 truncate">
            {mat.name}
          </p>
          {criticallyMissing && (
            <AlertCircle size={10} className="text-red-400 shrink-0" />
          )}
        </div>
        <div className="h-1 mt-1.5 rounded-full bg-zinc-100 overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${
              done ? "bg-emerald-400" : "bg-yellow-400"
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </div>
      <div className="text-right shrink-0">
        <span
          className={`text-xs font-mono font-bold ${
            done
              ? "text-emerald-500"
              : mat.have > 0
                ? "text-zinc-700"
                : "text-zinc-400"
          }`}
        >
          {mat.have.toLocaleString()}
        </span>
        <span className="text-[10px] font-mono text-zinc-300 mx-0.5">/</span>
        <span className="text-xs font-mono text-zinc-500 font-semibold">
          {mat.total_needed.toLocaleString()}
        </span>
      </div>
    </motion.div>
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
    <div className="mb-4">
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between py-2 group"
      >
        <div className="flex items-center gap-2">
          <div
            className={`w-1 h-3 rounded-full transition-colors ${
              open ? "bg-yellow-400" : "bg-zinc-200"
            }`}
          />
          <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-zinc-400 group-hover:text-zinc-600 transition-colors">
            {category}
          </span>
          <span className="text-[10px] font-mono text-zinc-300 ml-1">
            {done}/{materials.length}
          </span>
        </div>
        <div className="w-5 h-5 rounded-full border border-zinc-100 flex items-center justify-center group-hover:border-zinc-200 transition-colors">
          {open ? (
            <ChevronUp size={10} className="text-zinc-400" />
          ) : (
            <ChevronDown size={10} className="text-zinc-400" />
          )}
        </div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-1 pb-2">
              {materials.map((m) => (
                <MaterialRow key={m.item_id} mat={m} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CreditRow({
  creditItem,
  owned,
  needed,
}: {
  creditItem: Item | null;
  owned: number;
  needed: number;
  onChange: (qty: number) => void;
}) {
  const remaining = Math.max(0, needed - owned);
  const pct = needed > 0 ? Math.min(100, (owned / needed) * 100) : 100;
  const done = remaining === 0;

  return (
    <div
      className={`flex items-center gap-2.5 py-3 ${done ? "opacity-60" : ""}`}
    >
      {/* T-Creds icon */}
      <div className="w-8 h-8 rounded-lg bg-zinc-100 shrink-0 overflow-hidden border border-zinc-200">
        {creditItem?.image ? (
          <Image
            width={32}
            height={32}
            src={creditItem.image}
            alt={creditItem.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[10px] font-mono text-zinc-400">
            ₵
          </div>
        )}
      </div>

      {/* Name + progress */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-zinc-700 truncate">
          {creditItem?.name ?? "T-Creds"}
        </p>
        <div className="h-1 mt-1.5 rounded-full bg-zinc-100 overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${
              done ? "bg-emerald-400" : "bg-yellow-400"
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </div>

      {/* Inline "have" / need */}
      <div className="flex items-center gap-1 shrink-0">
        <span className="text-xs font-mono text-zinc-700 font-bold">
          {owned.toLocaleString()}
        </span>
        <span className="text-[10px] font-mono text-zinc-300">/</span>
        <span className="text-xs font-mono text-zinc-500 font-semibold">
          {needed.toLocaleString()}
        </span>
      </div>
    </div>
  );
}

export default function SummaryPanel({
  summary,
  loading,
  creditItem,
  creditOwned,
  onCreditChange,
  onEditInventory,
}: SummaryPanelProps) {
  // Group non-currency materials by category
  const grouped = (() => {
    if (!summary) return [];
    const map = new Map<string, SummaryMaterial[]>();
    for (const m of summary.materials) {
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

  const totalCreditsNeeded = Number(summary?.total_credits_needed ?? 0);
  const totalRemaining =
    summary?.materials
      .filter((m) => m.category !== "Currency")
      .reduce((s, m) => s + m.remaining, 0) ?? 0;
  const creditsRemaining = Math.max(0, totalCreditsNeeded - creditOwned);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400 mb-0.5">
            [ PROGRESS ]
          </p>
          <h2 className="text-lg font-black text-zinc-900">Plan Summary</h2>
        </div>
        <motion.button
          onClick={onEditInventory}
          whileHover={{ scale: 1.05, backgroundColor: "#fef9c3", borderColor: "#fde047" }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-zinc-200 bg-white text-[10px] font-bold uppercase tracking-wider text-zinc-600 transition-all hover:text-yellow-700 shadow-xs"
        >
          <ArrowRight size={12} className="text-zinc-400" />
          Edit Inventory
        </motion.button>
      </div>

      {/* Headline Insight */}
      <HeadlineInsight
        totalRemaining={totalRemaining}
        creditsRemaining={creditsRemaining}
        summary={summary}
      />

      {/* Material list */}
      <div className="flex-1 overflow-y-auto min-h-0 pr-1 -mr-1 custom-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin text-yellow-400" />
          </div>
        ) : !summary ||
          (summary.materials.filter((m) => m.category !== "Currency").length ===
            0 &&
            totalCreditsNeeded === 0) ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-3xl bg-zinc-50 border border-zinc-100 flex items-center justify-center mb-4">
              <Package size={24} className="text-zinc-200" />
            </div>
            <p className="text-sm font-bold text-zinc-400">No Materials Needed</p>
            <p className="text-xs text-zinc-300 mt-2 max-w-[180px]">
              Add operators or weapons to see requirements
            </p>
          </div>
        ) : (
          <>
            {/* Costs section — EXP & Credits */}
            {(totalCreditsNeeded > 0 || Number(summary.total_exp_needed) > 0) && (
              <div className="mb-6 bg-zinc-50/50 border border-zinc-100 rounded-2xl p-3 space-y-4">
                <div className="flex items-center justify-between mb-1 px-1">
                  <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-zinc-400 font-bold">
                    Mandatory Costs
                  </span>
                  {creditsRemaining > 0 && (
                    <span className="text-[9px] font-mono text-red-400 font-bold uppercase">
                      Insufficient Credits
                    </span>
                  )}
                </div>
                
                {/* EXP */}
                {Number(summary.total_exp_needed) > 0 && (
                  <div className="flex items-center gap-2.5 px-1">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 font-bold shrink-0 border border-emerald-100 flex items-center justify-center">
                      <span className="text-[10px] tracking-wider">EXP</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-zinc-700">Total Experience</p>
                      <p className="text-[10px] text-zinc-400 leading-tight mt-0.5">Needed for level-ups</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono font-bold text-emerald-600">
                        {Number(summary.total_exp_needed).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}

                {/* Credits */}
                {totalCreditsNeeded > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <CreditRow
                      creditItem={creditItem}
                      owned={creditOwned}
                      needed={totalCreditsNeeded}
                      onChange={onCreditChange}
                    />
                    <div className="text-[10px] bg-white border border-zinc-200 rounded-xl p-2.5 text-zinc-500 shadow-sm flex flex-col gap-1.5 mt-1">
                      <p className="font-bold text-zinc-700 uppercase tracking-widest text-[9px]">Credit Breakdown</p>
                      <div className="flex justify-between font-mono">
                        <span className="text-zinc-400">Leveling</span>
                        <span className="font-semibold text-zinc-700">{Number(summary.credits_breakdown?.leveling ?? 0).toLocaleString()} <span className="text-[8px]">₵</span></span>
                      </div>
                      <div className="flex justify-between font-mono">
                        <span className="text-zinc-400">Ascension</span>
                        <span className="font-semibold text-zinc-700">{Number(summary.credits_breakdown?.ascension ?? 0).toLocaleString()} <span className="text-[8px]">₵</span></span>
                      </div>
                      <div className="flex justify-between font-mono">
                        <span className="text-zinc-400">Skills</span>
                        <span className="font-semibold text-zinc-700">{Number(summary.credits_breakdown?.skills ?? 0).toLocaleString()} <span className="text-[8px]">₵</span></span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Grouped materials */}
            <div className="space-y-1">
              {grouped.map(([cat, mats]) => (
                <CategorySection key={cat} category={cat} materials={mats} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
