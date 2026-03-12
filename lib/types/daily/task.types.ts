export interface Task {
  id: number;
  name: string;
  group_id: number;
  sub_group_id?: number | null;
  max_progress: number;
  reward_point: number;
  order_index: number;
}
