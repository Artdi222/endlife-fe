"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  X,
  Trash2,
  Image as ImageIcon,
  Star,
  Search,
  Loader2,
} from "lucide-react";
import { weaponsApi } from "@/lib/api/ascension/weapon.api";
import type { Weapon, CreateWeaponDTO, UpdateWeaponDTO } from "@/lib/types";
import DataTable from "@/components/admin/DataTable";
import Toast from "@/components/admin/Toast";
import { FormField, inputCls, selectCls } from "@/components/admin/FormField";

// ── Constants ────────────────────────────────────────────────
const WEAPON_TYPES = ["Sword", "Greatsword", "Gun", "Polearm", "Arts Unit"];
const RARITIES = [3, 4, 5, 6];

const emptyForm: CreateWeaponDTO = {
  name: "",
  rarity: 5,
  type: "Sword",
  order_index: 0,
};

// ── Rarity Stars ─────────────────────────────────────────────
function RarityStars({ rarity }: { rarity: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: rarity }).map((_, i) => (
        <Star key={i} size={10} className="text-yellow-400 fill-yellow-400" />
      ))}
    </div>
  );
}

// ── Icon Upload Row ───────────────────────────────────────────
function IconUploadRow({
  weapon,
  onUploaded,
}: {
  weapon: Weapon;
  onUploaded: (updated: Weapon) => void;
}) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const res = await weaponsApi.uploadIcon(weapon.id, file);
      onUploaded(res.data);
    } catch {
      // silent — toast handled by parent
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mt-3 pt-3 border-t border-zinc-800">
      <label
        className={`relative flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all text-xs font-mono
          ${
            weapon.icon
              ? "border-yellow-400/40 bg-yellow-400/5 text-yellow-400"
              : "border-zinc-700 bg-zinc-800/50 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300"
          }`}
      >
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleUpload(f);
          }}
        />
        {uploading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <ImageIcon size={14} />
        )}
        <span>{weapon.icon ? "✓ Icon" : "Icon"}</span>
      </label>
    </div>
  );
}

