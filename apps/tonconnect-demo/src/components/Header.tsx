import { TonConnectButton } from "@tonconnect/ui-react"
import { useSettingsContext } from "@/context/SettingsContext"
import { useDevToolsContext } from "@/context/DevToolsContext"
import { Monitor, Sun, Moon } from "lucide-react"
import { useRef, useCallback } from "react"
import { toast } from "sonner"
import type { ThemeOption } from "@/hooks/useSettings"

const SECRET_TAP_COUNT = 5
const SECRET_TAP_TIMEOUT = 2000 // 2 seconds window for taps

export function Header() {
  const { theme, setTheme } = useSettingsContext()
  const { isUnlocked, unlockDevTools } = useDevToolsContext()

  const tapCountRef = useRef(0)
  const tapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleTitleClick = useCallback(() => {
    if (isUnlocked) return // Already unlocked

    tapCountRef.current += 1

    // Clear existing timeout
    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current)
    }

    // Check if reached required taps
    if (tapCountRef.current >= SECRET_TAP_COUNT) {
      tapCountRef.current = 0
      unlockDevTools()
      toast.success("DevTools unlocked!", {
        description: "Check the DevTools tab to configure debug options"
      })
      return
    }

    // Reset counter after timeout
    tapTimeoutRef.current = setTimeout(() => {
      tapCountRef.current = 0
    }, SECRET_TAP_TIMEOUT)
  }, [isUnlocked, unlockDevTools])

  const themes: { value: ThemeOption; icon: typeof Monitor; label: string }[] = [
    { value: "system", icon: Monitor, label: "System" },
    { value: "light", icon: Sun, label: "Light" },
    { value: "dark", icon: Moon, label: "Dark" },
  ]

  const currentThemeIndex = themes.findIndex(t => t.value === theme)
  const CurrentIcon = themes[currentThemeIndex]?.icon || Monitor

  const cycleTheme = useCallback(() => {
    const nextIndex = (currentThemeIndex + 1) % themes.length
    setTheme(themes[nextIndex].value)
  }, [currentThemeIndex, setTheme])

  return (
    <header className="header-animated sticky top-0 z-50 bg-background/95 backdrop-blur-sm">
      <div className="header-content mx-auto max-w-7xl px-4 md:px-8 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1
            className="header-title font-bold text-foreground text-xl sm:text-3xl cursor-pointer select-none"
            onClick={handleTitleClick}
          >
            TonConnect Demo
          </h1>
          <p className="header-subtitle text-sm text-muted-foreground hidden sm:block">
            Test and demonstrate wallet integration
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Theme toggle - single button on mobile, segmented on desktop */}
          <button
            onClick={cycleTheme}
            title={`Theme: ${themes[currentThemeIndex]?.label}`}
            className="sm:hidden flex items-center justify-center h-8 w-8 rounded-md border bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
          >
            <CurrentIcon className="h-4 w-4" />
          </button>
          <div className="header-button hidden sm:flex rounded-md border bg-muted/50 p-0.5">
            {themes.map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                title={label}
                className={`flex items-center justify-center h-8 w-8 rounded-sm transition-colors ${
                  theme === value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>
          <TonConnectButton />
        </div>
      </div>
    </header>
  )
}
