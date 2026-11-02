import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createTask, deleteTask, fetchTasks, updateTask } from '../api/tasks';
import { taskKeys } from '../constants';
import type { Task, TaskWriteDto } from '../types';

export function useTasks() {
  return useQuery({
    queryKey: taskKeys.list(),
    queryFn: ({ signal }) => fetchTasks(signal),
  });
}

function useSetTask() {
  const queryClient = useQueryClient();
  return (task: Task) => {
    queryClient.setQueryData<Task[]>(taskKeys.list(), (tasks = []) =>
      tasks.some((item) => item.id === task.id)
        ? tasks.map((item) => (item.id === task.id ? task : item))
        : [task, ...tasks],
    );
  };
}

export function useCreateTask() {
  const setTask = useSetTask();
  return useMutation({ mutationFn: createTask, onSuccess: setTask });
}

export function useUpdateTask() {
  const setTask = useSetTask();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: TaskWriteDto }) => updateTask(id, body),
    onSuccess: setTask,
  });
}

/** Toggles completion optimistically so the checkbox responds instantly. */
export function useToggleTaskComplete() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      updateTask(id, { completed_at: completed ? new Date().toISOString() : null }),
    onMutate: async ({ id, completed }) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.list() });
      const previous = queryClient.getQueryData<Task[]>(taskKeys.list());
      queryClient.setQueryData<Task[]>(taskKeys.list(), (tasks) =>
        tasks?.map((task) =>
          task.id === id
            ? { ...task, completedAt: completed ? new Date().toISOString() : null }
            : task,
        ),
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      queryClient.setQueryData(taskKeys.list(), context?.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: taskKeys.list() }),
  });
}

export function useDeleteTasks() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      const results = await Promise.allSettled(ids.map(deleteTask));
      return {
        succeeded: ids.filter((_, index) => results[index]?.status === 'fulfilled'),
        failed: ids.filter((_, index) => results[index]?.status === 'rejected'),
      };
    },
    onSuccess: ({ succeeded }) => {
      const removed = new Set(succeeded);
      queryClient.setQueryData<Task[]>(taskKeys.list(), (tasks) =>
        tasks?.filter((task) => !removed.has(task.id)),
      );
    },
  });
}