// ── Weapon Form Modal ─────────────────────────────────────────
function WeaponModal({
  mode,
  initial,
  onClose,
  onSaved,
}: {
  mode: "create" | "edit";
  initial: Weapon | null;
  onClose: () => void;
  onSaved: (w: Weapon) => void;
}) {
  const [form, setForm] = useState<CreateWeaponDTO>(
    initial
      ? {
          name: initial.name,
          rarity: initial.rarity,
          type: initial.type,
          order_index: initial.order_index,
        }
      : emptyForm,
  );
  const [saving, setSaving] = useState(false);
  const [savedWeapon, setSavedWeapon] = useState<Weapon | null>(initial);

  const set = (k: keyof CreateWeaponDTO, v: string | number) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const res =
        mode === "create"
          ? await weaponsApi.create(form)
          : await weaponsApi.update(initial!.id, form as UpdateWeaponDTO);
      setSavedWeapon(res.data);
      if (mode === "edit") {
        onSaved(res.data);
        onClose();
      }
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  const handleIconUploaded = (updated: Weapon) => {
    setSavedWeapon(updated);
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
            {mode === "create" ? "Add Weapon" : `Edit — ${initial?.name}`}
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
              placeholder="e.g. Blazing Sun"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </FormField>

          {/* Rarity + Type */}
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
            <FormField label="Type">
              <select
                className={selectCls}
                value={form.type}
                onChange={(e) => set("type", e.target.value)}
              >
                {WEAPON_TYPES.map((w) => (
                  <option key={w}>{w}</option>
                ))}
              </select>
            </FormField>
          </div>

          {/* Order Index */}
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
              ? savedWeapon
                ? "✓ Saved — Upload Icon Below"
                : "Create Weapon"
              : "Save Changes"}
          </button>

          {/* Icon upload — shown after weapon is created / when editing */}
          {savedWeapon && (
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-1">
                Media
              </p>
              <IconUploadRow
                weapon={savedWeapon}
                onUploaded={handleIconUploaded}
              />
              {mode === "create" && (
                <button
                  onClick={() => {
                    onSaved(savedWeapon);
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

// ── Delete Confirm ────────────────────────────────────────────
function DeleteConfirm({
  weapon,
  onClose,
  onDeleted,
}: {
  weapon: Weapon;
  onClose: () => void;
  onDeleted: (id: number) => void;
}) {
  const [deleting, setDeleting] = useState(false);

  const confirm = async () => {
    setDeleting(true);
    try {
      await weaponsApi.delete(weapon.id);
      onDeleted(weapon.id);
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
            <p className="text-sm font-bold text-white">Delete Weapon</p>
            <p className="text-xs text-zinc-500">
              This also deletes the icon file.
            </p>
          </div>
        </div>
        <p className="text-sm text-zinc-300 mb-5">
          Are you sure you want to delete{" "}
          <span className="text-white font-bold">{weapon.name}</span>? This
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

// ── Main Page ─────────────────────────────────────────────────
export default function WeaponsPage() {
  const [weapons, setWeapons] = useState<Weapon[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<{
    mode: "create" | "edit";
    weapon: Weapon | null;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Weapon | null>(null);
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
      const res = await weaponsApi.getAll();
      setWeapons(res.data);
    } catch {
      showToast("Failed to load weapons", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSaved = (w: Weapon) => {
    setWeapons((prev) => {
      const exists = prev.find((x) => x.id === w.id);
      return exists ? prev.map((x) => (x.id === w.id ? w : x)) : [...prev, w];
    });
    showToast(
      modal?.mode === "create" ? "Weapon created!" : "Weapon updated!",
      "success",
    );
  };

  const handleDeleted = (id: number) => {
    setWeapons((prev) => prev.filter((w) => w.id !== id));
    showToast("Weapon deleted", "success");
  };

  const filtered = weapons.filter(
    (w) =>
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.type.toLowerCase().includes(search.toLowerCase()),
  );

  const columns = [
    {
      key: "icon",
      label: "Icon",
      render: (w: Weapon) =>
        w.icon ? (
          <img
            width={64}
            height={64}
            src={w.icon}
            alt={w.name}
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
      render: (w: Weapon) => (
        <div>
          <p className="font-semibold text-white">{w.name}</p>
          <RarityStars rarity={w.rarity} />
        </div>
      ),
    },
    { key: "type", label: "Type" },
    { key: "order_index", label: "Order" },
    {
      key: "icon_status",
      label: "Icon",
      render: (w: Weapon) => (
        <span
          className={`text-xs font-mono ${w.icon ? "text-yellow-400" : "text-zinc-500"}`}
        >
          {w.icon ? "✓" : "—"}
        </span>
      ),
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
        <h1 className="text-2xl font-extrabold text-white">Weapons</h1>
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
            placeholder="Search name, type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          onClick={() => setModal({ mode: "create", weapon: null })}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-yellow-300 text-zinc-900 text-sm font-bold hover:bg-yellow-400 transition-all"
        >
          <Plus size={15} />
          Add Weapon
        </button>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 mb-5">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 flex items-center gap-2">
          <span className="text-2xl font-black text-yellow-300">
            {weapons.length}
          </span>
          <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
            Total
          </span>
        </div>
        {WEAPON_TYPES.map((type) => {
          const count = weapons.filter((w) => w.type === type).length;
          if (count === 0) return null;
          return (
            <div
              key={type}
              className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 flex items-center gap-2"
            >
              <span className="text-sm font-bold text-zinc-300">{count}</span>
              <span className="text-xs font-mono text-zinc-500">{type}</span>
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
          onEdit={(w) => setModal({ mode: "edit", weapon: w })}
          onDelete={(w) => setDeleteTarget(w)}
        />
      </motion.div>

      {/* Modals */}
      <AnimatePresence>
        {modal && (
          <WeaponModal
            mode={modal.mode}
            initial={modal.weapon}
            onClose={() => setModal(null)}
            onSaved={handleSaved}
          />
        )}
        {deleteTarget && (
          <DeleteConfirm
            weapon={deleteTarget}
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
