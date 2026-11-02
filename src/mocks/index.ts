import type { HttpAdapter, HttpRequest } from '@/types';

import { dispatch, hasRoute } from './router';
import './handlers/alerts';
import './handlers/attendance';
import './handlers/auth';
import './handlers/calls';
import './handlers/companies';
import './handlers/contacts';
import './handlers/deals';
import './handlers/files';
import './handlers/products';
import './handlers/tasks';
import './handlers/users';

/** Serves requests from the in-memory mock db with the same shapes as the REST API. */
export const mockAdapter: HttpAdapter = (request) => dispatch(request);

export function mockHandles(request: HttpRequest): boolean {
  return hasRoute(request);
}
