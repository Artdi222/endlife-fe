"use client";
import { useEffect, useState } from "react";
import DataTable from "@/components/admin/DataTable";
import Modal from "@/components/admin/Modal";
import Toast from "@/components/admin/Toast";
import { FormField, inputCls, selectCls } from "@/components/admin/FormField";
import { groupsApi, categoriesApi } from "@/lib/api";
import type { Group, Category } from "@/lib/types";

const empty = { name: "", category_id: 0, order_index: 0 };

export default function GroupsPage() {
  const [data, setData] = useState<Group[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<Group | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Groups are fetched per category — load all categories then fetch all groups
  const load = async () => {
    setLoading(true);
    try {
      const catRes = await categoriesApi.getAll();
      const cats = catRes.data ?? [];
      setCategories(cats);

      const groupArrays = await Promise.all(
        cats.map((c) => groupsApi.getByCategoryId(c.id)),
      );
      setData(groupArrays.flatMap((r) => r.data ?? []));
    } catch {
      showToast("Failed to load", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const catName = (id: number) =>
    categories.find((c) => c.id === id)?.name ?? `#${id}`;

  const handleCreate = async () => {
    if (!form.name.trim() || !form.category_id) return;
    setSubmitting(true);
    try {
      await groupsApi.create({
        name: form.name,
        category_id: Number(form.category_id),
        order_index: Number(form.order_index),
      });
      setForm(empty);
      await load();
      showToast("Group created!");
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
      await groupsApi.update(editing.id, {
        ...editing,
        category_id: Number(editing.category_id),
        order_index: Number(editing.order_index),
      });
      setEditing(null);
      await load();
      showToast("Group updated!");
    } catch {
      showToast("Failed to update", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (row: Group) => {
    if (!confirm(`Delete "${row.name}"?`)) return;
    try {
      await groupsApi.delete(row.id);
      await load();
      showToast("Group deleted!");
    } catch {
      showToast("Failed to delete", "error");
    }
  };

  const columns = [
    {
      key: "id",
      label: "ID",
      render: (r: Group) => (
        <span className="font-mono text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">
          #{r.id}
        </span>
      ),
    },
    { key: "name", label: "Name" },
    {
      key: "category_id",
      label: "Category",
      render: (r: Group) => (
        <span className="text-xs bg-yellow-300/10 text-yellow-300 border border-yellow-300/20 px-2 py-0.5 rounded-full">
          {catName(r.category_id)}
        </span>
      ),
    },
    {
      key: "order_index",
      label: "Order",
      render: (r: Group) => (
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
          Groups
        </h1>
        <p className="text-zinc-500 text-sm mt-1 font-mono">
          {data.length} records
        </p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
        <p className="text-xs font-mono uppercase tracking-widest text-yellow-300 mb-4">
          Add Group
        </p>
        <div className="flex gap-3 flex-wrap items-end">
          <div className="flex-1 min-w-48">
            <FormField label="Name">
              <input
                className={inputCls}
                placeholder="e.g. Global Priorities"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </FormField>
          </div>
          <div className="flex-1 min-w-48">
            <FormField label="Category">
              <select
                className={selectCls}
                value={form.category_id}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    category_id: Number(e.target.value),
                  }))
                }
              >
                <option value={0}>Select category...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
          <div className="w-28">
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
        <Modal title="Edit Group" onClose={() => setEditing(null)}>
          <FormField label="Name">
            <input
              className={inputCls}
              value={editing.name}
              onChange={(e) =>
                setEditing((v) => v && { ...v, name: e.target.value })
              }
            />
          </FormField>
          <FormField label="Category">
            <select
              className={selectCls}
              value={editing.category_id}
              onChange={(e) =>
                setEditing(
                  (v) => v && { ...v, category_id: Number(e.target.value) },
                )
              }
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
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
