import { useState, useMemo } from "react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { JsonViewer } from "./JsonViewer"
import {
  ChevronRight,
  ChevronDown,
  Plug,
  Unplug,
  RefreshCw,
  XCircle,
  Copy,
  Trash2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import type { ConnectionOperation } from "@/types/connection-events"
import {
  formatOperationTime,
  formatAddress,
  formatChainName,
  formatPlatformName,
  formatProvider,
  formatProofTimestamp,
  processFeatures,
} from "@/utils/connection-formatters"

// ============ SECTION CONFIG ============

const SECTION_CONFIG = {
  connect: {
    showRequested: true,
    responseTitle: 'WALLET RESPONSE'
  },
  disconnect: {
    showRequested: false,
    responseTitle: 'DISCONNECT EVENT'
  },
  restore_session: {
    showRequested: false,
    responseTitle: 'RESTORED SESSION'
  }
} as const

// ============ HELPER COMPONENTS ============

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider border-b border-border/50 pb-1">
        {title}
      </h4>
      {children}
    </div>
  )
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(text)
      toast.success(`${label} copied`)
    } catch {
      toast.error("Failed to copy")
    }
  }

  return (
    <Button variant="ghost" size="icon" className="h-5 w-5 shrink-0" onClick={handleCopy}>
      <Copy className="h-3 w-3" />
    </Button>
  )
}

// ============ RAW DATA SECTION ============

interface RawDataSectionProps {
  request?: unknown
  response?: unknown
}

function RawDataSection({ request, response }: RawDataSectionProps) {
  const [tab, setTab] = useState<'request' | 'response' | 'both'>('both')

  const hasRequest = request !== undefined && request !== null
  const hasResponse = response !== undefined && response !== null

  if (!hasRequest && !hasResponse) return null

  const getContent = () => {
    if (tab === 'request') return JSON.stringify(request, null, 2)
    if (tab === 'response') return JSON.stringify(response, null, 2)
    return JSON.stringify({ request, response }, null, 2)
  }

  const countLines = (obj: unknown) => JSON.stringify(obj, null, 2).split('\n').length

  const handleCopyAll = async () => {
    try {
      await navigator.clipboard.writeText(getContent())
      toast.success("Copied to clipboard")
    } catch {
      toast.error("Failed to copy")
    }
  }

  return (
    <Section title="RAW DATA">
      <div className="space-y-2">
        {/* Tab buttons */}
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {hasRequest && (
              <Button
                variant={tab === 'request' ? 'secondary' : 'ghost'}
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => setTab('request')}
              >
                Request ({countLines(request)})
              </Button>
            )}
            {hasResponse && (
              <Button
                variant={tab === 'response' ? 'secondary' : 'ghost'}
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => setTab('response')}
              >
                Response ({countLines(response)})
              </Button>
            )}
            {hasRequest && hasResponse && (
              <Button
                variant={tab === 'both' ? 'secondary' : 'ghost'}
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => setTab('both')}
              >
                Both
              </Button>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs ml-auto"
            onClick={handleCopyAll}
          >
            <Copy className="h-3 w-3 mr-1" />
            Copy
          </Button>
        </div>

        <JsonViewer
          title=""
          json={getContent()}
          defaultExpanded={true}
          collapsible={false}
          maxHeight={250}
        />
      </div>
    </Section>
  )
}

// ============ OPERATION ROW ============

interface OperationRowProps {
  operation: ConnectionOperation
  onDelete?: () => void
}

