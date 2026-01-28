import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { JsonViewer } from "./JsonViewer"
import { X, RotateCcw } from "lucide-react"

/** Base result data that all result types share */
export interface BaseResultData {
  id: string
  timestamp: number
  requestSnapshot: string
  response: string
  status: "success" | "error"
}

/** JsonViewer configuration options */
export interface JsonViewerConfig {
  maxHeight?: number
  defaultExpanded?: boolean
  inlineThreshold?: number
}

/** Props for BaseResultCard */
export interface BaseResultCardProps {
  result: BaseResultData
  statusBar: ReactNode
  responseFooter?: ReactNode
  onDismiss?: () => void
  onLoadToForm?: () => void
  requestViewerProps?: JsonViewerConfig
  responseViewerProps?: JsonViewerConfig
}

export function BaseResultCard({
  result,
  statusBar,
  responseFooter,
  onDismiss,
  onLoadToForm,
  requestViewerProps = {},
  responseViewerProps = {},
}: BaseResultCardProps) {
  return (
    <div className="rounded-none border-x-0 sm:rounded-lg sm:border bg-muted/30 overflow-hidden animate-in fade-in-50 slide-in-from-bottom-2">
      {/* Header: timestamp + dismiss */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <span className="text-sm text-muted-foreground font-mono">
          {new Date(result.timestamp).toLocaleTimeString()}
        </span>
        {onDismiss && (
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onDismiss}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Status Bar */}
      {statusBar}

      {/* Content: 2-column layout on desktop */}
      <div className="grid gap-4 px-4 py-4 sm:p-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* Left column: Request Sent */}
        <div className="space-y-4 min-w-0 overflow-hidden">
          <JsonViewer
            title="Request Sent"
            json={result.requestSnapshot}
            defaultExpanded={requestViewerProps.defaultExpanded ?? true}
            maxHeight={requestViewerProps.maxHeight ?? 250}
          />
        </div>

        {/* Right column: Response + optional footer */}
        <div className="space-y-4 min-w-0 overflow-hidden">
          <JsonViewer
            title="Response"
            json={result.response}
            defaultExpanded={responseViewerProps.defaultExpanded ?? true}
            maxHeight={responseViewerProps.maxHeight ?? 150}
            inlineThreshold={responseViewerProps.inlineThreshold}
          />
          {responseFooter}
        </div>
      </div>

      {/* Footer: Load to form button */}
      {onLoadToForm && (
        <div className="px-4 py-3 border-t">
          <Button variant="outline" size="sm" onClick={onLoadToForm} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Load Request to Form
          </Button>
        </div>
      )}
    </div>
  )
}
