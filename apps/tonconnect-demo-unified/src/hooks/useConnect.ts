import { useState, useCallback, useRef, useEffect } from "react"
import { useTonConnectUI, useTonWallet } from "@tonconnect/ui-react"
import type { Wallet } from "@tonconnect/ui-react"
import { toast } from "sonner"

// Step result for tracking request/response
export interface StepResult {
  id: string
  timestamp: number
  status: 'success' | 'error'
  request?: unknown
  response?: unknown
  error?: string
}

// Wallet event for history
export interface WalletEvent {
  id: string
  timestamp: number
  type: 'connected' | 'disconnected' | 'reconnected'
  walletName?: string
  address?: string
}

export function useConnect() {
  const [tonConnectUI] = useTonConnectUI()
  const wallet = useTonWallet()

  // Refs
  const payloadTokenRef = useRef<string | null>(null)
  const expectingProofRef = useRef(false)
  const prevWalletRef = useRef<Wallet | null>(null)
  const initializedRef = useRef(false)

  // Events history (in memory, lost on reload)
  const [events, setEvents] = useState<WalletEvent[]>([])

  // Last full wallet response
  const [lastWalletResponse, setLastWalletResponse] = useState<unknown>(null)

  // Loading states
  const [isGeneratingPayload, setIsGeneratingPayload] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isFetchingAccount, setIsFetchingAccount] = useState(false)

  // Step results
  const [payloadResult, setPayloadResult] = useState<StepResult | null>(null)
  const [verifyResult, setVerifyResult] = useState<StepResult | null>(null)
  const [accountResult, setAccountResult] = useState<StepResult | null>(null)

  // Derived state
  const isConnected = !!wallet
  const hasPayload = payloadResult?.status === 'success'
  const hasProof = wallet?.connectItems?.tonProof && !('error' in wallet.connectItems.tonProof)
  const isAuthenticated = verifyResult?.status === 'success'

  // Add event to history
  const addEvent = useCallback((type: WalletEvent['type'], walletName?: string, address?: string) => {
    setEvents(prev => [...prev, {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      type,
      walletName,
      address
    }])
  }, [])

  // ========== STEP 1: Generate Payload ==========

  const generatePayload = useCallback(async () => {
    setIsGeneratingPayload(true)

    const request = {
      method: 'POST',
      url: '/api/generate_payload'
    }

    try {
      const response = await fetch('/api/generate_payload', { method: 'POST' })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate payload')
      }

      payloadTokenRef.current = data.payloadToken

      setPayloadResult({
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        status: 'success',
        request,
        response: data
      })

      // Set tonProof payload for future connection
      tonConnectUI.setConnectRequestParameters({
        state: 'ready',
        value: { tonProof: data.payloadTokenHash }
      })

      return data
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate payload'
      setPayloadResult({
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        status: 'error',
        request,
        error: message
      })
      toast.error(message)
      return null
    } finally {
      setIsGeneratingPayload(false)
    }
  }, [tonConnectUI])

  // Auto-generate payload on mount
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true
      generatePayload()
    }
  }, [generatePayload])

  // Track wallet connection changes
  useEffect(() => {
    const prevWallet = prevWalletRef.current

    if (!prevWallet && wallet) {
      // Connected
      const response = {
        account: wallet.account,
        device: wallet.device,
        connectItems: wallet.connectItems
      }
      setLastWalletResponse(response)

      if (expectingProofRef.current) {
        // Connected with proof expected
        addEvent('connected', wallet.device.appName, wallet.account.address)
        expectingProofRef.current = false
      } else {
        // Simple connect
        addEvent('connected', wallet.device.appName, wallet.account.address)
      }
      setIsConnecting(false)
    } else if (prevWallet && !wallet) {
      // Disconnected
      addEvent('disconnected')
      setLastWalletResponse(null)
      // Clear TonProof-related state and regenerate payload for next connection
      setVerifyResult(null)
      setAccountResult(null)
      generatePayload()
    } else if (prevWallet && wallet && prevWallet.account.address !== wallet.account.address) {
      // Reconnected to different wallet
      const response = {
        account: wallet.account,
        device: wallet.device,
        connectItems: wallet.connectItems
      }
      setLastWalletResponse(response)
      addEvent('reconnected', wallet.device.appName, wallet.account.address)
      // Clear TonProof-related state on reconnect
      setVerifyResult(null)
      setAccountResult(null)
    }

    prevWalletRef.current = wallet
  }, [wallet, addEvent, generatePayload])

  // ========== SIMPLE CONNECT ==========

  const connect = useCallback(async () => {
    if (wallet) {
      toast.error('Already connected')
      return
    }

    setIsConnecting(true)

    // Clear proof expectation for simple connect
    tonConnectUI.setConnectRequestParameters(null)
    expectingProofRef.current = false

    try {
      await tonConnectUI.openModal()
    } catch (error) {
      setIsConnecting(false)
      toast.error(error instanceof Error ? error.message : 'Connection failed')
    }
  }, [tonConnectUI, wallet])

  // ========== STEP 2: Connect with Proof ==========

  const connectWithProof = useCallback(async () => {
    if (wallet) {
      toast.error('Disconnect first')
      return
    }

    if (!payloadResult || payloadResult.status !== 'success') {
      toast.error('Generate payload first')
      return
    }

    setIsConnecting(true)
    expectingProofRef.current = true

    // Ensure payload is set
    const payloadResponse = payloadResult.response as { payloadTokenHash?: string }
    if (payloadResponse?.payloadTokenHash) {
      tonConnectUI.setConnectRequestParameters({
        state: 'ready',
        value: { tonProof: payloadResponse.payloadTokenHash }
      })
    }

    try {
      await tonConnectUI.openModal()
    } catch (error) {
      setIsConnecting(false)
      expectingProofRef.current = false
      toast.error(error instanceof Error ? error.message : 'Connection failed')
    }
  }, [tonConnectUI, wallet, payloadResult])

  // ========== DISCONNECT ==========

  const disconnect = useCallback(async () => {
    if (!wallet) {
      toast.error('Not connected')
      return
    }

    try {
      await tonConnectUI.disconnect()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Disconnect failed')
    }
  }, [tonConnectUI, wallet])

  // ========== STEP 3: Verify Proof ==========

  const verifyProof = useCallback(async () => {
    if (!wallet) {
      toast.error('Not connected')
      return
    }

    const tonProof = wallet.connectItems?.tonProof
    if (!tonProof || 'error' in tonProof) {
      toast.error('No valid proof')
      return
    }

    if (!payloadTokenRef.current) {
      toast.error('No payload token - regenerate payload and reconnect')
      return
    }

    setIsVerifying(true)
    setAccountResult(null)

    const requestBody = {
      address: wallet.account.address,
      network: wallet.account.chain,
      public_key: wallet.account.publicKey,
      proof: {
        ...tonProof.proof,
        state_init: wallet.account.walletStateInit
      },
      payloadToken: payloadTokenRef.current
    }

    const request = {
      method: 'POST',
      url: '/api/check_proof',
      body: requestBody
    }

    try {
      const response = await fetch('/api/check_proof', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })

      const data = await response.json()

      // New response format: { valid, checks, token?, error? }
      if (data.valid) {
        setVerifyResult({
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          status: 'success',
          request,
          response: data
        })
        payloadTokenRef.current = null
        toast.success('Proof verified!')
      } else {
        setVerifyResult({
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          status: 'error',
          request,
          response: data,
          error: data.error || 'Verification failed'
        })
        toast.error(data.error || 'Verification failed')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Verification failed'
      setVerifyResult({
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        status: 'error',
        request,
        error: message
      })
      toast.error(message)
    } finally {
      setIsVerifying(false)
    }
  }, [wallet])

  // ========== STEP 4: Get Account Info ==========

  const getAccountInfo = useCallback(async () => {
    if (!verifyResult || verifyResult.status !== 'success') {
      toast.error('Verify proof first')
      return
    }

    const token = (verifyResult.response as { token?: string })?.token
    if (!token) {
      toast.error('No auth token')
      return
    }

    setIsFetchingAccount(true)

    const request = {
      method: 'GET',
      url: '/api/get_account_info',
      headers: { Authorization: 'Bearer <token>' }
    }

    try {
      const response = await fetch('/api/get_account_info', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch account')
      }

      setAccountResult({
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        status: 'success',
        request,
        response: data
      })

      toast.success('Account info fetched')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch account'
      setAccountResult({
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        status: 'error',
        request,
        error: message
      })
      toast.error(message)
    } finally {
      setIsFetchingAccount(false)
    }
  }, [verifyResult])

  // ========== RESET ==========

  const resetTonProof = useCallback(() => {
    setVerifyResult(null)
    setAccountResult(null)
    payloadTokenRef.current = null
    // Regenerate payload
    generatePayload()
  }, [generatePayload])

  // Computed flags
  const canConnect = !wallet && !isConnecting
  const canDisconnect = !!wallet
  const canConnectWithProof = !wallet && !isConnecting && hasPayload
  const canVerify = isConnected && hasProof && !isAuthenticated && !isVerifying
  const canGetAccount = isAuthenticated && !isFetchingAccount

  return {
    // Wallet
    wallet,
    isConnected,
    hasProof,
    isAuthenticated,

    // Events
    events,
    lastWalletResponse,

    // Loading states
    isGeneratingPayload,
    isConnecting,
    isVerifying,
    isFetchingAccount,

    // Actions
    connect,
    disconnect,
    generatePayload,
    connectWithProof,
    verifyProof,
    getAccountInfo,
    resetTonProof,

    // Step results
    payloadResult,
    verifyResult,
    accountResult,

    // Flags
    canConnect,
    canDisconnect,
    canConnectWithProof,
    canVerify,
    canGetAccount
  }
}
