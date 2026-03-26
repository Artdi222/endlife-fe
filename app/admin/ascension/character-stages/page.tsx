"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  Save,
  Loader2,
  Search,
  Package,
  Zap,
} from "lucide-react";
import { charactersApi } from "@/lib/api/ascension/character.api";
import { stageApi } from "@/lib/api/ascension/stage.api";
import { requirementApi } from "@/lib/api/ascension/requirement.api";
import { itemsApi } from "@/lib/api/ascension/item.api";
import type { Character } from "@/lib/types";
import type {
  AscensionStageWithRequirements,
  AscensionRequirement,
  Item,
} from "@/lib/types";
import Toast from "@/components/admin/Toast";
import { FormField, inputCls} from "@/components/admin/FormField";
import Image from "next/image";

const STAGE_DEFS = [
  {
    stage_number: 1,
    level_from: 1,
    level_to: 20,
    is_breakthrough: false,
    label: "1 → 20",
  },
  {
    stage_number: 2,
    level_from: 20,
    level_to: 20,
    is_breakthrough: true,
    label: "20 → 20+",
  },
  {
    stage_number: 3,
    level_from: 20,
    level_to: 40,
    is_breakthrough: false,
    label: "20+ → 40",
  },
  {
    stage_number: 4,
    level_from: 40,
    level_to: 40,
    is_breakthrough: true,
    label: "40 → 40+",
  },
  {
    stage_number: 5,
    level_from: 40,
    level_to: 60,
    is_breakthrough: false,
    label: "40+ → 60",
  },
  {
    stage_number: 6,
    level_from: 60,
    level_to: 60,
    is_breakthrough: true,
    label: "60 → 60+",
  },
  {
    stage_number: 7,
    level_from: 60,
    level_to: 80,
    is_breakthrough: false,
    label: "60+ → 80",
  },
  {
    stage_number: 8,
    level_from: 80,
    level_to: 80,
    is_breakthrough: true,
    label: "80 → 80+",
  },
  {
    stage_number: 9,
    level_from: 80,
    level_to: 90,
    is_breakthrough: false,
    label: "80+ → 90",
  },
];

