import { BaseResultCard } from "./BaseResultCard"
import { StatusBar } from "./StatusBar"
import { VerificationResult } from "./VerificationResult"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2, ShieldCheck, Server } from "lucide-react"
import type { SignDataOperationResult } from "@/hooks/useSignData"
import type { VerificationResult as VerificationResultType } from "@/utils/sign-data-verification"

interface SignDataResultCardProps {
  result: SignDataOperationResult
  onDismiss?: () => void
  onLoadToForm?: () => void
  // Verification
  canVerify: boolean
  onVerifyClient: () => void
  onVerifyServer: () => void
  isVerifyingClient: boolean
  isVerifyingServer: boolean
  clientResult: VerificationResultType | null
  serverResult: VerificationResultType | null
}

export function SignDataResultCard({
  result,
  onDismiss,
  onLoadToForm,
  canVerify,
  onVerifyClient,
  onVerifyServer,
  isVerifyingClient,
  isVerifyingServer,
  clientResult,
  serverResult,
}: SignDataResultCardProps) {
  const isSuccess = result.status === "success"
  const isError = result.status === "error"

  // Build subtitle for error
  let subtitle: string | undefined
  if (isError) {
    try {
      const parsed = JSON.parse(result.response)
      subtitle = parsed.message || parsed.error || undefined
    } catch {
      subtitle = undefined
    }
  }

  // Verification buttons (only for success)
  const verificationActions = isSuccess ? (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onVerifyClient}
        disabled={!canVerify || isVerifyingClient}
        className="h-7 px-2 gap-1.5 bg-transparent border-current/20 hover:bg-current/10"
      >
        {isVerifyingClient ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <ShieldCheck className="h-3.5 w-3.5" />
        )}
        Client
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onVerifyServer}
        disabled={!canVerify || isVerifyingServer}
        className="h-7 px-2 gap-1.5 bg-transparent border-current/20 hover:bg-current/10"
      >
        {isVerifyingServer ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Server className="h-3.5 w-3.5" />
        )}
        Server
      </Button>
    </div>
  ) : undefined

  // Verification results (inline under StatusBar)
  const hasVerificationResults = clientResult || serverResult
  const verificationContent = hasVerificationResults ? (
    <div className="space-y-2">
      {clientResult && <VerificationResult title="Client" result={clientResult} />}
      {serverResult && <VerificationResult title="Server" result={serverResult} />}
    </div>
  ) : undefined

  const statusBar = (
    <StatusBar
      variant={isSuccess ? "success" : "error"}
      icon={isSuccess ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
      title={isSuccess ? "Signed" : "Error"}
      subtitle={subtitle}
      actions={verificationActions}
    >
      {verificationContent}
    </StatusBar>
  )

  return (
    <BaseResultCard
      result={result}
      statusBar={statusBar}
      onDismiss={onDismiss}
      onLoadToForm={onLoadToForm}
      responseViewerProps={{ maxHeight: 250 }}
    />
  )
}
