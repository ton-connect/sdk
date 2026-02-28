// Formatters for connection operations log

import type { Feature } from "@tonconnect/sdk"

// ============ FEATURES FORMATTER ============

/**
 * Deduplicate and format wallet features for display
 * Converts raw SDK features to human-readable format like "SendTx(4)" or "SignData(text,bin,cell)"
 */
export function processFeatures(features: Feature[]): string[] {
  const seen = new Map<string, string>()

  for (const feature of features) {
    if (typeof feature === 'string') {
      if (!seen.has(feature)) {
        seen.set(feature, feature)
      }
    } else {
      const f = feature as { name: string; maxMessages?: number; extraCurrencySupported?: boolean; types?: string[] }
      let formatted = f.name

      if (f.name === 'SendTransaction') {
        const details: string[] = []
        if (f.maxMessages) details.push(`${f.maxMessages}`)
        if (f.extraCurrencySupported) details.push('extra')
        formatted = details.length > 0 ? `SendTx(${details.join(',')})` : 'SendTx'
      } else if (f.name === 'SignData' && f.types) {
        const types = f.types.map(t => t === 'binary' ? 'bin' : t)
        formatted = `SignData(${types.join(',')})`
      }

      seen.set(f.name, formatted)
    }
  }

  return Array.from(seen.values())
}

// ============ TIME FORMATTERS ============

export function formatOperationTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

export function formatRelativeTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp

  if (diff < 60000) return 'just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`

  return new Date(timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })
}

// ============ ADDRESS FORMATTERS ============

export function formatAddress(address: string, prefixLen = 6, suffixLen = 4): string {
  if (!address) return ''
  if (address.length <= prefixLen + suffixLen + 3) return address
  return `${address.slice(0, prefixLen)}...${address.slice(-suffixLen)}`
}

// ============ CHAIN/NETWORK FORMATTERS ============

export function formatChainName(chain: string): string {
  const chains: Record<string, string> = {
    '-239': 'Mainnet',
    '-3': 'Testnet'
  }
  return chains[chain] || `Chain ${chain}`
}

export function formatChainShort(chain: string): string {
  return chain === '-239' ? 'mainnet' : chain === '-3' ? 'testnet' : chain
}

export function isTestnet(chain: string): boolean {
  return chain === '-3'
}

// ============ DEVICE FORMATTERS ============

export function formatPlatformName(platform: string): string {
  const platforms: Record<string, string> = {
    'iphone': 'iOS',
    'ipad': 'iOS',
    'android': 'Android',
    'windows': 'Windows',
    'mac': 'macOS',
    'linux': 'Linux',
    'browser': 'Browser'
  }
  return platforms[platform] || platform
}

export function formatProvider(provider: 'http' | 'injected'): string {
  return provider === 'injected' ? 'Extension' : 'Bridge'
}

// ============ PROOF TIMESTAMP ============

export function formatProofTimestamp(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// ============ ITEMS FORMATTER ============

export function formatItems(items: string[]): string {
  return items.map(item => {
    if (item === 'ton_addr') return 'ton_addr'
    if (item === 'ton_proof') return 'ton_proof'
    return item
  }).join(', ')
}
