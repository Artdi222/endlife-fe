"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Trash2, Loader2, User } from "lucide-react";
import type {
  UserCharacterWithDetails,
  UserCharacterSkillWithDetails,
  UpdateUserCharacterDTO,
} from "@/lib/types/ascension/userPlanner.types";
import LevelRangeInput from "./LevelRangeInput";
import SkillRows from "./SkillRows";

interface CharacterCardProps {
  character:      UserCharacterWithDetails;
  skills:         UserCharacterSkillWithDetails[];
  index:          number;
  onUpdate:       (id: number, dto: UpdateUserCharacterDTO) => Promise<void>;
  onRemove:       (id: number) => Promise<void>;
  onUpdateSkill:  (skillId: number, current: number, target: number) => Promise<void>;
}

const RARITY_COLOR: Record<number, string> = {
  6: "text-yellow-500",
  5: "text-orange-400",
  4: "text-purple-400",
  3: "text-blue-400",
};

export default function CharacterCard({
  character,
  skills,
  index,
  onUpdate,
  onRemove,
  onUpdateSkill,
}: CharacterCardProps) {
  const [saving,   setSaving]   = useState(false);
  const [removing, setRemoving] = useState(false);

  const handleChange = async (dto: UpdateUserCharacterDTO) => {
    setSaving(true);
    try {
      await onUpdate(character.id, dto);
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    setRemoving(true);
    try {
      await onRemove(character.id);
    } finally {
      setRemoving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, scale: 0.96 }}
      transition={{
        duration: 0.35,
        delay: index * 0.05,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="bg-white border border-zinc-200 rounded-2xl overflow-hidden hover:border-yellow-300 transition-colors group"
    >
      {/* Top accent line */}
      <div className="h-0.5 bg-linear-to-r from-yellow-300 via-yellow-200 to-transparent" />

      <div className="p-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          {/* Icon */}
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-100 shrink-0 border border-zinc-200">
            {character.character_icon ? (
              <img
                src={character.character_icon}
                alt={character.character_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User size={18} className="text-zinc-400" />
              </div>
            )}
          </div>

          {/* Name + meta */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="text-sm font-black text-zinc-900 truncate">
                {character.character_name}
              </h3>
              {saving && (
                <Loader2
                  size={12}
                  className="animate-spin text-yellow-500 shrink-0"
                />
              )}
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {/* Rarity stars */}
              <span
                className={`text-xs font-mono ${RARITY_COLOR[character.character_rarity] ?? "text-zinc-400"}`}
              >
                {Array.from({ length: character.character_rarity }).map(
                  (_, i) => (
                    <img
                      key={i}
                      src="/icon/star-icon.png"
                      alt="star"
                      className="inline w-4 h-4"
                    />
                  ),
                )}
              </span>
              {character.character_element && (
                <span className="text-[10px] font-mono uppercase tracking-wide text-zinc-500">
                  {character.character_element}
                </span>
              )}
              {character.character_class && (
                <span className="text-[10px] font-mono uppercase tracking-wide px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-500">
                  {character.character_class}
                </span>
              )}
            </div>
          </div>

          {/* Remove button */}
          <motion.button
            onClick={handleRemove}
            disabled={removing}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-800 hover:text-red-400 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
          >
            {removing ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Trash2 size={13} />
            )}
          </motion.button>
        </div>

        {/* Level + Stage selectors */}
        <LevelRangeInput
          currentLevel={character.current_level}
          targetLevel={character.target_level}
          currentStage={character.current_ascension_stage}
          targetStage={character.target_ascension_stage}
          disabled={saving}
          onCurrentLevelChange={(v) => handleChange({ current_level: v })}
          onTargetLevelChange={(v) => handleChange({ target_level: v })}
          onCurrentStageChange={(v) =>
            handleChange({ current_ascension_stage: v })
          }
          onTargetStageChange={(v) =>
            handleChange({ target_ascension_stage: v })
          }
        />

        {/* Skills */}
        <SkillRows skills={skills} onUpdateSkill={onUpdateSkill} />
      </div>
    </motion.div>
  );
}