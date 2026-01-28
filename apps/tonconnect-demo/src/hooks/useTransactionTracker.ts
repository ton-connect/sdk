import { useState, useEffect, useCallback } from "react"
import { getNormalizedExtMessageHash } from "@/utils/transaction-utils"

export interface TransactionDetails {
  lt: string
  hash: string
  fee: string
  timestamp: number
}

export type TransactionStatus = "idle" | "pending" | "confirmed" | "expired"

interface UseTransactionTrackerOptions {
  boc: string | null
  validUntil: number // Unix timestamp
  network: "mainnet" | "testnet"
}

export function useTransactionTracker({ boc, validUntil, network }: UseTransactionTrackerOptions) {
  const [status, setStatus] = useState<TransactionStatus>("idle")
  const [transaction, setTransaction] = useState<TransactionDetails | null>(null)
  const [hash, setHash] = useState<string | null>(null)
  const [remainingTime, setRemainingTime] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)

  // Reset state when boc changes
  useEffect(() => {
    if (boc) {
      setStatus("pending")
      setTransaction(null)
      setError(null)
      try {
        const normalizedHash = getNormalizedExtMessageHash(boc)
        setHash(normalizedHash)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to calculate hash")
        setStatus("idle")
      }
    } else {
      setStatus("idle")
      setHash(null)
      setTransaction(null)
    }
  }, [boc])

  // Countdown timer
  useEffect(() => {
    if (!boc || status !== "pending") return

    const updateRemaining = () => {
      const remaining = validUntil - Math.floor(Date.now() / 1000)
      setRemainingTime(Math.max(0, remaining))

      if (remaining <= 0) {
        setStatus("expired")
      }
    }

    updateRemaining()
    const interval = setInterval(updateRemaining, 1000)

    return () => clearInterval(interval)
  }, [boc, validUntil, status])

  // Polling for transaction confirmation
  useEffect(() => {
    if (!hash || status !== "pending") return

    const endpoint = network === "testnet"
      ? "https://testnet.toncenter.com/api/v3"
      : "https://toncenter.com/api/v3"

    const poll = async () => {
      if (Date.now() / 1000 > validUntil) {
        setStatus("expired")
        return
      }

      try {
        const response = await fetch(
          `${endpoint}/transactionsByMessage?msg_hash=${hash}&direction=in`
        )
        const data = await response.json()

        if (data.transactions?.length > 0) {
          const tx = data.transactions[0]
          setTransaction({
            lt: tx.lt,
            hash: tx.hash,
            fee: tx.total_fees,
            timestamp: tx.now,
          })
          setStatus("confirmed")
        }
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Network error")
      }
    }

    poll()
    const pollInterval = setInterval(poll, 3000)

    return () => clearInterval(pollInterval)
  }, [hash, validUntil, network, status])

  const reset = useCallback(() => {
    setStatus("idle")
    setHash(null)
    setTransaction(null)
    setError(null)
    setRemainingTime(0)
  }, [])

  // Format time as M:SS
  const formattedTime = `${Math.floor(remainingTime / 60)}:${(remainingTime % 60).toString().padStart(2, "0")}`

  return {
    hash,
    status,
    transaction,
    remainingTime,
    formattedTime,
    error,
    reset,
  }
}
