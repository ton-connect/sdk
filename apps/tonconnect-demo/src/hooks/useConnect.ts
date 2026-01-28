import { useState, useCallback, useRef, useEffect } from "react"
import { useTonConnectUI, useTonWallet } from "@tonconnect/ui-react"
import type { Wallet } from "@tonconnect/ui-react"
import { toast } from "sonner"
import { useConnectionHistory } from "./useConnectionHistory"
import type { ConnectionRequest, ConnectionResponse, ConnectionOperation } from "@/types/connection-events"

// Step result for tracking request/response
export interface StepResult {
  id: string
  timestamp: number
  status: 'success' | 'error'
  request?: unknown
  response?: unknown
  error?: string
}

// Re-export ConnectionOperation for external use
export type { ConnectionOperation }

export function useConnect() {
  const [tonConnectUI] = useTonConnectUI()
  const wallet = useTonWallet()

  // Connection history (persisted to localStorage)
  const connectionHistory = useConnectionHistory()

  // Refs
  const payloadTokenRef = useRef<string | null>(null)
  const expectingProofRef = useRef(false)
  const prevWalletRef = useRef<Wallet | null>(null)
  const initializedRef = useRef(false)
  const lastRequestRef = useRef<ConnectionRequest | null>(null)
  const disconnectInitiatorRef = useRef<'dapp' | 'wallet'>('wallet')

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

  // Extract wallet snapshot for operation log
  const extractWalletSnapshot = useCallback((w: Wallet): ConnectionResponse['wallet'] => {
    const tonProof = w.connectItems?.tonProof
    const hasProofData = tonProof && !('error' in tonProof)
    const proofData = hasProofData ? tonProof.proof : null

    return {
      account: {
        address: w.account.address,
        chain: w.account.chain,
        publicKey: w.account.publicKey,
        walletStateInit: w.account.walletStateInit
      },
      device: {
        appName: w.device.appName,
        appVersion: w.device.appVersion,
        platform: w.device.platform,
        features: w.device.features || []  // Preserve raw features, format at display time
      },
      provider: w.provider as 'http' | 'injected',
      tonProof: proofData ? {
        timestamp: proofData.timestamp,
        domain: proofData.domain.value,
        payload: proofData.payload,
        signature: proofData.signature
      } : undefined
    }
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
      // Connected - log the operation with request/response
      const rawResponse = {
        account: wallet.account,
        device: wallet.device,
        connectItems: wallet.connectItems,
        provider: wallet.provider
      }
      setLastWalletResponse(rawResponse)

      connectionHistory.addOperation({
        timestamp: Date.now(),
        type: 'connect',
        request: lastRequestRef.current,
        response: {
          success: true,
          wallet: extractWalletSnapshot(wallet)
        },
        rawRequest: lastRequestRef.current,
        rawResponse
      })

      expectingProofRef.current = false
      lastRequestRef.current = null
      setIsConnecting(false)
    } else if (prevWallet && !wallet) {
      // Disconnected - log with previous wallet info
      connectionHistory.addOperation({
        timestamp: Date.now(),
        type: 'disconnect',
        request: null,
        response: null,
        initiator: disconnectInitiatorRef.current,
        previousAddress: prevWallet.account.address,
        previousWalletName: prevWallet.device.appName
      })

      disconnectInitiatorRef.current = 'wallet' // Reset to default
      setLastWalletResponse(null)
      // Clear TonProof-related state and regenerate payload for next connection
      setVerifyResult(null)
      setAccountResult(null)
      generatePayload()
    } else if (prevWallet && wallet && prevWallet.account.address !== wallet.account.address) {
      // Reconnected to different wallet
      const rawResponse = {
        account: wallet.account,
        device: wallet.device,
        connectItems: wallet.connectItems,
        provider: wallet.provider
      }
      setLastWalletResponse(rawResponse)

      connectionHistory.addOperation({
        timestamp: Date.now(),
        type: 'connect',
        request: lastRequestRef.current,
        response: {
          success: true,
          wallet: extractWalletSnapshot(wallet)
        },
        rawRequest: lastRequestRef.current,
        rawResponse
      })

      lastRequestRef.current = null
      // Clear TonProof-related state on reconnect
      setVerifyResult(null)
      setAccountResult(null)
    }

    prevWalletRef.current = wallet
  }, [wallet, generatePayload, connectionHistory, extractWalletSnapshot])

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

    // Save request for operation log
    lastRequestRef.current = {
      items: ['ton_addr']
    }

    try {
      await tonConnectUI.openModal()
    } catch (error) {
      setIsConnecting(false)
      // Log failed connection attempt
      connectionHistory.addOperation({
        timestamp: Date.now(),
        type: 'connect',
        request: lastRequestRef.current,
        response: {
          success: false,
          error: {
            code: 0,
            message: error instanceof Error ? error.message : 'Connection failed'
          }
        },
        rawRequest: lastRequestRef.current
      })
      lastRequestRef.current = null
      toast.error(error instanceof Error ? error.message : 'Connection failed')
    }
  }, [tonConnectUI, wallet, connectionHistory])

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

    // Save request for operation log
    lastRequestRef.current = {
      items: ['ton_addr', 'ton_proof'],
      payload: payloadResponse?.payloadTokenHash
    }

    try {
      await tonConnectUI.openModal()
    } catch (error) {
      setIsConnecting(false)
      expectingProofRef.current = false
      // Log failed connection attempt
      connectionHistory.addOperation({
        timestamp: Date.now(),
        type: 'connect',
        request: lastRequestRef.current,
        response: {
          success: false,
          error: {
            code: 0,
            message: error instanceof Error ? error.message : 'Connection failed'
          }
        },
        rawRequest: lastRequestRef.current
      })
      lastRequestRef.current = null
      toast.error(error instanceof Error ? error.message : 'Connection failed')
    }
  }, [tonConnectUI, wallet, payloadResult, connectionHistory])

  // ========== DISCONNECT ==========

  const disconnect = useCallback(async () => {
    if (!wallet) {
      toast.error('Not connected')
      return
    }

    // Mark that dApp initiated the disconnect
    disconnectInitiatorRef.current = 'dapp'

    try {
      await tonConnectUI.disconnect()
    } catch (error) {
      disconnectInitiatorRef.current = 'wallet' // Reset on error
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

    // Connection operations log
    operations: connectionHistory.operations,
    clearOperations: connectionHistory.clearAll,
    deleteOperation: connectionHistory.deleteOperation,
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