// ── Add Requirement Modal ────────────────────────────────────────────────────
function AddRequirementModal({
  stageId,
  items,
  existingItemIds,
  onClose,
  onAdded,
}: {
  stageId: number;
  items: Item[];
  existingItemIds: number[];
  onClose: () => void;
  onAdded: (req: AscensionRequirement) => void;
}) {
  const available = items.filter((i) => !existingItemIds.includes(i.id));
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<Item | null>(
    available[0] ?? null,
  );
  const [quantity, setQuantity] = useState(1);
  const [saving, setSaving] = useState(false);

  const filtered = available.filter(
    (i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.category.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSave = async () => {
    if (!selectedItem || quantity < 1) return;
    setSaving(true);
    try {
      const res = await requirementApi.upsert({
        stage_id: stageId,
        item_id: selectedItem.id,
        quantity,
      });
      onAdded(res.data);
      onClose();
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
        className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-sm shadow-2xl p-6 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-sm font-bold text-white">Add Material</h3>

        {/* Search */}
        <div className="relative">
          <Search
            size={13}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500"
          />
          <input
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder-zinc-600 outline-none focus:border-yellow-400 transition-colors"
            placeholder="Search items or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </div>

        {/* Item list */}
        <div className="flex flex-col gap-1 max-h-52 overflow-y-auto pr-1">
          {filtered.length === 0 ? (
            <p className="text-xs text-zinc-600 font-mono text-center py-4">
              No items found
            </p>
          ) : (
            filtered.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all text-xs
                  ${
                    selectedItem?.id === item.id
                      ? "bg-yellow-300/10 border border-yellow-400/30 text-yellow-300"
                      : "bg-zinc-800/60 border border-transparent text-zinc-300 hover:bg-zinc-800 hover:text-white"
                  }`}
              >
                {item.image ? (
                  <Image
                    width={64}
                    height={64}
                    src={item.image}
                    alt={item.name}
                    className="w-7 h-7 rounded object-cover shrink-0"
                  />
                ) : (
                  <Package size={14} className="text-zinc-600 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{item.name}</p>
                  <p className="text-zinc-500 truncate">{item.category}</p>
                </div>
                {selectedItem?.id === item.id && (
                  <span className="text-yellow-400 text-xs">✓</span>
                )}
              </button>
            ))
          )}
        </div>

        {/* Quantity */}
        <FormField label="Quantity">
          <input
            type="number"
            min={1}
            className={inputCls}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />
        </FormField>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl border border-zinc-700 text-zinc-400 text-sm hover:text-white transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !selectedItem}
            className="flex-1 py-2 rounded-xl bg-yellow-300 text-zinc-900 text-sm font-bold hover:bg-yellow-400 transition-all flex items-center justify-center gap-2 disabled:opacity-40"
          >
            {saving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Save size={14} />
            )}
            Save
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Stage Row ────────────────────────────────────────────────────────────────
function StageRow({
  stageDef,
  stage,
  items,
  characterId,
  onStageCreated,
  onStageUpdated,
  onRequirementAdded,
  onRequirementDeleted,
  showToast,
}: {
  stageDef: (typeof STAGE_DEFS)[0];
  stage: AscensionStageWithRequirements | null;
  items: Item[];
  characterId: number;
  onStageCreated: (s: AscensionStageWithRequirements) => void;
  onStageUpdated: (s: AscensionStageWithRequirements) => void;
  onRequirementAdded: (stageId: number, req: AscensionRequirement) => void;
  onRequirementDeleted: (stageId: number, reqId: number) => void;
  showToast: (msg: string, type: "success" | "error") => void;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deletingReqId, setDeletingReqId] = useState<number | null>(null);
  const [showAddReq, setShowAddReq] = useState(false);

  // Local edit state — avoids setState-in-effect. Falls back to prop value.
  const [localCreditCost, setLocalCreditCost] = useState<string | null>(null);
  const creditCost = localCreditCost ?? stage?.credit_cost ?? "0";

  const handleCreate = async () => {
    setCreating(true);
    try {
      const res = await stageApi.create({
        entity_type: "character",
        entity_id: characterId,
        stage_number: stageDef.stage_number,
        level_from: stageDef.level_from,
        level_to: stageDef.level_to,
        is_breakthrough: stageDef.is_breakthrough,
        credit_cost: 0,
      });
      // create() returns AscensionStage — attach empty requirements for local state
      const full: AscensionStageWithRequirements = {
        ...res.data,
        requirements: [],
      };
      onStageCreated(full);
      showToast("Stage created", "success");
    } catch {
      showToast("Failed to create stage", "error");
    } finally {
      setCreating(false);
    }
  };

  const handleSaveCost = async () => {
    if (!stage) return;
    setSaving(true);
    try {
      const res = await stageApi.update(stage.id, {
        credit_cost: Number(creditCost),
      });
      onStageUpdated({ ...stage, credit_cost: res.data.credit_cost });
      setLocalCreditCost(null); // clear local edit — prop value is now up to date
      showToast("Credit cost saved", "success");
    } catch {
      showToast("Failed to save", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteReq = async (reqId: number) => {
    if (!stage) return;
    setDeletingReqId(reqId);
    try {
      await requirementApi.delete(reqId);
      onRequirementDeleted(stage.id, reqId);
      showToast("Material removed", "success");
    } catch {
      showToast("Failed to remove", "error");
    } finally {
      setDeletingReqId(null);
    }
  };

  return (
    <div className="border border-zinc-800 rounded-xl overflow-hidden">
      {/* Row header — div instead of button to allow nested Create button */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => stage && setOpen((p) => !p)}
        onKeyDown={(e) => e.key === "Enter" && stage && setOpen((p) => !p)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-zinc-900 hover:bg-zinc-800/60 transition-all cursor-pointer"
      >
        <span className="text-xs font-mono text-zinc-500 w-5">
          {stageDef.stage_number}
        </span>
        <span className="text-sm font-semibold text-white flex-1 text-left">
          {stageDef.label}
        </span>
        {stageDef.is_breakthrough && (
          <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-yellow-400/10 text-yellow-400 border border-yellow-400/20">
            Breakthrough
          </span>
        )}
        {stage ? (
          <>
            <span className="text-xs font-mono text-zinc-400">
              {stage.requirements.length} materials
            </span>
            <span className="text-xs font-mono text-zinc-500">
              {Number(stage.credit_cost).toLocaleString()} credits
            </span>
            {open ? (
              <ChevronDown size={14} className="text-zinc-500" />
            ) : (
              <ChevronRight size={14} className="text-zinc-500" />
            )}
          </>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCreate();
            }}
            disabled={creating}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-700 text-zinc-300 text-xs font-semibold hover:bg-zinc-600 transition-all"
          >
            {creating ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Plus size={12} />
            )}
            Create
          </button>
        )}
      </div>

      {/* Expanded */}
      <AnimatePresence>
        {open && stage && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 py-4 bg-zinc-950 border-t border-zinc-800 flex flex-col gap-4">
              {/* Credit cost — wrapped in div to avoid passing className to FormField */}
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <FormField label="Credit Cost">
                    <input
                      type="number"
                      min={0}
                      className={inputCls}
                      value={creditCost}
                      onChange={(e) => setLocalCreditCost(e.target.value)}
                    />
                  </FormField>
                </div>
                <button
                  onClick={handleSaveCost}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-yellow-300 text-zinc-900 text-sm font-bold hover:bg-yellow-400 transition-all mb-px disabled:opacity-40"
                >
                  {saving ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Save size={13} />
                  )}
                  Save
                </button>
              </div>

              {/* Materials */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono uppercase tracking-widest text-zinc-500">
                    Materials
                  </span>
                  <button
                    onClick={() => setShowAddReq(true)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-800 text-zinc-300 text-xs font-semibold hover:bg-zinc-700 transition-all"
                  >
                    <Plus size={12} />
                    Add Item
                  </button>
                </div>
                {stage.requirements.length === 0 ? (
                  <p className="text-xs text-zinc-600 font-mono py-2">
                    No materials added yet
                  </p>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {stage.requirements.map((req) => (
                      <div
                        key={req.id}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800"
                      >
                        {req.item_image ? (
                          <Image
                            width={64}
                            height={64}
                            src={req.item_image}
                            alt={req.item_name}
                            className="w-7 h-7 rounded object-cover"
                          />
                        ) : (
                          <Package size={14} className="text-zinc-600" />
                        )}
                        <span className="text-sm text-white flex-1">
                          {req.item_name}
                        </span>
                        <span className="text-xs font-mono text-yellow-400">
                          ×{req.quantity}
                        </span>
                        <button
                          onClick={() => handleDeleteReq(req.id)}
                          disabled={deletingReqId === req.id}
                          className="w-6 h-6 flex items-center justify-center rounded text-zinc-600 hover:text-red-400 hover:bg-red-400/10 transition-all"
                        >
                          {deletingReqId === req.id ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <Trash2 size={12} />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddReq && stage && (
          <AddRequirementModal
            key="add-req-modal"
            stageId={stage.id}
            items={items}
            existingItemIds={stage.requirements.map((r) => r.item_id)}
            onClose={() => setShowAddReq(false)}
            onAdded={(req) => {
              onRequirementAdded(stage.id, req);
              setShowAddReq(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function CharacterStagesPage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedChar, setSelectedChar] = useState<Character | null>(null);
  const [stages, setStages] = useState<AscensionStageWithRequirements[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    Promise.all([charactersApi.getAll(), itemsApi.getAll()]).then(
      ([cRes, iRes]) => {
        setCharacters(cRes.data);
        setItems(iRes.data);
      },
    );
  }, []);

useEffect(() => {
  if (!selectedChar) return;

  const char = selectedChar; 
  let cancelled = false;

  async function load() {
    setLoading(true);
    setStages([]);
    try {
      const res = await stageApi.getForEntity("character", char.id);
      if (!cancelled) setStages(res.data);
    } catch {
      if (!cancelled) showToast("Failed to load stages", "error");
    } finally {
      if (!cancelled) setLoading(false);
    }
  }

  load();
  return () => {
    cancelled = true;
  };
}, [selectedChar]);

  const getStageForDef = (n: number) =>
    stages.find((s) => s.stage_number === n) ?? null;

  const handleStageCreated = (s: AscensionStageWithRequirements) =>
    setStages((prev) =>
      [...prev, s].sort((a, b) => a.stage_number - b.stage_number),
    );

  const handleStageUpdated = (s: AscensionStageWithRequirements) =>
    setStages((prev) => prev.map((x) => (x.id === s.id ? s : x)));

  const handleRequirementAdded = (stageId: number, req: AscensionRequirement) =>
    setStages((prev) =>
      prev.map((s) =>
        s.id === stageId ? { ...s, requirements: [...s.requirements, req] } : s,
      ),
    );

  const handleRequirementDeleted = (stageId: number, reqId: number) =>
    setStages((prev) =>
      prev.map((s) =>
        s.id === stageId
          ? { ...s, requirements: s.requirements.filter((r) => r.id !== reqId) }
          : s,
      ),
    );

  const filtered = characters.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="w-full flex gap-6">
      {/* Character selector */}
      <div className="w-64 shrink-0">
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden"
        >
          <div className="px-4 py-4 border-b border-zinc-800">
            <p className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-2">
              Select Character
            </p>
            <div className="relative">
              <Search
                size={13}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500"
              />
              <input
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder-zinc-600 outline-none focus:border-yellow-400 transition-colors"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-y-auto max-h-[calc(100vh-220px)]">
            {filtered.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedChar(c)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all border-b border-zinc-800/50 last:border-0
                  ${
                    selectedChar?.id === c.id
                      ? "bg-yellow-300/10 text-yellow-300"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
                  }`}
              >
                {c.icon ? (
                  <Image
                    width={64}
                    height={64}
                    src={c.icon}
                    alt={c.name}
                    className="w-7 h-7 rounded-lg object-cover shrink-0"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-zinc-800 shrink-0" />
                )}
                <span className="font-semibold truncate">{c.name}</span>
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Stages panel */}
      <div className="flex-1 min-w-0">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5"
        >
          <p className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-1">
            Ascension Master
          </p>
          <h1 className="text-2xl font-extrabold text-white">
            Character Stages
            {selectedChar && (
              <span className="text-yellow-300"> — {selectedChar.name}</span>
            )}
          </h1>
        </motion.div>

        {!selectedChar ? (
          <div className="flex flex-col items-center justify-center py-24 text-zinc-600">
            <Zap size={32} className="mb-3 opacity-30" />
            <p className="text-sm font-mono">
              Select a character to manage stages
            </p>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={24} className="animate-spin text-zinc-500" />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="flex flex-col gap-2"
          >
            {STAGE_DEFS.map((def) => (
              <StageRow
                key={def.stage_number}
                stageDef={def}
                stage={getStageForDef(def.stage_number)}
                items={items}
                characterId={selectedChar.id}
                onStageCreated={handleStageCreated}
                onStageUpdated={handleStageUpdated}
                onRequirementAdded={handleRequirementAdded}
                onRequirementDeleted={handleRequirementDeleted}
                showToast={showToast}
              />
            ))}
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {toast && (
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
