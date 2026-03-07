"use client";

import { useEffect, useState, useCallback } from "react";
import { dailyApi } from "@/lib/api/daily.api";
import type {
  DailyChecklistRow,
  ActivityLevelResult,
  GlobalProgressResult,
  SanityResult,
} from "@/lib/types/daily.types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toDateString = (d: Date) => d.toISOString().split("T")[0]; // "YYYY-MM-DD"

// Group flat rows → { category → { group → { subGroup|null → task[] } } }
type TaskNode = DailyChecklistRow;
type SubGroupMap = Map<string | null, TaskNode[]>;
type GroupMap = Map<number, { name: string; subGroups: SubGroupMap }>;
type CategoryMap = Map<number, { name: string; groups: GroupMap }>;

function groupChecklist(rows: DailyChecklistRow[]): CategoryMap {
  const map: CategoryMap = new Map();

  for (const row of rows) {
    if (!map.has(row.category_id)) {
      map.set(row.category_id, { name: row.category_name, groups: new Map() });
    }
    const cat = map.get(row.category_id)!;

    if (!cat.groups.has(row.group_id)) {
      cat.groups.set(row.group_id, { name: row.group_name, subGroups: new Map() });
    }
    const grp = cat.groups.get(row.group_id)!;

    const subKey = row.sub_group_id ? String(row.sub_group_id) : null;
    if (!grp.subGroups.has(subKey)) {
      grp.subGroups.set(subKey, []);
    }
    grp.subGroups.get(subKey)!.push(row);
  }

  return map;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max === 0 ? 0 : Math.min((value / max) * 100, 100);
  const done = value >= max;
  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex-1 h-1.5 bg-zinc-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${done ? "bg-yellow-400" : "bg-zinc-400"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`text-xs font-mono ${done ? "text-yellow-500" : "text-zinc-400"}`}>
        {value}/{max}
      </span>
    </div>
  );
}

