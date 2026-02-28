import { useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useSettingsContext } from "@/context/SettingsContext"
import { useTonConnectUI, useTonWallet } from "@tonconnect/ui-react"

function getNetworkLabel(chain: string): string {
  switch (chain) {
    case "-239": return "Mainnet"
    case "-3": return "Testnet"
    default: return chain
  }
}

export function NetworkPicker() {
  const { selectedNetwork, setSelectedNetwork } = useSettingsContext()
  const [tonConnectUI] = useTonConnectUI()
  const wallet = useTonWallet()

  const isConnected = !!wallet
  const walletNetwork = wallet?.account?.chain

  // Sync selected network with TonConnect SDK (only when not connected)
  useEffect(() => {
    if (!isConnected) {
      const chainId = selectedNetwork || undefined
      tonConnectUI.setConnectionNetwork(chainId)
    }
  }, [selectedNetwork, tonConnectUI, isConnected])

  // When connected, show wallet's network
  // When not connected, show selected network or "any"
  const displayValue = isConnected && walletNetwork ? walletNetwork : (selectedNetwork || "any")
  const handleChange = (v: string) => setSelectedNetwork(v === "any" ? "" : v)

  return (
    <div className="space-y-2">
      <Label htmlFor="network">Network</Label>
      <Select
        value={displayValue}
        onValueChange={handleChange}
        disabled={isConnected}
      >
        <SelectTrigger id="network">
          <SelectValue>
            {isConnected && walletNetwork
              ? `${getNetworkLabel(walletNetwork)} (connected)`
              : displayValue === "any"
                ? "Any Network"
                : getNetworkLabel(displayValue)
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="any">Any Network</SelectItem>
          <SelectItem value="-239">Mainnet</SelectItem>
          <SelectItem value="-3">Testnet</SelectItem>
        </SelectContent>
      </Select>
      {isConnected && (
        <p className="text-xs text-muted-foreground">
          Network is determined by connected wallet
        </p>
      )}
    </div>
  )
}
