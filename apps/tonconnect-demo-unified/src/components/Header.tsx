import { TonConnectButton } from "@tonconnect/ui-react"
import { useSettingsContext } from "@/context/SettingsContext"
import { Monitor, Sun, Moon } from "lucide-react"
import type { ThemeOption } from "@/hooks/useSettings"

export function Header() {
  const { theme, setTheme } = useSettingsContext()

  const themes: { value: ThemeOption; icon: typeof Monitor; label: string }[] = [
    { value: "system", icon: Monitor, label: "System" },
    { value: "light", icon: Sun, label: "Light" },
    { value: "dark", icon: Moon, label: "Dark" },
  ]

  return (
    <header className="header-animated sticky top-0 z-50 bg-background/95 backdrop-blur-sm">
      <div className="header-content mx-auto max-w-7xl px-4 md:px-8 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="header-title font-bold text-foreground text-xl sm:text-3xl">
            TonConnect Demo
          </h1>
          <p className="header-subtitle text-xs sm:text-sm text-muted-foreground">
            Test and demonstrate wallet integration
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Theme toggle - compact segmented */}
          <div className="header-button flex rounded-md border bg-muted/50 p-0.5">
            {themes.map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                title={label}
                className={`flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded-sm transition-colors ${
                  theme === value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
            ))}
          </div>
          <TonConnectButton />
        </div>
      </div>
    </header>
  )
}
