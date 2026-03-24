"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Save, Loader2, X, Edit2 } from "lucide-react";
import { levelCostApi } from "@/lib/api/ascension/levelCost.api";
import type { LevelCost, CreateLevelCostDTO } from "@/lib/types";
import Toast from "@/components/admin/Toast";
import { FormField, inputCls } from "@/components/admin/FormField";

type EntityType = "character" | "weapon";

function LevelCostModal({
  entityType,
  initial,
  onClose,
  onSaved,
}: {
  entityType: EntityType;
  initial: LevelCost | null;
  onClose: () => void;
  onSaved: (lc: LevelCost) => void;
}) {
  const [form, setForm] = useState<CreateLevelCostDTO>({
    entity_type: entityType,
    level: initial?.level ?? 1,
    exp_required: initial ? Number(initial.exp_required) : 0,
    credit_cost: initial ? Number(initial.credit_cost) : 0,
  });
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof CreateLevelCostDTO>(
    k: K,
    v: CreateLevelCostDTO[K],
  ) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await levelCostApi.upsert(form);
      onSaved(res.data);
      // Fix 1: removed onClose() — parent's onSaved callback already closes the modal
    } catch {
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.15 }}
        className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-sm shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800">
          <h2 className="text-base font-bold text-white">
            {initial ? `Edit Level ${initial.level}` : "Add Level Cost"}
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-800 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          <FormField label="Level">
            <input
              type="number"
              min={1}
              max={90}
              className={inputCls}
              value={form.level}
              onChange={(e) => set("level", Number(e.target.value))}
              disabled={!!initial}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="EXP Required">
              <input
                type="number"
                min={0}
                className={inputCls}
                value={form.exp_required}
                onChange={(e) => set("exp_required", Number(e.target.value))}
              />
            </FormField>
            <FormField label="Credit Cost">
              <input
                type="number"
                min={0}
                className={inputCls}
                value={form.credit_cost}
                onChange={(e) => set("credit_cost", Number(e.target.value))}
              />
            </FormField>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-zinc-700 text-zinc-400 text-sm hover:text-white transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-yellow-300 text-zinc-900 text-sm font-bold hover:bg-yellow-400 transition-all flex items-center justify-center gap-2 disabled:opacity-40"
            >
              {saving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Save size={14} />
              )}
              Save
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function LevelCostsPage() {
  const [activeTab, setActiveTab] = useState<EntityType>("character");
  const [costs, setCosts] = useState<Record<EntityType, LevelCost[]>>({
    character: [],
    weapon: [],
  });
  const [loading, setLoading] = useState<Record<EntityType, boolean>>({
    character: false,
    weapon: false,
  });
  const [modal, setModal] = useState<{ lc: LevelCost | null } | null>(null);
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadCosts = async (type: EntityType) => {
    setLoading((p) => ({ ...p, [type]: true }));
    try {
      const res = await levelCostApi.getAll(type);
      setCosts((p) => ({ ...p, [type]: res.data }));
    } catch {
      showToast("Failed to load level costs", "error");
    } finally {
      setLoading((p) => ({ ...p, [type]: false }));
    }
  };

  useEffect(() => {
    loadCosts("character");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Lazy-load weapon costs only when the tab is first visited
  useEffect(() => {
    if (
      activeTab === "weapon" &&
      costs.weapon.length === 0 &&
      !loading.weapon
    ) {
      loadCosts("weapon");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleSaved = (lc: LevelCost) => {
    setCosts((prev) => {
      const list = prev[activeTab];
      const exists = list.find((x) => x.level === lc.level);
      return {
        ...prev,
        [activeTab]: exists
          ? list.map((x) => (x.level === lc.level ? lc : x))
          : [...list, lc].sort((a, b) => a.level - b.level),
      };
    });
    showToast(`Level ${lc.level} saved`, "success");
  };

  const currentCosts = costs[activeTab];

  // Build full 1–90 grid showing which levels are configured
  const allLevels = Array.from({ length: 90 }, (_, i) => i + 1);

  const totalExp = currentCosts.reduce(
    (sum, c) => sum + Number(c.exp_required),
    0,
  );
  const totalCredits = currentCosts.reduce(
    (sum, c) => sum + Number(c.credit_cost),
    0,
  );

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <p className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-1">
          Ascension Master
        </p>
        <h1 className="text-2xl font-extrabold text-white">Level Costs</h1>
      </motion.div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 bg-zinc-900 border border-zinc-800 rounded-xl p-1 w-fit">
        {(["character", "weapon"] as EntityType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all
              ${activeTab === tab ? "bg-yellow-300 text-zinc-900" : "text-zinc-400 hover:text-white"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        {[
          { label: "Configured", value: currentCosts.length, suffix: "/ 90" },
          { label: "Total EXP", value: totalExp.toLocaleString(), suffix: "" },
          {
            label: "Total Credits",
            value: totalCredits.toLocaleString(),
            suffix: "",
          },
        ].map(({ label, value, suffix }) => (
          <div
            key={label}
            className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 flex items-center gap-2"
          >
            <span className="text-lg font-black text-yellow-300">{value}</span>
            {suffix && (
              <span className="text-xs font-mono text-zinc-600">{suffix}</span>
            )}
            <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
              {label}
            </span>
          </div>
        ))}
        <button
          onClick={() => setModal({ lc: null })}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-yellow-300 text-zinc-900 text-sm font-bold hover:bg-yellow-400 transition-all ml-auto"
        >
          Add Level Cost
        </button>
      </div>

      {/* Level grid */}
      {loading[activeTab] ? (
        <div className="flex justify-center py-16">
          <Loader2 size={24} className="animate-spin text-zinc-500" />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden"
        >
          {/* Table header */}
          <div className="grid grid-cols-4 gap-0 px-5 py-3 border-b border-zinc-800 bg-zinc-950">
            {["Level", "EXP Required", "Credit Cost", ""].map((h) => (
              <span
                key={h}
                className="text-xs font-mono uppercase tracking-widest text-zinc-500"
              >
                {h}
              </span>
            ))}
          </div>

          {/* Table rows */}
          <div className="divide-y divide-zinc-800/50">
            {allLevels.map((level) => {
              const cost = currentCosts.find((c) => c.level === level);
              return (
                <div
                  key={level}
                  className={`grid grid-cols-4 gap-0 px-5 py-2.5 items-center hover:bg-zinc-800/30 transition-all ${!cost ? "opacity-40" : ""}`}
                >
                  <span className="text-sm font-mono text-zinc-300">
                    {level}
                    {!cost && (
                      <span className="ml-2 text-xs text-zinc-600">—</span>
                    )}
                  </span>
                  <span className="text-sm font-mono text-zinc-300">
                    {cost ? Number(cost.exp_required).toLocaleString() : "—"}
                  </span>
                  <span className="text-sm font-mono text-zinc-300">
                    {cost ? Number(cost.credit_cost).toLocaleString() : "—"}
                  </span>
                  <button
                    onClick={() =>
                      setModal({
                        // Fix 2: include id field to satisfy LevelCost type (id: 0 = no real DB row yet)
                        lc: cost ?? {
                          id: 0,
                          entity_type: activeTab,
                          level,
                          exp_required: "0",
                          credit_cost: "0",
                        },
                      })
                    }
                    className="justify-self-end flex items-center gap-1.5 px-3 py-1 rounded-lg text-zinc-500 hover:text-yellow-400 hover:bg-yellow-400/10 text-xs font-mono transition-all"
                  >
                    <Edit2 size={11} />
                    {cost ? "Edit" : "Add"}
                  </button>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {modal && (
          <LevelCostModal
            entityType={activeTab}
            initial={modal.lc?.level ? modal.lc : null}
            onClose={() => setModal(null)}
            onSaved={(lc) => {
              handleSaved(lc);
              setModal(null);
            }}
          />
        )}
        {toast && (
          // Fix 4: key required for AnimatePresence exit animation to fire
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <Toast msg={toast.msg} type={toast.type} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
