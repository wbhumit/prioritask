export enum Priority {
  P1 = 'P1',
  P2 = 'P2',
  P3 = 'P3',
  P4 = 'P4',
}

export enum Complexity {
  E = 'E', // Easy
  M = 'M', // Medium
  H = 'H', // Hard
}

export interface SubTask {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface Task {
  id: string;
  title: string;
  priority: Priority;
  complexity: Complexity;
  subtasks: SubTask[];
  isExpanded: boolean;
  createdAt: number;
}

export type TaskSortFn = (a: Task, b: Task) => number;