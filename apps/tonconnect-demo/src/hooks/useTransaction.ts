import { useState, useEffect, useCallback, useMemo } from "react"
import { useTonConnectUI, useTonWallet, useIsConnectionRestored, CHAIN } from "@tonconnect/ui-react"
import { toNano, fromNano } from "@ton/core"
import { toast } from "sonner"
import { useHistory } from "./useHistory"

export interface TransactionMessage {
  address: string
  amount: string // Always stored in nanotons
  stateInit?: string
  payload?: string
}

export type AmountUnit = "TON" | "nano"

export interface OperationResult {
  id: string
  timestamp: number
  requestSnapshot: string  // Frozen JSON at send time
  response: string
  status: 'success' | 'error'
  errorMessage?: string
  boc?: string
  validUntil?: number
}

export const PRESETS = {
  simple: {
    name: "Simple Transfer",
    description: "Basic TON transfer to any address",
    validUntil: 600,
    from: "",
    messages: [{ address: "EQCKWpx7cNMpvmcN5ObM5lLUZHZRFKqYA4xmw9jOry0ZsF9M", amount: "5000000" }],
  },
  withPayload: {
    name: "Transfer with Comment",
    description: "Include a text message with your transfer",
    validUntil: 600,
    from: "",
    messages: [{ address: "EQCKWpx7cNMpvmcN5ObM5lLUZHZRFKqYA4xmw9jOry0ZsF9M", amount: "10000000", payload: "te6cckEBAQEADAAMABQAAAAASGVsbG8h" }],
  },
  multiMessage: {
    name: "Multiple Messages",
    description: "Send TON to 2+ recipients in one transaction",
    validUntil: 600,
    from: "",
    messages: [
      { address: "EQCKWpx7cNMpvmcN5ObM5lLUZHZRFKqYA4xmw9jOry0ZsF9M", amount: "5000000" },
      { address: "EQCD39VS5jcptHL8vMjEXrzGaRcCVYto7HUn4bpAOg8xqB2N", amount: "3000000" },
    ],
  },
  jetton: {
    name: "Jetton Transfer",
    description: "Send fungible tokens (Jettons)",
    validUntil: 600,
    from: "",
    messages: [{ address: "EQCKWpx7cNMpvmcN5ObM5lLUZHZRFKqYA4xmw9jOry0ZsF9M", amount: "50000000", payload: "te6cckEBAgEAqwAB4YgBQzYIKlMZvqYGaO2k3+YDIZGkqnSBfSYvklMpBnmOTLbgIUMWCCpTGb6mBmjtpN/mAyGRpKp0gX0mL5JTKQZJjky2wAAAAAAAAAAAAAAAAAEBAGRURVNUIFRSQU5TRkVSIFRPIEpFVFRPTiBXQUxMRVQgV0lUSCBDT01NRU5U" }],
  },
} as const

export type PresetKey = keyof typeof PRESETS

