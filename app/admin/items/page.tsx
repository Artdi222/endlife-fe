"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  X,
  Trash2,
  Image as ImageIcon,
  Search,
  Loader2,
} from "lucide-react";
import { itemsApi } from "@/lib/api/ascension/item.api";
import type {
  Item,
  ItemCategory,
  CreateItemDTO,
  UpdateItemDTO,
} from "@/lib/types";
import DataTable from "@/components/admin/DataTable";
import Toast from "@/components/admin/Toast";
import { FormField, inputCls, selectCls } from "@/components/admin/FormField";

// ── Constants ─────────────────────────────────────────────────
const CATEGORIES: ItemCategory[] = [
  "Progression Materials",
  "Naturals",
  "Gatherables",
  "Rare Materials",
  "AIC Products",
  "Usables",
  "Functionals",
  "Operator Gifts",
  "Currency",
];

const emptyForm: CreateItemDTO = {
  name: "",
  category: "Naturals",
  exp_value: 0,
  order_index: 0,
};

// ── Image Upload Row ──────────────────────────────────────────
function ImageUploadRow({
  item,
  onUploaded,
}: {
  item: Item;
  onUploaded: (updated: Item) => void;
}) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const res = await itemsApi.uploadImage(item.id, file);
      onUploaded(res.data);
    } catch {
      // silent
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mt-3 pt-3 border-t border-zinc-800">
      <label
        className={`relative flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all text-xs font-mono
          ${
            item.image
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
        <span>{item.image ? "✓ Image" : "Image"}</span>
      </label>
    </div>
  );
}

// ── Item Form Modal ───────────────────────────────────────────
function ItemModal({
  mode,
  initial,
  onClose,
  onSaved,
}: {
  mode: "create" | "edit";
  initial: Item | null;
  onClose: () => void;
  onSaved: (item: Item) => void;
}) {
  const [form, setForm] = useState<CreateItemDTO>(
    initial
      ? {
          name: initial.name,
          category: initial.category,
          exp_value: initial.exp_value,
          order_index: initial.order_index,
        }
      : emptyForm,
  );
  const [saving, setSaving] = useState(false);
  const [savedItem, setSavedItem] = useState<Item | null>(initial);

  const set = (k: keyof CreateItemDTO, v: string | number) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const res =
        mode === "create"
          ? await itemsApi.create(form)
          : await itemsApi.update(initial!.id, form as UpdateItemDTO);
      setSavedItem(res.data);
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

  const handleImageUploaded = (updated: Item) => {
    setSavedItem(updated);
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
            {mode === "create" ? "Add Item" : `Edit — ${initial?.name}`}
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
              placeholder="e.g. Crystalline Circuit"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </FormField>

          {/* Category */}
          <FormField label="Category">
            <select
              className={selectCls}
              value={form.category}
              onChange={(e) => set("category", e.target.value as ItemCategory)}
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </FormField>

          {/* EXP Value + Order Index */}
          <div className="grid grid-cols-2 gap-3">
            <FormField label="EXP Value">
              <input
                type="number"
                className={inputCls}
                placeholder="0"
                value={form.exp_value ?? 0}
                onChange={(e) => set("exp_value", Number(e.target.value))}
              />
            </FormField>
            <FormField label="Order Index">
              <input
                type="number"
                className={inputCls}
                value={form.order_index ?? 0}
                onChange={(e) => set("order_index", Number(e.target.value))}
              />
            </FormField>
          </div>

          {/* Save button */}
          <button
            onClick={handleSubmit}
            disabled={saving || !form.name.trim()}
            className="w-full py-2.5 rounded-xl bg-yellow-300 text-zinc-900 text-sm font-bold hover:bg-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : null}
            {mode === "create"
              ? savedItem
                ? "✓ Saved — Upload Image Below"
                : "Create Item"
              : "Save Changes"}
          </button>

          {/* Image upload — shown after item is created / when editing */}
          {savedItem && (
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-1">
                Media
              </p>
              <ImageUploadRow
                item={savedItem}
                onUploaded={handleImageUploaded}
              />
              {mode === "create" && (
                <button
                  onClick={() => {
                    onSaved(savedItem);
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
  item,
  onClose,
  onDeleted,
}: {
  item: Item;
  onClose: () => void;
  onDeleted: (id: number) => void;
}) {
  const [deleting, setDeleting] = useState(false);

  const confirm = async () => {
    setDeleting(true);
    try {
      await itemsApi.delete(item.id);
      onDeleted(item.id);
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
            <p className="text-sm font-bold text-white">Delete Item</p>
            <p className="text-xs text-zinc-500">
              This also deletes the image file.
            </p>
          </div>
        </div>
        <p className="text-sm text-zinc-300 mb-5">
          Are you sure you want to delete{" "}
          <span className="text-white font-bold">{item.name}</span>? This cannot
          be undone.
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
export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<ItemCategory | "All">(
    "All",
  );
  const [modal, setModal] = useState<{
    mode: "create" | "edit";
    item: Item | null;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Item | null>(null);
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
      const res = await itemsApi.getAll();
      setItems(res.data);
    } catch {
      showToast("Failed to load items", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSaved = (item: Item) => {
    setItems((prev) => {
      const exists = prev.find((x) => x.id === item.id);
      return exists
        ? prev.map((x) => (x.id === item.id ? item : x))
        : [...prev, item];
    });
    showToast(
      modal?.mode === "create" ? "Item created!" : "Item updated!",
      "success",
    );
  };

  const handleDeleted = (id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    showToast("Item deleted", "success");
  };

  const filtered = items.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === "All" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const columns = [
    {
      key: "image",
      label: "Image",
      render: (item: Item) =>
        item.image ? (
          <img
            src={item.image}
            alt={item.name}
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
      render: (item: Item) => (
        <p className="font-semibold text-white">{item.name}</p>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (item: Item) => (
        <span className="text-xs font-mono text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded-md">
          {item.category}
        </span>
      ),
    },
    {
      key: "exp_value",
      label: "EXP",
      render: (item: Item) => (
        <span
          className={`text-xs font-mono ${item.exp_value > 0 ? "text-yellow-400" : "text-zinc-600"}`}
        >
          {item.exp_value > 0 ? item.exp_value.toLocaleString() : "—"}
        </span>
      ),
    },
    { key: "order_index", label: "Order" },
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
        <h1 className="text-2xl font-extrabold text-white">Items</h1>
      </motion.div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
          />
          <input
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-yellow-400 transition-colors"
            placeholder="Search name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-yellow-400 transition-colors"
          value={categoryFilter}
          onChange={(e) =>
            setCategoryFilter(e.target.value as ItemCategory | "All")
          }
        >
          <option value="All">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <button
          onClick={() => setModal({ mode: "create", item: null })}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-yellow-300 text-zinc-900 text-sm font-bold hover:bg-yellow-400 transition-all"
        >
          <Plus size={15} />
          Add Item
        </button>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 mb-5 flex-wrap">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 flex items-center gap-2">
          <span className="text-2xl font-black text-yellow-300">
            {items.length}
          </span>
          <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
            Total
          </span>
        </div>
        {CATEGORIES.map((cat) => {
          const count = items.filter((i) => i.category === cat).length;
          if (count === 0) return null;
          return (
            <div
              key={cat}
              className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 flex items-center gap-2 cursor-pointer hover:border-zinc-600 transition-colors"
              onClick={() =>
                setCategoryFilter((prev) => (prev === cat ? "All" : cat))
              }
            >
              <span className="text-sm font-bold text-zinc-300">{count}</span>
              <span className="text-xs font-mono text-zinc-500">{cat}</span>
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
          onEdit={(item) => setModal({ mode: "edit", item })}
          onDelete={(item) => setDeleteTarget(item)}
        />
      </motion.div>

      {/* Modals */}
      <AnimatePresence>
        {modal && (
          <ItemModal
            mode={modal.mode}
            initial={modal.item}
            onClose={() => setModal(null)}
            onSaved={handleSaved}
          />
        )}
        {deleteTarget && (
          <DeleteConfirm
            item={deleteTarget}
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
