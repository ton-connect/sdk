import { useTonWallet, CHAIN } from "@tonconnect/ui-react"
import { BaseResultCard } from "./BaseResultCard"
import { StatusBar, type StatusVariant } from "./StatusBar"
import { TransactionDetails } from "./TransactionDetails"
import { useTransactionTracker, type TransactionStatus } from "@/hooks/useTransactionTracker"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import type { OperationResult } from "@/hooks/useTransaction"

interface ResultCardProps {
  result: OperationResult
  onDismiss?: () => void
  onLoadToForm?: () => void
}

/** Maps transaction status to StatusBar variant */
function getVariant(status: TransactionStatus, isError: boolean): StatusVariant {
  if (isError) return "error"
  switch (status) {
    case "confirmed":
      return "success"
    case "expired":
      return "error"
    default:
      return "pending"
  }
}

/** Gets icon for status */
function getIcon(status: TransactionStatus, isError: boolean) {
  if (isError) return <XCircle className="h-4 w-4" />
  switch (status) {
    case "confirmed":
      return <CheckCircle className="h-4 w-4" />
    case "expired":
      return <XCircle className="h-4 w-4" />
    default:
      return <Loader2 className="h-4 w-4 animate-spin" />
  }
}

/** Gets title for status */
function getTitle(status: TransactionStatus, isError: boolean, hasBoc: boolean): string {
  if (isError) return "Error"
  switch (status) {
    case "confirmed":
      return "Confirmed"
    case "expired":
      return "Expired"
    case "pending":
    case "idle":
      return hasBoc ? "Pending" : "Sent"
  }
}

/** Gets subtitle for confirmed transactions */
function getConfirmedSubtitle(transaction: { lt: string; fee: string; timestamp: number }): string {
  const time = new Date(transaction.timestamp * 1000).toLocaleTimeString()
  const feeInTon = (parseInt(transaction.fee) / 1e9).toFixed(6)
  return `LT: ${transaction.lt} • Fee: ${feeInTon} TON • ${time}`
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

  const isError = result.status === "error"
  const hasBoc = !!result.boc
  const effectiveStatus = isError ? "idle" : tracking.status

  // Build subtitle
  let subtitle: string | undefined
  if (isError) {
    // Try to extract error message from response
    try {
      const parsed = JSON.parse(result.response)
      subtitle = parsed.message || parsed.error || undefined
    } catch {
      subtitle = undefined
    }
  } else if (effectiveStatus === "confirmed" && tracking.transaction) {
    subtitle = getConfirmedSubtitle(tracking.transaction)
  } else if (effectiveStatus === "expired") {
    subtitle = "Transaction not found before validUntil"
  } else if (effectiveStatus === "pending" && tracking.error) {
    subtitle = `${tracking.error}, retrying...`
  } else if (effectiveStatus === "pending") {
    subtitle = "Waiting for confirmation..."
  }

  const statusBar = (
    <StatusBar
      variant={getVariant(effectiveStatus, isError)}
      icon={getIcon(effectiveStatus, isError)}
      title={getTitle(effectiveStatus, isError, hasBoc)}
      subtitle={subtitle}
      timer={effectiveStatus === "pending" ? tracking.formattedTime : undefined}
    />
  )

  const responseFooter = hasBoc ? (
    <TransactionDetails
      boc={result.boc!}
      hash={tracking.hash}
      network={network}
    />
  ) : undefined

  return (
    <BaseResultCard
      result={result}
      statusBar={statusBar}
      responseFooter={responseFooter}
      onDismiss={onDismiss}
      onLoadToForm={onLoadToForm}
      responseViewerProps={{ maxHeight: 150, inlineThreshold: 100 }}
    />
  )
}
