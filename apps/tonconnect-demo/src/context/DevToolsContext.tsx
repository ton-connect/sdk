import { createContext, useContext } from "react"
import type { ReactNode } from "react"
import { useDevTools } from "@/hooks/useDevTools"

type DevToolsContextType = ReturnType<typeof useDevTools>

const DevToolsContext = createContext<DevToolsContextType | null>(null)

export function DevToolsProvider({ children }: { children: ReactNode }) {
  const devTools = useDevTools()
  return (
    <DevToolsContext.Provider value={devTools}>
      {children}
    </DevToolsContext.Provider>
  )
}

export function useDevToolsContext() {
  const context = useContext(DevToolsContext)
  if (!context) {
    throw new Error("useDevToolsContext must be used within DevToolsProvider")
  }
  return context
}
