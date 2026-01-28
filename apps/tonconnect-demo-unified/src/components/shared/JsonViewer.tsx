import { useMemo, useState } from "react"
import CodeMirror from "@uiw/react-codemirror"
import { json } from "@codemirror/lang-json"
import { javascript } from "@codemirror/lang-javascript"
import { EditorView } from "@codemirror/view"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Copy, ChevronRight, ChevronDown } from "lucide-react"
import { toast } from "sonner"
import { useSettingsContext } from "@/context/SettingsContext"
import { createTonConnectTheme } from "@/lib/codemirror-theme"

interface JsonViewerProps {
  title: string
  json: string
  /** Default expanded state */
  defaultExpanded?: boolean
  /** Max height for long JSON (default 200px) */
  maxHeight?: number
  /** Show inline for short JSON (default 80 chars) */
  inlineThreshold?: number
  /** Allow collapsing (default true) */
  collapsible?: boolean
  /** Language for syntax highlighting (default json) */
  language?: "json" | "typescript"
}

export function JsonViewer({
  title,
  json: jsonString,
  defaultExpanded = true,
  maxHeight = 200,
  inlineThreshold = 80,
  collapsible = true,
  language = "json",
}: JsonViewerProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const { theme } = useSettingsContext()

  const isDark = useMemo(() => {
    if (theme === "system") {
      return typeof window !== "undefined" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
    }
    return theme === "dark"
  }, [theme])

  const codemirrorTheme = useMemo(() => createTonConnectTheme(isDark), [isDark])

  // Language extension for syntax highlighting
  const langExtension = useMemo(() => {
    return language === "typescript"
      ? javascript({ jsx: true, typescript: true })
      : json()
  }, [language])

  // Parse and format content
  const { formatted, lineCount, isShort } = useMemo(() => {
    // For TypeScript/JS, don't try to parse as JSON
    if (language === "typescript") {
      const lines = jsonString.split("\n")
      return {
        formatted: jsonString,
        lineCount: lines.length,
        isShort: false, // Never show inline for code
      }
    }

    // For JSON, try to parse and pretty-print
    try {
      const parsed = JSON.parse(jsonString)
      const formatted = JSON.stringify(parsed, null, 2)
      const lines = formatted.split("\n")
      return {
        formatted,
        lineCount: lines.length,
        isShort: formatted.length <= inlineThreshold && lines.length <= 2,
      }
    } catch {
      return { formatted: jsonString, lineCount: 1, isShort: jsonString.length <= inlineThreshold }
    }
  }, [jsonString, inlineThreshold, language])

  const copyToClipboard = async (e: React.MouseEvent) => {
    e.stopPropagation() // Don't toggle collapsible
    try {
      await navigator.clipboard.writeText(formatted)
      toast.success("Copied to clipboard")
    } catch {
      toast.error("Failed to copy")
    }
  }

  // Calculate height: line-height ~18px + padding
  const calculatedHeight = useMemo(() => {
    const lineHeight = 18
    const padding = 16
    const naturalHeight = lineCount * lineHeight + padding
    return Math.min(naturalHeight, maxHeight)
  }, [lineCount, maxHeight])

  // Short JSON - show inline without collapsible
  if (isShort) {
    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <Label className="text-sm text-muted-foreground">{title}</Label>
          <Button
            variant="ghost"
            size="sm"
            onClick={copyToClipboard}
            className="h-6 px-2 gap-1"
          >
            <Copy className="h-3 w-3" />
            Copy
          </Button>
        </div>
        <code className="block text-xs font-mono bg-muted/50 px-3 py-2 rounded-md border">
          {formatted}
        </code>
      </div>
    )
  }

  // Non-collapsible mode - just show CodeMirror with optional header
  if (!collapsible) {
    return (
      <div className="space-y-2">
        {title && (
          <div className="flex items-center justify-between">
            <Label className="text-sm text-muted-foreground">{title}</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyToClipboard}
              className="h-6 px-2 gap-1"
            >
              <Copy className="h-3 w-3" />
              Copy
            </Button>
          </div>
        )}
        <CodeMirror
          value={formatted}
          extensions={[
            langExtension,
            EditorView.editable.of(false),
            ...codemirrorTheme,
          ]}
          theme="none"
          height={`${calculatedHeight}px`}
          basicSetup={{
            lineNumbers: false,
            foldGutter: false,
            highlightActiveLine: false,
            highlightSelectionMatches: false,
          }}
          className="rounded-md border overflow-hidden text-xs [&_.cm-content]:cursor-default"
          editable={false}
        />
      </div>
    )
  }

  // Long content - collapsible with CodeMirror
  return (
    <Collapsible open={expanded} onOpenChange={setExpanded}>
      <div className="flex items-center justify-between">
        <CollapsibleTrigger className="flex items-center gap-1 text-sm hover:text-foreground text-muted-foreground">
          {expanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          {title}
          {!expanded && (
            <span className="text-xs ml-2 opacity-60">
              ({lineCount} lines)
            </span>
          )}
        </CollapsibleTrigger>
        <Button
          variant="ghost"
          size="sm"
          onClick={copyToClipboard}
          className="h-6 px-2 gap-1"
        >
          <Copy className="h-3 w-3" />
          Copy
        </Button>
      </div>
      <CollapsibleContent className="pt-2">
        <CodeMirror
          value={formatted}
          extensions={[
            langExtension,
            EditorView.editable.of(false),
            ...codemirrorTheme,
          ]}
          theme="none"
          height={`${calculatedHeight}px`}
          basicSetup={{
            lineNumbers: false,
            foldGutter: false,
            highlightActiveLine: false,
            highlightSelectionMatches: false,
          }}
          className="rounded-md border overflow-hidden text-xs [&_.cm-content]:cursor-default"
          editable={false}
        />
      </CollapsibleContent>
    </Collapsible>
  )
}
