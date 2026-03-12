export interface Weapon {
  id: number;
  name: string;
  rarity: number;
  type: string;
  icon: string | null;
  order_index: number;
}

export interface CreateWeaponDTO {
  name: string;
  rarity: number;
  type: string;
  order_index?: number;
}

export interface UpdateWeaponDTO {
  name?: string;
  rarity?: number;
  type?: string;
  order_index?: number;
}
