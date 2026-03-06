"use client";
import { useEffect, useState } from "react";
import DataTable from "@/components/admin/DataTable";
import Modal from "@/components/admin/Modal";
import Toast from "@/components/admin/Toast";
import { FormField, inputCls, selectCls } from "@/components/admin/FormField";
import { subGroupsApi, groupsApi, categoriesApi } from "@/lib/api/index";
import type { SubGroup, Group, Category } from "@/lib/types";

const empty = { name: "", group_id: 0, order_index: 0 };

export default function SubGroupsPage() {
  const [data, setData] = useState<SubGroup[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<SubGroup | null>(null);
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
      // Load categories → groups per category → sub groups per group
      const catRes = await categoriesApi.getAll();
      const cats = catRes.data ?? [];
      setCategories(cats);

      const groupArrays = await Promise.all(
        cats.map((c) => groupsApi.getByCategoryId(c.id)),
      );
      const allGroups = groupArrays.flatMap((r) => r.data ?? []);
      setGroups(allGroups);

      const subArrays = await Promise.all(
        allGroups.map((g) => subGroupsApi.getByGroupId(g.id)),
      );
      setData(subArrays.flatMap((r) => r.data ?? []));
    } catch {
      showToast("Failed to load", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const grpName = (id: number) =>
    groups.find((g) => g.id === id)?.name ?? `#${id}`;

  const handleCreate = async () => {
    if (!form.name.trim() || !form.group_id) return;
    setSubmitting(true);
    try {
      await subGroupsApi.create({
        name: form.name,
        group_id: Number(form.group_id),
        order_index: Number(form.order_index),
      });
      setForm(empty);
      await load();
      showToast("Sub group created!");
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
      await subGroupsApi.update(editing.id, {
        ...editing,
        group_id: Number(editing.group_id),
        order_index: Number(editing.order_index),
      });
      setEditing(null);
      await load();
      showToast("Sub group updated!");
    } catch {
      showToast("Failed to update", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (row: SubGroup) => {
    if (!confirm(`Delete "${row.name}"?`)) return;
    try {
      await subGroupsApi.delete(row.id);
      await load();
      showToast("Sub group deleted!");
    } catch {
      showToast("Failed to delete", "error");
    }
  };

  const columns = [
    {
      key: "id",
      label: "ID",
      render: (r: SubGroup) => (
        <span className="font-mono text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">
          #{r.id}
        </span>
      ),
    },
    { key: "name", label: "Name" },
    {
      key: "group_id",
      label: "Group",
      render: (r: SubGroup) => (
        <span className="text-xs bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 px-2 py-0.5 rounded-full">
          {grpName(r.group_id)}
        </span>
      ),
    },
    {
      key: "order_index",
      label: "Order",
      render: (r: SubGroup) => (
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
          Sub Groups
        </h1>
        <p className="text-zinc-500 text-sm mt-1 font-mono">
          {data.length} records
        </p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
        <p className="text-xs font-mono uppercase tracking-widest text-yellow-300 mb-4">
          Add Sub Group
        </p>
        <div className="flex gap-3 flex-wrap items-end">
          <div className="flex-1 min-w-48">
            <FormField label="Name">
              <input
                className={inputCls}
                placeholder="e.g. Local Depot Deliverys"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
            </FormField>
          </div>
          <div className="flex-1 min-w-48">
            <FormField label="Group">
              <select
                className={selectCls}
                value={form.group_id}
                onChange={(e) =>
                  setForm((f) => ({ ...f, group_id: Number(e.target.value) }))
                }
              >
                <option value={0}>Select group...</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
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
        <Modal title="Edit Sub Group" onClose={() => setEditing(null)}>
          <FormField label="Name">
            <input
              className={inputCls}
              value={editing.name}
              onChange={(e) =>
                setEditing((v) => v && { ...v, name: e.target.value })
              }
            />
          </FormField>
          <FormField label="Group">
            <select
              className={selectCls}
              value={editing.group_id}
              onChange={(e) =>
                setEditing(
                  (v) => v && { ...v, group_id: Number(e.target.value) },
                )
              }
            >
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
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
