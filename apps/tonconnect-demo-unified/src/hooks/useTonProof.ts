import { useState, useCallback, useEffect, useRef } from "react"
import { useTonConnectUI, useTonWallet } from "@tonconnect/ui-react"
import { toast } from "sonner"

type Status = 'idle' | 'generating' | 'connecting' | 'verifying' | 'authenticated' | 'error'

interface TonProofState {
  status: Status
  authToken: string | null
  accountInfo: Record<string, unknown> | null
  error: string | null
  requestJson: string | null
  responseJson: string | null
}

export function useTonProof() {
  const [tonConnectUI] = useTonConnectUI()
  const wallet = useTonWallet()
  const payloadTokenRef = useRef<string | null>(null)

  const [state, setState] = useState<TonProofState>({
    status: 'idle',
    authToken: null,
    accountInfo: null,
    error: null,
    requestJson: null,
    responseJson: null
  })

  // Generate payload and prepare for connection
  const generatePayload = useCallback(async () => {
    setState(prev => ({
      ...prev,
      status: 'generating',
      error: null,
      requestJson: null,
      responseJson: null
    }))

    try {
      const response = await fetch('/api/generate_payload', { method: 'POST' })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate payload')
      }

      setState(prev => ({
        ...prev,
        responseJson: JSON.stringify(data, null, 2)
      }))

      // Store payload token for later verification
      payloadTokenRef.current = data.payloadToken

      // Set tonProof payload for connection
      tonConnectUI.setConnectRequestParameters({
        state: 'ready',
        value: { tonProof: data.payloadTokenHash }
      })

      setState(prev => ({ ...prev, status: 'connecting' }))
      toast.info('Connect your wallet to authenticate')

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate payload'
      setState(prev => ({ ...prev, status: 'error', error: message }))
      toast.error(message)
    }
  }, [tonConnectUI])

  // Verify proof when wallet connects with proof
  useEffect(() => {
    const tonProof = wallet?.connectItems?.tonProof
    if (!tonProof) return
    if (state.status !== 'connecting') return
    if (!payloadTokenRef.current) return

    const verifyProof = async () => {
      setState(prev => ({ ...prev, status: 'verifying' }))

      try {
        if ('error' in tonProof) {
          throw new Error(tonProof.error.message)
        }

        const requestBody = {
          address: wallet.account.address,
          network: wallet.account.chain,
          public_key: wallet.account.publicKey,
          proof: tonProof.proof,
          payloadToken: payloadTokenRef.current
        }

        setState(prev => ({
          ...prev,
          requestJson: JSON.stringify(requestBody, null, 2)
        }))

        const response = await fetch('/api/check_proof', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        })

        const data = await response.json()

        setState(prev => ({
          ...prev,
          responseJson: JSON.stringify(data, null, 2)
        }))

        if (!response.ok) {
          throw new Error(data.error || 'Proof verification failed')
        }

        setState(prev => ({
          ...prev,
          status: 'authenticated',
          authToken: data.token
        }))

        payloadTokenRef.current = null
        toast.success('Authentication successful!')

      } catch (error) {
        const message = error instanceof Error ? error.message : 'Verification failed'
        setState(prev => ({ ...prev, status: 'error', error: message }))
        toast.error(message)
      }
    }

    verifyProof()
  }, [wallet, state.status])

  // Fetch account info using auth token
  const fetchAccountInfo = useCallback(async () => {
    if (!state.authToken) {
      toast.error('Not authenticated')
      return
    }

    try {
      const response = await fetch('/api/get_account_info', {
        headers: { 'Authorization': `Bearer ${state.authToken}` }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch account info')
      }

      setState(prev => ({
        ...prev,
        accountInfo: data,
        responseJson: JSON.stringify(data, null, 2)
      }))
      toast.success('Account info fetched')

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch account'
      toast.error(message)
    }
  }, [state.authToken])

  // Reset state
  const reset = useCallback(() => {
    setState({
      status: 'idle',
      authToken: null,
      accountInfo: null,
      error: null,
      requestJson: null,
      responseJson: null
    })
    payloadTokenRef.current = null
    tonConnectUI.setConnectRequestParameters({ state: 'loading' })
  }, [tonConnectUI])

  return {
    ...state,
    isAuthenticated: state.status === 'authenticated',
    isLoading: ['generating', 'connecting', 'verifying'].includes(state.status),
    generatePayload,
    fetchAccountInfo,
    reset
  }
}
