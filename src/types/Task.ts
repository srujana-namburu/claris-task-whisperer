
export interface Task {
  id: string;
  name: string;
  assignee: string;
  dueDate: Date | null;
  priority: 'P1' | 'P2' | 'P3' | 'P4';
  completed: boolean;
  createdAt: Date;
}

export interface TaskFilters {
  assignee?: string;
  priority?: string;
  search?: string;
}

export interface ParsedTask {
  name: string;
  assignee: string;
  dueDate: Date | null;
  priority: 'P1' | 'P2' | 'P3' | 'P4';
}
