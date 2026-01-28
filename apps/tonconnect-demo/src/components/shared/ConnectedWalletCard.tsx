import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { JsonViewer } from "./JsonViewer"
import { Circle, Unplug, ChevronRight, Copy, Check, Smartphone, Monitor, Package, Link } from "lucide-react"
import { toast } from "sonner"
import { toUserFriendlyAddress, CHAIN, type Feature } from "@tonconnect/sdk"
import type { Wallet } from "@tonconnect/ui-react"

interface ConnectedWalletCardProps {
  wallet: Wallet | null
  isAuthenticated?: boolean // kept for API compatibility, not used in UI
  onDisconnect: () => void
}

function getNetworkName(chain: string): string {
  return chain === '-239' ? 'Mainnet' : 'Testnet'
}

function getPlatformIcon(platform: string) {
  if (['iphone', 'ipad', 'android'].includes(platform)) {
    return <Smartphone className="h-3.5 w-3.5" />
  }
  return <Monitor className="h-3.5 w-3.5" />
}

// Deduplicate and format features
function processFeatures(features: Feature[]): string[] {
  const seen = new Map<string, string>()

  for (const feature of features) {
    if (typeof feature === 'string') {
      if (!seen.has(feature)) {
        seen.set(feature, feature)
      }
    } else {
      const f = feature as { name: string; maxMessages?: number; extraCurrencySupported?: boolean; types?: string[] }
      let formatted = f.name

      if (f.name === 'SendTransaction') {
        const details: string[] = []
        if (f.maxMessages) details.push(`${f.maxMessages}`)
        if (f.extraCurrencySupported) details.push('extra')
        formatted = details.length > 0 ? `SendTx(${details.join(',')})` : 'SendTx'
      } else if (f.name === 'SignData' && f.types) {
        const types = f.types.map(t => t === 'binary' ? 'bin' : t)
        formatted = `SignData(${types.join(',')})`
      }

      seen.set(f.name, formatted)
    }
  }

  return Array.from(seen.values())
}

