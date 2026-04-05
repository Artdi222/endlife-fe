"use client";
import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";

import { userPlannerApi } from "@/lib/api/ascension/userPlanner.api";
import { itemsApi } from "@/lib/api/ascension/item.api";
import type {
  UserCharacterWithDetails,
  UserCharacterSkillWithDetails,
  UserWeaponWithDetails,
  PlannerSummary,
  UpdateUserCharacterDTO,
  UpdateUserWeaponDTO,
  AddUserCharacterDTO,
  AddUserWeaponDTO,
} from "@/lib/types/ascension/userPlanner.types";
import type { Item } from "@/lib/types";

import PlannerHeader from "@/components/ascension/planner/PlannerHeader";
import CharacterCard from "@/components/ascension/planner/CharacterCard";
import WeaponCard from "@/components/ascension/planner/WeaponCard";
import SummaryPanel from "@/components/ascension/planner/SummaryPanel";
import AddCharacterModal from "@/components/ascension/planner/AddCharacterModal";
import AddWeaponModal from "@/components/ascension/planner/AddWeaponModal";
import InventoryModal from "@/components/ascension/planner/InventoryModal";

type Modal = "add-character" | "add-weapon" | "inventory" | null;

export default function PlannerPage() {
  const [characters, setCharacters] = useState<UserCharacterWithDetails[]>([]);
  const [weapons, setWeapons] = useState<UserWeaponWithDetails[]>([]);
  const [skillsMap, setSkillsMap] = useState<
    Record<number, UserCharacterSkillWithDetails[]>
  >({});
  const [summary, setSummary] = useState<PlannerSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [modal, setModal] = useState<Modal>(null);

  const [creditItem, setCreditItem] = useState<Item | null>(null);
  const [creditOwned, setCreditOwned] = useState(0);
  const [creditItemId, setCreditItemId] = useState<number | null>(null);

  // ── Data fetching ──────────────────────────────────────────────────────────

  const refreshSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const res = await userPlannerApi.getSummary();
      setSummary(res.data);
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  const loadSkills = useCallback(async (userCharacterId: number) => {
    try {
      const res = await userPlannerApi.getCharacterSkills(userCharacterId);
      setSkillsMap((p) => ({ ...p, [userCharacterId]: res.data }));
    } catch {
      console.error(`Failed to load skills for user character ${userCharacterId}`);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const [charRes, weapRes, sumRes, itemsRes, invRes] = await Promise.all([
          userPlannerApi.getCharacters(),
          userPlannerApi.getWeapons(),
          userPlannerApi.getSummary(),
          itemsApi.getAll(),
          userPlannerApi.getInventory(),
        ]);

        setCharacters(charRes.data);
        setWeapons(weapRes.data);
        setSummary(sumRes.data);

        const tCreds = itemsRes.data.find((i) => i.category === "Currency");
        if (tCreds) {
          setCreditItem(tCreds);
          setCreditItemId(tCreds.id);
          const invEntry = invRes.data.find((inv) => inv.item_id === tCreds.id);
          setCreditOwned(invEntry?.quantity ?? 0);
        }

        // Load skills for all characters
        await Promise.all(charRes.data.map((c) => loadSkills(c.id)));
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [loadSkills]);

  const handleCreditChange = useCallback(
    async (qty: number) => {
      setCreditOwned(qty);
      if (creditItemId == null) return;
      try {
        await userPlannerApi.setInventoryItem(creditItemId, { quantity: qty });
      } catch {
        console.error("Failed to update T-Creds quantity");
      }
    },
    [creditItemId],
  );

  // ── Character actions ──────────────────────────────────────────────────────

  const handleAddCharacter = async (dto: AddUserCharacterDTO) => {
    const res = await userPlannerApi.addCharacter(dto);
    setCharacters((p) => [...p, res.data]);
    await loadSkills(res.data.id);
    await refreshSummary();
  };

  const handleUpdateCharacter = async (
    id: number,
    dto: UpdateUserCharacterDTO,
  ) => {
    const res = await userPlannerApi.updateCharacter(id, dto);
    setCharacters((p) => p.map((c) => (c.id === id ? res.data : c)));
    await refreshSummary();
  };

  const handleRemoveCharacter = async (id: number) => {
    await userPlannerApi.removeCharacter(id);
    setCharacters((p) => p.filter((c) => c.id !== id));
    setSkillsMap((p) => {
      const n = { ...p };
      delete n[id];
      return n;
    });
    await refreshSummary();
  };

  const handleUpdateSkill = async (
    userCharId: number,
    skillId: number,
    current: number,
    target: number,
  ) => {
    const res = await userPlannerApi.updateSkill(skillId, {
      current_level: current,
      target_level: target,
    });
    setSkillsMap((p) => ({
      ...p,
      [userCharId]: (p[userCharId] ?? []).map((s) =>
        s.id === skillId
          ? {
              ...s,
              current_level: res.data.current_level,
              target_level: res.data.target_level,
            }
          : s,
      ),
    }));
    await refreshSummary();
  };

  // ── Weapon actions ─────────────────────────────────────────────────────────

  const handleAddWeapon = async (dto: AddUserWeaponDTO) => {
    const res = await userPlannerApi.addWeapon(dto);
    setWeapons((p) => [...p, res.data]);
    await refreshSummary();
  };

  const handleUpdateWeapon = async (id: number, dto: UpdateUserWeaponDTO) => {
    const res = await userPlannerApi.updateWeapon(id, dto);
    setWeapons((p) => p.map((w) => (w.id === id ? res.data : w)));
    await refreshSummary();
  };

  const handleRemoveWeapon = async (id: number) => {
    await userPlannerApi.removeWeapon(id);
    setWeapons((p) => p.filter((w) => w.id !== id));
    await refreshSummary();
  };

  // ── Inventory ──────────────────────────────────────────────────────────────

  const handleSaveInventory = async (
    items: Array<{ item_id: number; quantity: number }>,
  ) => {
    await userPlannerApi.bulkSetInventory({ items });
    // Sync T-Creds owned if it was in the bulk save
    if (creditItemId != null) {
      const entry = items.find((i) => i.item_id === creditItemId);
      if (entry) setCreditOwned(entry.quantity);
    }
    await refreshSummary();
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={28} className="animate-spin text-yellow-400" />
          <p className="text-xs font-mono uppercase tracking-widest text-zinc-400">
            Loading planner…
          </p>
        </div>
      </div>
    );
  }

  const isEmpty = characters.length === 0 && weapons.length === 0;

  return (
    <div className="w-full p-10">
      <div className="flex flex-col xl:flex-row gap-6">
        {/* ── LEFT: entity list ── */}
        <div className="flex-1 min-w-0">
          <PlannerHeader
            characterCount={characters.length}
            weaponCount={weapons.length}
            onAddCharacter={() => setModal("add-character")}
            onAddWeapon={() => setModal("add-weapon")}
            onOpenInventory={() => setModal("inventory")}
          />

          <div>
            {isEmpty ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-24 text-center"
              >
                <div
                  className="w-20 h-20 rounded-2xl border-2 border-dashed border-zinc-200 flex items-center justify-center mb-4"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(-45deg, transparent, transparent 6px, rgba(0,0,0,0.015) 6px, rgba(0,0,0,0.015) 7px)",
                  }}
                >
                  <span className="text-3xl text-zinc-200">⬡</span>
                </div>
                <p className="text-sm font-bold text-zinc-300 mb-1">
                  No operators in plan
                </p>
                <p className="text-xs text-zinc-300 max-w-xs">
                  Add an operator or weapon to start tracking materials and
                  upgrade costs.
                </p>
                <motion.button
                  onClick={() => setModal("add-character")}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="mt-5 px-5 py-2.5 rounded-xl bg-yellow-300 text-zinc-900 text-sm font-bold hover:bg-yellow-400 transition-all"
                >
                  + Add Operator
                </motion.button>
              </motion.div>
            ) : (
              <div className="flex flex-col gap-3 pb-6">
                <AnimatePresence mode="popLayout">
                  {characters.map((c, i) => (
                    <CharacterCard
                      key={c.id}
                      character={c}
                      skills={skillsMap[c.id] ?? []}
                      index={i}
                      onUpdate={handleUpdateCharacter}
                      onRemove={handleRemoveCharacter}
                      onUpdateSkill={(skillId, current, target) =>
                        handleUpdateSkill(c.id, skillId, current, target)
                      }
                    />
                  ))}
                </AnimatePresence>

                {characters.length > 0 && weapons.length > 0 && (
                  <div className="flex items-center gap-3 my-1">
                    <div className="flex-1 h-px bg-zinc-100" />
                    <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-300">
                      Weapons
                    </span>
                    <div className="flex-1 h-px bg-zinc-100" />
                  </div>
                )}

                <AnimatePresence mode="popLayout">
                  {weapons.map((w, i) => (
                    <WeaponCard
                      key={w.id}
                      weapon={w}
                      index={i}
                      onUpdate={handleUpdateWeapon}
                      onRemove={handleRemoveWeapon}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: summary panel ── */}
        <div className="w-full xl:w-80 2xl:w-96 shrink-0">
          <div className="bg-white border border-zinc-200 rounded-2xl p-5">
            <SummaryPanel
              summary={summary}
              loading={summaryLoading}
              creditItem={creditItem}
              creditOwned={creditOwned}
              onCreditChange={handleCreditChange}
              onEditInventory={() => setModal("inventory")}
            />
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      <AnimatePresence>
        {modal === "add-character" && (
          <AddCharacterModal
            key="add-char"
            existingIds={characters.map((c) => c.character_id)}
            onClose={() => setModal(null)}
            onAdd={handleAddCharacter}
          />
        )}
        {modal === "add-weapon" && (
          <AddWeaponModal
            key="add-weapon"
            existingIds={weapons.map((w) => w.weapon_id)}
            onClose={() => setModal(null)}
            onAdd={handleAddWeapon}
          />
        )}
        {modal === "inventory" && (
          <InventoryModal
            key="inventory"
            materials={summary?.materials ?? []}
            creditItem={creditItem}
            creditOwned={creditOwned}
            creditNeeded={summary ? Number(summary.total_credits_needed) : 0}
            onClose={() => setModal(null)}
            onSave={handleSaveInventory}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
