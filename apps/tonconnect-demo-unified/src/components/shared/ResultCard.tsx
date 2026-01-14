import { useTonWallet, CHAIN } from "@tonconnect/ui-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { JsonViewer } from "./JsonViewer"
import { useTransactionTracker } from "@/hooks/useTransactionTracker"
import { getExplorerUrl } from "@/utils/explorer-utils"
import {
  Copy,
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  X,
  RotateCcw,
} from "lucide-react"
import { toast } from "sonner"
import type { OperationResult } from "@/hooks/useTransaction"

interface ResultCardProps {
  result: OperationResult
  onDismiss?: () => void
  onLoadToForm?: () => void
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text)
  toast.success("Copied to clipboard")
}

export function ResultCard({ result, onDismiss, onLoadToForm }: ResultCardProps) {
  const wallet = useTonWallet()
  const network = wallet?.account.chain === CHAIN.TESTNET ? "testnet" : "mainnet"

  // Transaction tracking (if we have boc)
  const tracking = useTransactionTracker({
    boc: result.boc || null,
    validUntil: result.validUntil || 0,
    network,
  })

  // Determine overall status for badge
  const displayStatus = result.status === 'error'
    ? 'error'
    : result.boc
      ? tracking.status
      : 'success'

  return (
    <div className="rounded-lg border bg-muted/30 animate-in fade-in-50 slide-in-from-bottom-2">
      {/* Header: timestamp + status + dismiss */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground font-mono">
            {new Date(result.timestamp).toLocaleTimeString()}
          </span>
          <Badge
            variant={
              displayStatus === "pending" ? "secondary" :
              displayStatus === "confirmed" || displayStatus === "success" ? "default" :
              "destructive"
            }
          >
            {displayStatus === "pending" && (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Pending
              </>
            )}
            {displayStatus === "confirmed" && (
              <>
                <CheckCircle className="h-3 w-3 mr-1" />
                Confirmed
              </>
            )}
            {displayStatus === "success" && !result.boc && (
              <>
                <CheckCircle className="h-3 w-3 mr-1" />
                Sent
              </>
            )}
            {displayStatus === "expired" && (
              <>
                <XCircle className="h-3 w-3 mr-1" />
                Expired
              </>
            )}
            {displayStatus === "error" && (
              <>
                <XCircle className="h-3 w-3 mr-1" />
                Error
              </>
            )}
          </Badge>
          {displayStatus === "pending" && (
            <span className="text-sm text-muted-foreground font-mono">
              {tracking.formattedTime}
            </span>
          )}
        </div>
        {onDismiss && (
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onDismiss}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Content: 2-column layout on desktop */}
      <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* Left column: Request Sent */}
        <div className="space-y-4 min-w-0 overflow-hidden">
          <JsonViewer
            title="Request Sent"
            json={result.requestSnapshot}
            defaultExpanded={true}
            maxHeight={250}
          />
        </div>

        {/* Right column: Response + Transaction tracking */}
        <div className="space-y-4 min-w-0 overflow-hidden">
          {/* Response */}
          <JsonViewer
            title="Response"
            json={result.response}
            defaultExpanded={true}
            maxHeight={150}
            inlineThreshold={100}
          />

          {/* Transaction tracking (if boc exists) */}
          {result.boc && (
            <div className="space-y-3 pt-2 border-t">
              {/* BOC - truncated with length indicator */}
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  BOC <span className="opacity-60">({result.boc.length} chars)</span>
                </Label>
                <div className="flex gap-2 items-center">
                  <code
                    className="flex-1 text-xs bg-muted p-2 rounded truncate font-mono cursor-pointer hover:bg-muted/80"
                    onClick={() => copyToClipboard(result.boc!)}
                    title="Click to copy full BOC"
                  >
                    {result.boc.slice(0, 50)}...
                  </code>
                  <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={() => copyToClipboard(result.boc!)}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Hash - full display with word-break */}
              {tracking.hash && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground">Hash (TEP-467)</Label>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" className="h-6 w-6" asChild>
                        <a
                          href={getExplorerUrl(tracking.hash, network)}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="View in explorer"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => copyToClipboard(tracking.hash!)}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <a
                    href={getExplorerUrl(tracking.hash, network)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-primary hover:underline font-mono text-xs break-all leading-relaxed"
                  >
                    {tracking.hash}
                  </a>
                </div>
              )}

              {/* Confirmed details - compact */}
              {tracking.status === "confirmed" && tracking.transaction && (
                <Alert className="py-2">
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle className="text-sm">Transaction Confirmed</AlertTitle>
                  <AlertDescription className="text-xs">
                    LT: {tracking.transaction.lt} • Fee: {tracking.transaction.fee} nanotons • {new Date(tracking.transaction.timestamp * 1000).toLocaleString()}
                  </AlertDescription>
                </Alert>
              )}

              {/* Expired */}
              {tracking.status === "expired" && (
                <Alert variant="destructive" className="py-2">
                  <XCircle className="h-4 w-4" />
                  <AlertTitle className="text-sm">Transaction Expired</AlertTitle>
                  <AlertDescription className="text-xs">
                    Transaction not found before validUntil expired.
                  </AlertDescription>
                </Alert>
              )}

              {/* Network error */}
              {tracking.error && tracking.status === "pending" && (
                <Alert className="py-2">
                  <Clock className="h-4 w-4" />
                  <AlertTitle className="text-sm">Network Error</AlertTitle>
                  <AlertDescription className="text-xs">
                    {tracking.error}. Retrying...
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer: Load to form button */}
      {onLoadToForm && (
        <div className="p-4 border-t">
          <Button variant="outline" size="sm" onClick={onLoadToForm} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Load Request to Form
          </Button>
        </div>
      )}
    </div>
  )
}
