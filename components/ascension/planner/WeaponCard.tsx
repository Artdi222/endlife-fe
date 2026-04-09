"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Trash2, Loader2, Sword } from "lucide-react";
import type {
  UserWeaponWithDetails,
  UpdateUserWeaponDTO,
} from "@/lib/types/ascension/userPlanner.types";
import LevelRangeInput from "./LevelRangeInput";
import Image from "next/image";

interface WeaponCardProps {
  weapon: UserWeaponWithDetails;
  index: number;
  onUpdate: (id: number, dto: UpdateUserWeaponDTO) => Promise<void>;
  onRemove: (id: number) => Promise<void>;
}

const RARITY_COLOR: Record<number, string> = {
  6: "text-yellow-500",
  5: "text-orange-400",
  4: "text-purple-400",
  3: "text-blue-400",
};

export default function WeaponCard({
  weapon,
  index,
  onUpdate,
  onRemove,
}: WeaponCardProps) {
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);

  const handleChange = async (dto: UpdateUserWeaponDTO) => {
    setSaving(true);
    try {
      await onUpdate(weapon.id, dto);
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    setRemoving(true);
    try {
      await onRemove(weapon.id);
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
      className="bg-white border border-zinc-200 rounded-2xl overflow-hidden hover:border-zinc-300 transition-colors group"
    >
      {/* Top accent — subtle for weapons */}
      <div className="h-0.5 bg-linear-to-r from-zinc-300 via-zinc-200 to-transparent" />

      <div className="p-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-100 shrink-0 border border-zinc-200 flex items-center justify-center">
            {weapon.weapon_icon ? (
              <Image
                width={128}
                height={128}
                src={weapon.weapon_icon}
                alt={weapon.weapon_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Sword size={18} className="text-zinc-400" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="text-sm font-black text-zinc-900 truncate">
                {weapon.weapon_name}
              </h3>
              {saving && (
                <Loader2
                  size={12}
                  className="animate-spin text-yellow-500 shrink-0"
                />
              )}
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-mono ${RARITY_COLOR[weapon.weapon_rarity] ?? "text-zinc-400"}`}
              >
                {Array.from({ length: weapon.weapon_rarity }).map(
                  (_, i) => (
                    <Image
                      width={16}
                      height={16}
                      key={i}
                      src="/icon/star-icon.png"
                      alt="star"
                      className="inline w-4 h-4"
                    />
                  ),
                )}
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wide px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-500">
                {weapon.weapon_type}
              </span>
            </div>
          </div>

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

        <LevelRangeInput
          currentLevel={weapon.current_level}
          targetLevel={weapon.target_level}
          disabled={saving}
          onCurrentLevelChange={(v) => handleChange({ current_level: v })}
          onTargetLevelChange={(v) => handleChange({ target_level: v })}
        />
      </div>
    </motion.div>
  );
}
