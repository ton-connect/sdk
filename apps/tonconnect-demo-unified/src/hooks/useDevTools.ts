import { useState, useCallback, useEffect } from 'react'

const STORAGE_KEYS = {
  QA_MODE: 'devtools:qa-mode',
  ERUDA: 'devtools:eruda',
  RPC_LOGS: 'devtools:rpc-logs',
  DOCS_HIDDEN: 'devtools:docs-hidden',
  UNLOCKED: 'devtools:unlocked',
} as const

export function useDevTools() {
  // DevTools visibility (persisted in localStorage)
  const [isUnlocked, setIsUnlockedState] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.UNLOCKED) === 'true'
  })

  // QA Mode state (read from localStorage, set triggers reload)
  const [qaMode] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.QA_MODE) === 'true'
  })

  // Eruda state
  const [erudaEnabled, setErudaEnabledState] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.ERUDA) === 'true'
  })

  // RPC Logs state
  const [rpcLogsEnabled, setRpcLogsEnabledState] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.RPC_LOGS) === 'true'
  })

  // Docs hidden state
  const [docsHidden, setDocsHiddenState] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.DOCS_HIDDEN) === 'true'
  })

  // Unlock DevTools (called from secret tap)
  const unlockDevTools = useCallback(() => {
    localStorage.setItem(STORAGE_KEYS.UNLOCKED, 'true')
    setIsUnlockedState(true)
  }, [])

  // Lock DevTools (hide the tab)
  const lockDevTools = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.UNLOCKED)
    setIsUnlockedState(false)
  }, [])

  // Set QA Mode (triggers page reload)
  const setQaMode = useCallback((enabled: boolean) => {
    if (enabled) {
      localStorage.setItem(STORAGE_KEYS.QA_MODE, 'true')
    } else {
      localStorage.removeItem(STORAGE_KEYS.QA_MODE)
    }
    // Reload is required for QA Mode to take effect
    window.location.reload()
  }, [])

  // Set Eruda (dynamic load/destroy)
  const setErudaEnabled = useCallback(async (enabled: boolean) => {
    if (enabled) {
      localStorage.setItem(STORAGE_KEYS.ERUDA, 'true')
      const eruda = await import('eruda')
      eruda.default.init()
    } else {
      localStorage.removeItem(STORAGE_KEYS.ERUDA)
      const eruda = await import('eruda')
      eruda.default.destroy()
    }
    setErudaEnabledState(enabled)
  }, [])

  // Set RPC Logs
  const setRpcLogsEnabled = useCallback((enabled: boolean) => {
    if (enabled) {
      localStorage.setItem(STORAGE_KEYS.RPC_LOGS, 'true')
    } else {
      localStorage.removeItem(STORAGE_KEYS.RPC_LOGS)
    }
    setRpcLogsEnabledState(enabled)
  }, [])

  // Set Docs Hidden
  const setDocsHidden = useCallback((hidden: boolean) => {
    if (hidden) {
      localStorage.setItem(STORAGE_KEYS.DOCS_HIDDEN, 'true')
    } else {
      localStorage.removeItem(STORAGE_KEYS.DOCS_HIDDEN)
    }
    setDocsHiddenState(hidden)
  }, [])

  // Initialize eruda on mount if enabled
  useEffect(() => {
    if (erudaEnabled) {
      import('eruda').then(eruda => eruda.default.init())
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Reset all DevTools settings
  const resetAll = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.QA_MODE)
    localStorage.removeItem(STORAGE_KEYS.ERUDA)
    localStorage.removeItem(STORAGE_KEYS.RPC_LOGS)
    localStorage.removeItem(STORAGE_KEYS.DOCS_HIDDEN)
    localStorage.removeItem(STORAGE_KEYS.UNLOCKED)
    window.location.reload()
  }, [])

  return {
    isUnlocked,
    unlockDevTools,
    lockDevTools,
    qaMode,
    setQaMode,
    erudaEnabled,
    setErudaEnabled,
    rpcLogsEnabled,
    setRpcLogsEnabled,
    docsHidden,
    setDocsHidden,
    resetAll,
  }
}
