import { CheckCircle, XCircle } from "lucide-react"
import type { VerificationResult as VerificationResultType } from "@/utils/sign-data-verification"

interface VerificationResultProps {
  title: string // "Client" | "Server"
  result: VerificationResultType
}

export function VerificationResult({ title, result }: VerificationResultProps) {
  const isValid = result.valid

  return (
    <div className="text-sm">
      {/* Title + status */}
      <div className="flex items-center gap-2">
        {isValid ? (
          <CheckCircle className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
        ) : (
          <XCircle className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
        )}
        <span className="font-medium">
          {title}: {isValid ? "Valid" : "Invalid"}
        </span>
      </div>

      {/* Details */}
      {result.details && (
        <div className="ml-5.5 text-xs opacity-70 mt-0.5">
          Address {result.details.addressMatch ? "✓" : "✗"} •{" "}
          Public key {result.details.publicKeyMatch ? "✓" : "✗"} •{" "}
          Signature {result.details.signatureValid ? "✓" : "✗"}
        </div>
      )}
    </div>
  )
}