export function useTransaction(showToastBefore = true, showToastSuccess = true, showToastError = true) {
  const [tonConnectUI] = useTonConnectUI()
  const wallet = useTonWallet()
  const isConnectionRestored = useIsConnectionRestored()
  const history = useHistory()

  // Valid until as unix timestamp
  const [validUntil, setValidUntil] = useState(() =>
    Math.floor(Date.now() / 1000) + 86400 // Default: +1 day
  )
  const [network, setNetwork] = useState("")
  const [from, setFrom] = useState("")
  const [messages, setMessages] = useState<TransactionMessage[]>([
    { address: "EQCKWpx7cNMpvmcN5ObM5lLUZHZRFKqYA4xmw9jOry0ZsF9M", amount: "5000000", stateInit: "", payload: "" },
  ])

  // Amount units per message (for display)
  const [amountUnits, setAmountUnits] = useState<Record<number, AmountUnit>>({})

  const [requestJson, setRequestJson] = useState("")

  // Operation result with snapshot
  const [lastResult, setLastResult] = useState<OperationResult | null>(null)

  // Loading state
  const [isSending, setIsSending] = useState(false)

  // Helper to add time to validUntil
  const addTimeToValidUntil = useCallback((seconds: number) => {
    setValidUntil(Math.floor(Date.now() / 1000) + seconds)
  }, [])

  // Get display amount (converted based on unit)
  const getDisplayAmount = useCallback((index: number): string => {
    const unit = amountUnits[index] || "TON"
    const nanoAmount = messages[index]?.amount || "0"
    if (unit === "TON") {
      return fromNano(nanoAmount)
    }
    return nanoAmount
  }, [messages, amountUnits])

  // Set amount with unit conversion
  const setMessageAmount = useCallback((index: number, displayValue: string, unit: AmountUnit) => {
    const updated = [...messages]
    try {
      const nanoValue = unit === "TON" ? toNano(displayValue || "0").toString() : displayValue
      updated[index] = { ...updated[index], amount: nanoValue }
      setMessages(updated)
    } catch {
      // Invalid number - keep as is
    }
  }, [messages])

  // Get/set unit for message
  const getAmountUnit = useCallback((index: number): AmountUnit => {
    return amountUnits[index] || "TON"
  }, [amountUnits])

  const setAmountUnit = useCallback((index: number, unit: AmountUnit) => {
    setAmountUnits(prev => ({ ...prev, [index]: unit }))
  }, [])

  // Wallet's network (only after connection is restored to prevent flicker)
  const walletNetwork = useMemo(
    () => isConnectionRestored && wallet?.account?.chain ? String(wallet.account.chain) : "",
    [isConnectionRestored, wallet?.account?.chain]
  )

  // Build request JSON
  useEffect(() => {
    const builtMessages = messages.map((msg) => {
      const m: Record<string, string> = { address: msg.address, amount: msg.amount }
      if (msg.stateInit) m.stateInit = msg.stateInit
      if (msg.payload) m.payload = msg.payload
      return m
    })

    const effectiveNetwork = network || walletNetwork

    const tx: Record<string, unknown> = {
      validUntil,
      messages: builtMessages,
    }
    if (effectiveNetwork) tx.network = effectiveNetwork
    if (from) tx.from = from

    setRequestJson(JSON.stringify(tx, null, 2))
  }, [validUntil, network, from, messages, walletNetwork])

  const loadPreset = (key: PresetKey) => {
    const preset = PRESETS[key]
    setValidUntil(Math.floor(Date.now() / 1000) + preset.validUntil)
    setNetwork("") // Reset to empty - will use wallet's network
    setFrom(preset.from)
    setMessages(preset.messages.map((msg) => ({
      address: msg.address,
      amount: msg.amount,
      stateInit: "",
      payload: "payload" in msg ? msg.payload : "",
    })))
    // Reset all amount units to TON
    setAmountUnits({})
  }

  const addMessage = () => {
    setMessages([...messages, { address: "", amount: toNano("0.001").toString(), stateInit: "", payload: "" }])
  }

  const removeMessage = (index: number) => {
    if (messages.length > 1) setMessages(messages.filter((_, i) => i !== index))
  }

  const updateMessage = (index: number, field: keyof TransactionMessage, value: string) => {
    const updated = [...messages]
    updated[index] = { ...updated[index], [field]: value }
    setMessages(updated)
  }

  // Set form state from JSON (for edit mode)
  const setFromJson = useCallback((json: string) => {
    try {
      const data = JSON.parse(json)

      // Set validUntil directly (it's a unix timestamp)
      if (data.validUntil) {
        setValidUntil(data.validUntil)
      }

      if (data.network !== undefined) setNetwork(data.network)
      if (data.from !== undefined) setFrom(data.from)

      if (Array.isArray(data.messages)) {
        setMessages(data.messages.map((msg: Record<string, string>) => ({
          address: msg.address || "",
          amount: msg.amount || "0",
          stateInit: msg.stateInit || "",
          payload: msg.payload || "",
        })))
        // Reset units to nano since JSON has nanotons
        const newUnits: Record<number, AmountUnit> = {}
        data.messages.forEach((_: unknown, i: number) => {
          newUnits[i] = "nano"
        })
        setAmountUnits(newUnits)
      }
    } catch {
      // Invalid JSON - ignore
    }
  }, [])

  // Internal send implementation - used by both send() and sendRaw()
  const sendInternal = async (requestSnapshot: string, txValidUntil: number, txMessages: Array<{ address: string; amount: string; stateInit?: string; payload?: string }>) => {
    if (!wallet) {
      toast.error("Please connect wallet first")
      return
    }

    const walletAddress = wallet.account.address
    const walletNetwork = wallet.account.chain === CHAIN.TESTNET ? "testnet" as const : "mainnet" as const

    setIsSending(true)
    try {
      if (showToastBefore) toast.info("Please confirm in your wallet")

      const result = await tonConnectUI.sendTransaction({
        validUntil: txValidUntil,
        messages: txMessages,
      })

      const operationId = crypto.randomUUID()

      // Save result with frozen request snapshot
      setLastResult({
        id: operationId,
        timestamp: Date.now(),
        requestSnapshot,
        response: JSON.stringify(result, null, 2),
        status: 'success',
        boc: result.boc,
        validUntil: txValidUntil,
      })

      // Save to localStorage history
      history.addEntry({
        timestamp: Date.now(),
        walletAddress,
        network: walletNetwork,
        request: JSON.parse(requestSnapshot),
        requestRaw: requestSnapshot,
        status: "success",
        response: JSON.parse(JSON.stringify(result)),
        boc: result.boc,
      })

      if (showToastSuccess) toast.success("Transaction sent successfully")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Transaction failed"

      // Save error result with frozen request snapshot
      setLastResult({
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        requestSnapshot,
        response: JSON.stringify({ error: message }, null, 2),
        status: 'error',
        errorMessage: message,
      })

      // Save error to localStorage history
      history.addEntry({
        timestamp: Date.now(),
        walletAddress,
        network: walletNetwork,
        request: JSON.parse(requestSnapshot),
        requestRaw: requestSnapshot,
        status: "error",
        response: { error: message },
      })

      if (showToastError) toast.error(message)
    } finally {
      setIsSending(false)
    }
  }

  const send = async () => {
    if (!wallet) {
      toast.error("Please connect wallet first")
      return
    }

    const builtMessages = messages.map((msg) => {
      const m: Record<string, string> = { address: msg.address, amount: msg.amount }
      if (msg.stateInit) m.stateInit = msg.stateInit
      if (msg.payload) m.payload = msg.payload
      return m
    })

    await sendInternal(
      requestJson,
      validUntil,
      builtMessages as Array<{ address: string; amount: string; stateInit?: string; payload?: string }>
    )
  }

  // Send raw JSON directly (bypasses form state)
  const sendRaw = async (rawJson: string) => {
    if (!wallet) {
      toast.error("Please connect wallet first")
      return
    }

    try {
      const data = JSON.parse(rawJson)

      const txValidUntil = data.validUntil || Math.floor(Date.now() / 1000) + 300
      const txMessages = (data.messages || []).map((msg: Record<string, string>) => {
        const m: Record<string, string> = { address: msg.address, amount: msg.amount }
        if (msg.stateInit) m.stateInit = msg.stateInit
        if (msg.payload) m.payload = msg.payload
        return m
      })

      await sendInternal(rawJson, txValidUntil, txMessages)
    } catch {
      toast.error("Invalid JSON")
    }
  }

  const clearResult = useCallback(() => {
    setLastResult(null)
  }, [])

  const loadResultToForm = useCallback(() => {
    if (lastResult) {
      setFromJson(lastResult.requestSnapshot)
    }
  }, [lastResult, setFromJson])

  // Load history entry to form
  const loadHistoryToForm = useCallback((requestRaw: string) => {
    setFromJson(requestRaw)
    clearResult() // Clear current result when loading from history
  }, [setFromJson, clearResult])

  // Current wallet address for history selector
  const currentWalletAddress = wallet?.account.address || null

  return {
    validUntil, setValidUntil,
    addTimeToValidUntil,
    network, setNetwork,
    from, setFrom,
    messages,
    // Amount helpers
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
    isConnected: !!wallet,
    isSending,
    // Operation result with snapshot
    lastResult,
    clearResult,
    loadResultToForm,
    // History
    currentWalletAddress,
    loadHistoryToForm,
    // Connection state (for UI loading states)
    isConnectionRestored,
    walletNetwork,
  }
}
