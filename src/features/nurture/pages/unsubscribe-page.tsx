import { CircleCheck, Loader2, MailX } from 'lucide-react';
import { useEffect, useRef, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { errorMessage } from '@/services';

import { NURTURE_PROBLEM_CODES, nurtureProblemCode } from '../constants';
import { useUnsubscribe } from '../hooks/use-nurture';

/** Same brand frame as the auth pages (sign-in, password reset), without any sign-in. */
function PublicFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex items-center justify-center gap-2 font-heading font-semibold">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
            C
          </span>
          Climetavere
        </div>
        <div className="space-y-4 rounded-xl border bg-card p-6 text-center shadow-xs">
          {children}
        </div>
      </div>
    </div>
  );
}

function Message({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children?: ReactNode;
}) {
  return (
    <>
      {icon}
      <div className="space-y-1.5">
        <h1 className="font-heading text-xl font-semibold tracking-tight">{title}</h1>
        {children && <p className="text-sm text-pretty text-muted-foreground">{children}</p>}
      </div>
    </>
  );
}

/** Public /unsubscribe?token=… page linked from nurture emails and messages. */
export default function UnsubscribePage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token')?.trim() ?? '';
  const unsubscribe = useUnsubscribe();
  // StrictMode mounts effects twice in development: send the request only once per token.
  const sentFor = useRef<string | null>(null);

  useEffect(() => {
    if (!token || sentFor.current === token) return;
    sentFor.current = token;
    unsubscribe.mutate(token);
    // `unsubscribe` changes identity on every render; the ref guards repeats.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (!token)
    return (
      <PublicFrame>
        <Message
          icon={<MailX aria-hidden className="mx-auto size-10 text-destructive" />}
          title="This link is incomplete"
        >
          The unsubscribe link is missing its code. Open the link from the message again, or copy
          the whole address into your browser.
        </Message>
      </PublicFrame>
    );

  if (unsubscribe.isSuccess)
    return (
      <PublicFrame>
        <Message
          icon={<CircleCheck aria-hidden className="mx-auto size-10 text-success" />}
          title="You’re unsubscribed"
        >
          You won’t receive any more marketing emails or WhatsApp messages from us. You can close
          this page.
        </Message>
      </PublicFrame>
    );

  if (unsubscribe.isError) {
    const invalid = nurtureProblemCode(unsubscribe.error) === NURTURE_PROBLEM_CODES.invalidToken;
    return (
      <PublicFrame>
        <Message
          icon={<MailX aria-hidden className="mx-auto size-10 text-destructive" />}
          title={invalid ? 'This link is invalid or has expired' : 'We couldn’t unsubscribe you'}
        >
          {invalid
            ? 'Use the unsubscribe link from a more recent message, or reply to it and ask us to stop.'
            : errorMessage(unsubscribe.error, 'Something went wrong. Please try again.')}
        </Message>
        {!invalid && (
          <Button
            variant="outline"
            onClick={() => {
              unsubscribe.mutate(token);
            }}
          >
            Try again
          </Button>
        )}
      </PublicFrame>
    );
  }

  return (
    <PublicFrame>
      <div role="status" aria-live="polite" className="space-y-4">
        <Loader2 aria-hidden className="mx-auto size-10 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Unsubscribing you…</p>
      </div>
    </PublicFrame>
  );
}
