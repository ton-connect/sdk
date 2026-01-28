import { useState, useEffect, useCallback } from "react"

const HISTORY_KEY = "tc-demo-history"
const MAX_ENTRIES_PER_WALLET = 20

export interface HistoryEntry {
  id: string
  timestamp: number
  walletAddress: string
  network: "mainnet" | "testnet"
  request: Record<string, unknown>
  requestRaw: string
  status: "success" | "error" | "confirmed" | "expired"
  response?: Record<string, unknown>
  boc?: string
}

interface HistoryStore {
  entries: Record<string, HistoryEntry[]>
}

function loadFromStorage(): HistoryStore {
  try {
    const data = localStorage.getItem(HISTORY_KEY)
    if (data) {
      return JSON.parse(data)
    }
  } catch {
    // Invalid data - start fresh
  }
  return { entries: {} }
}

function saveToStorage(store: HistoryStore) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(store))
  } catch {
    // Storage full or unavailable
  }
}

export function useHistory() {
  const [store, setStore] = useState<HistoryStore>(() => loadFromStorage())

  // Save to localStorage when store changes
  useEffect(() => {
    saveToStorage(store)
  }, [store])

  const addEntry = useCallback((entry: Omit<HistoryEntry, "id">): string => {
    const id = crypto.randomUUID()
    const newEntry: HistoryEntry = { ...entry, id }

    setStore(prev => {
      const wallet = entry.walletAddress
      const walletEntries = prev.entries[wallet] || []

      // Add new entry at the beginning, limit to MAX_ENTRIES_PER_WALLET
      const updatedEntries = [newEntry, ...walletEntries].slice(0, MAX_ENTRIES_PER_WALLET)

      return {
        ...prev,
        entries: {
          ...prev.entries,
          [wallet]: updatedEntries,
        },
      }
    })

    return id
  }, [])

  const updateEntry = useCallback((id: string, updates: Partial<HistoryEntry>) => {
    setStore(prev => {
      const newEntries = { ...prev.entries }

      for (const wallet of Object.keys(newEntries)) {
        const idx = newEntries[wallet].findIndex(e => e.id === id)
        if (idx !== -1) {
          newEntries[wallet] = [...newEntries[wallet]]
          newEntries[wallet][idx] = { ...newEntries[wallet][idx], ...updates }
          break
        }
      }

      return { ...prev, entries: newEntries }
    })
  }, [])

  const getByWallet = useCallback((walletAddress: string): HistoryEntry[] => {
    return store.entries[walletAddress] || []
  }, [store.entries])

  const clearWallet = useCallback((walletAddress: string) => {
    setStore(prev => {
      const { [walletAddress]: _, ...rest } = prev.entries
      return { entries: rest }
    })
  }, [])

  const deleteEntry = useCallback((id: string) => {
    setStore(prev => {
      const newEntries = { ...prev.entries }
      for (const wallet of Object.keys(newEntries)) {
        const filtered = newEntries[wallet].filter(e => e.id !== id)
        if (filtered.length !== newEntries[wallet].length) {
          newEntries[wallet] = filtered
          break
        }
      }
      return { entries: newEntries }
    })
  }, [])

  const clearAll = useCallback(() => {
    setStore({ entries: {} })
  }, [])

  return {
    addEntry,
    updateEntry,
    getByWallet,
    clearWallet,
    deleteEntry,
    clearAll,
  }
}
