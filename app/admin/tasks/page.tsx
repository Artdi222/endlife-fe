"use client";
import { useEffect, useState } from "react";
import DataTable from "@/components/admin/DataTable";
import Modal from "@/components/admin/Modal";
import Toast from "@/components/admin/Toast";
import { FormField, inputCls, selectCls } from "@/components/admin/FormField";
import { tasksApi, groupsApi, subGroupsApi, categoriesApi } from "@/lib/api";
import type { Task, Group, SubGroup } from "@/lib/types";

const empty: Omit<Task, "id"> = {
  name: "",
  group_id: 0,
  sub_group_id: null,
  max_progress: 1,
  reward_point: 0,
  order_index: 0,
};

export default function TasksPage() {
  const [data, setData] = useState<Task[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [subGroups, setSubGroups] = useState<SubGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<Task | null>(null);
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
      // categories → groups → sub groups + tasks per group
      const catRes = await categoriesApi.getAll();
      const cats = catRes.data ?? [];

      const groupArrays = await Promise.all(
        cats.map((c) => groupsApi.getByCategoryId(c.id)),
      );
      const allGroups = groupArrays.flatMap((r) => r.data ?? []);
      setGroups(allGroups);

      const [subArrays, taskArrays] = await Promise.all([
        Promise.all(allGroups.map((g) => subGroupsApi.getByGroupId(g.id))),
        Promise.all(allGroups.map((g) => tasksApi.getByGroupId(g.id))),
      ]);

      setSubGroups(subArrays.flatMap((r) => r.data ?? []));
      setData(taskArrays.flatMap((r) => r.data ?? []));
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
  const subName = (id?: number | null) =>
    id ? (subGroups.find((s) => s.id === id)?.name ?? `#${id}`) : "—";
  const filteredSubs = (gid: number) =>
    subGroups.filter((s) => s.group_id === gid);

  const handleCreate = async () => {
    if (!form.name.trim() || !form.group_id) return;
    setSubmitting(true);
    try {
      await tasksApi.create({
        ...form,
        group_id: Number(form.group_id),
        sub_group_id: form.sub_group_id ? Number(form.sub_group_id) : undefined,
        max_progress: Number(form.max_progress),
        reward_point: Number(form.reward_point),
        order_index: Number(form.order_index),
      });
      setForm(empty);
      await load();
      showToast("Task created!");
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
      await tasksApi.update(editing.id, {
        ...editing,
        group_id: Number(editing.group_id),
        sub_group_id: editing.sub_group_id
          ? Number(editing.sub_group_id)
          : undefined,
        max_progress: Number(editing.max_progress),
        reward_point: Number(editing.reward_point),
        order_index: Number(editing.order_index),
      });
      setEditing(null);
      await load();
      showToast("Task updated!");
    } catch {
      showToast("Failed to update", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (row: Task) => {
    if (!confirm(`Delete "${row.name}"?`)) return;
    try {
      await tasksApi.delete(row.id);
      await load();
      showToast("Task deleted!");
    } catch {
      showToast("Failed to delete", "error");
    }
  };

  const columns = [
    {
      key: "id",
      label: "ID",
      render: (r: Task) => (
        <span className="font-mono text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">
          #{r.id}
        </span>
      ),
    },
    { key: "name", label: "Name" },
    {
      key: "group_id",
      label: "Group",
      render: (r: Task) => (
        <span className="text-xs bg-yellow-300/10 text-yellow-300 border border-yellow-300/20 px-2 py-0.5 rounded-full">
          {grpName(r.group_id)}
        </span>
      ),
    },
    {
      key: "sub_group_id",
      label: "Sub Group",
      render: (r: Task) => (
        <span className="font-mono text-xs text-zinc-500">
          {subName(r.sub_group_id)}
        </span>
      ),
    },
    {
      key: "max_progress",
      label: "Max",
      render: (r: Task) => (
        <span className="text-xs bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 px-2 py-0.5 rounded-full">
          {r.max_progress}
        </span>
      ),
    },
    {
      key: "reward_point",
      label: "Points",
      render: (r: Task) => (
        <span className="font-mono text-sm text-yellow-300 font-bold">
          {r.reward_point}
        </span>
      ),
    },
    {
      key: "order_index",
      label: "Order",
      render: (r: Task) => (
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
          Tasks
        </h1>
        <p className="text-zinc-500 text-sm mt-1 font-mono">
          {data.length} records
        </p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
        <p className="text-xs font-mono uppercase tracking-widest text-yellow-300 mb-4">
          Add Task
        </p>
        <div className="flex gap-3 flex-wrap items-end">
          <div className="flex-1 min-w-52">
            <FormField label="Task Name">
              <input
                className={inputCls}
                placeholder="e.g. Complete Daily Quest"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </FormField>
          </div>
          <div className="flex-1 min-w-40">
            <FormField label="Group">
              <select
                className={selectCls}
                value={form.group_id}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    group_id: Number(e.target.value),
                    sub_group_id: null,
                  }))
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
          <div className="flex-1 min-w-40">
            <FormField label="Sub Group (optional)">
              <select
                className={selectCls}
                value={form.sub_group_id ?? ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    sub_group_id: e.target.value
                      ? Number(e.target.value)
                      : null,
                  }))
                }
              >
                <option value="">None</option>
                {filteredSubs(form.group_id).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
          <div className="w-24">
            <FormField label="Max Progress">
              <input
                type="number"
                min={1}
                className={inputCls}
                value={form.max_progress}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    max_progress: Number(e.target.value),
                  }))
                }
              />
            </FormField>
          </div>
          <div className="w-24">
            <FormField label="Reward Pts">
              <input
                type="number"
                className={inputCls}
                value={form.reward_point}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    reward_point: Number(e.target.value),
                  }))
                }
              />
            </FormField>
          </div>
          <div className="w-20">
            <FormField label="Order">
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
        <Modal title="Edit Task" onClose={() => setEditing(null)}>
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
                  (v) =>
                    v && {
                      ...v,
                      group_id: Number(e.target.value),
                      sub_group_id: null,
                    },
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
          <FormField label="Sub Group (optional)">
            <select
              className={selectCls}
              value={editing.sub_group_id ?? ""}
              onChange={(e) =>
                setEditing(
                  (v) =>
                    v && {
                      ...v,
                      sub_group_id: e.target.value
                        ? Number(e.target.value)
                        : null,
                    },
                )
              }
            >
              <option value="">None</option>
              {filteredSubs(editing.group_id).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </FormField>
          <div className="grid grid-cols-3 gap-3">
            <FormField label="Max Progress">
              <input
                type="number"
                min={1}
                className={inputCls}
                value={editing.max_progress}
                onChange={(e) =>
                  setEditing(
                    (v) => v && { ...v, max_progress: Number(e.target.value) },
                  )
                }
              />
            </FormField>
            <FormField label="Reward Pts">
              <input
                type="number"
                className={inputCls}
                value={editing.reward_point}
                onChange={(e) =>
                  setEditing(
                    (v) => v && { ...v, reward_point: Number(e.target.value) },
                  )
                }
              />
            </FormField>
            <FormField label="Order">
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
          </div>
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
