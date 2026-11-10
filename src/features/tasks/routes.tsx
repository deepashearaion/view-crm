import type { RouteObject } from 'react-router-dom';

import { crumb } from '@/types';

import { TaskDeepLink } from './components/task-deep-link';

const tasksPage = (createOnMount: boolean) => () =>
  import('./pages/tasks-page').then(({ default: TasksPage }) => ({
    Component: () => <TasksPage createOnMount={createOnMount} />,
  }));

/** Mounted under /dashboard. */
export const tasksRoutes: RouteObject[] = [
  {
    path: 'tasks',
    handle: crumb('Tasks'),
    children: [
      { index: true, lazy: tasksPage(false) },
      { path: 'new', handle: crumb('New task'), lazy: tasksPage(true) },
      // Notification links (/tasks/{id}) open the task's sheet.
      { path: ':taskId', element: <TaskDeepLink /> },
    ],
  },
];
