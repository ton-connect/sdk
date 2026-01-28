import { useState, useEffect, useCallback } from "react"
import { useTonConnectUI, THEME } from "@tonconnect/ui-react"

// Default colors for each theme - matches SDK defaults from packages/ui/src/app/styles/default-colors.ts
const DEFAULT_COLORS = {
  [THEME.DARK]: {
    constant: { black: "#000000", white: "#FFFFFF" },
    connectButton: { background: "#0098EA", foreground: "#FFFFFF" },
    accent: "#E5E5EA",
    telegramButton: "#31A6F5",
    icon: { primary: "#E5E5EA", secondary: "#909099", tertiary: "#434347", success: "#29CC6A", error: "#F5A73B" },
    background: { primary: "#121214", secondary: "#18181A", segment: "#262629", tint: "#222224", qr: "#FFFFFF" },
    text: { primary: "#E5E5EA", secondary: "#7D7D85" }
  },
  [THEME.LIGHT]: {
    constant: { black: "#000000", white: "#FFFFFF" },
    connectButton: { background: "#0098EA", foreground: "#FFFFFF" },
    accent: "#0098EA",
    telegramButton: "#0098EA",
    icon: { primary: "#0F0F0F", secondary: "#7A8999", tertiary: "#C1CAD2", success: "#29CC6A", error: "#F5A73B" },
    background: { primary: "#FFFFFF", secondary: "#F1F3F5", segment: "#FFFFFF", tint: "#F1F3F5", qr: "#F1F3F5" },
    text: { primary: "#0F0F0F", secondary: "#6A7785" }
  }
}

export type ThemeOption = "light" | "dark" | "system"
export type LanguageOption = "en" | "ru" | "system"

export interface ColorsConfig {
  // Constant
  constantBlack: string
  constantWhite: string
  // Connect Button
  connectButtonBg: string
  connectButtonFg: string
  // General
  accent: string
  telegramButton: string
  // Icon
  iconPrimary: string
  iconSecondary: string
  iconTertiary: string
  iconSuccess: string
  iconError: string
  // Background
  backgroundPrimary: string
  backgroundSecondary: string
  backgroundSegment: string
  backgroundTint: string
  backgroundQr: string
  // Text
  textPrimary: string
  textSecondary: string
}

export type FeaturesMode = "none" | "required" | "preferred"
export type ExportFormat = "json" | "react" | "vanilla"

// Helper to convert SDK color structure to flat ColorsConfig
function colorsFromTheme(theme: THEME): ColorsConfig {
  const colors = DEFAULT_COLORS[theme]
  return {
    constantBlack: colors.constant.black,
    constantWhite: colors.constant.white,
    connectButtonBg: colors.connectButton.background,
    connectButtonFg: colors.connectButton.foreground,
    accent: colors.accent,
    telegramButton: colors.telegramButton,
    iconPrimary: colors.icon.primary,
    iconSecondary: colors.icon.secondary,
    iconTertiary: colors.icon.tertiary,
    iconSuccess: colors.icon.success,
    iconError: colors.icon.error,
    backgroundPrimary: colors.background.primary,
    backgroundSecondary: colors.background.secondary,
    backgroundSegment: colors.background.segment,
    backgroundTint: colors.background.tint,
    backgroundQr: colors.background.qr,
    textPrimary: colors.text.primary,
    textSecondary: colors.text.secondary,
  }
}

