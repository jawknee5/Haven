import { useEffect } from 'react';
import { useTasksStore } from '../store/useTasksStore';

export function useTasks() {
  const { tasks, loading, error, load, update, toggleStep } = useTasksStore();

  useEffect(() => {
    if (tasks.length === 0 && !loading && !error) {
      load();
    }
  }, [tasks.length, loading, error, load]);

  const pendingTasks = tasks.filter((t) => t.status !== 'completed');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  return {
    tasks,
    pendingTasks,
    completedTasks,
    loading,
    error,
    reload: load,
    updateTask: update,
    toggleStep,
  };
}
