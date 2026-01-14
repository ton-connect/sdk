import { TonConnectUIProvider } from '@tonconnect/ui-react'
import { DemoContent } from '@/components/DemoContent'

function App() {
  return (
    <TonConnectUIProvider manifestUrl="https://ton-connect.github.io/demo-dapp-with-react-ui/tonconnect-manifest.json">
      <DemoContent />
    </TonConnectUIProvider>
  )
}

export default App
