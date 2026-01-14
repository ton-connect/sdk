import { useTonWallet, CHAIN } from "@tonconnect/ui-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Label } from "@/components/ui/label"
import { useTransactionTracker } from "@/hooks/useTransactionTracker"
import { getExplorerUrl } from "@/utils/explorer-utils"
import { Copy, ExternalLink, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface TransactionResultProps {
  boc: string
  validUntil: number
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text)
  toast.success("Copied to clipboard")
}

export function TransactionResult({ boc, validUntil }: TransactionResultProps) {
  const wallet = useTonWallet()
  const network = wallet?.account.chain === CHAIN.TESTNET ? "testnet" : "mainnet"

  const { hash, status, transaction, formattedTime, error } = useTransactionTracker({
    boc,
    validUntil,
    network,
  })

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            Transaction Result
            <Badge
              variant={
                status === "pending" ? "secondary" :
                status === "confirmed" ? "default" : "destructive"
              }
            >
              {status === "pending" && (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Pending
                </>
              )}
              {status === "confirmed" && (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Confirmed
                </>
              )}
              {status === "expired" && (
                <>
                  <XCircle className="h-3 w-3 mr-1" />
                  Expired
                </>
              )}
            </Badge>
          </span>

          {status === "pending" && (
            <span className="text-sm text-muted-foreground font-mono">
              {formattedTime}
            </span>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* BOC */}
        <div className="space-y-2">
          <Label>BOC</Label>
          <div className="flex gap-2">
            <code className="flex-1 text-xs bg-muted p-2 rounded truncate">{boc}</code>
            <Button size="icon" variant="ghost" onClick={() => copyToClipboard(boc)}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Hash with explorer link */}
        {hash && (
          <div className="space-y-2">
            <Label>Transaction Normalized Hash (TEP-467)</Label>
            <div className="flex gap-2 items-center">
              <a
                href={getExplorerUrl(hash, network)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-mono text-sm flex items-center gap-1"
              >
                {hash.slice(0, 16)}...{hash.slice(-8)}
                <ExternalLink className="h-3 w-3" />
              </a>
              <Button size="icon" variant="ghost" onClick={() => copyToClipboard(hash)}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Confirmed */}
        {status === "confirmed" && transaction && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Transaction Confirmed</AlertTitle>
            <AlertDescription className="space-y-1 text-sm">
              <div><strong>LT:</strong> {transaction.lt}</div>
              <div><strong>Fee:</strong> {transaction.fee} nanotons</div>
              <div><strong>Time:</strong> {new Date(transaction.timestamp * 1000).toLocaleString()}</div>
            </AlertDescription>
          </Alert>
        )}

        {/* Expired */}
        {status === "expired" && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Transaction Expired</AlertTitle>
            <AlertDescription>
              Transaction not found before validUntil expired.
              It may have been rejected by wallet or not sent to blockchain.
            </AlertDescription>
          </Alert>
        )}

        {/* Network error */}
        {error && status === "pending" && (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertTitle>Network Error</AlertTitle>
            <AlertDescription>
              {error}. Retrying...
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
