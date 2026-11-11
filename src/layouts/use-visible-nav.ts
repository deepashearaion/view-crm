import { useMemo } from 'react';

import { useAccess } from '@/features/auth';
import { navGroups, settingsNav, visibleNav } from '@/routes/nav';

/**
 * The sidebar and command menu, trimmed to what the signed-in user may open. Until /api/v1/me
 * has loaded, everything is shown so the menu doesn't flash empty.
 */
export function useVisibleNav() {
  const access = useAccess();
  return useMemo(
    () => (access.ready ? visibleNav(access.can) : { groups: navGroups, settings: settingsNav }),
    [access],
  );
}
