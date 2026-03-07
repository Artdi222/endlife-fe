"use client";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";

interface ActivityLevelProps {
  level: number; // 0–100
}

export default function ActivityLevel({ level }: ActivityLevelProps) {
  const clamped = Math.min(Math.max(level, 0), 100);
  const barColor =
    clamped >= 80
      ? "bg-yellow-300"
      : clamped >= 50
        ? "bg-cyan-300"
        : "bg-pink-300";

  return (
    <div className="bg-white border border-zinc-100 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-yellow-400" />
          <span className="text-sm font-bold text-zinc-800">
            Activity Level
          </span>
        </div>
        <span className="text-sm font-black text-zinc-800">
          {clamped}
          <span className="text-zinc-400 font-normal text-xs"> / 100</span>
        </span>
      </div>

      <div className="relative h-3 bg-zinc-100 rounded-full overflow-hidden mb-1">
        <motion.div
          className={`absolute left-0 top-0 h-full rounded-full ${barColor}`}
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
      <p className="text-[10px] text-zinc-400 font-mono">
        Auto-calculated from daily objectives
      </p>
    </div>
  );
}
