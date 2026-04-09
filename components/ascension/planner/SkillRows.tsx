"use client";
import { useState, useMemo } from "react";
import { Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { UserCharacterSkillWithDetails } from "@/lib/types/ascension/userPlanner.types";
import { SKILL_MAX_LEVEL } from "./constants";

interface SkillRowsProps {
  skills: UserCharacterSkillWithDetails[];
  onUpdateSkill: (
    skillId: number,
    current: number,
    target: number,
  ) => Promise<void>;
}

const SKILL_TYPE_LABEL: Record<string, string> = {
  skill: "Combat Skill",
  talent: "Talent",
  spaceship_talent: "Ship Skill",
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
    "bg-zinc-50 border border-zinc-200 rounded-md pl-1.5 pr-5 py-0.5 text-xs font-mono text-zinc-800 outline-none focus:border-yellow-400 transition-colors cursor-pointer appearance-none text-center min-w-[36px]";

  return (
    <div className="flex items-center gap-2 py-2 border-b border-zinc-50 last:border-0 group/row">
      {/* Icon */}
      <div className="w-9 h-9 rounded flex items-center justify-center shrink-0 bg-zinc-950 border border-zinc-800 overflow-hidden relative">
        {skill.skill_icon ? (
          <img
            width={36}
            height={36}
            src={skill.skill_icon}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-[10px] font-mono text-yellow-300 font-bold">
            {SKILL_TYPE_LABEL[skill.skill_type]?.[0] ?? "S"}
          </span>
        )}
      </div>

      {/* Name + type badge */}
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold text-zinc-700 truncate leading-tight">
          {skill.skill_name}
        </p>
        <span
          className={`inline-block text-[8px] font-mono uppercase tracking-wider px-1 rounded border ${
            SKILL_TYPE_COLOR[skill.skill_type] ??
            "bg-zinc-50 text-zinc-400 border-zinc-100"
          }`}
        >
          {SKILL_TYPE_LABEL[skill.skill_type] ?? skill.skill_type}
        </span>
      </div>

      {/* Level selects */}
      <div className="flex items-center gap-1.5 shrink-0 ml-2">
        <div className="relative flex items-center">
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
          <ChevronDown
            size={10}
            className="absolute right-1 text-zinc-400 pointer-events-none"
          />
        </div>

        <span className="text-zinc-300 font-mono text-[10px]">→</span>

        <div className="relative flex items-center">
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
          <ChevronDown
            size={10}
            className="absolute right-1 text-zinc-400 pointer-events-none"
          />
        </div>

        <div className="w-3 flex items-center justify-center">
          {saving && (
            <Loader2
              size={10}
              className="animate-spin text-yellow-500 shrink-0"
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function SkillRows({ skills, onUpdateSkill }: SkillRowsProps) {
  const [open, setOpen] = useState(true);

  const grouped = useMemo(() => {
    const types = ["skill", "talent", "spaceship_talent"];
    return types
      .map((type) => ({
        type,
        label: SKILL_TYPE_LABEL[type],
        items: skills.filter((s) => s.skill_type === type),
      }))
      .filter((g) => g.items.length > 0);
  }, [skills]);

  if (skills.length === 0) return null;

  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between py-2 text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400 hover:text-zinc-600 transition-colors border-b border-zinc-100"
      >
        <div className="flex items-center gap-2">
          <span>Skills Progress</span>
          <span className="text-[10px] font-mono text-zinc-300">
            ({skills.length})
          </span>
        </div>
        {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-2 space-y-4">
              {grouped.map((group) => (
                <div key={group.type}>
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-[9px] font-mono uppercase tracking-[0.1em] text-zinc-400">
                      {group.label}s
                    </span>
                    <div className="flex-1 h-px bg-zinc-50" />
                  </div>
                  <div className="space-y-0.5">
                    {group.items.map((s) => (
                      <SkillRow
                        key={s.id}
                        skill={s}
                        onUpdate={(c, t) => onUpdateSkill(s.id, c, t)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
