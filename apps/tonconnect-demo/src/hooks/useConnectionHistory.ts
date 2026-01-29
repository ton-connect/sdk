import { useState, useEffect, useCallback } from "react"
import type { ConnectionOperation } from "@/types/connection-events"
import { CONNECTION_HISTORY_KEY, MAX_OPERATIONS } from "@/types/connection-events"

function loadFromStorage(): ConnectionOperation[] {
  try {
    const data = localStorage.getItem(CONNECTION_HISTORY_KEY)
    if (data) {
      return JSON.parse(data)
    }
  } catch {
    // Invalid or missing data
  }
  return []
}

function saveToStorage(operations: ConnectionOperation[]) {
  try {
    localStorage.setItem(CONNECTION_HISTORY_KEY, JSON.stringify(operations))
  } catch {
    // Storage full - try to trim
    const trimmed = operations.slice(0, 20)
    try {
      localStorage.setItem(CONNECTION_HISTORY_KEY, JSON.stringify(trimmed))
    } catch {
      // Give up
    }
  }
}

export function useConnectionHistory() {
  const [operations, setOperations] = useState<ConnectionOperation[]>(() => loadFromStorage())

  // Persist on change
  useEffect(() => {
    saveToStorage(operations)
  }, [operations])

  // Add operation
  const addOperation = useCallback((op: Omit<ConnectionOperation, 'id'>) => {
    const newOp: ConnectionOperation = { ...op, id: crypto.randomUUID() }
    setOperations(prev => [newOp, ...prev].slice(0, MAX_OPERATIONS))
    return newOp.id
  }, [])

  // Delete operation
  const deleteOperation = useCallback((id: string) => {
    setOperations(prev => prev.filter(o => o.id !== id))
  }, [])

  // Clear all
  const clearAll = useCallback(() => {
    setOperations([])
  }, [])

  return {
    operations,
    addOperation,
    deleteOperation,
    clearAll
  }
}
