export const taskKeys = {
  all: ['tasks'] as const,
  alerts: () => [...taskKeys.all, 'alerts'] as const,
};
