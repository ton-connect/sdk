import "./polyfills"
import { enableQaMode } from '@tonconnect/ui-react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Initialize QA Mode before App renders (critical for WalletsListManager)
if (localStorage.getItem('devtools:qa-mode') === 'true') {
  enableQaMode()
}

async function startApp() {
  // Start MSW mock server
  const { startMockServer } = await import('./server')
  await startMockServer()

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

startApp()
