import { useState, useEffect } from "react"

export function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("dark")

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark")
  }, [theme])

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark")

  return { theme, setTheme, toggleTheme }
}
