import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useTonProof } from "@/hooks/useTonProof"
import { useTonWallet } from "@tonconnect/ui-react"
import { CheckCircle, XCircle, Loader2, Shield, User, RefreshCw, Key } from "lucide-react"

export function TonProofTab() {
  const wallet = useTonWallet()
  const {
    status,
    authToken,
    accountInfo,
    error,
    isAuthenticated,
    isLoading,
    requestJson,
    responseJson,
    generatePayload,
    fetchAccountInfo,
    reset
  } = useTonProof()

  const statusColors: Record<string, string> = {
    idle: 'bg-muted-foreground',
    generating: 'bg-warning',
    connecting: 'bg-primary',
    verifying: 'bg-primary/70',
    authenticated: 'bg-success',
    error: 'bg-destructive'
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Ton Proof Authentication
              </CardTitle>
              <CardDescription>
                Authenticate users with cryptographic proof of wallet ownership
              </CardDescription>
            </div>
            <Badge className={statusColors[status]}>
              {status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Error display */}
          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success display */}
          {isAuthenticated && (
            <Alert variant="success">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Authenticated</AlertTitle>
              <AlertDescription>
                Your wallet ownership has been cryptographically verified.
              </AlertDescription>
            </Alert>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-4">
            {!isAuthenticated && !wallet && (
              <Button
                onClick={generatePayload}
                disabled={isLoading}
                className="gap-2"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Key className="h-4 w-4" />
                )}
                Generate Payload & Connect
              </Button>
            )}

            {!isAuthenticated && wallet && status === 'idle' && (
              <Alert>
                <AlertDescription>
                  Disconnect wallet first to authenticate with TonProof.
                  TonProof must be requested during connection.
                </AlertDescription>
              </Alert>
            )}

            {isAuthenticated && (
              <>
                <Button onClick={fetchAccountInfo} variant="outline" className="gap-2">
                  <User className="h-4 w-4" />
                  Get Account Info
                </Button>
                <Button onClick={reset} variant="ghost" className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Reset
                </Button>
              </>
            )}
          </div>

          {/* Auth Token display */}
          {authToken && (
            <div className="space-y-2">
              <h3 className="font-medium">Auth Token (JWT)</h3>
              <ScrollArea className="h-24 rounded-md border bg-muted p-3">
                <pre className="text-xs break-all whitespace-pre-wrap">{authToken}</pre>
              </ScrollArea>
            </div>
          )}

          {/* Account Info display */}
          {accountInfo && (
            <div className="space-y-2">
              <h3 className="font-medium">Account Info</h3>
              <ScrollArea className="h-48 rounded-md border bg-muted p-3">
                <pre className="text-xs">{JSON.stringify(accountInfo, null, 2)}</pre>
              </ScrollArea>
            </div>
          )}

          {/* Request/Response JSON */}
          {(requestJson || responseJson) && (
            <div className="grid gap-4 md:grid-cols-2">
              {requestJson && (
                <div className="space-y-2">
                  <h3 className="font-medium text-sm">Request</h3>
                  <ScrollArea className="h-48 rounded-md border bg-muted p-3">
                    <pre className="text-xs">{requestJson}</pre>
                  </ScrollArea>
                </div>
              )}
              {responseJson && (
                <div className="space-y-2">
                  <h3 className="font-medium text-sm">Response</h3>
                  <ScrollArea className="h-48 rounded-md border bg-muted p-3">
                    <pre className="text-xs">{responseJson}</pre>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* How it works */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">How TonProof Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium text-foreground mb-2">1. Generate Payload</h4>
              <p>Server generates random bytes and creates a JWT payload token. The hash of this token is sent to the wallet.</p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">2. Wallet Signs</h4>
              <p>Wallet signs a message containing the payload hash, domain, timestamp, and address using Ed25519.</p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">3. Server Verifies</h4>
              <p>Server verifies the signature, checks the payload token, and validates address matches stateInit.</p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">4. Issue Auth Token</h4>
              <p>On success, server issues a JWT auth token that can be used to access protected endpoints.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
