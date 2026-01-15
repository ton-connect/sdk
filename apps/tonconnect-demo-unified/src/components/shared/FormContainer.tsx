import { useState, useEffect, useMemo, useRef } from "react"
import type { ReactNode } from "react"
import CodeMirror from "@uiw/react-codemirror"
import { json } from "@codemirror/lang-json"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { JsonViewer } from "./JsonViewer"
import { ResultCard } from "./ResultCard"
import { AlertCircle, AlertTriangle, Copy, ChevronDown, RotateCcw, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useSettingsContext } from "@/context/SettingsContext"
import { createTonConnectTheme } from "@/lib/codemirror-theme"
import type { ValidationResult } from "@/utils/validator"
import type { OperationResult } from "@/hooks/useTransaction"

export interface PresetOption {
  id: string
  name: string
  description: string
}

type EditorMode = "form" | "raw"

interface FormContainerProps {
  // Metadata
  title: string
  submitButtonText?: string
  codeEditorHeight?: string

  // Content
  formContent: ReactNode
  requestJson: string

  // Callbacks
  onJsonChange?: (json: string) => void
  onSend: () => void
  onSendRaw?: (json: string) => void

  // Validation
  validateJson?: (json: string) => ValidationResult

  // State
  isConnected: boolean
  isLoading?: boolean

  // Presets
  presets?: PresetOption[]
  onPresetSelect?: (presetId: string) => void

  // Result
  lastResult?: OperationResult | null
  onClearResult?: () => void
  onLoadResult?: () => void
}

function isValidJson(str: string): boolean {
  try {
    JSON.parse(str)
    return true
  } catch {
    return false
  }
}

