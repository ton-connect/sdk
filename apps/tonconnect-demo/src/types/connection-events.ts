// Connection operation types for the operations log

import type { Feature } from "@tonconnect/sdk"

export type ConnectionOperationType = 'connect' | 'disconnect' | 'restore_session'

// What dApp requested
export interface ConnectionRequest {
  items: ('ton_addr' | 'ton_proof')[]
  payload?: string  // Challenge for TonProof
}

// Wallet account snapshot
export interface AccountSnapshot {
  address: string
  chain: string  // '-239' (mainnet) | '-3' (testnet)
  publicKey?: string
  walletStateInit?: string
}

// Wallet device snapshot
export interface DeviceSnapshot {
  appName: string
  appVersion: string
  platform: string
  features: Feature[]  // Raw SDK features, formatted at display time
}

// TonProof data from wallet
export interface TonProofSnapshot {
  timestamp: number
  domain: string
  payload: string
  signature: string
}

// What wallet returned
export interface ConnectionResponse {
  success: boolean
  wallet?: {
    account: AccountSnapshot
    device: DeviceSnapshot
    provider: 'http' | 'injected'
    tonProof?: TonProofSnapshot
  }
  error?: {
    code: number
    message: string
  }
}

// Full connection operation
export interface ConnectionOperation {
  id: string
  timestamp: number
  type: ConnectionOperationType

  // Request/Response pair
  request: ConnectionRequest | null
  response: ConnectionResponse | null

  // For disconnect
  initiator?: 'dapp' | 'wallet'
  previousAddress?: string
  previousWalletName?: string

  // Raw data for JsonViewer
  rawRequest?: unknown
  rawResponse?: unknown
}

// Storage constants
export const CONNECTION_HISTORY_KEY = 'tc-demo-connection-history'
export const MAX_OPERATIONS = 50
