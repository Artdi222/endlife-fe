export interface Group {
  id: number;
  name: string;
  category_id: number;
  order_index: number;
}

export interface SubGroup {
  id: number;
  name: string;
  group_id: number;
  order_index: number;
}
