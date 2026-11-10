import { Bot, MessageCircle, Send, Users } from 'lucide-react';
import type { ReactNode } from 'react';

const highlights = [
  { icon: Bot, title: 'AI-powered', detail: 'Smarter insights' },
  { icon: Users, title: 'CRM', detail: 'Organize leads' },
  { icon: MessageCircle, title: 'WhatsApp API', detail: 'Real-time chats' },
  { icon: Send, title: 'Insta automation', detail: 'Auto DM' },
] as const;

interface AuthLayoutProps {
  title: string;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

/** Split-screen layout shared by sign-in, sign-up and password reset. */
export function AuthLayout({ title, description, children, footer }: AuthLayoutProps) {
  return (
    <div className="grid min-h-svh bg-background lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 -right-32 size-96 rounded-full bg-primary-foreground/10 blur-3xl"
        />
        <div className="flex items-center gap-2 font-heading text-lg font-semibold">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary-foreground text-sm font-bold text-primary">
            C
          </span>
          Climetavere
        </div>

        <div className="relative space-y-8">
          <h2 className="max-w-md font-heading text-4xl leading-tight font-semibold tracking-tight text-balance">
            The real definition for a powerful CRM
          </h2>
          <ul className="grid max-w-md grid-cols-2 gap-4">
            {highlights.map(({ icon: Icon, title: label, detail }) => (
              <li
                key={label}
                className="flex items-start gap-3 rounded-xl bg-primary-foreground/10 p-3"
              >
                <Icon aria-hidden className="mt-0.5 size-5 shrink-0" />
                <span>
                  <span className="block text-sm font-semibold">{label}</span>
                  <span className="block text-xs opacity-80">{detail}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="text-sm opacity-90">
            Trusted by <strong>2500+</strong> businesses
          </p>
        </div>

        <p className="text-xs opacity-70">
          © {new Date().getFullYear()} Climetaverse . All rights reserved.
        </p>
      </aside>

      <main className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-sm space-y-6">
          <div className="space-y-1.5">
            <div className="mb-6 flex items-center gap-2 font-heading font-semibold lg:hidden">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
                C
              </span>
              Climetavere
            </div>
            <h1 className="font-heading text-2xl font-semibold tracking-tight">{title}</h1>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
          {children}
          {footer && <div className="text-center text-sm text-muted-foreground">{footer}</div>}
        </div>
      </main>
    </div>
  );
}
