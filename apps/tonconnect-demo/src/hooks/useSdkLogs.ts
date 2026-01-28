import { useState, useEffect, useCallback, useRef } from 'react'

export type RpcLogStatus = 'pending' | 'success' | 'error'
export type RpcProvider = 'bridge' | 'injected' | 'unknown'

export interface RpcLogEntry {
  id: string
  method: string
  provider: RpcProvider
  requestTimestamp: number
  request: object
  response?: object
  responseTimestamp?: number
  status: RpcLogStatus
}

// SDK log format: console.debug('[TON_CONNECT_SDK]', message, data)
const SDK_PREFIX = '[TON_CONNECT_SDK]'
const REQUEST_PATTERN = /Send ([\w-]+) request:/i  // space before "request"
const RESPONSE_PATTERN = /Wallet message received:/i

/**
 * Hook for intercepting SDK console.debug logs and collecting RPC request/response pairs.
 * Only active when enabled.
 */
export function useSdkLogs(enabled: boolean) {
  const [logs, setLogs] = useState<RpcLogEntry[]>([])
  const originalDebugRef = useRef<typeof console.debug | null>(null)

  // Use ref for handler to avoid re-creating interceptor on every render
  const handleSdkLogRef = useRef<(message: string, data: unknown) => void>(() => {})

  // Parse provider from log message
  const parseProvider = useCallback((message: string): RpcProvider => {
    const lower = message.toLowerCase()
    if (lower.includes('http-bridge')) return 'bridge'
    if (lower.includes('injected')) return 'injected'
    return 'unknown'
  }, [])

  // Extract method name from request object
  const extractMethod = useCallback((request: Record<string, unknown>): string => {
    if (typeof request.method === 'string') return request.method
    return 'unknown'
  }, [])

  // Update handler ref when dependencies change
  useEffect(() => {
    handleSdkLogRef.current = (message: string, data: unknown) => {
      const timestamp = Date.now()

      // Check for request
      const requestMatch = message.match(REQUEST_PATTERN)
      if (requestMatch && data && typeof data === 'object') {
        const requestData = data as Record<string, unknown>
        const id = String(requestData.id ?? timestamp)
        const method = extractMethod(requestData)
        const provider = parseProvider(message)

        setLogs(prev => [{
          id,
          method,
          provider,
          requestTimestamp: timestamp,
          request: requestData,
          status: 'pending',
        }, ...prev])
        return
      }

      // Check for response
      if (RESPONSE_PATTERN.test(message) && data && typeof data === 'object') {
        const responseData = data as Record<string, unknown>
        const responseId = String(responseData.id ?? '')

        if (!responseId) return

        setLogs(prev => prev.map(entry => {
          if (entry.id === responseId && entry.status === 'pending') {
            const hasError = 'error' in responseData
            return {
              ...entry,
              response: responseData,
              responseTimestamp: timestamp,
              status: hasError ? 'error' : 'success',
            }
          }
          return entry
        }))
      }
    }
  }, [extractMethod, parseProvider])

  // Setup console.debug interception - only depends on enabled
  useEffect(() => {
    if (!enabled) return

    // Store original
    originalDebugRef.current = console.debug

    // Create interceptor
    console.debug = (...args: unknown[]) => {
      // Always call original
      originalDebugRef.current?.apply(console, args)

      // SDK format: console.debug('[TON_CONNECT_SDK]', message, data)
      // args[0] = '[TON_CONNECT_SDK]'
      // args[1] = 'Send http-bridge request:' (message)
      // args[2] = { method, params, id } (data)
      if (args.length >= 3 && args[0] === SDK_PREFIX && typeof args[1] === 'string') {
        handleSdkLogRef.current(args[1], args[2])
      }
    }

    // Cleanup
    return () => {
      if (originalDebugRef.current) {
        console.debug = originalDebugRef.current
        originalDebugRef.current = null
      }
    }
  }, [enabled])

  // Clear logs
  const clearLogs = useCallback(() => {
    setLogs([])
  }, [])

  return { logs, clearLogs }
}
