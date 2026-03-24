export interface LevelCost {
  id: number;
  entity_type: "character" | "weapon";
  level: number;
  exp_required: string;
  credit_cost: string;
}

export interface CreateLevelCostDTO {
  entity_type: "character" | "weapon";
  level: number;
  exp_required: number;
  credit_cost: number;
}

export interface LevelCostRange {
  total_exp: string;
  total_credits: string;
}

// ─── DTOs ────────────────────────────────────────────────────────────────────

export interface UpsertLevelCostDTO {
  entity_type: "character" | "weapon";
  level: number;
  exp_required: number;
  credit_cost: number;
}

export interface BulkUpsertLevelCostsDTO {
  entity_type: "character" | "weapon";
  rows: Array<{ level: number; exp_required: number; credit_cost: number }>;
}
