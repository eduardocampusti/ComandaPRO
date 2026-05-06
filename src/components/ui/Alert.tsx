
import * as React from "react"
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from "lucide-react"
import { cx } from "./AppPrimitives"

const alertVariants = {
  default: "bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-50 border-slate-200 dark:border-slate-800",
  destructive: "border-red-500/50 text-red-600 dark:border-red-500 [&>svg]:text-red-600 bg-red-50/50 dark:bg-red-950/20",
  success: "border-emerald-500/50 text-emerald-600 dark:border-emerald-500 [&>svg]:text-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20",
  warning: "border-amber-500/50 text-amber-600 dark:border-amber-500 [&>svg]:text-amber-600 bg-amber-50/50 dark:bg-amber-950/20",
}

const icons = {
  default: Info,
  destructive: AlertCircle,
  success: CheckCircle2,
  warning: AlertTriangle,
}

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof alertVariants
  title?: string
  description?: string
}

export function Alert({ className, variant = "default", title, description, children, ...props }: AlertProps) {
  const Icon = icons[variant]

  return (
    <div
      role="alert"
      className={cx(
        "relative w-full overflow-hidden rounded-2xl border p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-all duration-300 animate-in fade-in slide-in-from-top-2",
        alertVariants[variant],
        className
      )}
      {...props}
    >
      <div className="flex items-start gap-3.5">
        <div className={cx(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
          variant === 'success' ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40" :
          variant === 'destructive' ? "bg-red-100 text-red-600 dark:bg-red-950/40" :
          variant === 'warning' ? "bg-amber-100 text-amber-600 dark:bg-amber-950/40" :
          "bg-slate-100 text-slate-600 dark:bg-slate-800"
        )}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex flex-col gap-0.5 pt-0.5">
          {title && <h5 className="text-[14px] font-bold leading-tight tracking-tight text-slate-900 dark:text-white">{title}</h5>}
          {description && <div className="text-[13px] font-medium leading-relaxed opacity-70">{description}</div>}
        </div>
      </div>
      {children}
    </div>
  )
}
