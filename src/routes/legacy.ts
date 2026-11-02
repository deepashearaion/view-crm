import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { paths, type AppPath } from './paths';

/*
 * Temporary bridge for pages that still navigate with `setCurrentPage('<Page name>')`.
 * Deleted at the end of Phase 2 once every page uses real links.
 */

const IMPORT_TARGET_KEY = 'dealconverter_import_target';

const legacyPagePaths: Record<string, AppPath> = {
  Home: paths.home,
  Deals: paths.deals,
  Activities: paths.tasks,
  Attendance: paths.attendance,
  Quotation: paths.quotations,
  Reports: paths.reports,
  'File Cabinet': paths.files,
  Contacts: paths.contacts,
  'Add Contact': paths.contactsNew,
  Companies: paths.companies,
  'Add Company': paths.companiesNew,
  'Bulk Import': paths.import,
  'Call Recordings': paths.callRecordings,
  'Call Logs': paths.callRecordings,
  Invoice: paths.invoices,
  'Products & Services': paths.products,
};

export type LegacyNavigate = (page: string, target?: string | null) => void;

/** Same semantics as the old `handlePageChange` in App.jsx, but backed by the router. */
export function useLegacyNavigate(): LegacyNavigate {
  const navigate = useNavigate();
  return useCallback<LegacyNavigate>(
    (page, target = null) => {
      let importTarget: string | null = target;
      if (!importTarget && (page === 'Contacts' || page === 'Add Contact'))
        importTarget = 'Contacts';
      if (!importTarget && (page === 'Companies' || page === 'Add Company'))
        importTarget = 'Companies';
      if (importTarget) localStorage.setItem(IMPORT_TARGET_KEY, importTarget);

      void navigate(legacyPagePaths[page] ?? paths.home);
    },
    [navigate],
  );
}

export function readImportTarget(): string {
  return localStorage.getItem(IMPORT_TARGET_KEY) ?? 'Contacts';
}
