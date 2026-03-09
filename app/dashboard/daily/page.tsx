"use client";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { dailyApi } from "@/lib/api";
import type { DailyChecklistRow, GlobalProgressResult } from "@/lib/types";
import { getUserIdFromToken, getTodayDate } from "@/lib/utils/auth.utils";
import TaskItem from "@/components/dashboard/TaskItem";
import SanityBar from "@/components/dashboard/SanityBar";
import ActivityLevel from "@/components/dashboard/ActivityLevel";

const ACTIVITY_CATEGORY = "Operation Manual (Daily)";

interface TaskNode {
  taskId: number;
  taskName: string;
  maxProgress: number;
  currentProgress: number;
  rewardPoint: number;
}

interface SubGroupNode {
  subGroupId: number;
  subGroupName: string | null;
  tasks: TaskNode[];
}

interface GroupNode {
  groupId: number;
  groupName: string;
  directTasks: TaskNode[];
  subGroups: SubGroupNode[];
}

interface CategoryNode {
  categoryId: number;
  categoryName: string;
  isActivityCategory: boolean;
  groups: GroupNode[];
}

function buildTree(rows: DailyChecklistRow[]): CategoryNode[] {
  const catMap = new Map<number, CategoryNode>();
  for (const row of rows) {
    if (!catMap.has(row.category_id)) {
      catMap.set(row.category_id, {
        categoryId: row.category_id,
        categoryName: row.category_name,
        isActivityCategory: row.category_name === ACTIVITY_CATEGORY,
        groups: [],
      });
    }
    const cat = catMap.get(row.category_id)!;
    let group = cat.groups.find((g) => g.groupId === row.group_id);
    if (!group) {
      group = {
        groupId: row.group_id,
        groupName: row.group_name,
        directTasks: [],
        subGroups: [],
      };
      cat.groups.push(group);
    }
    const task: TaskNode = {
      taskId: row.task_id,
      taskName: row.task_name,
      maxProgress: row.max_progress,
      currentProgress: row.current_progress,
      rewardPoint: row.reward_point,
    };
    if (row.sub_group_id === null) {
      group.directTasks.push(task);
    } else {
      let sg = group.subGroups.find((s) => s.subGroupId === row.sub_group_id);
      if (!sg) {
        sg = {
          subGroupId: row.sub_group_id,
          subGroupName: row.sub_group_name,
          tasks: [],
        };
        group.subGroups.push(sg);
      }
      sg.tasks.push(task);
    }
  }
  return Array.from(catMap.values());
}

