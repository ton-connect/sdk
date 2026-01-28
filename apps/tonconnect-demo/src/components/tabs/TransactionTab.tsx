import { useState, useEffect, useMemo, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { FormContainer } from "@/components/shared/FormContainer"
import { ResultCard } from "@/components/shared/ResultCard"
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
    isConnectionRestored,
    walletNetwork,
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

  // Result scroll ref
  const resultRef = useRef<HTMLDivElement>(null)

  // Live countdown timer (combined state to reduce re-renders)
  const [timerState, setTimerState] = useState({
    displayTime: "",
    hoverTime: "",
    status: "ok" as "ok" | "warning" | "danger" | "expired"
  })
  const [isHoveringTimer, setIsHoveringTimer] = useState(false)

  useEffect(() => {
    // Format compact time with smart date context
    const formatCompactTime = (timestamp: number) => {
      const date = new Date(timestamp * 1000)
      const now = new Date()
      const isToday = date.toDateString() === now.toDateString()
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      const isTomorrow = date.toDateString() === tomorrow.toDateString()

      const time = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })

      if (isToday) return time
      if (isTomorrow) return `tmrw ${time}`
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ` ${time}`
    }

    // Format full datetime for hover (local time, ISO-like format)
    const formatFullTime = (timestamp: number) => {
      const date = new Date(timestamp * 1000)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const mins = String(date.getMinutes()).padStart(2, '0')
      const secs = String(date.getSeconds()).padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${mins}:${secs}`
    }

    // Format countdown as Xh Ym Zs
    const formatCountdown = (diff: number) => {
      const hours = Math.floor(diff / 3600)
      const mins = Math.floor((diff % 3600) / 60)
      const secs = diff % 60
      if (hours > 0) return `${hours}h ${mins}m ${secs}s`
      if (mins > 0) return `${mins}m ${secs}s`
      return `${secs}s`
    }

    const updateTimer = () => {
      const now = Math.floor(Date.now() / 1000)
      const diff = validUntil - now

      if (diff <= 0) {
        setTimerState({ displayTime: "Expired", hoverTime: "Expired", status: "expired" })
      } else if (diff < 120) {
        // <2m: countdown + time, danger
        setTimerState({
          displayTime: `${diff}s · ${formatCompactTime(validUntil)}`,
          hoverTime: `${formatCountdown(diff)} · ${formatFullTime(validUntil)}`,
          status: "danger"
        })
      } else if (diff < 600) {
        // 2-10m: just time, warning
        setTimerState({
          displayTime: formatCompactTime(validUntil),
          hoverTime: `${formatCountdown(diff)} · ${formatFullTime(validUntil)}`,
          status: "warning"
        })
      } else {
        // >10m: just time, ok
        setTimerState({
          displayTime: formatCompactTime(validUntil),
          hoverTime: `${formatCountdown(diff)} · ${formatFullTime(validUntil)}`,
          status: "ok"
        })
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

  // Scroll to result when it appears
  useEffect(() => {
    if (lastResult && resultRef.current) {
      const rect = resultRef.current.getBoundingClientRect()
      if (rect.top < 0 || rect.bottom > window.innerHeight) {
        resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    }
  }, [lastResult?.id])

  const formContent = (
    <>
      {/* Valid Until - unix timestamp with quick buttons */}
      <div className="space-y-2">
        <div
          className="flex items-center justify-between gap-2 flex-wrap cursor-default"
          onMouseEnter={() => setIsHoveringTimer(true)}
          onMouseLeave={() => setIsHoveringTimer(false)}
        >
          <FieldLabel htmlFor="validUntil" fieldId="validUntil">Valid Until</FieldLabel>
          <span className={`inline-flex items-center gap-1.5 text-xs sm:text-sm font-mono ${
            timerState.status === "expired" ? "text-destructive" : "text-muted-foreground"
          }`}>
            <span className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${
              timerState.status === "ok" ? "bg-green-500" :
              timerState.status === "warning" ? "bg-yellow-500" :
              timerState.status === "danger" ? "bg-red-500" :
              "bg-destructive"
            }`} />
            <span className="transition-opacity duration-150">
              {isHoveringTimer ? timerState.hoverTime : timerState.displayTime}
            </span>
          </span>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Input
            id="validUntil"
            type="number"
            value={validUntil}
            onChange={(e) => setValidUntil(parseInt(e.target.value) || 0)}
            className="flex-1 min-w-[120px] font-mono"
          />
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="h-9 px-2 text-xs" onClick={() => addTimeToValidUntil(60)}>+1m</Button>
            <Button variant="ghost" size="sm" className="h-9 px-2 text-xs" onClick={() => addTimeToValidUntil(300)}>+5m</Button>
            <Button variant="ghost" size="sm" className="h-9 px-2 text-xs" onClick={() => addTimeToValidUntil(43200)}>+12h</Button>
          </div>
        </div>
      </div>

      {/* Network + From */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <FieldLabel htmlFor="network" fieldId="network" className="text-muted-foreground">Network (optional)</FieldLabel>
          {!isConnectionRestored ? (
            <div className="h-9 rounded-md border bg-muted animate-pulse" />
          ) : (
            <Input
              id="network"
              value={network || walletNetwork}
              onChange={(e) => setNetwork(e.target.value)}
              placeholder={walletNetwork || "e.g. -239 for mainnet"}
              disabled={!!walletNetwork}
            />
          )}
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
      />

      {lastResult && (
        <div ref={resultRef} className="scroll-mt-20">
          <ResultCard
            result={lastResult}
            onDismiss={clearResult}
            onLoadToForm={loadResultToForm}
          />
        </div>
      )}

      <HistoryList
        currentWallet={currentWalletAddress}
        onLoadToForm={loadHistoryToForm}
      />

      <HowItWorksCard sectionId="transaction" />
    </div>
  )
}
