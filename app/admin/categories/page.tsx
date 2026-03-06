"use client";
import { useEffect, useState } from "react";
import DataTable from "@/components/admin/DataTable";
import Modal from "@/components/admin/Modal";
import Toast from "@/components/admin/Toast";
import { FormField, inputCls } from "@/components/admin/FormField";
import { categoriesApi } from "@/lib/api/index";
import type { Category } from "@/lib/types";

const empty = { name: "", order_index: 0 };

export default function CategoriesPage() {
  const [data, setData] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<Category | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = async () => {
    setLoading(true);
    try {
      const r = await categoriesApi.getAll();
      setData(r.data ?? []);
    } catch {
      showToast("Failed to load", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    setSubmitting(true);
    try {
      await categoriesApi.create({
        name: form.name,
        order_index: Number(form.order_index),
      });
      setForm(empty);
      await load();
      showToast("Category created!");
    } catch {
      showToast("Failed to create", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!editing) return;
    setSubmitting(true);
    try {
      await categoriesApi.update(editing.id, {
        name: editing.name,
        order_index: Number(editing.order_index),
      });
      setEditing(null);
      await load();
      showToast("Category updated!");
    } catch {
      showToast("Failed to update", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (row: Category) => {
    if (!confirm(`Delete "${row.name}"?`)) return;
    try {
      await categoriesApi.delete(row.id);
      await load();
      showToast("Category deleted!");
    } catch {
      showToast("Failed to delete", "error");
    }
  };

  const columns = [
    {
      key: "id",
      label: "ID",
      render: (r: Category) => (
        <span className="font-mono text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">
          #{r.id}
        </span>
      ),
    },
    { key: "name", label: "Name" },
    {
      key: "order_index",
      label: "Order",
      render: (r: Category) => (
        <span className="font-mono text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">
          {r.order_index}
        </span>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Categories
        </h1>
        <p className="text-zinc-500 text-sm mt-1 font-mono">
          {data.length} records
        </p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
        <p className="text-xs font-mono uppercase tracking-widest text-yellow-300 mb-4">
          Add Category
        </p>
        <div className="flex gap-3 flex-wrap items-end">
          <div className="flex-1 min-w-48">
            <FormField label="Name">
              <input
                className={inputCls}
                placeholder="e.g. World Management"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
            </FormField>
          </div>
          <div className="w-32">
            <FormField label="Order Index">
              <input
                type="number"
                className={inputCls}
                value={form.order_index}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    order_index: Number(e.target.value),
                  }))
                }
              />
            </FormField>
          </div>
          <button
            onClick={handleCreate}
            disabled={submitting}
            className="bg-yellow-300 text-zinc-950 font-bold text-sm px-5 py-2.5 rounded-lg hover:bg-yellow-400 disabled:opacity-40 transition-all whitespace-nowrap"
          >
            {submitting ? "Adding..." : "+ Add"}
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        onEdit={(row) => setEditing({ ...row })}
        onDelete={handleDelete}
      />

      {editing && (
        <Modal title="Edit Category" onClose={() => setEditing(null)}>
          <FormField label="Name">
            <input
              className={inputCls}
              value={editing.name}
              onChange={(e) =>
                setEditing((v) => v && { ...v, name: e.target.value })
              }
            />
          </FormField>
          <FormField label="Order Index">
            <input
              type="number"
              className={inputCls}
              value={editing.order_index}
              onChange={(e) =>
                setEditing(
                  (v) => v && { ...v, order_index: Number(e.target.value) },
                )
              }
            />
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setEditing(null)}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              disabled={submitting}
              className="px-4 py-2 rounded-lg text-sm font-bold bg-yellow-300 text-zinc-950 hover:bg-yellow-400 disabled:opacity-40 transition-all"
            >
              {submitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </Modal>
      )}
      {toast && <Toast {...toast} />}
    </div>
  );
}
