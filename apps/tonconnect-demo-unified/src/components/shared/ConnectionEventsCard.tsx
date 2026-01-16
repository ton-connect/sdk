import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronRight, Plug, Unplug, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import type { WalletEvent } from "@/hooks/useConnect"

interface ConnectionEventsCardProps {
  events: WalletEvent[]
}

const EVENT_ICONS = {
  connected: Plug,
  disconnected: Unplug,
  reconnected: RefreshCw
}

const EVENT_COLORS = {
  connected: 'text-green-500',
  disconnected: 'text-muted-foreground',
  reconnected: 'text-blue-500'
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function ConnectionEventsCard({ events }: ConnectionEventsCardProps) {
  if (events.length === 0) return null

  return (
    <Collapsible>
      <CollapsibleTrigger className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors w-full">
        <ChevronRight className="h-4 w-4 transition-transform duration-200 [[data-state=open]>&]:rotate-90" />
        <span>Connection Events</span>
        <span className="ml-1 text-xs">({events.length})</span>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2 pl-5">
        <div className="space-y-1 rounded-md border p-3 bg-muted/30">
          {events.map((event) => {
            const Icon = EVENT_ICONS[event.type]
            return (
              <div
                key={event.id}
                className="flex items-center gap-2 text-xs font-mono"
              >
                <span className="text-muted-foreground">{formatTime(event.timestamp)}</span>
                <Icon className={cn("h-3 w-3", EVENT_COLORS[event.type])} />
                <span className={EVENT_COLORS[event.type]}>{event.type}</span>
                {event.walletName && (
                  <span className="text-muted-foreground">({event.walletName})</span>
                )}
                {event.address && (
                  <code className="text-muted-foreground">{formatAddress(event.address)}</code>
                )}
              </div>
            )
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
