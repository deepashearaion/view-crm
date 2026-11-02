/** Data attached to a route via `handle`; read by the Topbar breadcrumbs. */
export interface RouteHandle {
  crumb?: string;
}

export const crumb = (label: string): RouteHandle => ({ crumb: label });
