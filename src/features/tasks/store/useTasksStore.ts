import { create } from 'zustand';
import { Task, TaskUpdateInput, TaskCreateInput } from '../types';
import { tasksApi } from '../api/tasksApi';

interface TasksState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  load: () => Promise<void>;
  create: (input: TaskCreateInput) => Promise<Task>;
  update: (id: string, patch: TaskUpdateInput) => Promise<void>;
  toggleStep: (taskId: string, stepId: string, completed: boolean) => Promise<void>;
  remove: (id: string) => Promise<void>;
  getById: (id: string) => Task | undefined;
  optimisticUpdate: (id: string, patch: Partial<Task>) => void;
}

export const useTasksStore = create<TasksState>((set, get) => ({
  tasks: [],
  loading: false,
  error: null,

  async load() {
    set({ loading: true, error: null });
    try {
      const tasks = await tasksApi.list();
      set({ tasks, loading: false });
    } catch (e: any) {
      set({ error: e.message ?? 'Failed to load tasks', loading: false });
    }
  },

  async create(input) {
    const task = await tasksApi.create(input);
    set({ tasks: [task, ...get().tasks] });
    return task;
  },

  async update(id, patch) {
    const prev = get().tasks;
    const optimistic = prev.map((t) =>
      t.id === id ? { ...t, ...patch, updatedAt: new Date().toISOString() } : t
    );
    set({ tasks: optimistic });
    try {
      const updated = await tasksApi.update(id, patch);
      set({ tasks: get().tasks.map((t) => (t.id === id ? updated : t)) });
    } catch (e) {
      set({ tasks: prev });
      throw e;
    }
  },

  async toggleStep(taskId, stepId, completed) {
    const prev = get().tasks;
    const optimistic = prev.map((t) =>
      t.id === taskId
        ? { ...t, steps: t.steps.map((s) => (s.id === stepId ? { ...s, completed } : s)) }
        : t
    );
    set({ tasks: optimistic });
    try {
      await tasksApi.toggleStep(taskId, stepId, completed);
    } catch (e) {
      set({ tasks: prev });
      throw e;
    }
  },

  async remove(id) {
    const prev = get().tasks;
    set({ tasks: prev.filter((t) => t.id !== id) });
    try {
      await tasksApi.delete(id);
    } catch (e) {
      set({ tasks: prev });
      throw e;
    }
  },

  getById(id) {
    return get().tasks.find((t) => t.id === id);
  },

  optimisticUpdate(id, patch) {
    set({ tasks: get().tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) });
  },
}));
