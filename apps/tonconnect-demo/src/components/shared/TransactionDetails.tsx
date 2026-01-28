import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Copy, ExternalLink } from "lucide-react"
import { getExplorerUrl } from "@/utils/explorer-utils"
import { copyToClipboard } from "@/utils/clipboard"

interface TransactionDetailsProps {
  boc: string
  hash: string | null
  network: "mainnet" | "testnet"
}

export function TransactionDetails({ boc, hash, network }: TransactionDetailsProps) {
  return (
    <div className="space-y-3 pt-3 border-t">
      {/* BOC - truncated with length indicator */}
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">
          BOC <span className="opacity-60">({boc.length} chars)</span>
        </Label>
        <div className="flex gap-2 items-center">
          <code
            className="flex-1 text-xs bg-muted p-2 rounded truncate font-mono cursor-pointer hover:bg-muted/80"
            onClick={() => copyToClipboard(boc)}
            title="Click to copy full BOC"
          >
            {boc.slice(0, 50)}...
          </code>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 shrink-0"
            onClick={() => copyToClipboard(boc)}
          >
            <Copy className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Hash - full display with word-break */}
      {hash && (
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Hash (TEP-467)</Label>
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" className="h-6 w-6" asChild>
                <a
                  href={getExplorerUrl(hash, network)}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="View in explorer"
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6"
                onClick={() => copyToClipboard(hash)}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <a
            href={getExplorerUrl(hash, network)}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-primary hover:underline font-mono text-xs break-all leading-relaxed"
          >
            {hash}
          </a>
        </div>
      )}
    </div>
  )
}
