import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useSettingsContext } from "@/context/SettingsContext"
import { useDevToolsContext } from "@/context/DevToolsContext"
import { NetworkPicker } from "@/components/NetworkPicker"
import { FieldLabel } from "@/components/shared/FieldLabel"
import { JsonViewer } from "@/components/shared/JsonViewer"
import { TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RotateCcw, AlertTriangle, Copy } from "lucide-react"
import { toast } from "sonner"
import type { ThemeOption, LanguageOption, ColorsConfig, FeaturesMode, ExportFormat } from "@/hooks/useSettings"

function ColorInput({
  label,
  value,
  onChange
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <Label className="text-sm">{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-8 cursor-pointer rounded border border-input bg-transparent"
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-24 font-mono text-xs"
        />
      </div>
    </div>
  )
}

function ColorsCard({
  title,
  description,
  colors,
  onUpdate
}: {
  title: string
  description: string
  colors: ColorsConfig
  onUpdate: (key: keyof ColorsConfig, value: string) => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Constants</p>
          <ColorInput label="Black" value={colors.constantBlack} onChange={(v) => onUpdate("constantBlack", v)} />
          <ColorInput label="White" value={colors.constantWhite} onChange={(v) => onUpdate("constantWhite", v)} />
        </div>
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Connect Button</p>
          <ColorInput label="Background" value={colors.connectButtonBg} onChange={(v) => onUpdate("connectButtonBg", v)} />
          <ColorInput label="Foreground" value={colors.connectButtonFg} onChange={(v) => onUpdate("connectButtonFg", v)} />
        </div>
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">General</p>
          <ColorInput label="Accent" value={colors.accent} onChange={(v) => onUpdate("accent", v)} />
          <ColorInput label="Telegram Button" value={colors.telegramButton} onChange={(v) => onUpdate("telegramButton", v)} />
        </div>
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Icons</p>
          <ColorInput label="Primary" value={colors.iconPrimary} onChange={(v) => onUpdate("iconPrimary", v)} />
          <ColorInput label="Secondary" value={colors.iconSecondary} onChange={(v) => onUpdate("iconSecondary", v)} />
          <ColorInput label="Tertiary" value={colors.iconTertiary} onChange={(v) => onUpdate("iconTertiary", v)} />
          <ColorInput label="Success" value={colors.iconSuccess} onChange={(v) => onUpdate("iconSuccess", v)} />
          <ColorInput label="Error" value={colors.iconError} onChange={(v) => onUpdate("iconError", v)} />
        </div>
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Background</p>
          <ColorInput label="Primary" value={colors.backgroundPrimary} onChange={(v) => onUpdate("backgroundPrimary", v)} />
          <ColorInput label="Secondary" value={colors.backgroundSecondary} onChange={(v) => onUpdate("backgroundSecondary", v)} />
          <ColorInput label="Segment" value={colors.backgroundSegment} onChange={(v) => onUpdate("backgroundSegment", v)} />
          <ColorInput label="Tint" value={colors.backgroundTint} onChange={(v) => onUpdate("backgroundTint", v)} />
          <ColorInput label="QR Code" value={colors.backgroundQr} onChange={(v) => onUpdate("backgroundQr", v)} />
        </div>
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Text</p>
          <ColorInput label="Primary" value={colors.textPrimary} onChange={(v) => onUpdate("textPrimary", v)} />
          <ColorInput label="Secondary" value={colors.textSecondary} onChange={(v) => onUpdate("textSecondary", v)} />
        </div>
      </CardContent>
    </Card>
  )
}

export function SettingsTab() {
  const {
    manifestUrl, setManifestUrl,
    buildConfiguration,
    formatConfiguration,
    language, setLanguage,
    theme, setTheme,
    borderRadius, setBorderRadius,
    darkColors, updateDarkColor,
    lightColors, updateLightColor,
    resetColors,
    modalsBefore, setModalsBefore,
    modalsSuccess, setModalsSuccess,
    modalsError, setModalsError,
    notificationsBefore, setNotificationsBefore,
    notificationsSuccess, setNotificationsSuccess,
    notificationsError, setNotificationsError,
    returnStrategy, setReturnStrategy,
    twaReturnUrl, setTwaReturnUrl,
    skipRedirect, setSkipRedirect,
    enableAndroidBackHandler, setEnableAndroidBackHandler,
    featuresMode, setFeaturesMode,
    minMessages, setMinMessages,
    extraCurrencyRequired, setExtraCurrencyRequired,
    signDataTypes, setSignDataTypes,
  } = useSettingsContext()

  const { showDeprecated, showExperimental } = useDevToolsContext()
  const [showFullConfig, setShowFullConfig] = useState(false)
  const [exportFormat, setExportFormat] = useState<ExportFormat>("json")
  const [includeDeprecatedInExport, setIncludeDeprecatedInExport] = useState(false)

  const handleSignDataTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      setSignDataTypes([...signDataTypes, type])
    } else {
      setSignDataTypes(signDataTypes.filter(t => t !== type))
    }
  }

  return (
    <div className="space-y-6">
      {/* Manifest URL */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Manifest URL
            <FieldLabel fieldId="manifestUrl">{""}</FieldLabel>
          </CardTitle>
          <CardDescription>Your dApp manifest for wallet identification</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Input
            value={manifestUrl}
            onChange={(e) => setManifestUrl(e.target.value)}
            placeholder="https://your-app.com/tonconnect-manifest.json"
          />
        </CardContent>
      </Card>

      {/* Row 1: Connection Settings + Modals + Notifications */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Connection Settings</CardTitle>
            <CardDescription>Network and wallet filtering</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <NetworkPicker />

            <div className="space-y-2">
              <Label htmlFor="featuresMode">Wallet Features Filter</Label>
              <Select value={featuresMode} onValueChange={(v) => setFeaturesMode(v as FeaturesMode)}>
                <SelectTrigger id="featuresMode"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (show all wallets)</SelectItem>
                  <SelectItem value="required">Required (disable unsupported)</SelectItem>
                  <SelectItem value="preferred">Preferred (move to end)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {featuresMode !== "none" && (
              <div className="space-y-3 rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="minMessages">Min Messages</Label>
                  <Input
                    id="minMessages"
                    type="number"
                    min="1"
                    max="255"
                    className="w-20"
                    value={minMessages ?? ""}
                    onChange={(e) => setMinMessages(e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="extraCurrency">Extra Currency</Label>
                  <Switch
                    id="extraCurrency"
                    checked={extraCurrencyRequired}
                    onCheckedChange={setExtraCurrencyRequired}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Sign Data Types</Label>
                  <div className="flex gap-4">
                    {["text", "cell", "binary"].map(type => (
                      <div key={type} className="flex items-center gap-2">
                        <Checkbox
                          id={`signData-${type}`}
                          checked={signDataTypes.includes(type)}
                          onCheckedChange={(checked) => handleSignDataTypeChange(type, !!checked)}
                        />
                        <Label htmlFor={`signData-${type}`} className="text-sm">{type}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Modals</CardTitle>
            <CardDescription>Show modal dialogs for actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="modalsBefore">Before</Label>
              <Switch id="modalsBefore" checked={modalsBefore} onCheckedChange={setModalsBefore} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="modalsSuccess">Success</Label>
              <Switch id="modalsSuccess" checked={modalsSuccess} onCheckedChange={setModalsSuccess} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="modalsError">Error</Label>
              <Switch id="modalsError" checked={modalsError} onCheckedChange={setModalsError} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Show toast notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="notificationsBefore">Before</Label>
              <Switch id="notificationsBefore" checked={notificationsBefore} onCheckedChange={setNotificationsBefore} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="notificationsSuccess">Success</Label>
              <Switch id="notificationsSuccess" checked={notificationsSuccess} onCheckedChange={setNotificationsSuccess} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="notificationsError">Error</Label>
              <Switch id="notificationsError" checked={notificationsError} onCheckedChange={setNotificationsError} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: UI Settings + Redirect Settings */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>UI Settings</CardTitle>
            <CardDescription>TonConnect UI appearance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select value={language} onValueChange={(v) => setLanguage(v as LanguageOption)}>
                <SelectTrigger id="language"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">System (auto-detect)</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ru">Русский</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select value={theme} onValueChange={(v) => setTheme(v as ThemeOption)}>
                <SelectTrigger id="theme"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="borders">Border Radius</Label>
              <Select value={borderRadius} onValueChange={(v) => setBorderRadius(v as "s" | "m" | "none")}>
                <SelectTrigger id="borders"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="m">Medium</SelectItem>
                  <SelectItem value="s">Small</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Redirect Settings</CardTitle>
            <CardDescription>Configure wallet redirect behavior</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="returnStrategy">Return Strategy</Label>
              <Select value={returnStrategy} onValueChange={(v) => setReturnStrategy(v as "back" | "none")}>
                <SelectTrigger id="returnStrategy"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="back">Back</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="twaReturnUrl">TWA Return URL</Label>
              <Input
                id="twaReturnUrl"
                value={twaReturnUrl}
                onChange={(e) => setTwaReturnUrl(e.target.value)}
                placeholder="tg://resolve?domain=..."
              />
              <p className="text-xs text-muted-foreground">
                Return URL for Telegram Web App connections
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Android Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Android Settings</CardTitle>
          <CardDescription>Android-specific behavior</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="androidBack">Enable Back Handler</Label>
              <p className="text-xs text-muted-foreground">
                Use Android back button to close modals
              </p>
            </div>
            <Switch
              id="androidBack"
              checked={enableAndroidBackHandler}
              onCheckedChange={setEnableAndroidBackHandler}
            />
          </div>
        </CardContent>
      </Card>

      {/* Row 4: Colors */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Colors</h3>
          <Button variant="outline" size="sm" onClick={resetColors} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Reset to Defaults
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <ColorsCard
            title="Dark Theme Colors"
            description="Colors used when dark theme is active"
            colors={darkColors}
            onUpdate={updateDarkColor}
          />
          <ColorsCard
            title="Light Theme Colors"
            description="Colors used when light theme is active"
            colors={lightColors}
            onUpdate={updateLightColor}
          />
        </div>
      </div>

      {/* Deprecated Options - only shown when enabled in DevTools */}
      {showDeprecated && (
        <Card className="border-yellow-500/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-500">
              <AlertTriangle className="h-5 w-5" />
              Deprecated Options
            </CardTitle>
            <CardDescription>
              These options are deprecated and may be removed in future SDK versions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="skipRedirect">Skip Redirect to Wallet</Label>
              <Select value={skipRedirect} onValueChange={(v) => setSkipRedirect(v as "never" | "always" | "ios")}>
                <SelectTrigger id="skipRedirect"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ios">iOS only</SelectItem>
                  <SelectItem value="never">Never</SelectItem>
                  <SelectItem value="always">Always</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Deprecated: SDK now auto-detects for TWA connections. In TMA this is always forced to "never".
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Configuration Export - Experimental */}
      {showExperimental && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Configuration Export</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Combined controls: Tabs + Options */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <TabsList className="h-9">
                <TabsTrigger
                  value="json"
                  className="text-xs px-3"
                  onClick={() => setExportFormat("json")}
                  data-state={exportFormat === "json" ? "active" : "inactive"}
                >
                  JSON
                </TabsTrigger>
                <TabsTrigger
                  value="react"
                  className="text-xs px-3"
                  onClick={() => setExportFormat("react")}
                  data-state={exportFormat === "react" ? "active" : "inactive"}
                >
                  React
                </TabsTrigger>
                <TabsTrigger
                  value="vanilla"
                  className="text-xs px-3"
                  onClick={() => setExportFormat("vanilla")}
                  data-state={exportFormat === "vanilla" ? "active" : "inactive"}
                >
                  Vanilla JS
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <Checkbox
                    id="showFullConfig"
                    checked={showFullConfig}
                    onCheckedChange={(checked) => setShowFullConfig(!!checked)}
                  />
                  <span className="text-xs text-muted-foreground">All</span>
                </label>
                {showDeprecated && (
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <Checkbox
                      id="includeDeprecated"
                      checked={includeDeprecatedInExport}
                      onCheckedChange={(checked) => setIncludeDeprecatedInExport(!!checked)}
                    />
                    <span className="text-xs text-yellow-500">Deprecated</span>
                  </label>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 gap-1"
                  onClick={async () => {
                    const content = formatConfiguration(buildConfiguration(showFullConfig, includeDeprecatedInExport), exportFormat)
                    await navigator.clipboard.writeText(content)
                    toast.success("Copied to clipboard")
                  }}
                >
                  <Copy className="h-3 w-3" />
                  <span className="text-xs">Copy</span>
                </Button>
              </div>
            </div>

            <JsonViewer
              title=""
              json={formatConfiguration(buildConfiguration(showFullConfig, includeDeprecatedInExport), exportFormat)}
              collapsible={false}
              maxHeight={400}
              language={exportFormat === "json" ? "json" : "typescript"}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
