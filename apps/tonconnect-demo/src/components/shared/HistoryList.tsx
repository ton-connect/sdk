import { useState, useMemo, useCallback } from "react"
import { fromNano } from "@ton/core"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { JsonViewer } from "./JsonViewer"
import { useHistory, type HistoryEntry } from "@/hooks/useHistory"
import {
  ChevronDown,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock,
  RotateCcw,
  Copy,
  Trash2,
  History,
  ExternalLink,
  Search,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"
import { getExplorerUrl } from "@/utils/explorer-utils"
import { getNormalizedExtMessageHash } from "@/utils/transaction-utils"

interface HistoryListProps {
  currentWallet: string | null
  onLoadToForm: (requestRaw: string) => void
}

function formatTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp

  // Less than 1 minute ago
  if (diff < 60000) {
    return "just now"
  }

  // Less than 1 hour ago
  if (diff < 3600000) {
    const mins = Math.floor(diff / 60000)
    return `${mins}m ago`
  }

  // Today - show time
  const date = new Date(timestamp)
  const today = new Date()
  if (date.toDateString() === today.toDateString()) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // Yesterday
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) {
    return "yesterday"
  }

  // Older - show date
  return date.toLocaleDateString([], { month: "short", day: "numeric" })
}

function formatAmount(request: Record<string, unknown>): string {
  try {
    const messages = request.messages as Array<{ amount?: string }> | undefined
    if (messages && messages.length > 0) {
      const totalNano = messages.reduce((sum, msg) => {
        return sum + BigInt(msg.amount || "0")
      }, BigInt(0))
      const ton = fromNano(totalNano)
      const num = parseFloat(ton)
      if (num >= 1) {
        return `${num.toFixed(2)} TON`
      }
      if (num >= 0.01) {
        return `${num.toFixed(3)} TON`
      }
      return `${ton} TON`
    }
  } catch {
    // Ignore
  }
  return ""
}

function getMessageCount(request: Record<string, unknown>): number {
  const messages = request.messages as Array<unknown> | undefined
  return messages?.length || 0
}

function StatusIcon({ status }: { status: HistoryEntry["status"] }) {
  switch (status) {
    case "confirmed":
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case "success":
      return <CheckCircle className="h-4 w-4 text-blue-500" />
    case "error":
      return <XCircle className="h-4 w-4 text-red-500" />
    case "expired":
      return <Clock className="h-4 w-4 text-yellow-500" />
    default:
      return <Clock className="h-4 w-4 text-muted-foreground" />
  }
}

function statusLabel(status: HistoryEntry["status"]): string {
  switch (status) {
    case "confirmed":
      return "Confirmed"
    case "success":
      return "Sent"
    case "error":
      return "Error"
    case "expired":
      return "Expired"
    default:
      return status
  }
}

interface HistoryEntryRowProps {
  entry: HistoryEntry
  expanded: boolean
  onToggle: () => void
  onLoadToForm: () => void
  onDelete: () => void
}

interface TransactionDetails {
  lt: string
  hash: string
  fee: string
  timestamp: number
}

