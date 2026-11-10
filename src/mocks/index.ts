import type { HttpAdapter, HttpRequest } from '@/types';

import { dispatch, hasRoute } from './router';
// Only modules the Go API doesn't serve yet are mocked. Users, contacts, leads, tasks,
// notifications, deals, nurture, invoices and reports always go to the backend (/api/v1).
import './handlers/attendance';
import './handlers/auth';
import './handlers/calls';
import './handlers/companies';
import './handlers/files';
import './handlers/products';

/** Serves requests from the in-memory mock db with the same shapes as the REST API. */
export const mockAdapter: HttpAdapter = (request) => dispatch(request);

export function mockHandles(request: HttpRequest): boolean {
  return hasRoute(request);
}
