import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { meKeys } from '@/features/auth';
import { useApplyTheme } from '@/hooks/use-theme';
import { isHttpError } from '@/services';

/** A 403 may mean the user's role just changed: reload their permissions from /api/v1/me. */
function refreshPermissionsOnForbidden(error: unknown) {
  if (isHttpError(error) && error.status === 403) {
    void queryClient.invalidateQueries({ queryKey: meKeys.all });
  }
}

const queryClient: QueryClient = new QueryClient({
  queryCache: new QueryCache({ onError: refreshPermissionsOnForbidden }),
  mutationCache: new MutationCache({ onError: refreshPermissionsOnForbidden }),
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      // Client errors (4xx) won't succeed on retry.
      retry: (failureCount, error) =>
        !(isHttpError(error) && error.status >= 400 && error.status < 500) && failureCount < 2,
    },
  },
});

function ThemeSync() {
  useApplyTheme();
  return null;
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={300}>
        <ThemeSync />
        {children}
        <Toaster richColors closeButton position="bottom-right" />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
