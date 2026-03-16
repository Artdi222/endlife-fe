"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  X,
  Trash2,
  Image as ImageIcon,
  Video,
  Star,
  Search,
  Loader2,
} from "lucide-react";
import { charactersApi } from "@/lib/api/ascension/character.api";
import type {
  Character,
  CreateCharacterDTO,
  UpdateCharacterDTO,
} from "@/lib/types";
import DataTable from "@/components/admin/DataTable";
import Toast from "@/components/admin/Toast";
import { FormField, inputCls, selectCls } from "@/components/admin/FormField";

// ── Constants ────────────────────────────────────────────────
const ELEMENTS = ["Heat", "Cryo", "Electric", "Physical", "Nature"];
const WEAPON_TYPES = ["Sword", "Greatsword", "Gun", "Polearm", "Arts Unit"];
const CLASSES = [
  "Guard",
  "Caster",
  "Striker",
  "Vanguard",
  "Defender",
  "Supporter",
];
const RARITIES = [4, 5, 6];
const MEDIA_FIELDS = [
  {
    field: "icon" as const,
    label: "Icon",
    accept: "image/*",
    icon: <ImageIcon size={14} />,
  },
  {
    field: "splash_art" as const,
    label: "Splash Art",
    accept: "image/*",
    icon: <ImageIcon size={14} />,
  },
  {
    field: "video_enter" as const,
    label: "Enter Video",
    accept: "video/*",
    icon: <Video size={14} />,
  },
  {
    field: "video_idle" as const,
    label: "Idle Video",
    accept: "video/*",
    icon: <Video size={14} />,
  },
];

const emptyForm: CreateCharacterDTO = {
  name: "",
  rarity: 5,
  element: "Heat",
  weapon_type: "Sword",
  race: "",
  faction: "",
  class: "",
  description: "",
  order_index: 0,
};

// Rarity Stars
function RarityStars({ rarity }: { rarity: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: rarity }).map((_, i) => (
        <Star key={i} size={10} className="text-yellow-400 fill-yellow-400" />
      ))}
    </div>
  );
}

// Media Upload
function MediaUploadRow({
  character,
  onUploaded,
}: {
  character: Character;
  onUploaded: (updated: Character) => void;
}) {
  const [uploading, setUploading] = useState<string | null>(null);

  const handleUpload = async (
    field: "icon" | "splash_art" | "video_enter" | "video_idle",
    file: File,
  ) => {
    setUploading(field);
    try {
      const res = await charactersApi.uploadMedia(character.id, field, file);
      onUploaded(res.data);
    } catch {
    } finally {
      setUploading(null);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-zinc-800">
      {MEDIA_FIELDS.map(({ field, label, accept, icon }) => {
        const hasFile = !!character[field];
        const isUploading = uploading === field;
        return (
          <label
            key={field}
            className={`relative flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all text-xs font-mono
              ${
                hasFile
                  ? "border-yellow-400/40 bg-yellow-400/5 text-yellow-400"
                  : "border-zinc-700 bg-zinc-800/50 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300"
              }`}
          >
            <input
              type="file"
              accept={accept}
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleUpload(field, f);
              }}
            />
            {isUploading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              icon
            )}
            <span>{hasFile ? `✓ ${label}` : label}</span>
          </label>
        );
      })}
    </div>
  );
}

