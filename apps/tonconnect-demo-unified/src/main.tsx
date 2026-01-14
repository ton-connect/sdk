import "./polyfills"
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

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
