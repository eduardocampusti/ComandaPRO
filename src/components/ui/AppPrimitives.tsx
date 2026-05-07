import type { MouseEventHandler, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Store } from 'lucide-react';

export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

type Tone = 'primary' | 'neutral' | 'success' | 'warning' | 'danger';

const toneClasses: Record<Tone, string> = {
  primary: 'bg-primary-50 text-primary-700 ring-primary-200 dark:bg-primary-950/40 dark:text-primary-200 dark:ring-primary-800/70',
  neutral: 'bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:ring-emerald-800/70',
  warning: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:ring-amber-800/70',
  danger: 'bg-red-50 text-red-700 ring-red-200 dark:bg-red-950/40 dark:text-red-200 dark:ring-red-800/70',
};

interface StatusBadgeProps {
  children: ReactNode;
  tone?: Tone;
  dot?: boolean;
  className?: string;
}

export function StatusBadge({
  children,
  tone = 'neutral',
  dot = false,
  className,
}: StatusBadgeProps) {
  return (
    <span className={cx('app-badge ring-1 ring-inset', toneClasses[tone], className)}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  icon: LucideIcon;
  tone?: 'default' | 'primary' | 'danger' | 'warning';
  variant?: 'ghost' | 'solid' | 'outline';
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export function IconButton({
  label,
  icon: Icon,
  tone = 'default',
  variant = 'solid',
  size = 'md',
  className,
  ...props
}: IconButtonProps) {
  const toneClass =
    tone === 'primary'
      ? 'text-primary-600 hover:bg-primary-50 hover:text-primary-700 dark:text-primary-300 dark:hover:bg-primary-950/40'
      : tone === 'danger'
        ? 'text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-300'
        : tone === 'warning'
          ? 'text-amber-500 hover:bg-amber-50 hover:text-amber-600 dark:text-amber-400 dark:hover:bg-amber-950/30'
          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white';

  const sizeClass = {
    xs: 'h-7 w-7',
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cx(
        'inline-flex items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950',
        toneClass,
        sizeClass[size],
        className
      )}
      {...props}
    >
      <Icon className={cx(size === 'xs' ? 'h-3.5 w-3.5' : size === 'sm' ? 'h-4 w-4' : 'h-5 w-5')} />
    </button>
  );
}

interface BrandMarkProps {
  logoUrl?: string;
  name: string;
  className?: string;
}

export function BrandMark({ logoUrl, name, className }: BrandMarkProps) {
  return (
    <div className={cx('flex min-w-0 items-center gap-3', className)}>
      {logoUrl ? (
        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white shadow-soft dark:border-slate-700 dark:bg-slate-900">
          <img
            src={logoUrl}
            alt="Logo"
            className="h-full w-full object-contain p-1.5"
            onError={(event) => {
              (event.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      ) : (
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary-600 text-white shadow-lifted">
          <Store className="h-5 w-5" />
        </div>
      )}
      <div className="min-w-0">
        <p className="truncate font-display text-base font-extrabold leading-tight text-slate-950 dark:text-white">
          {name}
        </p>
        <p className="text-[11px] font-bold uppercase tracking-normal text-slate-400 dark:text-slate-500">
          COMANDA PRO
        </p>
      </div>
    </div>
  );
}

// ========== New Primitives added for Menu Management ==========

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  icon?: LucideIcon;
  isLoading?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ 
  children, 
  variant = 'primary', 
  icon: Icon, 
  isLoading, 
  size = 'md',
  className, 
  disabled,
  ...props 
}: ButtonProps) {
  const baseClass = "inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 dark:focus-visible:ring-offset-slate-950";
  
  const variantClass = {
    primary: "bg-primary text-on-primary hover:bg-primary-container focus-visible:ring-primary shadow-lifted",
    secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200 focus-visible:ring-slate-500 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 focus-visible:ring-red-500 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-900/40"
  };

  const sizeClass = {
    sm: "h-9 px-4 text-xs",
    md: "h-11 px-6 text-sm",
    lg: "h-14 px-8 text-base"
  };

  return (
    <button
      className={cx(baseClass, variantClass[variant], sizeClass[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : Icon ? (
        <Icon className="h-5 w-5" />
      ) : null}
      {children}
    </button>
  );
}

export function Card({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={cx("rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }: { icon: React.ElementType, title: string, description?: string, action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-12 text-center dark:border-slate-800 dark:bg-slate-900/50">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-800">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="font-bold text-slate-900 dark:text-white">{title}</h3>
      {description && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function SectionHeader({ title, description, actions }: { title: string, description?: string, actions?: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="font-display text-2xl font-black text-slate-950 dark:text-white">{title}</h1>
        {description && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-3">{actions}</div>}
    </div>
  );
}
