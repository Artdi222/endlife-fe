import type { Task } from "./task.types";

export interface AdminSubGroup {
  id: number;
  name: string;
  order_index: number;
  tasks: Task[];
}

export interface AdminGroup {
  id: number;
  name: string;
  order_index: number;
  sub_groups: AdminSubGroup[];
  tasks: Task[];
}

export interface AdminCategory {
  id: number;
  name: string;
  order_index: number;
  groups: AdminGroup[];
}
