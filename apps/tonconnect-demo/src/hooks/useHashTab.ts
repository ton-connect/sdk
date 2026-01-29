import { useState, useEffect, useCallback } from "react"

/**
 * Hook for syncing tab state with URL hash.
 * Enables direct links like /#sign and browser back/forward navigation.
 *
 * @param validTabs - Array of valid tab values
 * @param defaultTab - Default tab when hash is empty or invalid
 * @returns [currentTab, setTab] tuple
 */
export function useHashTab(validTabs: string[], defaultTab: string) {
  // Read hash synchronously to avoid flicker
  const getValidTab = useCallback(() => {
    if (typeof window === "undefined") return defaultTab
    const hash = window.location.hash.slice(1)
    return validTabs.includes(hash) ? hash : defaultTab
  }, [validTabs, defaultTab])

  const [tab, setTabState] = useState(getValidTab)

  // Set initial hash if empty (for clean URLs like /)
  useEffect(() => {
    if (!window.location.hash) {
      window.history.replaceState(null, "", `#${tab}`)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Redirect to default if current tab becomes invalid (e.g., DevTools locked)
  useEffect(() => {
    if (!validTabs.includes(tab)) {
      const newTab = defaultTab
      setTabState(newTab)
      window.history.replaceState(null, "", `#${newTab}`)
    }
  }, [validTabs, tab, defaultTab])

  // Sync hash → state (back/forward buttons + programmatic changes)
  useEffect(() => {
    const onHashChange = () => {
      const newTab = getValidTab()
      setTabState(newTab)
    }
    window.addEventListener("hashchange", onHashChange)
    return () => window.removeEventListener("hashchange", onHashChange)
  }, [getValidTab])

  // Set tab by updating hash (let hashchange listener update state)
  const setTab = useCallback((newTab: string) => {
    if (validTabs.includes(newTab)) {
      window.location.hash = newTab
    }
  }, [validTabs])

  return [tab, setTab] as const
}