function TaskItem({
  task,
  onIncrement,
  onDecrement,
}: {
  task: TaskNode;
  onIncrement: (task: TaskNode) => void;
  onDecrement: (task: TaskNode) => void;
}) {
  const done = task.current_progress >= task.max_progress;

  return (
    <div
      className={`flex items-start justify-between gap-3 px-4 py-3 rounded-xl border transition-all ${
        done
          ? "bg-yellow-50 border-yellow-200"
          : "bg-zinc-50 border-zinc-200 hover:border-zinc-300"
      }`}
    >
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${done ? "text-yellow-700 line-through" : "text-zinc-800"}`}>
          {task.task_name}
        </p>
        <ProgressBar value={task.current_progress} max={task.max_progress} />
        <p className="text-xs text-zinc-400 mt-0.5">+{task.reward_point} pts</p>
      </div>

      <div className="flex items-center gap-1 pt-0.5 shrink-0">
        <button
          onClick={() => onDecrement(task)}
          disabled={task.current_progress <= 0}
          className="w-7 h-7 rounded-lg bg-zinc-200 text-zinc-600 text-sm font-bold hover:bg-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          −
        </button>
        <button
          onClick={() => onIncrement(task)}
          disabled={done}
          className="w-7 h-7 rounded-lg bg-yellow-300 text-zinc-900 text-sm font-bold hover:bg-yellow-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          +
        </button>
      </div>
    </div>
  );
}

function SanityCard({
  sanity,
  userId,
  onEmpty,
  onRefresh,
}: {
  sanity: SanityResult;
  userId: number;
  onEmpty: () => void;
  onRefresh: () => void;
}) {
  const pct =
    sanity.max_sanity === 0
      ? 0
      : Math.min((sanity.current_sanity / sanity.max_sanity) * 100, 100);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return [h > 0 && `${h}h`, m > 0 && `${m}m`, `${sec}s`]
      .filter(Boolean)
      .join(" ");
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-zinc-700 uppercase tracking-widest font-mono">
          Sanity
        </h3>
        <div className="flex gap-2">
          <button
            onClick={onRefresh}
            className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors"
          >
            ↻ Refresh
          </button>
          <button
            onClick={onEmpty}
            className="text-xs text-red-400 hover:text-red-600 transition-colors"
          >
            Empty
          </button>
        </div>
      </div>

      <div className="flex items-end gap-2 mb-2">
        <span className="text-3xl font-extrabold text-zinc-900">
          {sanity.current_sanity}
        </span>
        <span className="text-zinc-400 text-sm mb-1">/ {sanity.max_sanity}</span>
      </div>

      <div className="h-2 bg-zinc-100 rounded-full overflow-hidden mb-2">
        <div
          className="h-full bg-blue-400 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      {sanity.full_in_seconds > 0 ? (
        <p className="text-xs text-zinc-400 font-mono">
          Full in {formatTime(sanity.full_in_seconds)}
        </p>
      ) : (
        <p className="text-xs text-green-500 font-mono">Full ✓</p>
      )}
    </div>
  );
}

function GlobalProgressCard({ progress }: { progress: GlobalProgressResult }) {
  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm">
      <h3 className="text-sm font-bold text-zinc-700 uppercase tracking-widest font-mono mb-3">
        Global Progress
      </h3>
      <div className="flex items-end gap-2 mb-3">
        <span className="text-3xl font-extrabold text-zinc-900">
          {progress.completed_categories}
        </span>
        <span className="text-zinc-400 text-sm mb-1">
          / {progress.total_categories} categories
        </span>
      </div>
      <div className="h-2 bg-zinc-100 rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-yellow-400 rounded-full transition-all duration-500"
          style={{ width: `${Math.round(progress.progress * 100)}%` }}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        {progress.detail.map((cat) => (
          <div key={cat.category_id} className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${cat.is_completed ? "bg-yellow-400" : "bg-zinc-300"}`}
            />
            <span
              className={`text-xs truncate ${cat.is_completed ? "text-zinc-600 line-through" : "text-zinc-500"}`}
            >
              {cat.category_name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivityCard({ activity }: { activity: ActivityLevelResult }) {
  const level = activity.activity_level;
  const label =
    level >= 80 ? "Excellent" : level >= 50 ? "Good" : level >= 20 ? "Low" : "Inactive";
  const color =
    level >= 80
      ? "text-green-500"
      : level >= 50
      ? "text-yellow-500"
      : level >= 20
      ? "text-orange-400"
      : "text-red-400";

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm">
      <h3 className="text-sm font-bold text-zinc-700 uppercase tracking-widest font-mono mb-3">
        Activity Level
      </h3>
      <div className="flex items-end gap-2 mb-2">
        <span className="text-3xl font-extrabold text-zinc-900">{level}</span>
        <span className={`text-sm mb-1 font-semibold ${color}`}>{label}</span>
      </div>
      <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-green-400 rounded-full transition-all duration-500"
          style={{ width: `${level}%` }}
        />
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function DailyChecklistPage() {
  // Ganti dengan auth context / store kamu yang sebenarnya
  const USER_ID = 1;
  const today = toDateString(new Date());

  const [date, setDate] = useState(today);
  const [checklist, setChecklist] = useState<DailyChecklistRow[]>([]);
  const [activity, setActivity] = useState<ActivityLevelResult | null>(null);
  const [globalProgress, setGlobalProgress] = useState<GlobalProgressResult | null>(null);
  const [sanity, setSanity] = useState<SanityResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ── Fetch all data ──────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [cl, act, gp, san] = await Promise.all([
        dailyApi.getChecklist(USER_ID, date),
        dailyApi.getActivityLevel(USER_ID, date),
        dailyApi.getGlobalProgress(USER_ID, date),
        dailyApi.getSanity(USER_ID),
      ]);
      setChecklist(cl.data);
      setActivity(act.data);
      setGlobalProgress(gp.data);
      setSanity(san.data);
    } catch {
      setError("Failed to load daily data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ── Task progress handlers ──────────────────────────────────────────────────
  const updateProgress = async (task: DailyChecklistRow, delta: number) => {
    const newProgress = Math.max(
      0,
      Math.min(task.current_progress + delta, task.max_progress),
    );
    if (newProgress === task.current_progress) return;

    // Optimistic update
    setChecklist((prev) =>
      prev.map((t) =>
        t.task_id === task.task_id ? { ...t, current_progress: newProgress } : t,
      ),
    );

    try {
      await dailyApi.updateProgress({
        user_id: USER_ID,
        task_id: task.task_id,
        date,
        current_progress: newProgress,
      });

      // Refresh stats setelah update berhasil
      const [act, gp] = await Promise.all([
        dailyApi.getActivityLevel(USER_ID, date),
        dailyApi.getGlobalProgress(USER_ID, date),
      ]);
      setActivity(act.data);
      setGlobalProgress(gp.data);
    } catch {
      // Rollback jika gagal
      setChecklist((prev) =>
        prev.map((t) =>
          t.task_id === task.task_id
            ? { ...t, current_progress: task.current_progress }
            : t,
        ),
      );
    }
  };

  // ── Sanity handlers ─────────────────────────────────────────────────────────
  const handleEmptySanity = async () => {
    try {
      await dailyApi.emptySanity(USER_ID);
      const res = await dailyApi.getSanity(USER_ID);
      setSanity(res.data);
    } catch {
      /* silent */
    }
  };

  const handleRefreshSanity = async () => {
    try {
      const res = await dailyApi.getSanity(USER_ID);
      setSanity(res.data);
    } catch {
      /* silent */
    }
  };

  // ── Grouped checklist ───────────────────────────────────────────────────────
  const grouped = groupChecklist(checklist);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <div className="bg-white border-b border-zinc-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl text-yellow-300">⬡</span>
            <div>
              <h1 className="text-lg font-extrabold text-zinc-900 tracking-tight">
                Daily Checklist
              </h1>
              <p className="text-xs text-zinc-400 font-mono">{date}</p>
            </div>
          </div>
          <input
            type="date"
            value={date}
            max={today}
            onChange={(e) => setDate(e.target.value)}
            className="text-sm border border-zinc-200 rounded-xl px-3 py-2 text-zinc-700 bg-zinc-50 outline-none focus:border-yellow-300 focus:ring-2 focus:ring-yellow-300/20 transition-all"
          />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
        {/* ── Sidebar Stats ── */}
        <div className="w-full lg:w-72 shrink-0 flex flex-col gap-4">
          {activity && <ActivityCard activity={activity} />}
          {globalProgress && <GlobalProgressCard progress={globalProgress} />}
          {sanity && (
            <SanityCard
              sanity={sanity}
              userId={USER_ID}
              onEmpty={handleEmptySanity}
              onRefresh={handleRefreshSanity}
            />
          )}
        </div>

        {/* ── Checklist ── */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="flex items-center justify-center h-48 text-zinc-400 text-sm">
              Loading...
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-48 text-red-500 text-sm">
              {error}
            </div>
          ) : checklist.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-zinc-400 text-sm">
              No tasks found for this date.
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {Array.from(grouped.entries()).map(([catId, cat]) => (
                <div key={catId}>
                  {/* Category Header */}
                  <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-400 mb-3 px-1">
                    {cat.name}
                  </h2>

                  <div className="flex flex-col gap-4">
                    {Array.from(cat.groups.entries()).map(([grpId, grp]) => (
                      <div
                        key={grpId}
                        className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm"
                      >
                        {/* Group Header */}
                        <h3 className="text-sm font-bold text-zinc-800 mb-3">
                          {grp.name}
                        </h3>

                        <div className="flex flex-col gap-4">
                          {Array.from(grp.subGroups.entries()).map(
                            ([subKey, tasks]) => (
                              <div key={subKey ?? "root"}>
                                {/* Sub Group Label (jika ada) */}
                                {subKey && (
                                  <p className="text-xs text-zinc-400 font-medium mb-2 pl-1">
                                    {tasks[0]?.sub_group_name}
                                  </p>
                                )}
                                <div className="flex flex-col gap-2">
                                  {tasks.map((task) => (
                                    <TaskItem
                                      key={task.task_id}
                                      task={task}
                                      onIncrement={(t) => updateProgress(t, 1)}
                                      onDecrement={(t) => updateProgress(t, -1)}
                                    />
                                  ))}
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}