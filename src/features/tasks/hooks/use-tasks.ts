import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createTask, deleteTask, fetchTask, fetchTasks, updateTask } from '../api/tasks';
import { taskKeys } from '../constants';
import type { Task, TaskPatchDto, TaskStatus } from '../types';

export function useTasks() {
  return useQuery({
    queryKey: taskKeys.list(),
    queryFn: ({ signal }) => fetchTasks(signal),
  });
}

/** A single task, e.g. for a deep link to a task that isn't in the loaded list. */
export function useTask(id: string | null, { enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: taskKeys.detail(id ?? ''),
    queryFn: ({ signal }) => fetchTask(id ?? '', signal),
    enabled: enabled && Boolean(id),
    retry: false,
  });
}

function useSetTask() {
  const queryClient = useQueryClient();
  return (task: Task) => {
    queryClient.setQueryData<Task[]>(taskKeys.list(), (tasks) =>
      !tasks
        ? tasks
        : tasks.some((item) => item.id === task.id)
          ? tasks.map((item) => (item.id === task.id ? task : item))
          : [task, ...tasks],
    );
    queryClient.setQueryData(taskKeys.detail(task.id), task);
  };
}

export function useCreateTask() {
  const setTask = useSetTask();
  return useMutation({ mutationFn: createTask, onSuccess: setTask });
}

export function useUpdateTask() {
  const setTask = useSetTask();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: TaskPatchDto }) => updateTask(id, body),
    onSuccess: setTask,
  });
}

/** Complete (`done`), reopen (`open`) or cancel a task, optimistically. */
export function useSetTaskStatus() {
  const queryClient = useQueryClient();
  const setTask = useSetTask();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) => updateTask(id, { status }),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.all });
      const previousList = queryClient.getQueryData<Task[]>(taskKeys.list());
      const previousDetail = queryClient.getQueryData<Task>(taskKeys.detail(id));
      const patch = (task: Task): Task => ({
        ...task,
        status,
        completedAt: status === 'done' ? new Date().toISOString() : null,
      });
      queryClient.setQueryData<Task[]>(taskKeys.list(), (tasks) =>
        tasks?.map((task) => (task.id === id ? patch(task) : task)),
      );
      queryClient.setQueryData<Task>(taskKeys.detail(id), (task) => (task ? patch(task) : task));
      return { previousList, previousDetail };
    },
    onSuccess: setTask,
    onError: (_error, { id }, context) => {
      queryClient.setQueryData(taskKeys.list(), context?.previousList);
      queryClient.setQueryData(taskKeys.detail(id), context?.previousDetail);
    },
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
      for (const id of succeeded) queryClient.removeQueries({ queryKey: taskKeys.detail(id) });
    },
  });
}
