// ─── ASCENSION STAGE ─────────────────────────────────────────────────────────

export interface AscensionStage {
  id: number;
  entity_type: "character" | "weapon";
  entity_id: number;
  stage_number: number; // 1–9
  level_from: number;
  level_to: number;
  is_breakthrough: boolean;
  credit_cost: string; // BIGINT as string
}

export interface AscensionRequirement {
  id: number;
  stage_id: number;
  item_id: number;
  quantity: number;
  item_name: string;
  item_image: string | null;
  item_category: string;
  item_exp_value: number;
}

export interface AscensionStageWithRequirements extends AscensionStage {
  requirements: AscensionRequirement[];
}

// ─── DTOs ─────────────────────────────────────────────────────────────────────

export interface CreateAscensionStageDTO {
  entity_type: "character" | "weapon";
  entity_id: number;
  stage_number: number;
  level_from: number;
  level_to: number;
  is_breakthrough?: boolean;
  credit_cost?: number;
  // NOTE: exp_required is NOT here — EXP lives in level_costs
}

export interface UpdateAscensionStageDTO {
  credit_cost?: number;
}

export interface CreateAscensionRequirementDTO {
  stage_id: number;
  item_id: number;
  quantity: number;
}

export interface UpdateAscensionRequirementDTO {
  quantity: number;
}

export interface BulkUpsertRequirementsDTO {
  stage_id: number;
  items: Array<{ item_id: number; quantity: number }>;
}
