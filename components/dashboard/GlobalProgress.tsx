"use client";
import { motion } from "framer-motion";
import { CheckCircle2, Circle } from "lucide-react";
import type { GlobalProgressResult } from "@/lib/types";

interface GlobalProgressProps {
  data: GlobalProgressResult;
}

export default function GlobalProgress({ data }: GlobalProgressProps) {
  const pct = Math.round(data.progress * 100);

  return (
    <div className="bg-white border border-zinc-100 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-bold text-zinc-800">Global Progress</span>
        <span className="text-xs font-mono text-zinc-400">
          {data.completed_categories}/{data.total_categories} categories
        </span>
      </div>

      {/* Overall bar */}
      <div className="relative h-2 bg-zinc-100 rounded-full overflow-hidden mb-4">
        <motion.div
          className="absolute left-0 top-0 h-full rounded-full bg-yellow-300"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>

      {/* Category list */}
      <div className="flex flex-col gap-2">
        {data.detail.map((cat) => {
          const taskPct =
            cat.total_tasks === 0
              ? 0
              : Math.round((cat.completed_tasks / cat.total_tasks) * 100);

          return (
            <div key={cat.category_id}>
              <div className="flex items-center gap-2 mb-1">
                {cat.is_completed ? (
                  <CheckCircle2
                    size={14}
                    className="text-yellow-400 shrink-0"
                  />
                ) : (
                  <Circle size={14} className="text-zinc-300 shrink-0" />
                )}
                <span
                  className={`text-xs font-medium flex-1 ${
                    cat.is_completed ? "text-zinc-800" : "text-zinc-400"
                  }`}
                >
                  {cat.category_name}
                </span>
                <span className="text-[10px] font-mono text-zinc-400 shrink-0">
                  {cat.completed_tasks}/{cat.total_tasks}
                </span>
              </div>

              {/* Per-category mini bar */}
              <div className="ml-5 h-1 bg-zinc-100 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${
                    cat.is_completed ? "bg-yellow-300" : "bg-zinc-300"
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${taskPct}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