export function FormContainer({
  title,
  submitButtonText = "Send Transaction",
  codeEditorHeight = "400px",
  formContent,
  requestJson,
  onJsonChange,
  onSend,
  onSendRaw,
  validateJson,
  isConnected,
  isLoading = false,
  presets,
  onPresetSelect,
  lastResult,
  onClearResult,
  onLoadResult,
}: FormContainerProps) {
  const [mode, setMode] = useState<EditorMode>("form")
  const [editedJson, setEditedJson] = useState(requestJson)
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const resultRef = useRef<HTMLDivElement>(null)

  const { theme } = useSettingsContext()

  // Determine if dark mode based on theme setting
  const isDark = useMemo(() => {
    if (theme === "system") {
      return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches
    }
    return theme === "dark"
  }, [theme])

  // Create reactive CodeMirror theme
  const codemirrorTheme = useMemo(() => createTonConnectTheme(isDark), [isDark])

  // Sync JSON when in form mode or when requestJson changes
  useEffect(() => {
    if (mode === "form") {
      setEditedJson(requestJson)
      setValidationResult(null) // Clear validation when switching to form
    }
  }, [requestJson, mode])

  // Smart scroll to result when it appears
  useEffect(() => {
    if (lastResult && resultRef.current) {
      const rect = resultRef.current.getBoundingClientRect()
      if (rect.top > window.innerHeight) {
        resultRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" })
      }
    }
  }, [lastResult?.id])

  // Handle mode switch
  const handleModeChange = (newMode: EditorMode) => {
    if (newMode === mode) return

    if (mode === "raw" && newMode === "form") {
      // Code → Form: check validity first
      if (!isValidJson(editedJson)) {
        // Syntax error - confirm discard
        if (!confirm("Invalid JSON syntax. Discard changes and switch to Form?")) {
          return
        }
        setEditedJson(requestJson)
        setValidationResult(null)
        setMode("form")
        return
      }

      // Check schema validation
      if (validateJson) {
        const result = validateJson(editedJson)
        if (!result.valid) {
          // Schema warnings - confirm discard
          if (!confirm("JSON has validation errors. Some data may be lost. Switch to Form anyway?")) {
            return
          }
        }
      }

      // Apply changes
      onJsonChange?.(editedJson)
      setValidationResult(null)
    }

    if (mode === "form" && newMode === "raw") {
      // Form → Code: sync JSON
      setEditedJson(requestJson)
      setValidationResult(null)
    }

    setMode(newMode)
  }

  // Reset editor to form state
  const handleReset = () => {
    setEditedJson(requestJson)
    setValidationResult(null)
    toast.success("Reset to form state")
  }

  // Actually send the transaction (internal)
  const doSend = () => {
    if (onSendRaw) {
      onSendRaw(editedJson)
    } else {
      onJsonChange?.(editedJson)
      onSend()
    }
  }

  // Handle send - validates first in Code mode
  const handleSend = () => {
    if (mode === "form") {
      onSend()
    } else {
      // Code mode - validate before sending
      if (!isValidJson(editedJson)) {
        setValidationResult({ valid: false, errors: [{ path: "root", message: "Invalid JSON syntax" }] })
        return
      }

      // Run schema validation
      if (validateJson) {
        const result = validateJson(editedJson)
        if (!result.valid) {
          // Show warnings and DON'T send - user must click "Send Anyway"
          setValidationResult(result)
          return
        }
      }

      // All validation passed - send
      doSend()
    }
  }

  // Send anyway - bypasses schema validation (but still checks syntax)
  const handleSendAnyway = () => {
    if (!isValidJson(editedJson)) {
      return // Syntax errors still block
    }
    setValidationResult(null)
    doSend()
  }

  // Determine validation state (only shown after Send click)
  const hasSyntaxError = validationResult?.errors.some(e => e.message === "Invalid JSON syntax")
  const hasSchemaWarnings = validationResult && !validationResult.valid && !hasSyntaxError

  // Send button disabled state - disabled if not connected or loading
  const sendDisabled = !isConnected || isLoading

  return (
    <div className="space-y-4">
      <Card>
        {/* Header: Title + Toggle + Send */}
        <CardHeader className="flex flex-col gap-3 border-b sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <h2 className="text-lg font-semibold">{title}</h2>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap sm:gap-3">
            {/* Presets Dropdown */}
            {presets && presets.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="border h-8 px-2 sm:px-3">
                    Presets
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  {presets.map((preset) => (
                    <DropdownMenuItem
                      key={preset.id}
                      onClick={() => onPresetSelect?.(preset.id)}
                      className="flex flex-col items-start gap-0.5 cursor-pointer"
                    >
                      <span className="font-medium">{preset.name}</span>
                      <span className="text-xs text-muted-foreground">{preset.description}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Segmented Toggle */}
            <div className="inline-flex rounded-md border">
              <Button
                variant={mode === "form" ? "secondary" : "ghost"}
                size="sm"
                className="rounded-r-none border-r-0 h-8 px-2 sm:px-3"
                onClick={() => handleModeChange("form")}
              >
                Form
              </Button>
              <Button
                variant={mode === "raw" ? "secondary" : "ghost"}
                size="sm"
                className="rounded-l-none h-8 px-2 sm:px-3"
                onClick={() => handleModeChange("raw")}
              >
                Raw
              </Button>
            </div>

            {/* Send Button */}
            <Button
              onClick={handleSend}
              disabled={sendDisabled}
              size="sm"
              className="h-8 ml-auto sm:ml-0"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              <span className="hidden sm:inline">{submitButtonText}</span>
              <span className="sm:hidden">Send</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {mode === "form" ? (
            // Form mode: 2 columns in one card
            <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-6 lg:gap-8">
              {/* LEFT: Form */}
              <div className="space-y-4 min-w-0">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Configure</h3>
                {formContent}
              </div>

              {/* RIGHT: Preview (with left border on lg) */}
              <div className="space-y-4 min-w-0 lg:border-l lg:pl-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Request Preview</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 gap-1"
                    onClick={() => {
                      navigator.clipboard.writeText(requestJson)
                      toast.success("Copied to clipboard")
                    }}
                  >
                    <Copy className="h-3 w-3" />
                    Copy
                  </Button>
                </div>
                <JsonViewer
                  title=""
                  json={requestJson}
                  collapsible={false}
                  maxHeight={500}
                />
              </div>
            </div>
          ) : (
            // Code mode: Full width editor with toolbar
            <div className="space-y-4">
              {/* Toolbar */}
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 gap-1.5 text-muted-foreground hover:text-foreground"
                  onClick={handleReset}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 gap-1.5 text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    navigator.clipboard.writeText(editedJson)
                    toast.success("Copied to clipboard")
                  }}
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </Button>
              </div>

              <CodeMirror
                value={editedJson}
                onChange={(value) => {
                  setEditedJson(value)
                  // Clear validation when user edits
                  if (validationResult) {
                    setValidationResult(null)
                  }
                }}
                extensions={[json(), ...codemirrorTheme]}
                theme="none"
                height={codeEditorHeight}
                className="rounded-md border overflow-hidden"
              />

              {/* Syntax Error (shown after Send attempt) */}
              {hasSyntaxError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>Invalid JSON syntax. Please fix before sending.</AlertDescription>
                </Alert>
              )}

              {/* Schema Warnings (shown after Send attempt, blocks until "Send Anyway") */}
              {hasSchemaWarnings && (
                <Alert className="border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-200">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="flex items-center justify-between gap-4">
                    <span>
                      {validationResult!.errors.map(e => `${e.path}: ${e.message}`).join("; ")}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0 border-orange-500 text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900"
                      onClick={handleSendAnyway}
                    >
                      Send Anyway
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

            </div>
          )}
        </CardContent>
      </Card>

      {/* Result Card - ALWAYS visible (regardless of mode) */}
      {lastResult && (
        <div ref={resultRef}>
          <ResultCard
            result={lastResult}
            onDismiss={onClearResult}
            onLoadToForm={onLoadResult}
          />
        </div>
      )}
    </div>
  )
}
