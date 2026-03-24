"use client";
import { motion } from "framer-motion";
import { Plus, Package, TrendingUp } from "lucide-react";

interface PlannerHeaderProps {
  characterCount: number;
  weaponCount: number;
  onAddCharacter: () => void;
  onAddWeapon: () => void;
  onOpenInventory: () => void;
}

export default function PlannerHeader({
  characterCount,
  weaponCount,
  onAddCharacter,
  onAddWeapon,
  onOpenInventory,
}: PlannerHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col gap-4 mb-6"
    >
      {/* Title */}
      <div>
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400 mb-1">
          [ ASCENSION PLANNER ]
        </p>
        <h1 className="text-2xl font-black text-zinc-900 tracking-tight">
          Upgrade Planner
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Track materials and costs for your operators and weapons.
        </p>
      </div>

      {/* Action buttons — always in a row */}
      <div>
        <div className="flex items-center gap-2">
          <motion.button
            onClick={onOpenInventory}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-200 text-zinc-600 text-sm font-semibold hover:border-yellow-300 hover:text-zinc-900 transition-all bg-white"
          >
            <Package size={15} />
            Inventory
          </motion.button>

          <motion.button
            onClick={onAddWeapon}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-200 text-zinc-600 text-sm font-semibold hover:border-yellow-300 hover:text-zinc-900 transition-all bg-white"
          >
            <Plus size={15} />
            Add Weapon
          </motion.button>

          <motion.button
            onClick={onAddCharacter}
            whileHover={{
              scale: 1.03,
              boxShadow: "0 4px 16px rgba(235,191,0,0.3)",
            }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-300 text-zinc-900 text-sm font-bold hover:bg-yellow-400 transition-all"
          >
            <Plus size={15} />
            Add Operator
          </motion.button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-3 flex-wrap">
        {[
          { label: "Operators", value: characterCount, icon: TrendingUp },
          { label: "Weapons", value: weaponCount, icon: TrendingUp },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-50 border border-zinc-100"
          >
            <span className="text-sm font-black text-zinc-900">{value}</span>
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest">
              {label}
            </span>
          </div>
        ))}
        {/* Divider line */}
        <div className="flex-1 h-px bg-zinc-100 hidden sm:block" />
        <span className="text-[10px] font-mono text-zinc-300 uppercase tracking-widest hidden sm:block">
          [ ENDLIFE PLANNER ]
        </span>
      </div>
    </motion.div>
  );
}
