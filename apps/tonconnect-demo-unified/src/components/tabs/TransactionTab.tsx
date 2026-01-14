import { useState, useEffect, useMemo } from "react"
import { useTonWallet } from "@tonconnect/ui-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { FormContainer } from "@/components/shared/FormContainer"
import { HistoryList } from "@/components/shared/HistoryList"
import { HowItWorksCard } from "@/components/shared/HowItWorksCard"
import { FieldLabel } from "@/components/shared/FieldLabel"
import { useTransaction, PRESETS } from "@/hooks/useTransaction"
import { useSettingsContext } from "@/context/SettingsContext"
import { validateTransactionJson } from "@/utils/validator"
import { Plus, Trash2, ChevronRight, ChevronDown } from "lucide-react"
import type { AmountUnit, PresetKey } from "@/hooks/useTransaction"

export function TransactionTab() {
  const { modalsBefore, modalsSuccess, modalsError } = useSettingsContext()
  const wallet = useTonWallet()
  const {
    validUntil, setValidUntil,
    addTimeToValidUntil,
    network, setNetwork,
    from, setFrom,
    messages,
    getDisplayAmount,
    setMessageAmount,
    getAmountUnit,
    setAmountUnit,
    requestJson,
    loadPreset,
    addMessage,
    removeMessage,
    updateMessage,
    send,
    sendRaw,
    setFromJson,
    isConnected,
    isSending,
    lastResult,
    clearResult,
    loadResultToForm,
    currentWalletAddress,
    loadHistoryToForm,
  } = useTransaction(modalsBefore, modalsSuccess, modalsError)

  // Convert PRESETS to array format for FormContainer
  const presetOptions = useMemo(() =>
    Object.entries(PRESETS).map(([id, preset]) => ({
      id,
      name: preset.name,
      description: preset.description,
    })),
    []
  )

  const handlePresetSelect = (presetId: string) => {
    loadPreset(presetId as PresetKey)
  }

  // UI state for payload collapsibles
  const [expandedPayloads, setExpandedPayloads] = useState<Record<number, boolean>>({})

  // Get wallet's network as string
  const walletNetwork = wallet?.account?.chain ? String(wallet.account.chain) : ""

  // Live countdown timer
  const [timeLeft, setTimeLeft] = useState("")
  const [exactTime, setExactTime] = useState("")
  const [isHoveringTimer, setIsHoveringTimer] = useState(false)

  useEffect(() => {
    const updateTimer = () => {
      const now = Math.floor(Date.now() / 1000)
      const diff = validUntil - now

      // Exact time (always calculated)
      if (diff <= 0) {
        setExactTime("Expired")
      } else {
        const hours = Math.floor(diff / 3600)
        const mins = Math.floor((diff % 3600) / 60)
        const secs = diff % 60
        if (hours > 0) {
          setExactTime(`${hours}h ${mins}m ${secs}s`)
        } else if (mins > 0) {
          setExactTime(`${mins}m ${secs}s`)
        } else {
          setExactTime(`${secs}s`)
        }
      }

      // Display time (simplified)
      if (diff <= 0) {
        setTimeLeft("Expired")
      } else if (diff < 60) {
        setTimeLeft(`${diff}s`)
      } else if (diff < 600) {
        setTimeLeft(`~${Math.ceil(diff / 60)}m`)
      } else {
        setTimeLeft("more than 10 min")
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [validUntil])

  // Toggle payload section for a message
  const togglePayload = (index: number) => {
    setExpandedPayloads(prev => ({ ...prev, [index]: !prev[index] }))
  }

  const formContent = (
    <>
      {/* Valid Until - unix timestamp with quick buttons */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <FieldLabel htmlFor="validUntil" fieldId="validUntil">Valid Until</FieldLabel>
          <span
            className={`text-sm font-mono cursor-default ${timeLeft === "Expired" ? "text-destructive" : "text-muted-foreground"}`}
            onMouseEnter={() => setIsHoveringTimer(true)}
            onMouseLeave={() => setIsHoveringTimer(false)}
          >
            {timeLeft === "Expired" ? "Expired" : `Expires in ${isHoveringTimer ? exactTime : timeLeft}`}
          </span>
        </div>
        <div className="flex gap-2">
          <Input
            id="validUntil"
            type="number"
            value={validUntil}
            onChange={(e) => setValidUntil(parseInt(e.target.value) || 0)}
            className="flex-1 font-mono"
          />
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => addTimeToValidUntil(60)}>+1m</Button>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => addTimeToValidUntil(300)}>+5m</Button>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => addTimeToValidUntil(600)}>+10m</Button>
        </div>
      </div>

      {/* Network + From */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <FieldLabel htmlFor="network" fieldId="network" className="text-muted-foreground">Network (optional)</FieldLabel>
          <Input
            id="network"
            value={network || walletNetwork}
            onChange={(e) => setNetwork(e.target.value)}
            placeholder={walletNetwork || "e.g. -239 for mainnet"}
            disabled={!!walletNetwork}
          />
        </div>
        <div className="space-y-2">
          <FieldLabel htmlFor="from" fieldId="from" className="text-muted-foreground">From (optional)</FieldLabel>
          <Input
            id="from"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            placeholder="Sender address"
          />
        </div>
      </div>

      {/* Messages */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <FieldLabel fieldId="messages">Messages</FieldLabel>
          <Button variant="outline" size="sm" onClick={addMessage}>
            <Plus className="mr-1 h-3 w-3" />Add
          </Button>
        </div>

        {messages.map((message, index) => (
          <div key={index} className="rounded-lg border p-3 space-y-3">
            {/* Header with delete button */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Message {index + 1}</span>
              {messages.length > 1 && (
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => removeMessage(index)} aria-label="Remove message">
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>

            {/* Address */}
            <div className="space-y-1">
              <FieldLabel htmlFor={`address-${index}`} fieldId="address" className="text-xs">Address</FieldLabel>
              <Input
                id={`address-${index}`}
                value={message.address}
                onChange={(e) => updateMessage(index, "address", e.target.value)}
                placeholder="Recipient address"
                className="h-9"
              />
            </div>

            {/* Amount with unit selector */}
            <div className="space-y-1">
              <FieldLabel htmlFor={`amount-${index}`} fieldId="amount" className="text-xs">Amount</FieldLabel>
              <div className="flex gap-1">
                <Input
                  id={`amount-${index}`}
                  value={getDisplayAmount(index)}
                  onChange={(e) => setMessageAmount(index, e.target.value, getAmountUnit(index))}
                  placeholder={getAmountUnit(index) === "TON" ? "0.001" : "1000000"}
                  className="h-9 flex-1"
                />
                <Select
                  value={getAmountUnit(index)}
                  onValueChange={(v) => setAmountUnit(index, v as AmountUnit)}
                >
                  <SelectTrigger className="h-9 w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TON">TON</SelectItem>
                    <SelectItem value="nano">nano</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Payload + StateInit (collapsible, auto-open when has content) */}
            {(() => {
              const hasContent = !!message.payload || !!message.stateInit
              const isOpen = hasContent || expandedPayloads[index]
              return (
                <Collapsible open={isOpen} onOpenChange={() => !hasContent && togglePayload(index)}>
                  <CollapsibleTrigger
                    className={`flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground ${hasContent ? "cursor-default" : ""}`}
                  >
                    {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    Payload, State Init
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-2 space-y-2">
                    <div className="space-y-1">
                      <FieldLabel htmlFor={`payload-${index}`} fieldId="payload" className="text-xs">Payload</FieldLabel>
                      <Textarea
                        id={`payload-${index}`}
                        value={message.payload}
                        onChange={(e) => updateMessage(index, "payload", e.target.value)}
                        placeholder="Transaction payload (base64)"
                        rows={2}
                        className="text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <FieldLabel htmlFor={`stateInit-${index}`} fieldId="stateInit" className="text-xs">State Init</FieldLabel>
                      <Textarea
                        id={`stateInit-${index}`}
                        value={message.stateInit}
                        onChange={(e) => updateMessage(index, "stateInit", e.target.value)}
                        placeholder="State init (base64)"
                        rows={2}
                        className="text-xs"
                      />
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )
            })()}
          </div>
        ))}
      </div>
    </>
  )

  return (
    <div className="space-y-6">
      <FormContainer
        title="Transaction Request"
        submitButtonText="Send Transaction"
        formContent={formContent}
        requestJson={requestJson}
        onJsonChange={setFromJson}
        onSend={send}
        onSendRaw={sendRaw}
        validateJson={validateTransactionJson}
        isConnected={isConnected}
        isLoading={isSending}
        presets={presetOptions}
        onPresetSelect={handlePresetSelect}
        lastResult={lastResult}
        onClearResult={clearResult}
        onLoadResult={loadResultToForm}
      />

      <HistoryList
        currentWallet={currentWalletAddress}
        onLoadToForm={loadHistoryToForm}
      />

      <HowItWorksCard sectionId="transaction" />
    </div>
  )
}