// Global Progress Card
function GlobalProgressCard({ data }: { data: GlobalProgressResult }) {
  const pct = Math.round(data.progress * 100);
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-md mb-4"
    >
      <div className="flex items-end justify-between mb-3">
        <div>
          <p className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-1">
            Overall
          </p>
          <h2 className="text-2xl font-extrabold text-zinc-900">
            Global Progress
          </h2>
        </div>
        <div className="text-right">
          <span className="text-4xl font-black text-zinc-900">
            {pct}
            <span className="text-xl text-zinc-400 font-normal">%</span>
          </span>
          <p className="text-sm text-zinc-400 font-mono mt-0.5">
            {data.completed_categories}/{data.total_categories} categories
          </p>
        </div>
      </div>

      {/* Main bar */}
      <div className="relative h-3 bg-zinc-100 rounded-full overflow-hidden mb-4">
        <motion.div
          className="absolute left-0 top-0 h-full rounded-full bg-yellow-300"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
      </div>

      {/* Category breakdown */}
      <div className="grid grid-cols-3 gap-3">
        {data.detail.map((cat) => {
          const catPct =
            cat.total_tasks === 0
              ? 0
              : Math.round((cat.completed_tasks / cat.total_tasks) * 100);
          return (
            <div
              key={cat.category_id}
              className={`rounded-2xl px-4 py-3 border transition-all ${cat.is_completed ? "bg-yellow-50 border-yellow-200" : "bg-zinc-50 border-zinc-100"}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-sm font-bold truncate pr-2 ${cat.is_completed ? "text-zinc-800" : "text-zinc-500"}`}
                >
                  {cat.category_name}
                </span>
                <span className="text-xs font-mono text-zinc-400 shrink-0">
                  {cat.completed_tasks}/{cat.total_tasks}
                </span>
              </div>
              <div className="h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${cat.is_completed ? "bg-yellow-400" : "bg-zinc-400"}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${catPct}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// Sanity Card
function SanityCard({ userId }: { userId: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-zinc-900 rounded-2xl p-5 shadow-md flex flex-col gap-3 flex-1"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 relative shrink-0">
          <Image
            src="/icon/sanity-icon.png"
            alt="Sanity"
            fill
            className="object-contain"
          />
        </div>
        <div>
          <p className="text-xs font-mono uppercase tracking-widest text-zinc-500">
            Tracker
          </p>
          <h3 className="text-lg font-extrabold text-white">Sanity</h3>
        </div>
      </div>
      <SanityBar userId={userId} dark />
    </motion.div>
  );
}

// Activity Card
function ActivityCard({ level }: { level: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="bg-zinc-900 rounded-2xl p-5 shadow-md flex flex-col gap-3 flex-1"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 relative shrink-0">
          <Image
            src="/icon/activity-icon.png"
            alt="Activity"
            fill
            className="object-contain"
          />
        </div>
        <div>
          <p className="text-xs font-mono uppercase tracking-widest text-zinc-500">
            Daily
          </p>
          <h3 className="text-lg font-extrabold text-white">Activity Level</h3>
        </div>
      </div>
      <ActivityLevel level={level} dark />
    </motion.div>
  );
}

// Main Page
export default function DailyPage() {
  const [userId, setUserId] = useState<number | null>(null);
  const [date] = useState(getTodayDate());
  const [tree, setTree] = useState<CategoryNode[]>([]);
  const [activityLevel, setActivityLevel] = useState(0);
  const [globalProgress, setGlobalProgress] =
    useState<GlobalProgressResult | null>(null);
  const [loading, setLoading] = useState(true);

  const activityLocked = activityLevel >= 100;

  const refetchStats = useCallback(
    async (uid: number) => {
      const [actRes, globalRes] = await Promise.all([
        dailyApi.getActivityLevel(uid, date),
        dailyApi.getGlobalProgress(uid, date),
      ]);
      setActivityLevel(actRes.data.activity_level);
      setGlobalProgress(globalRes.data);
    },
    [date],
  );

  useEffect(() => {
    const uid = getUserIdFromToken();
    if (!uid) return;
    setUserId(uid);
    const init = async () => {
      try {
        const [checklistRes, actRes, globalRes] = await Promise.all([
          dailyApi.getChecklist(uid, date),
          dailyApi.getActivityLevel(uid, date),
          dailyApi.getGlobalProgress(uid, date),
        ]);
        setTree(buildTree(checklistRes.data));
        setActivityLevel(actRes.data.activity_level);
        setGlobalProgress(globalRes.data);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [date]);

  const handleProgressChange = useCallback(
    (_taskId: number, _newProgress: number) => {
      if (userId) refetchStats(userId);
    },
    [userId, refetchStats],
  );

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-yellow-300 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <p className="text-xs font-mono text-zinc-400 uppercase tracking-widest mb-1">
          {today}
        </p>
        <h1 className="text-4xl font-extrabold text-zinc-900 tracking-tight">
          Daily Checklist
        </h1>
      </motion.div>

      {/* Global progress — full width */}
      {globalProgress && <GlobalProgressCard data={globalProgress} />}

      {/* Sanity + Activity — side by side, each half width */}
      {userId && (
        <div className="flex gap-4 mb-6">
          <SanityCard userId={userId} />
          <ActivityCard level={activityLevel} />
        </div>
      )}

      {/* Checklist */}
      <div className="grid grid-cols-3 gap-6 items-start">
        {tree.map((cat, ci) => (
          <motion.div
            key={cat.categoryId}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: ci * 0.06 }}
            className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-extrabold text-zinc-900 uppercase tracking-wide">
                {cat.categoryName}
              </h2>
              {cat.isActivityCategory && activityLocked && (
                <span className="text-xs font-mono font-bold text-cyan-600 bg-cyan-50 border border-cyan-200 px-3 py-1 rounded-lg">
                  MAXED
                </span>
              )}
            </div>

            <div className="flex flex-col gap-5">
              {cat.groups.map((group) => (
                <div key={group.groupId}>
                  <p className="text-s font-bold text-yellow-400 uppercase tracking-widest mb-3 px-1">
                    {group.groupName}
                  </p>

                  {group.directTasks.length > 0 && (
                    <div className="flex flex-col gap-2 mb-3">
                      {group.directTasks.map((task) => (
                        <TaskItem
                          key={task.taskId}
                          userId={userId!}
                          date={date}
                          taskId={task.taskId}
                          taskName={task.taskName}
                          maxProgress={task.maxProgress}
                          currentProgress={task.currentProgress}
                          rewardPoint={task.rewardPoint}
                          isActivityTask={cat.isActivityCategory}
                          activityLocked={activityLocked}
                          onProgressChange={handleProgressChange}
                        />
                      ))}
                    </div>
                  )}

                  {group.subGroups.map((sg) => (
                    <div key={sg.subGroupId} className="mb-3">
                      {sg.subGroupName && (
                        <p className="text-xs text-zinc-400 font-semibold px-1 mb-2">
                          — {sg.subGroupName}
                        </p>
                      )}
                      <div className="flex flex-col gap-2">
                        {sg.tasks.map((task) => (
                          <TaskItem
                            key={task.taskId}
                            userId={userId!}
                            date={date}
                            taskId={task.taskId}
                            taskName={task.taskName}
                            maxProgress={task.maxProgress}
                            currentProgress={task.currentProgress}
                            rewardPoint={task.rewardPoint}
                            isActivityTask={cat.isActivityCategory}
                            activityLocked={activityLocked}
                            onProgressChange={handleProgressChange}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
