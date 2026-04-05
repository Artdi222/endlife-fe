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
  Eye,
  EyeOff,
} from "lucide-react";
import { newsBannersApi } from "@/lib/api/newsBanner.api";
import type {
  NewsBanner,
  CreateNewsBannerDTO,
  UpdateNewsBannerDTO,
} from "@/lib/types";
import DataTable from "@/components/admin/DataTable";
import Toast from "@/components/admin/Toast";
import { FormField, inputCls, selectCls } from "@/components/admin/FormField";

// ── Empty form ──────────────────────────────────────────────
const emptyForm: CreateNewsBannerDTO = {
  title: "",
  content: "",
  order_index: 0,
  is_active: true,
};

// ── Banner Modal ────────────────────────────────────────────
function BannerModal({
  mode,
  initial,
  onClose,
  onSaved,
}: {
  mode: "create" | "edit";
  initial: NewsBanner | null;
  onClose: () => void;
  onSaved: (b: NewsBanner) => void;
}) {
  const [form, setForm] = useState<CreateNewsBannerDTO>(
    initial
      ? {
          title: initial.title,
          content: initial.content ?? "",
          order_index: initial.order_index,
          is_active: initial.is_active,
        }
      : emptyForm,
  );
  const [saving, setSaving] = useState(false);
  const [savedBanner, setSavedBanner] = useState<NewsBanner | null>(initial);
  const [uploading, setUploading] = useState(false);

  const set = (k: keyof CreateNewsBannerDTO, v: string | number | boolean) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const res =
        mode === "create"
          ? await newsBannersApi.create(form)
          : await newsBannersApi.update(
              initial!.id,
              form as UpdateNewsBannerDTO,
            );
      setSavedBanner(res.data);
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

  const handleImageUpload = async (file: File) => {
    if (!savedBanner) return;
    setUploading(true);
    try {
      const res = await newsBannersApi.uploadImage(savedBanner.id, file);
      setSavedBanner(res.data);
      onSaved(res.data);
    } catch {
      // silent
    } finally {
      setUploading(false);
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
        className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800">
          <h2 className="text-base font-bold text-white">
            {mode === "create" ? "Add News Banner" : `Edit — ${initial?.title}`}
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-800 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          {/* Title */}
          <FormField label="Title">
            <input
              className={inputCls}
              placeholder="e.g. Version 1.2 Update"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
            />
          </FormField>

          {/* Content */}
          <FormField label="Content">
            <textarea
              className={`${inputCls} resize-none h-32`}
              placeholder="News body text / markdown content..."
              value={form.content ?? ""}
              onChange={(e) => set("content", e.target.value)}
            />
          </FormField>

          {/* Order + Active */}
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Order Index">
              <input
                type="number"
                className={inputCls}
                value={form.order_index ?? 0}
                onChange={(e) => set("order_index", Number(e.target.value))}
              />
            </FormField>
            <FormField label="Active">
              <select
                className={selectCls}
                value={form.is_active ? "true" : "false"}
                onChange={(e) => set("is_active", e.target.value === "true")}
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </FormField>
          </div>

          {/* Save button */}
          <button
            onClick={handleSubmit}
            disabled={saving || !form.title.trim()}
            className="w-full py-2.5 rounded-xl bg-yellow-300 text-zinc-900 text-sm font-bold hover:bg-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : null}
            {mode === "create"
              ? savedBanner
                ? "✓ Saved — Upload Image Below"
                : "Create Banner"
              : "Save Changes"}
          </button>

          {/* Image upload shown after banner is created/when editing */}
          {savedBanner && (
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-2">
                Banner Image
              </p>

              {/* Preview */}
              {savedBanner.image_url && (
                <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden border border-zinc-700 mb-2">
                  <img
                    src={savedBanner.image_url}
                    alt={savedBanner.title}
                    className="object-cover"
                  />
                </div>
              )}

              <label className="relative flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all text-xs font-mono border-zinc-700 bg-zinc-800/50 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleImageUpload(f);
                  }}
                />
                {uploading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <ImageIcon size={14} />
                )}
                <span>
                  {savedBanner.image_url ? "Replace Image" : "Upload Image"}
                </span>
              </label>

              {mode === "create" && (
                <button
                  onClick={() => {
                    onSaved(savedBanner);
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

// ── Delete Confirm ──────────────────────────────────────────
function DeleteConfirm({
  banner,
  onClose,
  onDeleted,
}: {
  banner: NewsBanner;
  onClose: () => void;
  onDeleted: (id: number) => void;
}) {
  const [deleting, setDeleting] = useState(false);

  const confirm = async () => {
    setDeleting(true);
    try {
      await newsBannersApi.delete(banner.id);
      onDeleted(banner.id);
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
            <p className="text-sm font-bold text-white">Delete Banner</p>
            <p className="text-xs text-zinc-500">
              This also deletes the image file.
            </p>
          </div>
        </div>
        <p className="text-sm text-zinc-300 mb-5">
          Are you sure you want to delete{" "}
          <span className="text-white font-bold">{banner.title}</span>? This
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

// ── News Banners Page ───────────────────────────────────────
export default function NewsBannersPage() {
  const [banners, setBanners] = useState<NewsBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<{
    mode: "create" | "edit";
    banner: NewsBanner | null;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<NewsBanner | null>(null);
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
      const res = await newsBannersApi.getAll();
      setBanners(res.data);
    } catch {
      showToast("Failed to load banners", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSaved = (b: NewsBanner) => {
    setBanners((prev) => {
      const exists = prev.find((x) => x.id === b.id);
      return exists ? prev.map((x) => (x.id === b.id ? b : x)) : [...prev, b];
    });
    showToast(
      modal?.mode === "create" ? "Banner created!" : "Banner updated!",
      "success",
    );
  };

  const handleDeleted = (id: number) => {
    setBanners((prev) => prev.filter((b) => b.id !== id));
    showToast("Banner deleted", "success");
  };

  const filtered = banners.filter((b) =>
    b.title.toLowerCase().includes(search.toLowerCase()),
  );

  const columns = [
    {
      key: "image",
      label: "Image",
      render: (b: NewsBanner) =>
        b.image_url ? (
          <img
            src={b.image_url}
            alt={b.title}
            className="w-20 h-11 rounded-lg object-cover border border-zinc-700"
          />
        ) : (
          <div className="w-20 h-11 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center">
            <ImageIcon size={14} className="text-zinc-600" />
          </div>
        ),
    },
    {
      key: "title",
      label: "Title",
      render: (b: NewsBanner) => (
        <p className="font-semibold text-white">{b.title}</p>
      ),
    },
    {
      key: "order_index",
      label: "Order",
      render: (b: NewsBanner) => (
        <span className="text-xs font-mono text-zinc-400">
          {b.order_index}
        </span>
      ),
    },
    {
      key: "is_active",
      label: "Status",
      render: (b: NewsBanner) =>
        b.is_active ? (
          <span className="inline-flex items-center gap-1 text-xs font-mono text-green-400">
            <Eye size={12} /> Active
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-mono text-zinc-500">
            <EyeOff size={12} /> Inactive
          </span>
        ),
    },
    {
      key: "content",
      label: "Content",
      render: (b: NewsBanner) => (
        <span className="text-xs text-zinc-500 truncate max-w-[200px] block">
          {b.content ? `${b.content.slice(0, 60)}…` : "—"}
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
        <h1 className="text-2xl font-extrabold text-white">News Banners</h1>
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
            placeholder="Search title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          onClick={() => setModal({ mode: "create", banner: null })}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-yellow-300 text-zinc-900 text-sm font-bold hover:bg-yellow-400 transition-all"
        >
          <Plus size={15} />
          Add Banner
        </button>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 mb-5">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 flex items-center gap-2">
          <span className="text-2xl font-black text-yellow-300">
            {banners.length}
          </span>
          <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
            Total
          </span>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 flex items-center gap-2">
          <span className="text-sm font-bold text-green-400">
            {banners.filter((b) => b.is_active).length}
          </span>
          <span className="text-xs font-mono text-zinc-500">Active</span>
        </div>
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
          onEdit={(b) => setModal({ mode: "edit", banner: b })}
          onDelete={(b) => setDeleteTarget(b)}
        />
      </motion.div>

      {/* Modals */}
      <AnimatePresence>
        {modal && (
          <BannerModal
            mode={modal.mode}
            initial={modal.banner}
            onClose={() => setModal(null)}
            onSaved={handleSaved}
          />
        )}
        {deleteTarget && (
          <DeleteConfirm
            banner={deleteTarget}
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
