import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Radio, Trash2 } from "lucide-react"
import { RpcLogCard } from "./RpcLogCard"
import type { RpcLogEntry } from "@/hooks/useSdkLogs"

interface RpcLogViewerProps {
  logs: RpcLogEntry[]
  onClear: () => void
}

export function RpcLogViewer({ logs, onClear }: RpcLogViewerProps) {
  const pendingCount = useMemo(
    () => logs.filter(l => l.status === "pending").length,
    [logs]
  )
  const hasLogs = logs.length > 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="h-5 w-5" />
            <CardTitle>RPC Logs</CardTitle>
            {pendingCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-yellow-500/20 px-1.5 text-xs font-medium text-yellow-500">
                {pendingCount}
              </span>
            )}
          </div>
          {hasLogs && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="gap-2 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
        <CardDescription>
          Raw JSON-RPC requests and responses from SDK
        </CardDescription>
      </CardHeader>
      <CardContent>
        {hasLogs ? (
          <div className="space-y-2">
            {logs.map((entry, index) => (
              <RpcLogCard key={`${entry.id}-${index}`} entry={entry} defaultOpen={index === 0} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[200px] text-center">
            <Radio className="h-8 w-8 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">No RPC logs yet</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Send a transaction or sign data to see logs here
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
