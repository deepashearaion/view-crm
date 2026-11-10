/** Paging shared by /api/v1 list endpoints (default limit 50, max 200). */
export interface ListParams {
  limit?: number;
  /** Cursor paging (contacts, notifications, timelines): the last id of the previous page. */
  before_id?: number;
  /** Offset paging (tasks, deals, invoices, enrollments). */
  offset?: number;
}