export function useSettings() {
  const [, setOptions] = useTonConnectUI()

  // Manifest URL (for configuration export)
  const [manifestUrl, setManifestUrl] = useState(
    "https://ton-connect.github.io/demo-dapp-with-react-ui/tonconnect-manifest.json"
  )

  // UI Settings
  const [language, setLanguage] = useState<LanguageOption>("system")
  const [theme, setThemeState] = useState<ThemeOption>(() => {
    const stored = localStorage.getItem("tonconnect-demo-theme")
    return (stored as ThemeOption) || "system"
  })
  const [borderRadius, setBorderRadius] = useState<"s" | "m" | "none">("m")

  // Persist theme to localStorage
  const setTheme = useCallback((newTheme: ThemeOption) => {
    setThemeState(newTheme)
    localStorage.setItem("tonconnect-demo-theme", newTheme)
  }, [])

  // Colors - initialized from SDK defaults
  const [darkColors, setDarkColors] = useState<ColorsConfig>(() => colorsFromTheme(THEME.DARK))
  const [lightColors, setLightColors] = useState<ColorsConfig>(() => colorsFromTheme(THEME.LIGHT))

  // Modals
  const [modalsBefore, setModalsBefore] = useState(true)
  const [modalsSuccess, setModalsSuccess] = useState(false)
  const [modalsError, setModalsError] = useState(false)

  // Notifications
  const [notificationsBefore, setNotificationsBefore] = useState(true)
  const [notificationsSuccess, setNotificationsSuccess] = useState(true)
  const [notificationsError, setNotificationsError] = useState(true)

  // Redirect
  const [returnStrategy, setReturnStrategy] = useState<"back" | "none">("back")
  const [twaReturnUrl, setTwaReturnUrl] = useState("")

  // Deprecated options
  const [skipRedirect, setSkipRedirect] = useState<"never" | "always" | "ios">("ios")

  // Android
  const [enableAndroidBackHandler, setEnableAndroidBackHandler] = useState(true)

  // Network selection (for transactions)
  // "" = Any, "-239" = Mainnet, "-3" = Testnet
  const [selectedNetwork, setSelectedNetwork] = useState<string>("")

  // Features Filter (Required и Preferred взаимоисключающие)
  const [featuresMode, setFeaturesMode] = useState<FeaturesMode>("none")
  const [minMessages, setMinMessages] = useState<number | undefined>()
  const [extraCurrencyRequired, setExtraCurrencyRequired] = useState(false)
  const [signDataTypes, setSignDataTypes] = useState<string[]>([])

  // Helper to get effective theme (resolve "system")
  const getEffectiveTheme = useCallback((): "light" | "dark" => {
    if (theme === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    }
    return theme
  }, [theme])

  // Apply theme to document
  useEffect(() => {
    const effectiveTheme = getEffectiveTheme()
    document.documentElement.classList.toggle("dark", effectiveTheme === "dark")

    // Listen for system theme changes when in "system" mode
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
      const handler = (e: MediaQueryListEvent) => {
        document.documentElement.classList.toggle("dark", e.matches)
      }
      mediaQuery.addEventListener("change", handler)
      return () => mediaQuery.removeEventListener("change", handler)
    }
  }, [theme, getEffectiveTheme])

  // Build features object for TonConnect
  const buildFeatures = useCallback((minMsg?: number, extraCurrency?: boolean, signTypes?: string[]) => {
    const features: Record<string, unknown> = {}
    if (minMsg || extraCurrency) {
      features.sendTransaction = {
        ...(minMsg ? { minMessages: minMsg } : {}),
        ...(extraCurrency ? { extraCurrencyRequired: true } : {})
      }
    }
    if (signTypes?.length) {
      features.signData = { types: signTypes }
    }
    return Object.keys(features).length > 0 ? features : undefined
  }, [])

  // Apply settings to TonConnect UI
  useEffect(() => {
    const tcTheme = theme === "system" ? "SYSTEM" : theme === "dark" ? THEME.DARK : THEME.LIGHT

    // Build modals array
    const modals: ("before" | "success" | "error")[] = []
    if (modalsBefore) modals.push("before")
    if (modalsSuccess) modals.push("success")
    if (modalsError) modals.push("error")

    // Build notifications array
    const notifications: ("before" | "success" | "error")[] = []
    if (notificationsBefore) notifications.push("before")
    if (notificationsSuccess) notifications.push("success")
    if (notificationsError) notifications.push("error")

    // Build features based on mode
    const features = buildFeatures(minMessages, extraCurrencyRequired, signDataTypes)

    setOptions({
      // Only set language if explicitly chosen (not "system" = auto-detect)
      language: language !== "system" ? language : undefined,
      walletsRequiredFeatures: featuresMode === "required" ? features : undefined,
      walletsPreferredFeatures: featuresMode === "preferred" ? features : undefined,
      uiPreferences: {
        theme: tcTheme,
        borderRadius,
        colorsSet: {
          [THEME.DARK]: {
            constant: { black: darkColors.constantBlack, white: darkColors.constantWhite },
            connectButton: { background: darkColors.connectButtonBg, foreground: darkColors.connectButtonFg },
            accent: darkColors.accent,
            telegramButton: darkColors.telegramButton,
            icon: {
              primary: darkColors.iconPrimary,
              secondary: darkColors.iconSecondary,
              tertiary: darkColors.iconTertiary,
              success: darkColors.iconSuccess,
              error: darkColors.iconError
            },
            background: {
              primary: darkColors.backgroundPrimary,
              secondary: darkColors.backgroundSecondary,
              segment: darkColors.backgroundSegment,
              tint: darkColors.backgroundTint,
              qr: darkColors.backgroundQr
            },
            text: { primary: darkColors.textPrimary, secondary: darkColors.textSecondary }
          },
          [THEME.LIGHT]: {
            constant: { black: lightColors.constantBlack, white: lightColors.constantWhite },
            connectButton: { background: lightColors.connectButtonBg, foreground: lightColors.connectButtonFg },
            accent: lightColors.accent,
            telegramButton: lightColors.telegramButton,
            icon: {
              primary: lightColors.iconPrimary,
              secondary: lightColors.iconSecondary,
              tertiary: lightColors.iconTertiary,
              success: lightColors.iconSuccess,
              error: lightColors.iconError
            },
            background: {
              primary: lightColors.backgroundPrimary,
              secondary: lightColors.backgroundSecondary,
              segment: lightColors.backgroundSegment,
              tint: lightColors.backgroundTint,
              qr: lightColors.backgroundQr
            },
            text: { primary: lightColors.textPrimary, secondary: lightColors.textSecondary }
          }
        }
      },
      actionsConfiguration: {
        modals: modals.length > 0 ? modals : undefined,
        notifications: notifications.length > 0 ? notifications : undefined,
        returnStrategy,
        skipRedirectToWallet: skipRedirect,
        twaReturnUrl: twaReturnUrl ? twaReturnUrl as `${string}://${string}` : undefined
      },
      enableAndroidBackHandler
    })
  }, [
    setOptions, language, theme, borderRadius,
    darkColors, lightColors,
    modalsBefore, modalsSuccess, modalsError,
    notificationsBefore, notificationsSuccess, notificationsError,
    returnStrategy, skipRedirect, twaReturnUrl,
    enableAndroidBackHandler,
    featuresMode, minMessages, extraCurrencyRequired, signDataTypes, buildFeatures
  ])

  // Helper to update a single dark color
  const updateDarkColor = useCallback((key: keyof ColorsConfig, value: string) => {
    setDarkColors(prev => ({ ...prev, [key]: value }))
  }, [])

  // Helper to update a single light color
  const updateLightColor = useCallback((key: keyof ColorsConfig, value: string) => {
    setLightColors(prev => ({ ...prev, [key]: value }))
  }, [])

  // Reset colors to defaults
  const resetColors = useCallback(() => {
    setDarkColors(colorsFromTheme(THEME.DARK))
    setLightColors(colorsFromTheme(THEME.LIGHT))
  }, [])

  // Build exportable configuration object
  const buildConfiguration = useCallback((showFull: boolean, includeDeprecated: boolean = false) => {
    const config: Record<string, unknown> = {
      manifestUrl
    }

    // Language - only if not "system" (auto-detect)
    if (language !== "system") {
      config.language = language
    } else if (showFull) {
      // In full mode, show that it's auto-detected
      config.language = undefined
    }

    // Wallet Features (Required or Preferred)
    if (featuresMode !== "none") {
      const features: Record<string, unknown> = {}

      // sendTransaction features
      if (minMessages || extraCurrencyRequired) {
        const sendTx: Record<string, unknown> = {}
        if (minMessages) sendTx.minMessages = minMessages
        if (extraCurrencyRequired) sendTx.extraCurrencyRequired = true
        features.sendTransaction = sendTx
      }

      // signData features
      if (signDataTypes.length > 0) {
        features.signData = { types: signDataTypes }
      }

      if (Object.keys(features).length > 0) {
        if (featuresMode === "required") {
          config.walletsRequiredFeatures = features
        } else {
          config.walletsPreferredFeatures = features
        }
      }
    }

    // UI Preferences
    const uiPrefs: Record<string, unknown> = {}
    const tcTheme = theme === "system" ? "SYSTEM" : theme === "dark" ? "DARK" : "LIGHT"

    if (showFull || tcTheme !== "SYSTEM") {
      uiPrefs.theme = tcTheme
    }

    if (showFull || borderRadius !== "m") {
      uiPrefs.borderRadius = borderRadius
    }

    // Colors - compare with SDK defaults
    const colorsSet: Record<string, Record<string, unknown>> = {}
    const defaultDark = colorsFromTheme(THEME.DARK)
    const defaultLight = colorsFromTheme(THEME.LIGHT)

    const buildColorsDiff = (current: ColorsConfig, defaults: ColorsConfig) => {
      const diff: Record<string, unknown> = {}

      // Check each color group
      if (showFull || current.constantBlack !== defaults.constantBlack || current.constantWhite !== defaults.constantWhite) {
        const constant: Record<string, string> = {}
        if (showFull || current.constantBlack !== defaults.constantBlack) constant.black = current.constantBlack
        if (showFull || current.constantWhite !== defaults.constantWhite) constant.white = current.constantWhite
        if (Object.keys(constant).length > 0) diff.constant = constant
      }

      if (showFull || current.connectButtonBg !== defaults.connectButtonBg || current.connectButtonFg !== defaults.connectButtonFg) {
        const connectButton: Record<string, string> = {}
        if (showFull || current.connectButtonBg !== defaults.connectButtonBg) connectButton.background = current.connectButtonBg
        if (showFull || current.connectButtonFg !== defaults.connectButtonFg) connectButton.foreground = current.connectButtonFg
        if (Object.keys(connectButton).length > 0) diff.connectButton = connectButton
      }

      if (showFull || current.accent !== defaults.accent) diff.accent = current.accent
      if (showFull || current.telegramButton !== defaults.telegramButton) diff.telegramButton = current.telegramButton

      // Icon colors
      const iconDiff: Record<string, string> = {}
      if (showFull || current.iconPrimary !== defaults.iconPrimary) iconDiff.primary = current.iconPrimary
      if (showFull || current.iconSecondary !== defaults.iconSecondary) iconDiff.secondary = current.iconSecondary
      if (showFull || current.iconTertiary !== defaults.iconTertiary) iconDiff.tertiary = current.iconTertiary
      if (showFull || current.iconSuccess !== defaults.iconSuccess) iconDiff.success = current.iconSuccess
      if (showFull || current.iconError !== defaults.iconError) iconDiff.error = current.iconError
      if (Object.keys(iconDiff).length > 0) diff.icon = iconDiff

      // Background colors
      const bgDiff: Record<string, string> = {}
      if (showFull || current.backgroundPrimary !== defaults.backgroundPrimary) bgDiff.primary = current.backgroundPrimary
      if (showFull || current.backgroundSecondary !== defaults.backgroundSecondary) bgDiff.secondary = current.backgroundSecondary
      if (showFull || current.backgroundSegment !== defaults.backgroundSegment) bgDiff.segment = current.backgroundSegment
      if (showFull || current.backgroundTint !== defaults.backgroundTint) bgDiff.tint = current.backgroundTint
      if (showFull || current.backgroundQr !== defaults.backgroundQr) bgDiff.qr = current.backgroundQr
      if (Object.keys(bgDiff).length > 0) diff.background = bgDiff

      // Text colors
      const textDiff: Record<string, string> = {}
      if (showFull || current.textPrimary !== defaults.textPrimary) textDiff.primary = current.textPrimary
      if (showFull || current.textSecondary !== defaults.textSecondary) textDiff.secondary = current.textSecondary
      if (Object.keys(textDiff).length > 0) diff.text = textDiff

      return diff
    }

    const darkDiff = buildColorsDiff(darkColors, defaultDark)
    const lightDiff = buildColorsDiff(lightColors, defaultLight)

    if (Object.keys(darkDiff).length > 0) colorsSet.DARK = darkDiff
    if (Object.keys(lightDiff).length > 0) colorsSet.LIGHT = lightDiff
    if (Object.keys(colorsSet).length > 0) uiPrefs.colorsSet = colorsSet

    if (Object.keys(uiPrefs).length > 0) {
      config.uiPreferences = uiPrefs
    }

    // Actions Configuration
    const actions: Record<string, unknown> = {}

    const modals = [
      modalsBefore && "before",
      modalsSuccess && "success",
      modalsError && "error"
    ].filter(Boolean) as string[]

    const isDefaultModals = modals.length === 1 && modals[0] === "before"
    if (showFull || !isDefaultModals) {
      actions.modals = modals.length > 0 ? modals : []
    }

    const notifications = [
      notificationsBefore && "before",
      notificationsSuccess && "success",
      notificationsError && "error"
    ].filter(Boolean) as string[]

    const isDefaultNotifications = notifications.length === 3
    if (showFull || !isDefaultNotifications) {
      actions.notifications = notifications.length > 0 ? notifications : []
    }

    if (showFull || returnStrategy !== "back") {
      actions.returnStrategy = returnStrategy
    }

    if (twaReturnUrl) {
      actions.twaReturnUrl = twaReturnUrl
    }

    // Deprecated: skipRedirectToWallet
    if (includeDeprecated && skipRedirect !== "ios") {
      actions.skipRedirectToWallet = skipRedirect
    }

    if (Object.keys(actions).length > 0) {
      config.actionsConfiguration = actions
    }

    // Android
    if (showFull || !enableAndroidBackHandler) {
      config.enableAndroidBackHandler = enableAndroidBackHandler
    }

    // Clean up undefined values for cleaner output
    if (config.language === undefined) {
      delete config.language
    }

    return config
  }, [
    manifestUrl, language, theme, borderRadius,
    darkColors, lightColors,
    modalsBefore, modalsSuccess, modalsError,
    notificationsBefore, notificationsSuccess, notificationsError,
    returnStrategy, twaReturnUrl, skipRedirect,
    enableAndroidBackHandler,
    featuresMode, minMessages, extraCurrencyRequired, signDataTypes
  ])

  // Format configuration for different export targets
  const formatConfiguration = useCallback((
    config: Record<string, unknown>,
    format: ExportFormat
  ): string => {
    if (format === "json") {
      return JSON.stringify(config, null, 2)
    }

    // Check if config uses theme constants
    const configStr = JSON.stringify(config)
    const needsTheme = configStr.includes('"DARK"') || configStr.includes('"LIGHT"') || configStr.includes('"SYSTEM"')

    // Helper to format a value for JS/TSX code
    const formatValue = (value: unknown, indent: number = 0): string => {
      const pad = "  ".repeat(indent)
      const padInner = "  ".repeat(indent + 1)

      if (value === null || value === undefined) {
        return String(value)
      }
      if (typeof value === "string") {
        // Convert theme strings to THEME constants
        if (value === "DARK" || value === "LIGHT" || value === "SYSTEM") {
          return `THEME.${value}`
        }
        return `'${value.replace(/'/g, "\\'")}'`
      }
      if (typeof value === "number" || typeof value === "boolean") {
        return String(value)
      }
      if (Array.isArray(value)) {
        if (value.length === 0) return "[]"
        const items = value.map(v => formatValue(v, 0)).join(", ")
        return `[${items}]`
      }
      if (typeof value === "object") {
        const entries = Object.entries(value)
        if (entries.length === 0) return "{}"
        const lines = entries.map(([k, v]) => {
          // Use [THEME.X] syntax for DARK/LIGHT keys in colorsSet
          let key: string
          if (k === "DARK" || k === "LIGHT") {
            key = `[THEME.${k}]`
          } else if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k)) {
            key = k
          } else {
            key = `'${k}'`
          }
          return `${padInner}${key}: ${formatValue(v, indent + 1)}`
        })
        return `{\n${lines.join(",\n")}\n${pad}}`
      }
      return String(value)
    }

    // Build JSX props for React
    const buildJsxProps = (cfg: Record<string, unknown>, indent: number): string => {
      const pad = "  ".repeat(indent)
      const lines: string[] = []

      for (const [key, value] of Object.entries(cfg)) {
        if (value === undefined) continue
        const formatted = formatValue(value, indent)
        // Simple values don't need braces in JSX
        if (typeof value === "string" && value !== "DARK" && value !== "LIGHT" && value !== "SYSTEM") {
          lines.push(`${pad}${key}="${value}"`)
        } else {
          lines.push(`${pad}${key}={${formatted}}`)
        }
      }

      return lines.join("\n")
    }

    // Build object properties for Vanilla JS
    const buildObjectProps = (cfg: Record<string, unknown>, indent: number): string => {
      const pad = "  ".repeat(indent)
      const lines: string[] = []

      for (const [key, value] of Object.entries(cfg)) {
        if (value === undefined) continue
        lines.push(`${pad}${key}: ${formatValue(value, indent)}`)
      }

      return lines.join(",\n")
    }

    if (format === "react") {
      const propsStr = buildJsxProps(config, 3)
      const imports = needsTheme
        ? "import { TonConnectUIProvider, THEME } from '@tonconnect/ui-react'"
        : "import { TonConnectUIProvider } from '@tonconnect/ui-react'"

      return `${imports}

function App({ children }) {
  return (
    <TonConnectUIProvider
${propsStr}
    >
      {children}
    </TonConnectUIProvider>
  )
}`
    }

    // Vanilla JS
    const optionsStr = buildObjectProps(config, 2)
    const imports = needsTheme
      ? "import { TonConnectUI, THEME } from '@tonconnect/ui'"
      : "import { TonConnectUI } from '@tonconnect/ui'"

    return `${imports}

const tonConnectUI = new TonConnectUI({
${optionsStr}
})`
  }, [])

  return {
    // Manifest
    manifestUrl, setManifestUrl,
    // Configuration export
    buildConfiguration,
    formatConfiguration,
    // UI
    language, setLanguage,
    theme, setTheme,
    borderRadius, setBorderRadius,
    // Colors
    darkColors, updateDarkColor,
    lightColors, updateLightColor,
    resetColors,
    // Modals
    modalsBefore, setModalsBefore,
    modalsSuccess, setModalsSuccess,
    modalsError, setModalsError,
    // Notifications
    notificationsBefore, setNotificationsBefore,
    notificationsSuccess, setNotificationsSuccess,
    notificationsError, setNotificationsError,
    // Redirect
    returnStrategy, setReturnStrategy,
    twaReturnUrl, setTwaReturnUrl,
    // Deprecated
    skipRedirect, setSkipRedirect,
    // Android
    enableAndroidBackHandler, setEnableAndroidBackHandler,
    // Network
    selectedNetwork, setSelectedNetwork,
    // Features Filter
    featuresMode, setFeaturesMode,
    minMessages, setMinMessages,
    extraCurrencyRequired, setExtraCurrencyRequired,
    signDataTypes, setSignDataTypes,
  }
}