function HistoryEntryRow({
  entry,
  expanded,
  onToggle,
  onLoadToForm,
  onDelete,
}: HistoryEntryRowProps) {
  const amount = formatAmount(entry.request)
  const msgCount = getMessageCount(entry.request)

  // Compute hash from BOC (only if boc exists)
  const hash = useMemo(() => {
    if (!entry.boc) return null
    try {
      return getNormalizedExtMessageHash(entry.boc)
    } catch {
      return null
    }
  }, [entry.boc])

  // Blockchain check state
  const [checkLoading, setCheckLoading] = useState(false)
  const [txDetails, setTxDetails] = useState<TransactionDetails | null>(null)
  const [checkError, setCheckError] = useState<string | null>(null)

  const checkBlockchain = useCallback(async () => {
    if (!hash) return

    setCheckLoading(true)
    setCheckError(null)

    const endpoint = entry.network === "testnet"
      ? "https://testnet.toncenter.com/api/v3"
      : "https://toncenter.com/api/v3"

    try {
      const response = await fetch(
        `${endpoint}/transactionsByMessage?msg_hash=${hash}&direction=in`
      )
      const data = await response.json()

      if (data.transactions?.length > 0) {
        const tx = data.transactions[0]
        setTxDetails({
          lt: tx.lt,
          hash: tx.hash,
          fee: tx.total_fees,
          timestamp: tx.now,
        })
      } else {
        setCheckError("Transaction not found in blockchain")
      }
    } catch (err) {
      setCheckError(err instanceof Error ? err.message : "Network error")
    } finally {
      setCheckLoading(false)
    }
  }, [hash, entry.network])

  return (
    <div className="rounded-none border-x-0 sm:rounded-lg sm:border bg-card">
      {/* Collapsed row - clickable header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 sm:p-3 text-left hover:bg-muted/50 transition-colors"
      >
        {expanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
        )}

        <span className="text-sm text-muted-foreground font-mono w-20 shrink-0">
          {formatTime(entry.timestamp)}
        </span>

        <span className="text-sm font-medium w-24 shrink-0">
          {amount}
        </span>

        <StatusIcon status={entry.status} />
        <span className="text-sm text-muted-foreground">
          {statusLabel(entry.status)}
        </span>

        {msgCount > 1 && (
          <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
            {msgCount} msgs
          </span>
        )}

        {hash && (
          <span className="text-xs text-muted-foreground font-mono ml-auto truncate max-w-[120px]">
            {hash.slice(0, 8)}...
          </span>
        )}
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t px-4 py-4 sm:p-4 space-y-4">
          {/* 2-column layout for Request / Response+Hash */}
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            {/* Left column: Request */}
            <div className="min-w-0 overflow-hidden">
              <JsonViewer
                title="Request Sent"
                json={entry.requestRaw}
                defaultExpanded={true}
                maxHeight={200}
              />
            </div>

            {/* Right column: Response + Hash + Blockchain */}
            <div className="min-w-0 overflow-hidden space-y-4">
              <JsonViewer
                title="Response"
                json={JSON.stringify(entry.response || {}, null, 2)}
                defaultExpanded={true}
                maxHeight={150}
              />

              {/* Hash with explorer link */}
              {hash && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-muted-foreground">Hash (TEP-467)</Label>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={() => {
                          navigator.clipboard.writeText(hash)
                          toast.success("Hash copied")
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-6 w-6" asChild>
                        <a
                          href={getExplorerUrl(hash, entry.network)}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="View in explorer"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    </div>
                  </div>
                  <a
                    href={getExplorerUrl(hash, entry.network)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-xs text-primary hover:underline font-mono break-all"
                  >
                    {hash}
                  </a>

                  {/* Check blockchain button */}
                  {!txDetails && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={checkBlockchain}
                      disabled={checkLoading}
                      className="gap-2"
                    >
                      {checkLoading ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Search className="h-3 w-3" />
                      )}
                      {checkLoading ? "Checking..." : "Check in blockchain"}
                    </Button>
                  )}

                  {/* Error */}
                  {checkError && (
                    <p className="text-xs text-muted-foreground">{checkError}</p>
                  )}

                  {/* Transaction details */}
                  {txDetails && (
                    <Alert className="py-2">
                      <CheckCircle className="h-4 w-4" />
                      <AlertTitle className="text-sm">Transaction Confirmed</AlertTitle>
                      <AlertDescription className="text-xs">
                        LT: {txDetails.lt} • Fee: {txDetails.fee} nanotons • {new Date(txDetails.timestamp * 1000).toLocaleString()}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t">
            <Button variant="outline" size="sm" onClick={onLoadToForm} className="gap-2">
              <RotateCcw className="h-3 w-3" />
              Load to Form
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="gap-2 text-destructive hover:text-destructive ml-auto"
            >
              <Trash2 className="h-3 w-3" />
              Delete
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export function HistoryList({ currentWallet, onLoadToForm }: HistoryListProps) {
  const history = useHistory()
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [sectionOpen, setSectionOpen] = useState(false)

  const entries = useMemo(() => {
    return currentWallet ? history.getByWallet(currentWallet) : []
  }, [currentWallet, history])

  if (!currentWallet || entries.length === 0) {
    return null
  }

  const toggleEntry = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const handleClear = () => {
    if (currentWallet) {
      history.clearWallet(currentWallet)
    }
  }

  return (
    <Collapsible open={sectionOpen} onOpenChange={setSectionOpen}>
      {/* Section header */}
      <div className="flex items-center justify-between py-2 px-4 sm:px-0">
        <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium hover:text-foreground text-muted-foreground">
          {sectionOpen ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          <History className="h-4 w-4" />
          <span>HISTORY ({entries.length})</span>
        </CollapsibleTrigger>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-3 w-3 mr-1" />
          Clear
        </Button>
      </div>

      <CollapsibleContent>
        <div className="space-y-2 pt-2">
          {entries.map(entry => (
            <HistoryEntryRow
              key={entry.id}
              entry={entry}
              expanded={expanded[entry.id] || false}
              onToggle={() => toggleEntry(entry.id)}
              onLoadToForm={() => onLoadToForm(entry.requestRaw)}
              onDelete={() => history.deleteEntry(entry.id)}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