function OperationRow({ operation, onDelete }: OperationRowProps) {
  const [expanded, setExpanded] = useState(false)

  const isConnect = operation.type === 'connect'
  const isDisconnect = operation.type === 'disconnect'
  const isSuccess = operation.response?.success !== false
  const hasError = operation.response?.error
  const wallet = operation.response?.wallet

  // Check if TonProof data exists in response (more reliable than checking request)
  const hasTonProofData = !!wallet?.tonProof

  const config = SECTION_CONFIG[operation.type]

  // Format features using the shared utility
  const features = wallet?.device.features
  const formattedFeatures = useMemo(() => {
    if (!features) return []
    return processFeatures(features)
  }, [features])

  // Determine icon and color
  let Icon = Plug
  let iconColor = 'text-green-500'
  let labelColor = 'text-green-600 dark:text-green-400'

  if (isDisconnect) {
    Icon = Unplug
    iconColor = 'text-muted-foreground'
    labelColor = 'text-muted-foreground'
  } else if (hasError) {
    Icon = XCircle
    iconColor = 'text-red-500'
    labelColor = 'text-red-600 dark:text-red-400'
  } else if (operation.type === 'restore_session') {
    Icon = RefreshCw
    iconColor = 'text-blue-500'
    labelColor = 'text-blue-600 dark:text-blue-400'
  }

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      {/* Collapsed Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 p-3 text-left hover:bg-muted/50 transition-colors"
      >
        {expanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
        )}

        {/* Time */}
        <span className="text-xs text-muted-foreground font-mono w-16 shrink-0">
          {formatOperationTime(operation.timestamp)}
        </span>

        {/* Icon */}
        <Icon className={cn("h-4 w-4 shrink-0", iconColor)} />

        {/* Type label */}
        <span className={cn("text-sm font-medium capitalize", labelColor)}>
          {operation.type.replace('_', ' ')}
        </span>

        {/* Items (for connect) */}
        {isConnect && operation.request?.items && (
          <span className="text-xs text-muted-foreground font-mono">
            [{operation.request.items.join(', ')}]
          </span>
        )}

        {/* Arrow and wallet name */}
        {isConnect && wallet && (
          <>
            <span className="text-muted-foreground">→</span>
            <span className="text-sm truncate max-w-[100px]">
              {wallet.device.appName}
            </span>
          </>
        )}

        {/* Disconnect initiator */}
        {isDisconnect && (
          <span className="text-xs text-muted-foreground">
            by {operation.initiator || 'wallet'}
          </span>
        )}

        {/* Address */}
        {wallet?.account.address && (
          <code className="text-xs text-muted-foreground font-mono ml-auto">
            {formatAddress(wallet.account.address)}
          </code>
        )}

        {/* Previous address for disconnect */}
        {isDisconnect && operation.previousAddress && (
          <code className="text-xs text-muted-foreground font-mono ml-auto">
            ({formatAddress(operation.previousAddress)})
          </code>
        )}

        {/* Success/Error indicator */}
        {isConnect && (
          <span className={cn("text-sm ml-1", isSuccess ? "text-green-500" : "text-red-500")}>
            {isSuccess ? "✓" : "✗"}
          </span>
        )}
      </button>

      {/* Expanded Content - VERTICAL LAYOUT */}
      {expanded && (
        <div className="border-t p-4 space-y-4">

          {/* REQUESTED Section - only for connect */}
          {config.showRequested && operation.request && (
            <Section title="REQUESTED">
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Items:</span>
                  <code className="text-xs font-mono">{operation.request.items.join(', ')}</code>
                </div>
                {operation.request.payload && (
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Challenge:</span>
                    <code className="text-xs font-mono text-muted-foreground truncate max-w-[200px]">
                      {operation.request.payload}
                    </code>
                    <CopyButton text={operation.request.payload} label="Challenge" />
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* RESPONSE Section with adaptive title */}
          <Section title={config.responseTitle}>
            {hasError ? (
              // Error state
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-red-500">
                  <XCircle className="h-4 w-4" />
                  <span className="font-medium">Error</span>
                </div>
                <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
                  <span className="text-muted-foreground">Code:</span>
                  <span>{operation.response!.error!.code}</span>
                  <span className="text-muted-foreground">Message:</span>
                  <span className="text-red-500">{operation.response!.error!.message}</span>
                </div>
              </div>
            ) : wallet ? (
              // Success - 3 column grid
              <div className="grid gap-4 md:grid-cols-3">
                {/* Account Column */}
                <div className="space-y-2 text-sm">
                  <h5 className="text-xs font-medium text-muted-foreground">Account</h5>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground">Address</span>
                      <div className="flex items-center gap-1">
                        <code className="font-mono text-xs truncate max-w-[260px]">
                          {formatAddress(wallet.account.address, 10, 8)}
                        </code>
                        <CopyButton text={wallet.account.address} label="Address" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Network</span>
                      <Badge variant="outline" className="text-[10px]">
                        {formatChainName(wallet.account.chain)}
                      </Badge>
                    </div>
                    {wallet.account.publicKey && (
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-muted-foreground">Public Key</span>
                        <div className="flex items-center gap-1">
                          <code className="font-mono text-xs text-muted-foreground truncate max-w-[260px]">
                            {formatAddress(wallet.account.publicKey, 10, 8)}
                          </code>
                          <CopyButton text={wallet.account.publicKey} label="Public Key" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Device Column */}
                <div className="space-y-2 text-sm">
                  <h5 className="text-xs font-medium text-muted-foreground">Device</h5>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Wallet</span>
                      <span className="text-right">{wallet.device.appName} {wallet.device.appVersion}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Platform</span>
                      <span>{formatPlatformName(wallet.device.platform)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Provider</span>
                      <Badge variant="secondary" className="text-[10px]">
                        {formatProvider(wallet.provider)}
                      </Badge>
                    </div>
                    {formattedFeatures.length > 0 && (
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-muted-foreground shrink-0">Features</span>
                        <div className="flex flex-wrap gap-1 justify-end">
                          {formattedFeatures.map((f, i) => (
                            <Badge key={i} variant="secondary" className="text-[10px]">
                              {f}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* TonProof Column - only if TonProof data exists */}
                {hasTonProofData && (
                  <div className="space-y-2 text-sm">
                    <h5 className="text-xs font-medium text-muted-foreground">TonProof</h5>
                    {wallet.tonProof ? (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Domain</span>
                          <code className="font-mono text-xs truncate max-w-[140px]">
                            {wallet.tonProof.domain}
                          </code>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Timestamp</span>
                          <span className="text-xs">
                            {formatProofTimestamp(wallet.tonProof.timestamp)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-muted-foreground">Signature</span>
                          <div className="flex items-center gap-1">
                            <code className="font-mono text-xs text-muted-foreground truncate max-w-[260px]">
                              {formatAddress(wallet.tonProof.signature, 10, 8)}
                            </code>
                            <CopyButton text={wallet.tonProof.signature} label="Signature" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">
                        Requested but not provided
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : isDisconnect ? (
              // Disconnect info
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
                  <span className="text-muted-foreground">Initiated by</span>
                  <Badge variant="outline" className="text-[10px] w-fit">
                    {operation.initiator || 'wallet'}
                  </Badge>
                  {operation.previousWalletName && (
                    <>
                      <span className="text-muted-foreground">Wallet was</span>
                      <span>{operation.previousWalletName}</span>
                    </>
                  )}
                  {operation.previousAddress && (
                    <>
                      <span className="text-muted-foreground">Address was</span>
                      <code className="font-mono text-xs">
                        {formatAddress(operation.previousAddress, 8, 6)}
                      </code>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No response data</p>
            )}
          </Section>

          {/* RAW DATA Section */}
          <RawDataSection
            request={operation.rawRequest}
            response={operation.rawResponse}
          />

          {/* Delete button */}
          {onDelete && (
            <div className="flex justify-end border-t pt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Remove
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ============ MAIN COMPONENT ============

interface ConnectionEventsCardProps {
  operations: ConnectionOperation[]
  onClear?: () => void
  onDelete?: (id: string) => void
}

export function ConnectionEventsCard({
  operations,
  onClear,
  onDelete,
}: ConnectionEventsCardProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (operations.length === 0) return null

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ChevronRight className={cn(
            "h-4 w-4 transition-transform duration-200",
            isOpen && "rotate-90"
          )} />
          <span>Connection Events</span>
          <span className="text-xs">({operations.length})</span>
        </CollapsibleTrigger>

        {onClear && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="text-muted-foreground hover:text-destructive h-7 px-2"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Clear
          </Button>
        )}
      </div>

      <CollapsibleContent className="pt-2">
        <div className="space-y-2">
          {operations.map((op) => (
            <OperationRow
              key={op.id}
              operation={op}
              onDelete={onDelete ? () => onDelete(op.id) : undefined}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
