// ─── USER CHARACTER ───────────────────────────────────────────────────────────

export interface UserCharacter {
  id: number;
  user_id: number;
  character_id: number;
  current_level: number;
  target_level: number;
  current_ascension_stage: number; // 0 = not yet ascended
  target_ascension_stage: number; // max 9
}

export interface UserCharacterWithDetails extends UserCharacter {
  character_name: string;
  character_icon: string | null;
  character_rarity: number;
  character_element: string;
  character_class: string | null;
}

// ─── USER CHARACTER SKILL ─────────────────────────────────────────────────────

export interface UserCharacterSkill {
  id: number;
  user_character_id: number;
  skill_id: number;
  current_level: number;
  target_level: number;
}

export interface UserCharacterSkillWithDetails extends UserCharacterSkill {
  skill_name: string;
  skill_type: string;
  skill_icon: string | null;
  skill_order_index: number;
}

// ─── USER WEAPON ──────────────────────────────────────────────────────────────

export interface UserWeapon {
  id: number;
  user_id: number;
  weapon_id: number;
  current_level: number;
  target_level: number;
  current_ascension_stage: number;
  target_ascension_stage: number;
}

export interface UserWeaponWithDetails extends UserWeapon {
  weapon_name: string;
  weapon_icon: string | null;
  weapon_rarity: number;
  weapon_type: string;
}

// ─── INVENTORY ────────────────────────────────────────────────────────────────

export interface UserInventoryItem {
  id: number;
  user_id: number;
  item_id: number;
  quantity: number;
  item_name: string;
  item_image: string | null;
  item_category: string;
  item_exp_value: number;
  item_order_index: number;
}

// ─── PLANNER SUMMARY ──────────────────────────────────────────────────────────

export interface SummaryMaterial {
  item_id: number;
  name: string;
  image: string | null;
  category: string;
  total_needed: number;
  have: number;
  remaining: number;
}

export interface PlannerSummary {
  materials: SummaryMaterial[];
  total_credits_needed: string; // BIGINT as string
  total_exp_needed: string; // BIGINT as string
  credits_breakdown: {
    ascension: string; // BIGINT as string
    skills: string;    // BIGINT as string
    leveling: string;  // BIGINT as string
  };
}

// ─── DTOs ─────────────────────────────────────────────────────────────────────

export interface AddUserCharacterDTO {
  character_id: number;
  current_level?: number;
  target_level?: number;
  current_ascension_stage?: number;
  target_ascension_stage?: number;
}

export interface UpdateUserCharacterDTO {
  current_level?: number;
  target_level?: number;
}

export interface AddUserWeaponDTO {
  weapon_id: number;
  current_level?: number;
  target_level?: number;
  current_ascension_stage?: number;
  target_ascension_stage?: number;
}

export interface UpdateUserWeaponDTO {
  current_level?: number;
  target_level?: number;
}

export interface UpdateUserCharacterSkillDTO {
  current_level?: number;
  target_level?: number;
}

export interface UpsertInventoryItemDTO {
  quantity: number;
}

export interface BulkUpsertInventoryDTO {
  items: Array<{ item_id: number; quantity: number }>;
}

// ─── ENTITY MATERIAL (per-card, inventory-adjusted) ──────────────────────────

export interface EntityMaterial {
  item_id: number;
  name: string;
  image: string | null;
  category: string;
  source: "ascension" | "skill";
  total_needed: number;
  have: number;
  remaining: number;
}

// ─── SKILL NEED ROW ───────────────────────────────────────────────────────────

export interface SkillNeedRow {
  user_character_skill_id: number;
  skill_id: number;
  skill_name: string;
  skill_type: string;
  skill_icon: string | null;
  skill_order_index: number;
  current_level: number;
  target_level: number;
  credits_needed: number;
  materials: EntityMaterial[];
}

// ─── CHARACTER NEEDS ──────────────────────────────────────────────────────────

export interface CharacterNeeds {
  user_character_id: number;
  character_id: number;
  character_name: string;
  current_level: number;
  target_level: number;
  current_ascension_stage: number;
  target_ascension_stage: number;
  level_credits: number;
  ascension_credits: number;
  skill_credits: number;
  total_credits: number;
  total_exp_needed: number;
  materials: EntityMaterial[];
  skills: SkillNeedRow[];
}

// ─── WEAPON NEEDS ─────────────────────────────────────────────────────────────

export interface WeaponNeeds {
  user_weapon_id: number;
  weapon_id: number;
  weapon_name: string;
  current_level: number;
  target_level: number;
  current_ascension_stage: number;
  target_ascension_stage: number;
  level_credits: number;
  ascension_credits: number;
  total_credits: number;
  total_exp_needed: number;
  materials: EntityMaterial[];
}