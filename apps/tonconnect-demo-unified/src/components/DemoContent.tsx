import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Toaster } from "@/components/ui/sonner"
import { SettingsProvider } from "@/context/SettingsContext"
import { Header } from "./Header"
import { TransactionTab, SignDataTab, SubscriptionTab, TonProofTab, SettingsTab } from "./tabs"

function DemoContentInner() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-7xl px-4 md:px-8 pt-6 pb-8">
        <Tabs defaultValue="transaction" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="transaction">Transaction</TabsTrigger>
            <TabsTrigger value="sign">Sign Data</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="tonproof">Ton Proof</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
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

          <TabsContent value="tonproof">
            <TonProofTab />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </main>
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
