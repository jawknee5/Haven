import { Task, TaskCreateInput, TaskUpdateInput } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { credentials: 'include', ...options });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const tasksApi = {
  list: (): Promise<Task[]> => fetchJson(`${API_BASE}/tasks`),

  get: (id: string): Promise<Task> => fetchJson(`${API_BASE}/tasks/${id}`),

  create: (input: TaskCreateInput): Promise<Task> =>
    fetchJson(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    }),

  update: (id: string, input: TaskUpdateInput): Promise<Task> =>
    fetchJson(`${API_BASE}/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    }),

  toggleStep: (taskId: string, stepId: string, completed: boolean): Promise<Task> =>
    fetchJson(`${API_BASE}/tasks/${taskId}/steps/${stepId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed }),
    }),

  delete: (id: string): Promise<void> => fetchJson(`${API_BASE}/tasks/${id}`, { method: 'DELETE' }),
};
