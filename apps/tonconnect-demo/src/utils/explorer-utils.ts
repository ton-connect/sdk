export function getExplorerUrl(hash: string, network: "mainnet" | "testnet"): string {
  const prefix = network === "testnet" ? "testnet." : ""
  return `https://${prefix}tonviewer.com/transaction/${hash}`
}
