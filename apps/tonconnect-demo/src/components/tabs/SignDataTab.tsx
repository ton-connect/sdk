import { useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FormContainer } from "@/components/shared/FormContainer"
import { SignDataResultCard } from "@/components/shared/SignDataResultCard"
import { HowItWorksCard } from "@/components/shared/HowItWorksCard"
import { FieldLabel } from "@/components/shared/FieldLabel"
import { useSignData } from "@/hooks/useSignData"
import { useSettingsContext } from "@/context/SettingsContext"
import { validateSignDataJson } from "@/utils/validator"

export function SignDataTab() {
  const resultRef = useRef<HTMLDivElement>(null)
  const { notificationsBefore, notificationsSuccess, notificationsError } = useSettingsContext()
  const {
    dataType, setDataType,
    dataText, setDataText,
    schema, setSchema,
    requestJson,
    sign,
    setFromJson,
    isConnected,
    isSigning,
    // Result
    lastResult,
    clearResult,
    loadResultToForm,
    // Verification
    canVerify,
    verify,
    verificationResult,
    isVerifying,
    verifyOnServer,
    serverVerificationResult,
    isVerifyingOnServer,
  } = useSignData(notificationsBefore, notificationsSuccess, notificationsError)

  // Scroll to result when it appears
  useEffect(() => {
    if (lastResult && resultRef.current) {
      const rect = resultRef.current.getBoundingClientRect()
      // Scroll if result is not fully visible
      if (rect.top < 0 || rect.bottom > window.innerHeight) {
        resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    }
  }, [lastResult?.id])

  const formContent = (
    <>
      <div className="space-y-2">
        <FieldLabel fieldId="dataType">Data Type</FieldLabel>
        <div className="flex gap-1 rounded-lg border bg-background p-1">
          <Button
            variant={dataType === "text" ? "secondary" : "ghost"}
            onClick={() => setDataType("text")}
            className="flex-1 h-8 rounded-md text-sm"
          >
            Text
          </Button>
          <Button
            variant={dataType === "binary" ? "secondary" : "ghost"}
            onClick={() => setDataType("binary")}
            className="flex-1 h-8 rounded-md text-sm"
          >
            Binary
          </Button>
          <Button
            variant={dataType === "cell" ? "secondary" : "ghost"}
            onClick={() => setDataType("cell")}
            className="flex-1 h-8 rounded-md text-sm"
          >
            Cell
          </Button>
        </div>
      </div>

      {dataType === "cell" && (
        <div className="space-y-2">
          <FieldLabel htmlFor="schema" fieldId="schema">Schema (TL-B)</FieldLabel>
          <Input
            id="schema"
            value={schema}
            onChange={(e) => setSchema(e.target.value)}
            placeholder="e.g. transfer#123abc amount:Coins"
          />
        </div>
      )}

      <div className="space-y-2">
        <FieldLabel
          htmlFor="signData"
          fieldId={dataType === "text" ? "text" : dataType === "binary" ? "bytes" : "cell"}
        >
          {dataType === "text" ? "Text" : dataType === "binary" ? "Data (base64)" : "Cell (BOC)"}
        </FieldLabel>
        <Textarea
          id="signData"
          value={dataText}
          onChange={(e) => setDataText(e.target.value)}
          placeholder={dataType === "text" ? "Hello, TON!" : dataType === "binary" ? "Binary data (base64)" : "Base64 encoded BOC"}
          rows={4}
        />
      </div>
    </>
  )

  return (
    <div className="space-y-6">
      <FormContainer
        title="Sign Data"
        submitButtonText="Sign"
        codeEditorHeight="200px"
        formContent={formContent}
        requestJson={requestJson}
        onJsonChange={setFromJson}
        onSend={sign}
        validateJson={validateSignDataJson}
        isConnected={isConnected}
        isLoading={isSigning}
      />

      {lastResult && (
        <div ref={resultRef} className="scroll-mt-30">
          <SignDataResultCard
            result={lastResult}
            onDismiss={clearResult}
            onLoadToForm={loadResultToForm}
            canVerify={canVerify}
            onVerifyClient={verify}
            onVerifyServer={verifyOnServer}
            isVerifyingClient={isVerifying}
            isVerifyingServer={isVerifyingOnServer}
            clientResult={verificationResult}
            serverResult={serverVerificationResult}
          />
        </div>
      )}

      <HowItWorksCard sectionId="signData" />
    </div>
  )
}
