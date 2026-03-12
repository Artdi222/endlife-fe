"use client";
import { useEffect, useState } from "react";
import DataTable from "@/components/admin/DataTable";
import Modal from "@/components/admin/Modal";
import Toast from "@/components/admin/Toast";
import { FormField, inputCls, selectCls } from "@/components/admin/FormField";
import { usersApi } from "@/lib/api";
import type { User, CreateUserDTO, UpdateUserDTO } from "@/lib/types";

const emptyCreate: CreateUserDTO = {
  username: "",
  email: "",
  password: "",
  role: "user",
};

const ROLE_BADGE: Record<string, string> = {
  admin: "bg-yellow-300/10 text-yellow-300 border border-yellow-300/20",
  user: "bg-zinc-700/50 text-zinc-400 border border-zinc-700",
};

export default function UsersPage() {
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<CreateUserDTO>(emptyCreate);
  const [editing, setEditing] = useState<(User & { password?: string }) | null>(
    null,
  );
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
      const r = await usersApi.getAll();
      setData(r.data ?? []);
    } catch {
      showToast("Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async () => {
    if (!form.username.trim() || !form.email.trim() || !form.password.trim())
      return;
    setSubmitting(true);
    try {
      await usersApi.create(form);
      setForm(emptyCreate);
      await load();
      showToast("User created!");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to create user";
      showToast(message || "Failed to create user", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!editing) return;
    setSubmitting(true);
    try {
      const body: UpdateUserDTO = {
        username: editing.username,
        email: editing.email,
        role: editing.role,
        ...(editing.password ? { password: editing.password } : {}),
      };
      await usersApi.update(editing.id, body);
      setEditing(null);
      await load();
      showToast("User updated!");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to update user";
      showToast(message || "Failed to update user", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (row: User) => {
    if (!confirm(`Delete user "${row.username}"? This cannot be undone.`))
      return;
    try {
      await usersApi.delete(row.id);
      await load();
      showToast("User deleted!");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to delete user";
      showToast(message || "Failed to delete user", "error");
    }
  };

  const columns = [
    {
      key: "id",
      label: "ID",
      render: (r: User) => (
        <span className="font-mono text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">
          #{r.id}
        </span>
      ),
    },
    { key: "username", label: "Username" },
    {
      key: "email",
      label: "Email",
      render: (r: User) => (
        <span className="text-zinc-400 text-sm">{r.email}</span>
      ),
    },
    {
      key: "role",
      label: "Role",
      render: (r: User) => (
        <span
          className={`text-xs px-2.5 py-0.5 rounded-full font-mono uppercase tracking-wider ${ROLE_BADGE[r.role] ?? ROLE_BADGE.user}`}
        >
          {r.role}
        </span>
      ),
    },
    {
      key: "created_at",
      label: "Created",
      render: (r: User) => (
        <span className="font-mono text-xs text-zinc-500">
          {new Date(r.created_at).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Users
        </h1>
        <p className="text-zinc-500 text-sm mt-1 font-mono">
          {data.length} registered users
        </p>
      </div>

      {/* Add form */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
        <p className="text-xs font-mono uppercase tracking-widest text-yellow-300 mb-4">
          Add User
        </p>
        <div className="flex gap-3 flex-wrap items-end">
          <div className="flex-1 min-w-40">
            <FormField label="Username">
              <input
                className={inputCls}
                placeholder="johndoe"
                value={form.username}
                onChange={(e) =>
                  setForm((f) => ({ ...f, username: e.target.value }))
                }
              />
            </FormField>
          </div>
          <div className="flex-1 min-w-48">
            <FormField label="Email">
              <input
                type="email"
                className={inputCls}
                placeholder="john@example.com"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
              />
            </FormField>
          </div>
          <div className="flex-1 min-w-40">
            <FormField label="Password">
              <input
                type="password"
                className={inputCls}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) =>
                  setForm((f) => ({ ...f, password: e.target.value }))
                }
              />
            </FormField>
          </div>
          <div className="w-32">
            <FormField label="Role">
              <select
                className={selectCls}
                value={form.role}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    role: e.target.value as "user" | "admin",
                  }))
                }
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </FormField>
          </div>
          <button
            onClick={handleCreate}
            disabled={submitting}
            className="bg-yellow-300 text-zinc-950 font-bold text-sm px-5 py-2.5 rounded-lg hover:bg-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all whitespace-nowrap"
          >
            {submitting ? "Adding..." : "+ Add"}
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        onEdit={(row) => setEditing({ ...row, password: "" })}
        onDelete={handleDelete}
      />

      {/* Edit modal */}
      {editing && (
        <Modal title="Edit User" onClose={() => setEditing(null)}>
          <FormField label="Username">
            <input
              className={inputCls}
              value={editing.username}
              onChange={(e) =>
                setEditing((v) => v && { ...v, username: e.target.value })
              }
            />
          </FormField>
          <FormField label="Email">
            <input
              type="email"
              className={inputCls}
              value={editing.email}
              onChange={(e) =>
                setEditing((v) => v && { ...v, email: e.target.value })
              }
            />
          </FormField>
          <FormField label="Role">
            <select
              className={selectCls}
              value={editing.role}
              onChange={(e) =>
                setEditing(
                  (v) =>
                    v && { ...v, role: e.target.value as "user" | "admin" },
                )
              }
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </FormField>
          <FormField label="New Password (leave blank to keep current)">
            <input
              type="password"
              className={inputCls}
              placeholder="••••••••"
              value={editing.password ?? ""}
              onChange={(e) =>
                setEditing((v) => v && { ...v, password: e.target.value })
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
