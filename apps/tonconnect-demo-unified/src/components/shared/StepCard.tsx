import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { JsonViewer } from "./JsonViewer"
import type { StepResult } from "@/hooks/useConnect"
import { Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react"
import type { ReactNode } from "react"

interface StepCardProps {
  step: number
  title: string
  description?: string
  buttonLabel: string
  buttonIcon?: ReactNode
  onAction: () => void
  isLoading?: boolean
  disabled?: boolean
  disabledReason?: string
  result?: StepResult | null
  /** Don't show response JSON (for steps where response goes to Wallet Response) */
  hideResponse?: boolean
}

export function StepCard({
  step,
  title,
  description,
  buttonLabel,
  buttonIcon,
  onAction,
  isLoading = false,
  disabled = false,
  disabledReason,
  result,
  hideResponse = false
}: StepCardProps) {
  const hasResult = !!result
  const isSuccess = result?.status === 'success'
  const isError = result?.status === 'error'

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-medium">
          {step}
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-sm">{title}</h4>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        {hasResult && (
          isSuccess ? (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          ) : (
            <XCircle className="h-4 w-4 text-destructive" />
          )
        )}
      </div>

      {/* Action Button */}
      <div className="pl-9">
        <Button
          onClick={onAction}
          disabled={disabled || isLoading}
          size="sm"
          variant={hasResult && isSuccess ? "outline" : "default"}
          className="gap-2"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : buttonIcon}
          {buttonLabel}
        </Button>
        {disabled && disabledReason && (
          <p className="text-xs text-muted-foreground mt-1">{disabledReason}</p>
        )}
      </div>

      {/* Result */}
      {hasResult && (
        <div className="pl-9 space-y-2">
          {/* Error */}
          {isError && result.error != null && (
            <Alert variant="destructive" className="py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">{result.error}</AlertDescription>
            </Alert>
          )}

          {/* Request */}
          {result.request != null && (
            <JsonViewer
              title="Request"
              json={JSON.stringify(result.request, null, 2)}
              maxHeight={150}
              defaultExpanded={!isSuccess}
            />
          )}

          {/* Response */}
          {!hideResponse && isSuccess && result.response != null && (
            <JsonViewer
              title="Response"
              json={JSON.stringify(result.response, null, 2)}
              maxHeight={150}
              defaultExpanded={true}
            />
          )}
        </div>
      )}
    </div>
  )
}
