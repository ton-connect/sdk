import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useDevToolsContext } from "@/context/DevToolsContext"
import { AlertTriangle, Lock, RotateCcw, Terminal, Bug, Radio, BookOpen } from "lucide-react"

export function DevToolsTab() {
  const {
    qaMode,
    setQaMode,
    erudaEnabled,
    setErudaEnabled,
    rpcLogsEnabled,
    setRpcLogsEnabled,
    docsHidden,
    setDocsHidden,
    lockDevTools,
    resetAll,
  } = useDevToolsContext()

  return (
    <div className="space-y-6">
      {/* Warning Banner */}
      <div className="flex items-center gap-3 rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4">
        <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0" />
        <div>
          <p className="font-medium text-yellow-500">Developer Tools</p>
          <p className="text-sm text-muted-foreground">
            These settings are for development and testing only. Do not use in production.
          </p>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        {/* QA Mode */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bug className="h-5 w-5" />
              QA Mode
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">SDK</Badge>
            </CardTitle>
            <CardDescription>
              SDK development mode: disables validations and uses staging wallets list
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="qaMode">Enable QA Mode</Label>
                <p className="text-xs text-muted-foreground">
                  Page will reload when changed
                </p>
              </div>
              <Switch
                id="qaMode"
                checked={qaMode}
                onCheckedChange={setQaMode}
              />
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <p>When enabled:</p>
              <ul className="list-disc list-inside space-y-0.5 ml-2">
                <li>Validation errors become console warnings</li>
                <li>Cross-network transactions allowed</li>
                <li>Uses staging wallets list</li>
                <li>Shows injected wallets</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Eruda Console */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="h-5 w-5" />
              Mobile Console
            </CardTitle>
            <CardDescription>
              Eruda console for mobile debugging
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="eruda">Enable Eruda</Label>
                <p className="text-xs text-muted-foreground">
                  Shows debug console on screen
                </p>
              </div>
              <Switch
                id="eruda"
                checked={erudaEnabled}
                onCheckedChange={setErudaEnabled}
              />
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <p>Eruda provides:</p>
              <ul className="list-disc list-inside space-y-0.5 ml-2">
                <li>Console logs viewer</li>
                <li>Network requests inspector</li>
                <li>DOM elements explorer</li>
                <li>Storage viewer</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* RPC Logs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Radio className="h-5 w-5" />
              RPC Logs
            </CardTitle>
            <CardDescription>
              Capture raw SDK requests and responses
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="rpcLogs">Enable RPC Logs</Label>
                <p className="text-xs text-muted-foreground">
                  Intercepts console.debug from SDK
                </p>
              </div>
              <Switch
                id="rpcLogs"
                checked={rpcLogsEnabled}
                onCheckedChange={setRpcLogsEnabled}
              />
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <p>Shows raw JSON-RPC data:</p>
              <ul className="list-disc list-inside space-y-0.5 ml-2">
                <li>Request payloads with id</li>
                <li>Response payloads</li>
                <li>Request/response timing</li>
                <li>Error details</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Documentation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Documentation
            </CardTitle>
            <CardDescription>
              Show or hide inline documentation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="docsHidden">Hide Documentation</Label>
                <p className="text-xs text-muted-foreground">
                  Hides "How it works" sections
                </p>
              </div>
              <Switch
                id="docsHidden"
                checked={docsHidden}
                onCheckedChange={setDocsHidden}
              />
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <p>When hidden:</p>
              <ul className="list-disc list-inside space-y-0.5 ml-2">
                <li>HowItWorks cards are hidden</li>
                <li>Cleaner interface for demos</li>
                <li>Field tooltips remain visible</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions & Info */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
            <CardDescription>Manage DevTools settings</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={lockDevTools}
              className="gap-2"
            >
              <Lock className="h-4 w-4" />
              Lock DevTools
            </Button>
            <Button
              variant="outline"
              onClick={resetAll}
              className="gap-2 text-destructive hover:text-destructive"
            >
              <RotateCcw className="h-4 w-4" />
              Reset All
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Information</CardTitle>
            <CardDescription>Current DevTools state</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="font-mono text-xs space-y-1 text-muted-foreground">
              <p>localStorage keys:</p>
              <ul className="list-disc list-inside ml-2">
                <li>devtools:qa-mode: {localStorage.getItem('devtools:qa-mode') ?? 'null'}</li>
                <li>devtools:eruda: {localStorage.getItem('devtools:eruda') ?? 'null'}</li>
                <li>devtools:rpc-logs: {localStorage.getItem('devtools:rpc-logs') ?? 'null'}</li>
                <li>devtools:docs-hidden: {localStorage.getItem('devtools:docs-hidden') ?? 'null'}</li>
                <li>devtools:unlocked: {localStorage.getItem('devtools:unlocked') ?? 'null'}</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
