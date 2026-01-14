import { TonConnectButton } from "@tonconnect/ui-react"
import { Button } from "@/components/ui/button"
import { useSettingsContext } from "@/context/SettingsContext"
import { Moon, Sun } from "lucide-react"

export function Header() {
  const { theme, setTheme } = useSettingsContext()

  return (
    <header className="header-animated sticky top-0 z-50 bg-background/95 backdrop-blur-sm">
      <div className="header-content mx-auto max-w-7xl px-4 md:px-8 flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="header-title font-bold text-foreground text-3xl">
            TonConnect Demo
          </h1>
          <p className="header-subtitle text-sm text-muted-foreground overflow-hidden">
            Test and demonstrate wallet integration capabilities
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 ml-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="header-button h-9 w-9"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <TonConnectButton />
        </div>
      </div>
    </header>
  )
}
