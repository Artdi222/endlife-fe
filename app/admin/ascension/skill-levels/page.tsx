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
import { skillApi } from "@/lib/api/ascension/skill.api";
import { skillLevelApi } from "@/lib/api/ascension/skillLevel.api";
import { itemsApi } from "@/lib/api/ascension/item.api";
import type { Character } from "@/lib/types";
import type {
  SkillWithLevels,
  SkillLevel,
  SkillLevelRequirement,
} from "@/lib/types";
import type { Item } from "@/lib/types";
import Toast from "@/components/admin/Toast";
import { FormField, inputCls } from "@/components/admin/FormField";
import Image from "next/image";

// ── Add Requirement Modal ────────────────────────────────────────────────────
function AddRequirementModal({
  skillLevelId,
  items,
  existingItemIds,
  onClose,
  onAdded,
}: {
  skillLevelId: number;
  items: Item[];
  existingItemIds: number[];
  onClose: () => void;
  onAdded: (req: SkillLevelRequirement) => void;
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
      const res = await skillLevelApi.upsertRequirement({
        skill_level_id: skillLevelId,
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
        <div className="flex flex-col gap-1 max-h-52 overflow-y-auto pr-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
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

// ── Level Row ────────────────────────────────────────────────────────────────
function LevelRow({
  levelNum,
  level,
  skillId,
  items,
  onLevelSaved,
  onRequirementAdded,
  onRequirementDeleted,
  showToast,
}: {
  levelNum: number;
  level: SkillLevel | null;
  skillId: number;
  items: Item[];
  onLevelSaved: (l: SkillLevel) => void;
  onRequirementAdded: (levelId: number, req: SkillLevelRequirement) => void;
  onRequirementDeleted: (levelId: number, reqId: number) => void;
  showToast: (msg: string, type: "success" | "error") => void;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingReqId, setDeletingReqId] = useState<number | null>(null);
  const [showAddReq, setShowAddReq] = useState(false);

  // Local edit state — avoids setState-in-effect. Falls back to prop value when null.
  const [localCreditCost, setLocalCreditCost] = useState<string | null>(null);
  const creditCost = localCreditCost ?? level?.credit_cost ?? "0";

  const handleSaveLevel = async () => {
    setSaving(true);
    try {
      const res = await skillLevelApi.upsert({
        skill_id: skillId,
        level: levelNum,
        credit_cost: Number(creditCost),
      });
      onLevelSaved({ ...res.data, requirements: level?.requirements ?? [] });
      setLocalCreditCost(null); // clear local edit
      showToast(`Level ${levelNum} saved`, "success");
    } catch {
      showToast("Failed to save", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteReq = async (reqId: number) => {
    if (!level) return;
    setDeletingReqId(reqId);
    try {
      await skillLevelApi.deleteRequirement(reqId);
      onRequirementDeleted(level.id, reqId);
      showToast("Material removed", "success");
    } catch {
      showToast("Failed to remove", "error");
    } finally {
      setDeletingReqId(null);
    }
  };

  return (
    <div className="border border-zinc-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-zinc-900 hover:bg-zinc-800/60 transition-all"
      >
        <span className="text-xs font-mono text-zinc-500 w-8">
          Lv.{levelNum}
        </span>
        <span className="text-sm font-semibold text-white flex-1 text-left">
          Level {levelNum}
        </span>
        {level ? (
          <>
            <span className="text-xs font-mono text-zinc-400">
              {level.requirements.length} materials
            </span>
            <span className="text-xs font-mono text-zinc-500">
              {Number(level.credit_cost).toLocaleString()} credits
            </span>
          </>
        ) : (
          <span className="text-xs font-mono text-zinc-600">
            Not configured
          </span>
        )}
        {open ? (
          <ChevronDown size={14} className="text-zinc-500" />
        ) : (
          <ChevronRight size={14} className="text-zinc-500" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 py-4 bg-zinc-950 border-t border-zinc-800 flex flex-col gap-4">
              {/* Credit cost — div wrapper avoids passing className to FormField */}
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
                  onClick={handleSaveLevel}
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

              {/* Materials — only show once the level row exists in DB */}
              {level ? (
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
                  {level.requirements.length === 0 ? (
                    <p className="text-xs text-zinc-600 font-mono py-2">
                      No materials for this level
                    </p>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      {level.requirements.map((req) => (
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
              ) : (
                <p className="text-xs text-zinc-600 font-mono">
                  Save credit cost first to enable material entry.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddReq && level && (
          <AddRequirementModal
            skillLevelId={level.id}
            items={items}
            existingItemIds={level.requirements.map((r) => r.item_id)}
            onClose={() => setShowAddReq(false)}
            onAdded={(req) => {
              onRequirementAdded(level.id, req);
              setShowAddReq(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function SkillLevelsPage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedChar, setSelectedChar] = useState<Character | null>(null);
  const [skills, setSkills] = useState<SkillWithLevels[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<SkillWithLevels | null>(
    null,
  );
  const [items, setItems] = useState<Item[]>([]);
  const [charSearch, setCharSearch] = useState("");
  const [loading, setLoading] = useState(false);
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
      setSkills([]);
      setSelectedSkill(null);
      try {
        const res = await skillApi.getForCharacter(char.id);
        if (!cancelled) setSkills(res.data);
      } catch {
        if (!cancelled) showToast("Failed to load skills", "error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [selectedChar]);

  const getLevelByNum = (num: number): SkillLevel | null =>
    selectedSkill?.levels.find((l) => l.level === num) ?? null;

  const handleLevelSaved = (l: SkillLevel) => {
    if (!selectedSkill) return;
    const updatedLevels = selectedSkill.levels.find((x) => x.level === l.level)
      ? selectedSkill.levels.map((x) => (x.level === l.level ? l : x))
      : [...selectedSkill.levels, l].sort((a, b) => a.level - b.level);
    const updated: SkillWithLevels = {
      ...selectedSkill,
      levels: updatedLevels,
    };
    setSelectedSkill(updated);
    setSkills((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  const handleRequirementAdded = (
    levelId: number,
    req: SkillLevelRequirement,
  ) => {
    if (!selectedSkill) return;
    const updated: SkillWithLevels = {
      ...selectedSkill,
      levels: selectedSkill.levels.map((l) =>
        l.id === levelId ? { ...l, requirements: [...l.requirements, req] } : l,
      ),
    };
    setSelectedSkill(updated);
    setSkills((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  const handleRequirementDeleted = (levelId: number, reqId: number) => {
    if (!selectedSkill) return;
    const updated: SkillWithLevels = {
      ...selectedSkill,
      levels: selectedSkill.levels.map((l) =>
        l.id === levelId
          ? { ...l, requirements: l.requirements.filter((r) => r.id !== reqId) }
          : l,
      ),
    };
    setSelectedSkill(updated);
    setSkills((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  const filteredChars = characters.filter((c) =>
    c.name.toLowerCase().includes(charSearch.toLowerCase()),
  );

  const SKILL_TYPE_COLORS: Record<string, string> = {
    skill: "bg-blue-400/10 text-blue-400 border-blue-400/20",
    talent: "bg-purple-400/10 text-purple-400 border-purple-400/20",
    spaceship_talent: "bg-orange-400/10 text-orange-400 border-orange-400/20",
  };

  return (
    <div className="w-full flex gap-4">
      {/* Character selector */}
      <div className="w-52 shrink-0">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden sticky top-4">
          <div className="px-3 py-3 border-b border-zinc-800">
            <p className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-2">
              Character
            </p>
            <div className="relative">
              <Search
                size={12}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500"
              />
              <input
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-7 pr-3 py-1.5 text-xs text-white placeholder-zinc-600 outline-none focus:border-yellow-400 transition-colors"
                placeholder="Search..."
                value={charSearch}
                onChange={(e) => setCharSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-y-auto max-h-72 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {filteredChars.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedChar(c)}
                className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs transition-all border-b border-zinc-800/50 last:border-0
                  ${selectedChar?.id === c.id ? "bg-yellow-300/10 text-yellow-300" : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"}`}
              >
                {c.icon ? (
                  <Image
                    width={64}
                    height={64}
                    src={c.icon}
                    alt={c.name}
                    className="w-6 h-6 rounded object-cover shrink-0"
                  />
                ) : (
                  <div className="w-6 h-6 rounded bg-zinc-800 shrink-0" />
                )}
                <span className="font-semibold truncate">{c.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Skill selector */}
      <div className="w-48 shrink-0">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden sticky top-4">
          <div className="px-3 py-3 border-b border-zinc-800">
            <p className="text-xs font-mono uppercase tracking-widest text-zinc-500">
              Skill
            </p>
          </div>
          <div className="overflow-y-auto max-h-[calc(100vh-220px)] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {!selectedChar ? (
              <p className="text-xs text-zinc-600 font-mono px-3 py-3">
                Select a character first
              </p>
            ) : loading ? (
              <div className="flex justify-center py-4">
                <Loader2 size={16} className="animate-spin text-zinc-500" />
              </div>
            ) : skills.length === 0 ? (
              <p className="text-xs text-zinc-600 font-mono px-3 py-3">
                No skills found
              </p>
            ) : (
              skills.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSkill(s)}
                  className={`w-full flex flex-col items-start gap-1 px-3 py-2.5 text-xs transition-all border-b border-zinc-800/50 last:border-0
                    ${selectedSkill?.id === s.id ? "bg-yellow-300/10 text-yellow-300" : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"}`}
                >
                  <span className="font-semibold truncate w-full">
                    {s.name}
                  </span>
                  <span
                    className={`text-xs font-mono px-1.5 py-0.5 rounded border ${SKILL_TYPE_COLORS[s.type]}`}
                  >
                    {s.type.replace(/_/g, " ")}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Levels panel */}
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
            Skill Levels
            {selectedSkill && (
              <span className="text-yellow-300"> — {selectedSkill.name}</span>
            )}
          </h1>
        </motion.div>

        {!selectedSkill ? (
          <div className="flex flex-col items-center justify-center py-24 text-zinc-600">
            <Zap size={32} className="mb-3 opacity-30" />
            <p className="text-sm font-mono">
              Select a character and skill to manage levels
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="flex flex-col gap-2"
          >
            {Array.from(
              { length: selectedSkill.type === "spaceship_talent" ? 2 : selectedSkill.type === "talent" ? 3 : 12 },
              (_, i) => i + 1,
            ).map((num) => (
              <LevelRow
                key={num}
                levelNum={num}
                level={getLevelByNum(num)}
                skillId={selectedSkill.id}
                items={items}
                onLevelSaved={handleLevelSaved}
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
