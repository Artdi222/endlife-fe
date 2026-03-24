// ─── ASCENSION STAGE DEFINITIONS ─────────────────────────────────────────────

export interface StageDef {
  stage_number: number;
  level_from: number;
  level_to: number;
  is_breakthrough: boolean;
  label: string;
}

export const STAGE_DEFS: StageDef[] = [
  {
    stage_number: 1,
    level_from: 1,
    level_to: 20,
    is_breakthrough: false,
    label: "1 → 20",
  },
  {
    stage_number: 2,
    level_from: 20,
    level_to: 20,
    is_breakthrough: true,
    label: "20 → 20+",
  },
  {
    stage_number: 3,
    level_from: 20,
    level_to: 40,
    is_breakthrough: false,
    label: "20+ → 40",
  },
  {
    stage_number: 4,
    level_from: 40,
    level_to: 40,
    is_breakthrough: true,
    label: "40 → 40+",
  },
  {
    stage_number: 5,
    level_from: 40,
    level_to: 60,
    is_breakthrough: false,
    label: "40+ → 60",
  },
  {
    stage_number: 6,
    level_from: 60,
    level_to: 60,
    is_breakthrough: true,
    label: "60 → 60+",
  },
  {
    stage_number: 7,
    level_from: 60,
    level_to: 80,
    is_breakthrough: false,
    label: "60+ → 80",
  },
  {
    stage_number: 8,
    level_from: 80,
    level_to: 80,
    is_breakthrough: true,
    label: "80 → 80+",
  },
  {
    stage_number: 9,
    level_from: 80,
    level_to: 90,
    is_breakthrough: false,
    label: "80+ → 90",
  },
];

// Single-point stage labels — "where you are right now"
// stage 0 = not started, stage N = just finished that stage
export const STAGE_POINT_OPTIONS = [
  { value: 0, label: "1" }, 
  { value: 1, label: "20" }, // cleared 1→20
  { value: 2, label: "20+" }, // breakthrough done
  { value: 3, label: "40" },
  { value: 4, label: "40+" },
  { value: 5, label: "60" },
  { value: 6, label: "60+" },
  { value: 7, label: "80" },
  { value: 8, label: "80+" },
  { value: 9, label: "90" },
] as const;

export const MAX_SKILL_LEVEL = 12;
export const MAX_LEVEL = 90;

// Max level by skill type — used to build the level select options
// spaceship_talent: always 2; talent: mostly 2 but some have 3 → safe cap at 3;
// skill: full 12 levels
export const SKILL_MAX_LEVEL: Record<string, number> = {
  skill: 12,
  talent: 3, // some operators only go to 2 — actual max capped by available levels
  spaceship_talent: 2,
};

// Category display order for materials
export const MATERIAL_CATEGORY_ORDER = [
  "Progression Materials",
  "Rare Materials",
  "Naturals",
  "Gatherables",
  "AIC Products",
  "Usables",
  "Functionals",
  "Operator Gifts",
  "Currency",
];
