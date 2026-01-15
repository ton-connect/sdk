import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

export type StatusVariant = "pending" | "success" | "error"

export interface StatusBarProps {
  variant: StatusVariant
  icon: ReactNode
  title: string
  subtitle?: string
  timer?: string
  actions?: ReactNode
  children?: ReactNode
}

const variantStyles: Record<StatusVariant, string> = {
  pending: "bg-yellow-50 border-yellow-200 text-yellow-900 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-100",
  success: "bg-green-50 border-green-200 text-green-900 dark:bg-green-950 dark:border-green-800 dark:text-green-100",
  error: "bg-red-50 border-red-200 text-red-900 dark:bg-red-950 dark:border-red-800 dark:text-red-100",
}

export function StatusBar({
  variant,
  icon,
  title,
  subtitle,
  timer,
  actions,
  children,
}: StatusBarProps) {
  return (
    <div className={cn("border-b", variantStyles[variant])}>
      {/* Main row: icon + title + timer/actions */}
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="shrink-0">{icon}</span>
          <span className="font-medium">{title}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {timer && (
            <span className="font-mono text-sm tabular-nums">{timer}</span>
          )}
          {actions}
        </div>
      </div>

      {/* Subtitle if present */}
      {subtitle && (
        <div className="px-4 pb-3 -mt-1 text-sm opacity-80">
          {subtitle}
        </div>
      )}

      {/* Children (BOC/Hash, verification results) */}
      {children && (
        <div className="px-4 pb-3 space-y-2">
          <div className="border-t border-current/10 pt-3">
            {children}
          </div>
        </div>
      )}
    </div>
  )
}
