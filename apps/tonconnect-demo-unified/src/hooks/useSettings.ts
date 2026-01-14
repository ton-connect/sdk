import { useState, useEffect, useCallback } from "react"
import { useTonConnectUI, THEME } from "@tonconnect/ui-react"

// Default colors for each theme (full TonConnect ColorsSet)
const DEFAULT_COLORS = {
  [THEME.DARK]: {
    constant: { black: "#000000", white: "#ffffff" },
    connectButton: { background: "#0098EA", foreground: "#FFFFFF" },
    accent: "#0098EA",
    telegramButton: "#31a6de",
    icon: { primary: "#f5f5f5", secondary: "#8e8e93", tertiary: "#636366", success: "#30d158", error: "#ff453a" },
    background: { primary: "#121214", secondary: "#1c1c1e", segment: "#2c2c2e", tint: "#222224", qr: "#ffffff" },
    text: { primary: "#f5f5f5", secondary: "#8e8e93" }
  },
  [THEME.LIGHT]: {
    constant: { black: "#000000", white: "#ffffff" },
    connectButton: { background: "#0098EA", foreground: "#FFFFFF" },
    accent: "#0098EA",
    telegramButton: "#31a6de",
    icon: { primary: "#0f0f0f", secondary: "#6a7785", tertiary: "#aeaeb2", success: "#34c759", error: "#ff3b30" },
    background: { primary: "#ffffff", secondary: "#f1f3f5", segment: "#e5e5ea", tint: "#f1f3f5", qr: "#ffffff" },
    text: { primary: "#0f0f0f", secondary: "#6a7785" }
  }
}

export type ThemeOption = "light" | "dark" | "system"

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

