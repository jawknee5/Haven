export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface TaskStep {
  id: string;
  label: string;
  completed: boolean;
  position: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  steps: TaskStep[];
  streakImpact: number;
  completionWeight: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskCreateInput {
  title: string;
  description: string;
  category: string;
  priority?: TaskPriority;
  dueDate?: string | null;
  steps?: Omit<TaskStep, 'id'>[];
}

export interface TaskUpdateInput {
  title?: string;
  description?: string;
  category?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
}
