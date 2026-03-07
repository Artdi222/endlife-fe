"use client";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { dailyApi } from "@/lib/api";
import type { DailyChecklistRow, GlobalProgressResult } from "@/lib/types";
import { getUserIdFromToken, getTodayDate } from "@/lib/utils/auth.utils";
import TaskItem from "@/components/dashboard/TaskItem";
import SanityBar from "@/components/dashboard/SanityBar";
import ActivityLevel from "@/components/dashboard/ActivityLevel";
import GlobalProgress from "@/components/dashboard/GlobalProgress";

const ACTIVITY_CATEGORY = "Operation Manual (Daily)";

interface TaskNode {
  taskId: number;
  taskName: string;
  maxProgress: number;
  currentProgress: number;
  rewardPoint: number;
}

interface SubGroupNode {
  subGroupId: number | null;
  subGroupName: string | null;
  tasks: TaskNode[];
}

interface GroupNode {
  groupId: number;
  groupName: string;
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
        subGroups: [],
      };
      cat.groups.push(group);
    }

    const sgKey = row.sub_group_id ?? -1;
    let sg = group.subGroups.find((s) => (s.subGroupId ?? -1) === sgKey);
    if (!sg) {
      sg = {
        subGroupId: row.sub_group_id,
        subGroupName: row.sub_group_name,
        tasks: [],
      };
      group.subGroups.push(sg);
    }

    sg.tasks.push({
      taskId: row.task_id,
      taskName: row.task_name,
      maxProgress: row.max_progress,
      currentProgress: row.current_progress,
      rewardPoint: row.reward_point,
    });
  }

  return Array.from(catMap.values());
}

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
        // silent
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
        <div className="w-6 h-6 border-2 border-yellow-300 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <p className="text-xs font-mono text-zinc-400 uppercase tracking-widest mb-1">
          {today}
        </p>
        <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">
          Daily Checklist
        </h1>
      </motion.div>

      <div className="flex gap-6">
        {/* Left — checklist */}
        <div className="flex-1 flex flex-col gap-6 min-w-0">
          {tree.map((cat, ci) => (
            <motion.div
              key={cat.categoryId}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: ci * 0.07 }}
              className="bg-white border border-zinc-100 rounded-2xl p-5 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-mono uppercase tracking-widest text-yellow-500">
                  {cat.categoryName}
                </h2>
                {cat.isActivityCategory && activityLocked && (
                  <span className="text-[10px] font-mono text-cyan-500 bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded-lg">
                    MAXED
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-4">
                {cat.groups.map((group) => (
                  <div key={group.groupId}>
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-wide mb-2 px-1">
                      {group.groupName}
                    </p>
                    {group.subGroups.map((sg) => (
                      <div key={sg.subGroupId ?? "root"} className="mb-3">
                        {sg.subGroupName && (
                          <p className="text-[11px] text-zinc-400 font-medium px-1 mb-1.5">
                            — {sg.subGroupName}
                          </p>
                        )}
                        <div className="flex flex-col gap-1.5">
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

        {/* Right — stats sidebar */}
        <div className="w-72 shrink-0 flex flex-col gap-4 sticky top-10 self-start">
          <ActivityLevel level={activityLevel} />
          {globalProgress && <GlobalProgress data={globalProgress} />}
          {userId && <SanityBar userId={userId} />}
        </div>
      </div>
    </div>
  );
}
