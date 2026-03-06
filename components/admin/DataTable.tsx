"use client";

interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onEdit: (row: T) => void;
  onDelete: (row: T) => void;
  loading?: boolean;
}

export default function DataTable<T extends { id: number }>({
  columns,
  data,
  onEdit,
  onDelete,
  loading,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 bg-zinc-900 border border-zinc-800 rounded-xl">
        <div className="w-7 h-7 border-2 border-zinc-700 border-t-lime-400 rounded-full animate-spin" />
        <span className="text-zinc-400 text-sm">Loading...</span>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 bg-zinc-900 border border-zinc-800 rounded-xl">
        <span className="text-4xl opacity-20">◈</span>
        <p className="text-zinc-400 text-sm">No records yet. Add one above.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-800">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-zinc-900 border-b border-zinc-800">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-left text-xs font-mono uppercase tracking-widest text-zinc-500"
              >
                {col.label}
              </th>
            ))}
            <th className="px-4 py-3 text-left text-xs font-mono uppercase tracking-widest text-zinc-500">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={row.id}
              className={`border-b border-zinc-800 last:border-0 hover:bg-zinc-800/50 transition-colors
                ${i % 2 === 0 ? "bg-zinc-900" : "bg-zinc-900/60"}`}
            >
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-sm text-zinc-200">
                  {col.render
                    ? col.render(row)
                    : String((row as Record<string, unknown>)[col.key] ?? "—")}
                </td>
              ))}
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEdit(row)}
                    className="px-3 py-1.5 rounded-lg text-xs font-mono bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 hover:bg-emerald-400/20 transition-all"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(row)}
                    className="px-3 py-1.5 rounded-lg text-xs font-mono bg-red-400/10 text-red-400 border border-red-400/20 hover:bg-red-400/20 transition-all"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
