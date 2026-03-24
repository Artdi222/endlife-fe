"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  X,
  Save,
  Loader2,
  Search,
  Zap,
  Upload,
  ImageIcon,
} from "lucide-react";
import { charactersApi } from "@/lib/api/ascension/character.api";
import { skillApi } from "@/lib/api/ascension/skill.api";
import type { Character } from "@/lib/types";
import type { Skill, CreateSkillDTO, SkillType } from "@/lib/types";
import DataTable from "@/components/admin/DataTable";
import Toast from "@/components/admin/Toast";
import { FormField, inputCls, selectCls } from "@/components/admin/FormField";

const SKILL_TYPES: { value: SkillType; label: string }[] = [
  { value: "skill", label: "Skill" },
  { value: "talent", label: "Talent" },
  { value: "spaceship_talent", label: "Spaceship Talent" },
];

const SKILL_TYPE_LABELS: Record<SkillType, string> = {
  skill: "Skill",
  talent: "Talent",
  spaceship_talent: "Spaceship Talent",
};

// ── Skill Modal ──────────────────────────────────────────────────────────────
function SkillModal({
  characterId,
  initial,
  onClose,
  onSaved,
}: {
  characterId: number;
  initial: Skill | null;
  onClose: () => void;
  onSaved: (s: Skill) => void;
}) {
  const [form, setForm] = useState<CreateSkillDTO>(
    initial
      ? {
          character_id: characterId,
          name: initial.name,
          type: initial.type,
          icon: initial.icon ?? "",
          order_index: initial.order_index,
        }
      : {
          character_id: characterId,
          name: "",
          type: "skill",
          icon: "",
          order_index: 0,
        },
  );
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [iconPreview, setIconPreview] = useState<string>(initial?.icon ?? "");
  // Holds a pending file to upload after the skill is created (we need the skill id first)
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (k: keyof CreateSkillDTO, v: string | number) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Show local preview immediately — actual upload happens on Save
    setIconPreview(URL.createObjectURL(file));
    setPendingFile(file);
    if (fileRef.current) fileRef.current.value = "";
  };

  const uploadIcon = async (
    skillId: number,
    file: File,
  ): Promise<string | null> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await skillApi.uploadIcon(skillId, formData);
    return res.data.icon ?? null;
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      // 1. Create or update the skill depending on whether we're editing
      let saved: Skill;
      if (initial) {
        const res = await skillApi.update(initial.id, {
          name: form.name,
          type: form.type,
          order_index: form.order_index ?? 0,
        });
        saved = res.data;
      } else {
        const res = await skillApi.create({
          ...form,
          icon: form.icon || undefined,
          order_index: form.order_index ?? 0,
        });
        saved = res.data;
      }

      // 2. If a new icon file was picked, upload it now that we have the id
      if (pendingFile) {
        setUploading(true);
        try {
          const updated = await uploadIcon(saved.id, pendingFile);
          if (updated) saved = { ...saved, icon: updated };
        } finally {
          setUploading(false);
        }
      }

      onSaved(saved);
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
        className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800">
          <h2 className="text-base font-bold text-white">
            {initial ? `Edit — ${initial.name}` : "Add Skill"}
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-800 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          <FormField label="Skill Name">
            <input
              className={inputCls}
              placeholder="e.g. Flaming Cinders"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </FormField>

          <FormField label="Type">
            <select
              className={selectCls}
              value={form.type}
              onChange={(e) => set("type", e.target.value as SkillType)}
            >
              {SKILL_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </FormField>

          {/* Icon upload */}
          <FormField label="Icon">
            <div className="flex items-center gap-3">
              {/* Preview */}
              <div className="w-12 h-12 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0 overflow-hidden">
                {iconPreview ? (
                  <img
                    src={iconPreview}
                    alt="icon preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon size={18} className="text-zinc-600" />
                )}
              </div>
              {/* Upload button */}
              <div className="flex-1">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-zinc-700 text-zinc-400 text-xs font-semibold hover:text-white hover:border-zinc-500 transition-all"
                >
                  <Upload size={13} />
                  {iconPreview ? "Replace Image" : "Upload Image"}
                </button>
                {pendingFile && (
                  <p className="text-xs text-zinc-500 font-mono truncate mt-1.5">
                    {pendingFile.name}
                  </p>
                )}
              </div>
            </div>
          </FormField>

          <FormField label="Order Index">
            <input
              type="number"
              min={0}
              className={inputCls}
              value={form.order_index ?? 0}
              onChange={(e) => set("order_index", Number(e.target.value))}
            />
          </FormField>

          <div className="flex gap-2 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-zinc-700 text-zinc-400 text-sm hover:text-white transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving || uploading || !form.name.trim()}
              className="flex-1 py-2.5 rounded-xl bg-yellow-300 text-zinc-900 text-sm font-bold hover:bg-yellow-400 transition-all flex items-center justify-center gap-2 disabled:opacity-40"
            >
              {saving || uploading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Save size={14} />
              )}
              {uploading ? "Uploading…" : "Save"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function SkillsPage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedChar, setSelectedChar] = useState<Character | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<{ skill: Skill | null } | null>(null);
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    charactersApi.getAll().then((res) => setCharacters(res.data));
  }, []);

  useEffect(() => {
    if (!selectedChar) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSkills([]);
      return;
    }
    setLoading(true);
    skillApi
      .getForCharacter(selectedChar.id)
      .then((res) => {
        // getForCharacter returns SkillWithLevels[] — strip levels for the list view
        const flat: Skill[] = res.data.map(({ levels: _levels, ...s }) => s);
        setSkills(flat);
      })
      .catch(() => showToast("Failed to load skills", "error"))
      .finally(() => setLoading(false));
  }, [selectedChar]);

  const handleSaved = (s: Skill) => {
    setSkills((prev) => {
      const exists = prev.find((x) => x.id === s.id);
      return exists ? prev.map((x) => (x.id === s.id ? s : x)) : [...prev, s];
    });
    showToast("Skill saved", "success");
  };

  const columns = [
    {
      key: "order_index",
      label: "#",
      render: (s: Skill) => (
        <span className="text-xs font-mono text-zinc-500">{s.order_index}</span>
      ),
    },
    {
      key: "name",
      label: "Name",
      render: (s: Skill) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0 overflow-hidden">
            {s.icon ? (
              <img
                src={s.icon}
                alt={s.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-zinc-600 text-xs font-mono">?</span>
            )}
          </div>
          <p className="font-semibold text-white">{s.name}</p>
        </div>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (s: Skill) => (
        <span
          className={`text-xs font-mono px-2 py-0.5 rounded-full border
          ${
            s.type === "skill"
              ? "bg-blue-400/10 text-blue-400 border-blue-400/20"
              : s.type === "talent"
                ? "bg-green-400/10 text-green-400 border-green-400/20"
                : "bg-orange-400/10 text-orange-400 border-orange-400/20"
          }`}
        >
          {SKILL_TYPE_LABELS[s.type]}
        </span>
      ),
    },
  ];

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
                  ${selectedChar?.id === c.id ? "bg-yellow-300/10 text-yellow-300" : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"}`}
              >
                {c.icon ? (
                  <img
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

      {/* Skills panel */}
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
            Skills
            {selectedChar && (
              <span className="text-yellow-300"> — {selectedChar.name}</span>
            )}
          </h1>
        </motion.div>

        {!selectedChar ? (
          <div className="flex flex-col items-center justify-center py-24 text-zinc-600">
            <Zap size={32} className="mb-3 opacity-30" />
            <p className="text-sm font-mono">
              Select a character to manage skills
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 flex items-center gap-2">
                <span className="text-2xl font-black text-yellow-300">
                  {skills.length}
                </span>
                <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
                  Skills
                </span>
              </div>
              <button
                onClick={() => setModal({ skill: null })}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-yellow-300 text-zinc-900 text-sm font-bold hover:bg-yellow-400 transition-all"
              >
                <Plus size={15} />
                Add Skill
              </button>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
            >
              <DataTable
                columns={columns}
                data={skills}
                loading={loading}
                onEdit={(s) => setModal({ skill: s })}
                onDelete={() => {}}
              />
            </motion.div>
          </>
        )}
      </div>

      <AnimatePresence>
        {modal && selectedChar && (
          <SkillModal
            key="skill-modal"
            characterId={selectedChar.id}
            initial={modal.skill}
            onClose={() => setModal(null)}
            onSaved={handleSaved}
          />
        )}
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
