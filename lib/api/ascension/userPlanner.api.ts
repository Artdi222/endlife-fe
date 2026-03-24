import { request } from "../base";
import type {
  UserCharacterWithDetails,
  UserCharacterSkillWithDetails,
  UserWeaponWithDetails,
  UserInventoryItem,
  PlannerSummary,
  AddUserCharacterDTO,
  UpdateUserCharacterDTO,
  AddUserWeaponDTO,
  UpdateUserWeaponDTO,
  UpdateUserCharacterSkillDTO,
  UpsertInventoryItemDTO,
  BulkUpsertInventoryDTO,
} from "../../types/ascension/userPlanner.types";

const BASE = "/user-planner";

export const userPlannerApi = {
  // CHARACTERS
  // GET /user-planner/characters
  getCharacters: () =>
    request<{ data: UserCharacterWithDetails[] }>(`${BASE}/characters`),

  // GET /user-planner/characters/:id
  getCharacterById: (id: number) =>
    request<{ data: UserCharacterWithDetails }>(`${BASE}/characters/${id}`),

  // POST /user-planner/characters
  addCharacter: (body: AddUserCharacterDTO) =>
    request<{ data: UserCharacterWithDetails }>(`${BASE}/characters`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  // PATCH /user-planner/characters/:id
  updateCharacter: (id: number, body: UpdateUserCharacterDTO) =>
    request<{ data: UserCharacterWithDetails }>(`${BASE}/characters/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  // DELETE /user-planner/characters/:id
  removeCharacter: (id: number) =>
    request<{ data: null }>(`${BASE}/characters/${id}`, {
      method: "DELETE",
    }),

  // CHARACTER SKILLS

  // GET /user-planner/characters/:id/skills
  getCharacterSkills: (userCharacterId: number) =>
    request<{ data: UserCharacterSkillWithDetails[] }>(
      `${BASE}/characters/${userCharacterId}/skills`,
    ),

  // PATCH /user-planner/skills/:id
  updateSkill: (
    userCharacterSkillId: number,
    body: UpdateUserCharacterSkillDTO,
  ) =>
    request<{ data: UserCharacterSkillWithDetails }>(
      `${BASE}/skills/${userCharacterSkillId}`,
      {
        method: "PATCH",
        body: JSON.stringify(body),
      },
    ),

  // WEAPONS

  // GET /user-planner/weapons
  getWeapons: () =>
    request<{ data: UserWeaponWithDetails[] }>(`${BASE}/weapons`),

  // GET /user-planner/weapons/:id
  getWeaponById: (id: number) =>
    request<{ data: UserWeaponWithDetails }>(`${BASE}/weapons/${id}`),

  // POST /user-planner/weapons
  addWeapon: (body: AddUserWeaponDTO) =>
    request<{ data: UserWeaponWithDetails }>(`${BASE}/weapons`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  // PATCH /user-planner/weapons/:id
  updateWeapon: (id: number, body: UpdateUserWeaponDTO) =>
    request<{ data: UserWeaponWithDetails }>(`${BASE}/weapons/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  // DELETE /user-planner/weapons/:id
  removeWeapon: (id: number) =>
    request<{ data: null }>(`${BASE}/weapons/${id}`, {
      method: "DELETE",
    }),

  // INVENTORY
  // GET /user-planner/inventory
  getInventory: () =>
    request<{ data: UserInventoryItem[] }>(`${BASE}/inventory`),

  // GET /user-planner/inventory/:item_id
  getInventoryItem: (itemId: number) =>
    request<{ data: UserInventoryItem }>(`${BASE}/inventory/${itemId}`),

  // PUT /user-planner/inventory/:item_id
  setInventoryItem: (itemId: number, body: UpsertInventoryItemDTO) =>
    request<{ data: UserInventoryItem }>(`${BASE}/inventory/${itemId}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  // POST /user-planner/inventory/bulk
  bulkSetInventory: (body: BulkUpsertInventoryDTO) =>
    request<{ data: UserInventoryItem[] }>(`${BASE}/inventory/bulk`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  // DELETE /user-planner/inventory/:item_id
  removeInventoryItem: (itemId: number) =>
    request<{ data: null }>(`${BASE}/inventory/${itemId}`, {
      method: "DELETE",
    }),

  // SUMMARY
  // GET /user-planner/summary
  // Returns aggregated materials needed, total credits and EXP across all planned
  // characters, weapons, and skills — with inventory quantities already subtracted.
  getSummary: () => request<{ data: PlannerSummary }>(`${BASE}/summary`),
}