export function useSettings() {
  const [, setOptions] = useTonConnectUI()

  // UI Settings
  const [language, setLanguage] = useState<"en" | "ru">("en")
  const [theme, setTheme] = useState<ThemeOption>("dark")
  const [borderRadius, setBorderRadius] = useState<"s" | "m" | "none">("m")

  // Colors
  const [darkColors, setDarkColors] = useState<ColorsConfig>({
    constantBlack: DEFAULT_COLORS[THEME.DARK].constant.black,
    constantWhite: DEFAULT_COLORS[THEME.DARK].constant.white,
    connectButtonBg: DEFAULT_COLORS[THEME.DARK].connectButton.background,
    connectButtonFg: DEFAULT_COLORS[THEME.DARK].connectButton.foreground,
    accent: DEFAULT_COLORS[THEME.DARK].accent,
    telegramButton: DEFAULT_COLORS[THEME.DARK].telegramButton,
    iconPrimary: DEFAULT_COLORS[THEME.DARK].icon.primary,
    iconSecondary: DEFAULT_COLORS[THEME.DARK].icon.secondary,
    iconTertiary: DEFAULT_COLORS[THEME.DARK].icon.tertiary,
    iconSuccess: DEFAULT_COLORS[THEME.DARK].icon.success,
    iconError: DEFAULT_COLORS[THEME.DARK].icon.error,
    backgroundPrimary: DEFAULT_COLORS[THEME.DARK].background.primary,
    backgroundSecondary: DEFAULT_COLORS[THEME.DARK].background.secondary,
    backgroundSegment: DEFAULT_COLORS[THEME.DARK].background.segment,
    backgroundTint: DEFAULT_COLORS[THEME.DARK].background.tint,
    backgroundQr: DEFAULT_COLORS[THEME.DARK].background.qr,
    textPrimary: DEFAULT_COLORS[THEME.DARK].text.primary,
    textSecondary: DEFAULT_COLORS[THEME.DARK].text.secondary,
  })

  const [lightColors, setLightColors] = useState<ColorsConfig>({
    constantBlack: DEFAULT_COLORS[THEME.LIGHT].constant.black,
    constantWhite: DEFAULT_COLORS[THEME.LIGHT].constant.white,
    connectButtonBg: DEFAULT_COLORS[THEME.LIGHT].connectButton.background,
    connectButtonFg: DEFAULT_COLORS[THEME.LIGHT].connectButton.foreground,
    accent: DEFAULT_COLORS[THEME.LIGHT].accent,
    telegramButton: DEFAULT_COLORS[THEME.LIGHT].telegramButton,
    iconPrimary: DEFAULT_COLORS[THEME.LIGHT].icon.primary,
    iconSecondary: DEFAULT_COLORS[THEME.LIGHT].icon.secondary,
    iconTertiary: DEFAULT_COLORS[THEME.LIGHT].icon.tertiary,
    iconSuccess: DEFAULT_COLORS[THEME.LIGHT].icon.success,
    iconError: DEFAULT_COLORS[THEME.LIGHT].icon.error,
    backgroundPrimary: DEFAULT_COLORS[THEME.LIGHT].background.primary,
    backgroundSecondary: DEFAULT_COLORS[THEME.LIGHT].background.secondary,
    backgroundSegment: DEFAULT_COLORS[THEME.LIGHT].background.segment,
    backgroundTint: DEFAULT_COLORS[THEME.LIGHT].background.tint,
    backgroundQr: DEFAULT_COLORS[THEME.LIGHT].background.qr,
    textPrimary: DEFAULT_COLORS[THEME.LIGHT].text.primary,
    textSecondary: DEFAULT_COLORS[THEME.LIGHT].text.secondary,
  })

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
  const [skipRedirect, setSkipRedirect] = useState<"never" | "always" | "ios">("ios")
  const [twaReturnUrl, setTwaReturnUrl] = useState("")

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
      language,
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
    setDarkColors({
      constantBlack: DEFAULT_COLORS[THEME.DARK].constant.black,
      constantWhite: DEFAULT_COLORS[THEME.DARK].constant.white,
      connectButtonBg: DEFAULT_COLORS[THEME.DARK].connectButton.background,
      connectButtonFg: DEFAULT_COLORS[THEME.DARK].connectButton.foreground,
      accent: DEFAULT_COLORS[THEME.DARK].accent,
      telegramButton: DEFAULT_COLORS[THEME.DARK].telegramButton,
      iconPrimary: DEFAULT_COLORS[THEME.DARK].icon.primary,
      iconSecondary: DEFAULT_COLORS[THEME.DARK].icon.secondary,
      iconTertiary: DEFAULT_COLORS[THEME.DARK].icon.tertiary,
      iconSuccess: DEFAULT_COLORS[THEME.DARK].icon.success,
      iconError: DEFAULT_COLORS[THEME.DARK].icon.error,
      backgroundPrimary: DEFAULT_COLORS[THEME.DARK].background.primary,
      backgroundSecondary: DEFAULT_COLORS[THEME.DARK].background.secondary,
      backgroundSegment: DEFAULT_COLORS[THEME.DARK].background.segment,
      backgroundTint: DEFAULT_COLORS[THEME.DARK].background.tint,
      backgroundQr: DEFAULT_COLORS[THEME.DARK].background.qr,
      textPrimary: DEFAULT_COLORS[THEME.DARK].text.primary,
      textSecondary: DEFAULT_COLORS[THEME.DARK].text.secondary,
    })
    setLightColors({
      constantBlack: DEFAULT_COLORS[THEME.LIGHT].constant.black,
      constantWhite: DEFAULT_COLORS[THEME.LIGHT].constant.white,
      connectButtonBg: DEFAULT_COLORS[THEME.LIGHT].connectButton.background,
      connectButtonFg: DEFAULT_COLORS[THEME.LIGHT].connectButton.foreground,
      accent: DEFAULT_COLORS[THEME.LIGHT].accent,
      telegramButton: DEFAULT_COLORS[THEME.LIGHT].telegramButton,
      iconPrimary: DEFAULT_COLORS[THEME.LIGHT].icon.primary,
      iconSecondary: DEFAULT_COLORS[THEME.LIGHT].icon.secondary,
      iconTertiary: DEFAULT_COLORS[THEME.LIGHT].icon.tertiary,
      iconSuccess: DEFAULT_COLORS[THEME.LIGHT].icon.success,
      iconError: DEFAULT_COLORS[THEME.LIGHT].icon.error,
      backgroundPrimary: DEFAULT_COLORS[THEME.LIGHT].background.primary,
      backgroundSecondary: DEFAULT_COLORS[THEME.LIGHT].background.secondary,
      backgroundSegment: DEFAULT_COLORS[THEME.LIGHT].background.segment,
      backgroundTint: DEFAULT_COLORS[THEME.LIGHT].background.tint,
      backgroundQr: DEFAULT_COLORS[THEME.LIGHT].background.qr,
      textPrimary: DEFAULT_COLORS[THEME.LIGHT].text.primary,
      textSecondary: DEFAULT_COLORS[THEME.LIGHT].text.secondary,
    })
  }, [])

  return {
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
    skipRedirect, setSkipRedirect,
    twaReturnUrl, setTwaReturnUrl,
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
