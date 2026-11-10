import { Navigate, useParams } from 'react-router-dom';

import { paths } from '@/routes/paths';

/** `/dashboard/tasks/:taskId` (notification links) opens that task's sheet on the list. */
export function TaskDeepLink() {
  const { taskId = '' } = useParams();
  return <Navigate to={`${paths.tasks}?task=${encodeURIComponent(taskId)}`} replace />;
}
