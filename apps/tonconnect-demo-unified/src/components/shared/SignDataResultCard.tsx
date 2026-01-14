import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { JsonViewer } from "./JsonViewer"
import {
  CheckCircle,
  XCircle,
  Loader2,
  ShieldCheck,
  Server,
  X,
  RotateCcw,
} from "lucide-react"
import type { SignDataOperationResult } from "@/hooks/useSignData"
import type { VerificationResult } from "@/utils/sign-data-verification"

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
  clientResult: VerificationResult | null
  serverResult: VerificationResult | null
}

function VerificationAlert({ title, result }: { title: string; result: VerificationResult }) {
  return (
    <Alert variant={result.valid ? "default" : "destructive"} className="py-2">
      {result.valid ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
      <AlertTitle className="text-sm">
        {title}: {result.valid ? "Valid Signature" : "Invalid Signature"}
      </AlertTitle>
      <AlertDescription className="text-xs">
        {result.message}
        {result.details && (
          <span className="ml-2">
            Address: {result.details.addressMatch ? "✓" : "✗"} |
            Public key: {result.details.publicKeyMatch ? "✓" : "✗"} |
            Signature: {result.details.signatureValid ? "✓" : "✗"}
          </span>
        )}
      </AlertDescription>
    </Alert>
  )
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
  return (
    <div className="rounded-lg border bg-muted/30 animate-in fade-in-50 slide-in-from-bottom-2">
      {/* Header: timestamp + status + dismiss */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground font-mono">
            {new Date(result.timestamp).toLocaleTimeString()}
          </span>
          <Badge variant={result.status === 'success' ? 'default' : 'destructive'}>
            {result.status === 'success' ? (
              <><CheckCircle className="h-3 w-3 mr-1" />Signed</>
            ) : (
              <><XCircle className="h-3 w-3 mr-1" />Error</>
            )}
          </Badge>
        </div>
        {onDismiss && (
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onDismiss}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Content: Request + Response */}
      <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-4 min-w-0 overflow-hidden">
          <JsonViewer
            title="Request Sent"
            json={result.requestSnapshot}
            defaultExpanded={true}
            maxHeight={250}
          />
        </div>
        <div className="space-y-4 min-w-0 overflow-hidden">
          <JsonViewer
            title="Response"
            json={result.response}
            defaultExpanded={true}
            maxHeight={250}
          />
        </div>
      </div>

      {/* Verification section (only if success) */}
      {result.status === 'success' && (
        <div className="p-4 border-t space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Verification</Label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onVerifyClient}
                disabled={!canVerify || isVerifyingClient}
                className="gap-2"
              >
                {isVerifyingClient ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ShieldCheck className="h-4 w-4" />
                )}
                Client
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onVerifyServer}
                disabled={!canVerify || isVerifyingServer}
                className="gap-2"
              >
                {isVerifyingServer ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Server className="h-4 w-4" />
                )}
                Server
              </Button>
            </div>
          </div>

          {/* Verification results */}
          {clientResult && (
            <VerificationAlert title="Client" result={clientResult} />
          )}
          {serverResult && (
            <VerificationAlert title="Server" result={serverResult} />
          )}
        </div>
      )}

      {/* Footer: Load to form */}
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
