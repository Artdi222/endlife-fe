"use client";
import { useState } from "react";
import { Minus, Plus, Check, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { dailyApi } from "@/lib/api";

interface TaskItemProps {
  userId: number;
  date: string;
  taskId: number;
  taskName: string;
  maxProgress: number;
  currentProgress: number;
  rewardPoint: number;
  isActivityTask?: boolean;
  activityLocked?: boolean; // true when activity level = 100
  onProgressChange?: (taskId: number, newProgress: number) => void;
}

export default function TaskItem({
  userId,
  date,
  taskId,
  taskName,
  maxProgress,
  currentProgress: initialProgress,
  rewardPoint,
  isActivityTask = false,
  activityLocked = false,
  onProgressChange,
}: TaskItemProps) {
  const [progress, setProgress] = useState(initialProgress);
  const [loading, setLoading] = useState(false);

  const isCheckbox = maxProgress === 1;
  const isCompleted = progress >= maxProgress;

  const isCheckLocked = isActivityTask && activityLocked && !isCompleted;
  const isIncrementLocked = isActivityTask && activityLocked && progress >= maxProgress;

  const updateProgress = async (newProgress: number) => {
    const clamped = Math.max(0, Math.min(newProgress, maxProgress));
    setLoading(true);
    const prev = progress;
    setProgress(clamped);

    try {
      await dailyApi.updateProgress({
        user_id: userId,
        task_id: taskId,
        date,
        current_progress: clamped,
      });
      onProgressChange?.(taskId, clamped);
    } catch (e: unknown) {
      console.error(e);
      setProgress(prev);
    } finally {
      setLoading(false);
    }
  };

  // Checkbox task
  if (isCheckbox) {
    return (
      <motion.div
        layout
        className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
          isCompleted
            ? "bg-yellow-50 border-yellow-200"
            : isCheckLocked
              ? "bg-zinc-50 border-zinc-100 opacity-50"
              : "bg-white border-zinc-100 hover:border-yellow-200"
        }`}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() =>
              !isCheckLocked && updateProgress(isCompleted ? 0 : 1)
            }
            disabled={loading || isCheckLocked}
            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
              isCompleted
                ? "bg-yellow-300 border-yellow-300"
                : isCheckLocked
                  ? "border-zinc-200 bg-zinc-100 cursor-not-allowed"
                  : "border-zinc-300 hover:border-yellow-300"
            }`}
          >
            <AnimatePresence>
              {isCompleted && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Check size={11} strokeWidth={3} className="text-zinc-900" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          <span
            className={`text-sm font-medium transition-all ${
              isCompleted
                ? "line-through text-zinc-400"
                : isCheckLocked
                  ? "text-zinc-400"
                  : "text-zinc-700"
            }`}
          >
            {taskName}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isCheckLocked && <Lock size={11} className="text-zinc-300" />}
          {rewardPoint > 0 && (
            <span className="text-sm font-mono text-zinc-400">
              +{rewardPoint}
            </span>
          )}
        </div>
      </motion.div>
    );
  }

  // Multi-progress task
  return (
    <motion.div
      layout
      className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
        isCompleted
          ? "bg-yellow-50 border-yellow-200"
          : "bg-white border-zinc-100"
      }`}
    >
      <span
        className={`text-sm font-medium flex-1 ${
          isCompleted ? "text-zinc-400" : "text-zinc-700"
        }`}
      >
        {taskName}
      </span>

      <div className="flex items-center gap-2 shrink-0">
        {rewardPoint > 0 && (
          <span className="text-xs font-mono text-zinc-400">
            +{rewardPoint}
          </span>
        )}
        <div className="flex items-center gap-1.5 bg-yellow-300 rounded-xl px-2 py-1">
          <button
            onClick={() => updateProgress(progress - 1)}
            disabled={loading || progress <= 0}
            className="w-5 h-5 rounded-lg hover:bg-black hover:text-white flex items-center justify-center transition-colors disabled:opacity-30"
          >
            <Minus size={11} strokeWidth={4} />
          </button>
          <span className="text-sm font-bold text-zinc-700 min-w-12 text-center">
            {progress}/{maxProgress}
          </span>
          <button
            onClick={() => updateProgress(progress + 1)}
            disabled={
              loading ||
              progress >= maxProgress ||
              (isActivityTask && activityLocked)
            }
            className="w-5 h-5 rounded-lg hover:bg-black hover:text-white flex items-center justify-center transition-colors disabled:opacity-30"
          >
            <Plus size={11} />
          </button>
        </div>
        {isActivityTask && activityLocked && progress < maxProgress && (
          <Lock size={11} className="text-zinc-300" />
        )}
      </div>
    </motion.div>
  );
}
