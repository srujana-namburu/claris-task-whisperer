
export interface Task {
  id: string;
  name: string;
  assignee: string;
  dueDate: Date | null;
  priority: 'P1' | 'P2' | 'P3' | 'P4';
  completed: boolean;
  createdAt: Date;
  source: 'manual' | 'transcript';
}

export interface TaskFilters {
  assignee?: string;
  priority?: string;
  search?: string;
  source?: string;
}

export interface ParsedTask {
  name: string;
  assignee: string;
  dueDate: Date | null;
  priority: 'P1' | 'P2' | 'P3' | 'P4';
  source?: 'manual' | 'transcript';
}

export interface BatchParsedTask extends ParsedTask {
  selected: boolean;
  id: string;
}
