import { useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, Clock, CheckCircle2, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { JsonViewer } from "./JsonViewer"
import type { RpcLogEntry, RpcLogStatus } from "@/hooks/useSdkLogs"

interface RpcLogCardProps {
  entry: RpcLogEntry
  defaultOpen?: boolean
}

const statusConfig: Record<RpcLogStatus, { icon: typeof Clock; color: string; label: string }> = {
  pending: { icon: Clock, color: "text-yellow-500", label: "Pending" },
  success: { icon: CheckCircle2, color: "text-green-500", label: "Success" },
  error: { icon: XCircle, color: "text-red-500", label: "Error" },
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

function formatDuration(start: number, end?: number): string {
  if (!end) {
    const elapsed = Math.floor((Date.now() - start) / 1000)
    return `${elapsed}s`
  }
  const ms = end - start
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

/** Parse params array - each element may be a JSON string */
function parseParams(params: unknown): unknown[] {
  if (!Array.isArray(params)) return []

  return params.map(param => {
    if (typeof param === 'string') {
      try {
        return JSON.parse(param)
      } catch {
        return param
      }
    }
    return param
  })
}

export function RpcLogCard({ entry, defaultOpen = false }: RpcLogCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const { icon: StatusIcon, color, label } = statusConfig[entry.status]

  // Parse params from request
  const parsedParams = useMemo(() => {
    const req = entry.request as Record<string, unknown>
    return parseParams(req.params)
  }, [entry.request])

  return (
    <Card className="overflow-hidden">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <button className="flex w-full items-center gap-3 p-3 text-left hover:bg-muted/50 transition-colors">
            {/* Status Icon */}
            <StatusIcon className={cn("h-4 w-4 shrink-0", color)} />

            {/* Method */}
            <span className="font-mono text-sm font-medium truncate">
              {entry.method}
            </span>

            {/* ID */}
            <span className="text-xs text-muted-foreground font-mono">
              #{entry.id}
            </span>

            {/* Provider Badge */}
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
              {entry.provider}
            </Badge>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Status / Timing */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {entry.status === "pending" ? (
                <span className={cn("animate-pulse", color)}>{label}</span>
              ) : (
                <span>{formatDuration(entry.requestTimestamp, entry.responseTimestamp)}</span>
              )}
              <span>{formatTime(entry.requestTimestamp)}</span>
            </div>

            {/* Expand Icon */}
            <ChevronDown
              className={cn(
                "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                isOpen && "rotate-180"
              )}
            />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="border-t p-3">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Left column: Request + Parsed Params */}
              <div className="space-y-4">
                <JsonViewer
                  title="Request"
                  json={JSON.stringify(entry.request)}
                  collapsible={false}
                  maxHeight={10000}
                />
                {/* Parsed Params */}
                {parsedParams.length > 0 && (
                  <div className="space-y-2">
                    {parsedParams.map((param, i) => (
                      <JsonViewer
                        key={i}
                        title={`Param ${i + 1}`}
                        json={JSON.stringify(param)}
                        collapsible={false}
                        maxHeight={200}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Right column: Response */}
              {entry.response ? (
                <JsonViewer
                  title="Response"
                  json={JSON.stringify(entry.response)}
                  collapsible={false}
                  maxHeight={300}
                />
              ) : (
                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground">Response</span>
                  <div className="flex items-center justify-center h-[200px] rounded-md border bg-muted/50">
                    <span className="text-sm text-muted-foreground">Waiting...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
