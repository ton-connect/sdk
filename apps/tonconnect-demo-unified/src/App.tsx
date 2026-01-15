import { TonConnectUIProvider } from '@tonconnect/ui-react'
import { DevToolsProvider } from '@/context/DevToolsContext'
import { DemoContent } from '@/components/DemoContent'

function App() {
  return (
    <DevToolsProvider>
      <TonConnectUIProvider manifestUrl="https://ton-connect.github.io/demo-dapp-with-react-ui/tonconnect-manifest.json">
        <DemoContent />
      </TonConnectUIProvider>
    </DevToolsProvider>
  )
}

export default App
