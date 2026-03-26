"use client";
import { useState } from "react";
import { Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { UserCharacterSkillWithDetails } from "@/lib/types/ascension/userPlanner.types";
import { SKILL_MAX_LEVEL } from "./constants";
import Image from "next/image";

interface SkillRowsProps {
  skills: UserCharacterSkillWithDetails[];
  onUpdateSkill: (
    skillId: number,
    current: number,
    target: number,
  ) => Promise<void>;
}

const SKILL_TYPE_LABEL: Record<string, string> = {
  skill: "Skill",
  talent: "Talent",
  spaceship_talent: "Ship",
};

const SKILL_TYPE_COLOR: Record<string, string> = {
  skill: "bg-blue-50 text-blue-600 border-blue-100",
  talent: "bg-purple-50 text-purple-600 border-purple-100",
  spaceship_talent: "bg-emerald-50 text-emerald-600 border-emerald-100",
};

// Build level options array from 1..max
function levelOptions(max: number) {
  return Array.from({ length: max }, (_, i) => i + 1);
}

function SkillRow({
  skill,
  onUpdate,
}: {
  skill: UserCharacterSkillWithDetails;
  onUpdate: (current: number, target: number) => Promise<void>;
}) {
  const [saving, setSaving] = useState(false);
  const [current, setCurrent] = useState(skill.current_level);
  const [target, setTarget] = useState(skill.target_level);

  // Determine max level for this skill type
  // Falls back to SKILL_MAX_LEVEL constant; actual max can't exceed 12
  const maxLevel = SKILL_MAX_LEVEL[skill.skill_type] ?? 12;
  const options = levelOptions(maxLevel);

  const handleChange = async (newCurrent: number, newTarget: number) => {
    // Guard: target can't be below current
    const safeTarget = Math.max(newTarget, newCurrent);
    setCurrent(newCurrent);
    setTarget(safeTarget);
    if (newCurrent === skill.current_level && safeTarget === skill.target_level)
      return;
    setSaving(true);
    try {
      await onUpdate(newCurrent, safeTarget);
    } finally {
      setSaving(false);
    }
  };

  const selectCls =
    "bg-zinc-50 border border-zinc-200 rounded-md px-1 py-0.5 text-xs font-mono text-zinc-800 outline-none focus:border-yellow-400 transition-colors cursor-pointer";

  return (
    <div className="flex items-center gap-2 py-1.5 border-b border-zinc-50 last:border-0">
      {/* Icon */}
      <div className="w-10 h-10 rounded flex items-center justify-center shrink-0 bg-black">
        {skill.skill_icon ? (
          <Image
            width={128}
            height={128}
            src={skill.skill_icon}
            alt=""
            className="w-8 h-8 object-cover rounded"
          />
        ) : (
          <span className="text-l font-mono text-yellow-300">
            {SKILL_TYPE_LABEL[skill.skill_type]?.[0] ?? "S"}
          </span>
        )}
      </div>

      {/* Name + type badge */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-zinc-700 truncate">
          {skill.skill_name}
        </p>
        <span
          className={`inline-block text-[9px] font-mono uppercase tracking-wide px-1 rounded border ${
            SKILL_TYPE_COLOR[skill.skill_type] ??
            "bg-zinc-50 text-zinc-400 border-zinc-100"
          }`}
        >
          {SKILL_TYPE_LABEL[skill.skill_type] ?? skill.skill_type}
        </span>
      </div>

      {/* Level selects — show current max options for this skill type */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Current level select */}
        <select
          value={current}
          onChange={(e) => handleChange(Number(e.target.value), target)}
          className={selectCls}
        >
          {options.map((lvl) => (
            <option key={lvl} value={lvl}>
              {lvl}
            </option>
          ))}
        </select>

        <span className="text-zinc-800 text-l">→</span>

        {/* Target level select — only options >= current */}
        <select
          value={target}
          onChange={(e) => handleChange(current, Number(e.target.value))}
          className={selectCls}
        >
          {options
            .filter((lvl) => lvl >= current)
            .map((lvl) => (
              <option key={lvl} value={lvl}>
                {lvl}
              </option>
            ))}
        </select>

        {saving && (
          <Loader2
            size={11}
            className="animate-spin text-yellow-500 shrink-0"
          />
        )}
      </div>
    </div>
  );
}

export default function SkillRows({ skills, onUpdateSkill }: SkillRowsProps) {
  const [open, setOpen] = useState(true);

  if (skills.length === 0) return null;

  // Group by type for a cleaner display order: skills first, then talents, then ship
  const ordered = [
    ...skills.filter((s) => s.skill_type === "skill"),
    ...skills.filter((s) => s.skill_type === "talent"),
    ...skills.filter((s) => s.skill_type === "spaceship_talent"),
  ];

  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between py-1.5 text-[10px] font-mono uppercase tracking-widest text-zinc-400 hover:text-zinc-600 transition-colors"
      >
        <span>Skills ({skills.length})</span>
        {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-1">
              {ordered.map((s) => (
                <SkillRow
                  key={s.id}
                  skill={s}
                  onUpdate={(c, t) => onUpdateSkill(s.id, c, t)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
