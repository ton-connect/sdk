import { useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Toaster } from "@/components/ui/sonner"
import { SettingsProvider } from "@/context/SettingsContext"
import { useDevToolsContext } from "@/context/DevToolsContext"
import { useHashTab } from "@/hooks/useHashTab"
import { useSdkLogs } from "@/hooks/useSdkLogs"
import { Header } from "./Header"
import { RpcLogViewer } from "./shared/RpcLogViewer"
import { TransactionTab, SignDataTab, SubscriptionTab, ConnectTab, SettingsTab, DevToolsTab } from "./tabs"

const ALL_TABS = ["transaction", "sign", "subscription", "connect", "settings", "devtools"] as const
const PUBLIC_TABS = ALL_TABS.filter(t => t !== "devtools")
const DEFAULT_TAB = "transaction"

function DemoContentInner() {
  const { isUnlocked, rpcLogsEnabled } = useDevToolsContext()

  // SDK RPC logs (only active when toggle is enabled)
  const { logs, clearLogs } = useSdkLogs(rpcLogsEnabled)

  // Valid tabs depend on DevTools unlock state
  const validTabs = useMemo(
    () => (isUnlocked ? [...ALL_TABS] : [...PUBLIC_TABS]),
    [isUnlocked]
  )

  // Sync tab with URL hash, auto-redirect if tab becomes invalid
  const [tab, setTab] = useHashTab(validTabs, DEFAULT_TAB)

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-7xl sm:px-4 md:px-8 pt-6 pb-8">
        <Tabs value={tab} onValueChange={setTab} className="space-y-6">
          <TabsList className={`flex w-full overflow-x-auto md:grid scrollbar-hide px-4 sm:px-0 ${isUnlocked ? 'md:grid-cols-6' : 'md:grid-cols-5'}`}>
            <TabsTrigger value="transaction" className="shrink-0">Transaction</TabsTrigger>
            <TabsTrigger value="sign" className="shrink-0">Sign Data</TabsTrigger>
            <TabsTrigger value="subscription" className="shrink-0">Subscription</TabsTrigger>
            <TabsTrigger value="connect" className="shrink-0">Connect</TabsTrigger>
            <TabsTrigger value="settings" className="shrink-0">Settings</TabsTrigger>
            {isUnlocked && (
              <TabsTrigger value="devtools" className="shrink-0">DevTools</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="transaction">
            <TransactionTab />
          </TabsContent>

          <TabsContent value="sign">
            <SignDataTab />
          </TabsContent>

          <TabsContent value="subscription">
            <SubscriptionTab />
          </TabsContent>

          <TabsContent value="connect">
            <ConnectTab />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsTab />
          </TabsContent>

          {isUnlocked && (
            <TabsContent value="devtools">
              <DevToolsTab />
            </TabsContent>
          )}
        </Tabs>
      </main>

      {/* RPC Logs footer - visible on all tabs when enabled */}
      {rpcLogsEnabled && (
        <footer className="mx-auto max-w-7xl px-4 md:px-8 pb-8">
          <RpcLogViewer logs={logs} onClear={clearLogs} />
        </footer>
      )}

      <Toaster />
    </div>
  )
}

export function DemoContent() {
  return (
    <SettingsProvider>
      <DemoContentInner />
    </SettingsProvider>
  )
}
