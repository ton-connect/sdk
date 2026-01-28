import { TonConnectUIProvider } from '@tonconnect/ui-react'
import { DevToolsProvider } from '@/context/DevToolsContext'
import { DemoContent } from '@/components/DemoContent'

function App() {
  return (
    <DevToolsProvider>
      <TonConnectUIProvider manifestUrl={`${window.location.origin}/tonconnect-manifest.json`}>
        <DemoContent />
      </TonConnectUIProvider>
    </DevToolsProvider>
  )
}

export default App
