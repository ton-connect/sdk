import { createContext, useContext } from "react"
import type { ReactNode } from "react"
import { useSettings } from "@/hooks/useSettings"

type SettingsContextType = ReturnType<typeof useSettings>

const SettingsContext = createContext<SettingsContextType | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const settings = useSettings()
  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettingsContext() {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error("useSettingsContext must be used within SettingsProvider")
  }
  return context
}