// Character Modal
function CharacterModal({
  mode,
  initial,
  onClose,
  onSaved,
}: {
  mode: "create" | "edit";
  initial: Character | null;
  onClose: () => void;
  onSaved: (c: Character) => void;
}) {
  const [form, setForm] = useState<CreateCharacterDTO>(
    initial
      ? {
          name: initial.name,
          rarity: initial.rarity,
          element: initial.element,
          weapon_type: initial.weapon_type,
          race: initial.race ?? "",
          faction: initial.faction ?? "",
          class: initial.class ?? "",
          description: initial.description ?? "",
          order_index: initial.order_index,
        }
      : emptyForm,
  );
  const [saving, setSaving] = useState(false);
  const [savedChar, setSavedChar] = useState<Character | null>(initial);

  const set = (k: keyof CreateCharacterDTO, v: string | number) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const res =
        mode === "create"
          ? await charactersApi.create(form)
          : await charactersApi.update(initial!.id, form as UpdateCharacterDTO);
      setSavedChar(res.data);
      if (mode === "create") {
        // Stay open after create so user can upload media
      } else {
        onSaved(res.data);
        onClose();
      }
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  const handleMediaUploaded = (updated: Character) => {
    setSavedChar(updated);
    onSaved(updated);
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
        className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800">
          <h2 className="text-base font-bold text-white">
            {mode === "create" ? "Add Character" : `Edit — ${initial?.name}`}
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-800 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          {/* Name */}
          <FormField label="Name">
            <input
              className={inputCls}
              placeholder="e.g. Laevatain"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </FormField>

          {/* Rarity + Element */}
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Rarity">
              <select
                className={selectCls}
                value={form.rarity}
                onChange={(e) => set("rarity", Number(e.target.value))}
              >
                {RARITIES.map((r) => (
                  <option key={r} value={r}>
                    {r} ★
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Element">
              <select
                className={selectCls}
                value={form.element}
                onChange={(e) => set("element", e.target.value)}
              >
                {ELEMENTS.map((el) => (
                  <option key={el}>{el}</option>
                ))}
              </select>
            </FormField>
          </div>

          {/* Weapon type */}
          <FormField label="Weapon Type">
            <select
              className={selectCls}
              value={form.weapon_type}
              onChange={(e) => set("weapon_type", e.target.value)}
            >
              {WEAPON_TYPES.map((w) => (
                <option key={w}>{w}</option>
              ))}
            </select>
          </FormField>

          {/* Race + Faction */}
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Race">
              <input
                className={inputCls}
                placeholder="e.g. Sarkaz"
                value={form.race ?? ""}
                onChange={(e) => set("race", e.target.value)}
              />
            </FormField>
            <FormField label="Faction">
              <input
                className={inputCls}
                placeholder="e.g. Rhodes Island"
                value={form.faction ?? ""}
                onChange={(e) => set("faction", e.target.value)}
              />
            </FormField>
          </div>

          {/* Class */}
          <FormField label="Class">
            <select
              className={selectCls}
              value={form.class ?? ""}
              onChange={(e) => set("class", e.target.value)}
            >
              <option value="">Select class</option>
              {CLASSES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </FormField>

          {/* Description */}
          <FormField label="Description">
            <textarea
              className={`${inputCls} resize-none h-20`}
              placeholder="Character lore / description..."
              value={form.description ?? ""}
              onChange={(e) => set("description", e.target.value)}
            />
          </FormField>

          {/* Order index */}
          <FormField label="Order Index">
            <input
              type="number"
              className={inputCls}
              value={form.order_index ?? 0}
              onChange={(e) => set("order_index", Number(e.target.value))}
            />
          </FormField>

          {/* Save button */}
          <button
            onClick={handleSubmit}
            disabled={saving || !form.name.trim()}
            className="w-full py-2.5 rounded-xl bg-yellow-300 text-zinc-900 text-sm font-bold hover:bg-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : null}
            {mode === "create"
              ? savedChar
                ? "✓ Saved — Upload Media Below"
                : "Create Character"
              : "Save Changes"}
          </button>

          {/* Media upload shown after character is created/when editing */}
          {savedChar && (
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-1">
                Media
              </p>
              <MediaUploadRow
                character={savedChar}
                onUploaded={handleMediaUploaded}
              />
              {mode === "create" && (
                <button
                  onClick={() => {
                    onSaved(savedChar);
                    onClose();
                  }}
                  className="w-full mt-3 py-2 rounded-xl border border-zinc-700 text-zinc-400 text-sm hover:text-white hover:border-zinc-500 transition-all"
                >
                  Done
                </button>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// Delete Confirm
function DeleteConfirm({
  character,
  onClose,
  onDeleted,
}: {
  character: Character;
  onClose: () => void;
  onDeleted: (id: number) => void;
}) {
  const [deleting, setDeleting] = useState(false);

  const confirm = async () => {
    setDeleting(true);
    try {
      await charactersApi.delete(character.id);
      onDeleted(character.id);
      onClose();
    } catch {
      // silent
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-400/10 flex items-center justify-center">
            <Trash2 size={18} className="text-red-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Delete Character</p>
            <p className="text-xs text-zinc-500">
              This also deletes all media files.
            </p>
          </div>
        </div>
        <p className="text-sm text-zinc-300 mb-5">
          Are you sure you want to delete{" "}
          <span className="text-white font-bold">{character.name}</span>? This
          cannot be undone.
        </p>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl border border-zinc-700 text-zinc-400 text-sm hover:text-white transition-all"
          >
            Cancel
          </button>
          <button
            onClick={confirm}
            disabled={deleting}
            className="flex-1 py-2 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-bold hover:bg-red-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-40"
          >
            {deleting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Trash2 size={14} />
            )}
            Delete
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// Characters Page
export default function CharactersPage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<{
    mode: "create" | "edit";
    char: Character | null;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Character | null>(null);
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = async () => {
    try {
      const res = await charactersApi.getAll();
      setCharacters(res.data);
    } catch {
      showToast("Failed to load characters", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSaved = (c: Character) => {
    setCharacters((prev) => {
      const exists = prev.find((x) => x.id === c.id);
      return exists ? prev.map((x) => (x.id === c.id ? c : x)) : [...prev, c];
    });
    showToast(
      modal?.mode === "create" ? "Character created!" : "Character updated!",
      "success",
    );
  };

  const handleDeleted = (id: number) => {
    setCharacters((prev) => prev.filter((c) => c.id !== id));
    showToast("Character deleted", "success");
  };

  const filtered = characters.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.element.toLowerCase().includes(search.toLowerCase()) ||
      c.faction?.toLowerCase().includes(search.toLowerCase()) ||
      c.race?.toLowerCase().includes(search.toLowerCase()) ||
      c.class?.toLowerCase().includes(search.toLowerCase()) ||
      c.weapon_type.toLowerCase().includes(search.toLowerCase()),
  );

  const columns = [
    {
      key: "icon",
      label: "Icon",
      render: (c: Character) =>
        c.icon ? (
          <img
            src={c.icon}
            alt={c.name}
            className="w-9 h-9 rounded-lg object-cover border border-zinc-700"
          />
        ) : (
          <div className="w-9 h-9 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center">
            <ImageIcon size={14} className="text-zinc-600" />
          </div>
        ),
    },
    {
      key: "name",
      label: "Name",
      render: (c: Character) => (
        <div>
          <p className="font-semibold text-white">{c.name}</p>
          <RarityStars rarity={c.rarity} />
        </div>
      ),
    },
    { key: "element", label: "Element" },
    { key: "weapon_type", label: "Weapon" },
    { key: "race", label: "Race" },
    { key: "faction", label: "Faction" },
    { key: "class", label: "Class" },
    {
      key: "media",
      label: "Media",
      render: (c: Character) => {
        const count = [
          c.icon,
          c.splash_art,
          c.video_enter,
          c.video_idle,
        ].filter(Boolean).length;
        return (
          <span
            className={`text-xs font-mono ${count === 4 ? "text-yellow-400" : "text-zinc-500"}`}
          >
            {count}/4
          </span>
        );
      },
    },
  ];

  return (
    <div className="w-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <p className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-1">
          General Master
        </p>
        <h1 className="text-2xl font-extrabold text-white">Characters</h1>
      </motion.div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
          />
          <input
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-yellow-400 transition-colors"
            placeholder="Search name, element, class..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          onClick={() => setModal({ mode: "create", char: null })}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-yellow-300 text-zinc-900 text-sm font-bold hover:bg-yellow-400 transition-all"
        >
          <Plus size={15} />
          Add Character
        </button>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 mb-5">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 flex items-center gap-2">
          <span className="text-2xl font-black text-yellow-300">
            {characters.length}
          </span>
          <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
            Total
          </span>
        </div>
        {ELEMENTS.map((el) => {
          const count = characters.filter((c) => c.element === el).length;
          if (count === 0) return null;
          return (
            <div
              key={el}
              className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 flex items-center gap-2"
            >
              <span className="text-sm font-bold text-zinc-300">{count}</span>
              <span className="text-xs font-mono text-zinc-500">{el}</span>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
          onEdit={(c) => setModal({ mode: "edit", char: c })}
          onDelete={(c) => setDeleteTarget(c)}
        />
      </motion.div>

      {/* Modals */}
      <AnimatePresence>
        {modal && (
          <CharacterModal
            mode={modal.mode}
            initial={modal.char}
            onClose={() => setModal(null)}
            onSaved={handleSaved}
          />
        )}
        {deleteTarget && (
          <DeleteConfirm
            character={deleteTarget}
            onClose={() => setDeleteTarget(null)}
            onDeleted={handleDeleted}
          />
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
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