// Truncate address showing start and end (e.g., "UQDa...bfef")
function truncateAddress(address: string, startChars = 8, endChars = 4): string {
  if (address.length <= startChars + endChars + 3) return address
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`
}

function CopyButton({ text, label = "Copied" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success(label)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="p-1 rounded hover:bg-muted transition-colors"
      title="Copy full address"
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
    </button>
  )
}

export function ConnectedWalletCard({ wallet, onDisconnect }: ConnectedWalletCardProps) {
  const isConnected = !!wallet
  const hasProof = wallet?.connectItems?.tonProof && !('error' in wallet.connectItems.tonProof)

  const friendlyAddress = isConnected
    ? toUserFriendlyAddress(wallet.account.address, wallet.account.chain === CHAIN.TESTNET)
    : ''

  const deviceFeatures = wallet?.device.features
  const features = useMemo(() => {
    if (!deviceFeatures) return []
    return processFeatures(deviceFeatures)
  }, [deviceFeatures])

  // Responsive address display
  const shortAddress = truncateAddress(friendlyAddress, 10, 6)
  const mediumAddress = truncateAddress(friendlyAddress, 16, 8)

  return (
    <Card>
      <CardContent className="pt-4 pb-3 space-y-3">
        {isConnected ? (
          <>
            {/* Row 1: Status + Info (left) | Disconnect (right, fixed) */}
            <div className="flex justify-between items-start gap-3">
              {/* Left side - wraps as needed */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 min-w-0">
                {/* Status */}
                <div className="flex items-center gap-2 shrink-0">
                  <Circle className="h-2.5 w-2.5 fill-green-500 text-green-500" />
                  <span className="font-medium text-sm">Connected</span>
                </div>

                {/* Address - truncated with visible end */}
                <div className="flex items-center gap-1 shrink-0">
                  <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-medium">
                    <span className="sm:hidden">{shortAddress}</span>
                    <span className="hidden sm:inline md:hidden">{mediumAddress}</span>
                    <span className="hidden md:inline">{friendlyAddress}</span>
                  </code>
                  <CopyButton text={friendlyAddress} label="Address copied" />
                </div>

                {/* Network + TonProof (wrap together) */}
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className="text-xs">
                    {getNetworkName(wallet.account.chain)}
                  </Badge>
                  {hasProof && (
                    <Badge variant="secondary" className="text-xs">
                      TonProof
                    </Badge>
                  )}
                </div>
              </div>

              {/* Right side - Disconnect ALWAYS top-right */}
              <Button
                variant="outline"
                size="sm"
                onClick={onDisconnect}
                className="gap-2 h-7 text-xs shrink-0 self-start"
              >
                <Unplug className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Disconnect</span>
              </Button>
            </div>

            {/* Row 2: Wallet details + Features + Raw toggle */}
            <Collapsible>
              {/* Wallet info row - with Features inline on lg+ */}
              <div className="flex justify-between items-start gap-3">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs min-w-0">
                  {/* Wallet name */}
                  <span className="font-medium">{wallet.device.appName}</span>
                  <span className="text-muted-foreground/40">•</span>

                  {/* Platform */}
                  <div className="flex items-center gap-1">
                    {getPlatformIcon(wallet.device.platform)}
                    <span className="hidden sm:inline text-muted-foreground">Platform:</span>
                    <span>{wallet.device.platform}</span>
                  </div>
                  <span className="text-muted-foreground/40">•</span>

                  {/* Version */}
                  <div className="flex items-center gap-1">
                    <Package className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="hidden sm:inline text-muted-foreground">Version:</span>
                    <span>{wallet.device.appVersion}</span>
                  </div>
                  <span className="text-muted-foreground/40">•</span>

                  {/* Provider */}
                  <div className="flex items-center gap-1">
                    <Link className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="hidden sm:inline text-muted-foreground">Provider:</span>
                    <span>{wallet.provider}</span>
                  </div>

                  {/* Features - inline on lg+ */}
                  {features.length > 0 && (
                    <>
                      <span className="hidden lg:inline text-muted-foreground/40">•</span>
                      <div className="hidden lg:flex items-center gap-1">
                        <span className="text-muted-foreground">Features:</span>
                        {features.map((feature, i) => (
                          <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Raw toggle - on lg+ stays on this row, right side */}
                <CollapsibleTrigger className="hidden lg:flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0">
                  <ChevronRight className="h-3.5 w-3.5 transition-transform duration-200 [[data-state=open]>&]:rotate-90" />
                  <span>Raw</span>
                </CollapsibleTrigger>
              </div>

              {/* Features + Raw toggle row - ONLY on smaller screens (< lg) */}
              <div className="lg:hidden flex justify-between items-center mt-2 text-xs">
                {/* Features */}
                {features.length > 0 ? (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-muted-foreground">Features:</span>
                    {features.map((feature, i) => (
                      <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <div />
                )}

                {/* Raw toggle */}
                <CollapsibleTrigger className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors shrink-0">
                  <ChevronRight className="h-3.5 w-3.5 transition-transform duration-200 [[data-state=open]>&]:rotate-90" />
                  <span>Raw</span>
                </CollapsibleTrigger>
              </div>

              {/* Raw JSON content */}
              <CollapsibleContent className="pt-3">
                <JsonViewer
                  title=""
                  json={JSON.stringify({
                    account: wallet.account,
                    device: wallet.device,
                    connectItems: wallet.connectItems,
                    provider: wallet.provider
                  }, null, 2)}
                  maxHeight={300}
                  defaultExpanded={true}
                  collapsible={false}
                />
              </CollapsibleContent>
            </Collapsible>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Circle className="h-2.5 w-2.5 fill-muted-foreground text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              No wallet connected — use the options below
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
