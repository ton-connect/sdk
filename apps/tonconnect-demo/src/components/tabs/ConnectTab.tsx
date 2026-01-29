import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useConnect } from "@/hooks/useConnect"
import { ConnectedWalletCard } from "@/components/shared/ConnectedWalletCard"
import { ConnectionEventsCard } from "@/components/shared/ConnectionEventsCard"
import { JsonViewer } from "@/components/shared/JsonViewer"
import { HowItWorksCard } from "@/components/shared/HowItWorksCard"
import { FieldLabel } from "@/components/shared/FieldLabel"
import {
  Plug,
  RefreshCw,
  Key,
  ShieldCheck,
  User,
  Loader2,
  XCircle,
  AlertCircle,
  ChevronRight,
  Copy,
  Check
} from "lucide-react"
import { useState } from "react"
import { copyToClipboard } from "@/utils/clipboard"

// Inline copy button for text flow
function InlineCopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await copyToClipboard(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex align-text-bottom ml-0.5 p-0.5 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
    </button>
  )
}

// Verification checks from backend
interface VerifyChecks {
  jwtValid: boolean
  payloadMatch: boolean
  publicKeyMatch: boolean
  addressMatch: boolean
  domainAllowed: boolean
  timestampValid: boolean
  signatureValid: boolean
}


// Display proof data from wallet
interface TonProof {
  timestamp: number
  domain: { lengthBytes: number; value: string }
  payload: string
  signature: string
  state_init?: string
}

interface WalletResponseDisplayProps {
  proof: TonProof | null
  address: string | null
  publicKey: string | null
  checks: VerifyChecks | null
  payloadToken: string | null
}

function CheckMark({ valid }: { valid: boolean }) {
  return valid ? (
    <span className="text-green-600 dark:text-green-400 ml-2">✓</span>
  ) : (
    <span className="text-red-600 dark:text-red-400 ml-2">✗</span>
  )
}

function WalletResponseDisplay({ proof, address, publicKey, checks, payloadToken }: WalletResponseDisplayProps) {
  return (
    <div className="space-y-2 text-xs">
      <div className="font-medium text-muted-foreground">Wallet Response</div>

      <div className="space-y-1">
        {/* timestamp */}
        <p>
          <span className="font-semibold w-20 inline-block">timestamp</span>
          {proof ? (
            <>
              <span className="font-mono">{proof.timestamp}</span>
              <span className="text-muted-foreground ml-1">
                ({new Date(proof.timestamp * 1000).toLocaleTimeString('en-US', { hour12: false })})
              </span>
              {checks && <CheckMark valid={checks.timestampValid} />}
            </>
          ) : (
            <span className="text-muted-foreground">signing time (unix)</span>
          )}
        </p>

        {/* domain */}
        <p>
          <span className="font-semibold w-20 inline-block">domain</span>
          {proof ? (
            <>
              <span className="font-mono">{proof.domain.value}</span>
              {checks && <CheckMark valid={checks.domainAllowed} />}
            </>
          ) : (
            <span className="text-muted-foreground">requesting domain</span>
          )}
        </p>

        {/* payload */}
        <p>
          <span className="font-semibold w-20 inline-block align-top">payload</span>
          {proof ? (
            <>
              <code
                onClick={() => copyToClipboard(proof.payload)}
                className="font-mono bg-primary/10 py-0.5 rounded break-all cursor-pointer hover:bg-primary/20 transition-colors [box-decoration-break:clone] [-webkit-box-decoration-break:clone]"
                title="Click to copy"
              >
                {proof.payload}
              </code>
              {checks && <CheckMark valid={checks.payloadMatch} />}
            </>
          ) : (
            <span className="text-muted-foreground">your challenge</span>
          )}
        </p>

        {/* signature */}
        <p>
          <span className="font-semibold w-20 inline-block align-top">signature</span>
          {proof ? (
            <>
              <code
                onClick={() => copyToClipboard(proof.signature)}
                className="font-mono bg-primary/10 py-0.5 rounded break-all cursor-pointer hover:bg-primary/20 transition-colors [box-decoration-break:clone] [-webkit-box-decoration-break:clone]"
                title="Click to copy"
              >
                {proof.signature}
              </code>
              {checks && <CheckMark valid={checks.signatureValid} />}
            </>
          ) : (
            <span className="text-muted-foreground">Ed25519 signature</span>
          )}
        </p>
      </div>

      {/* Account data (from wallet.account) */}
      <div className="space-y-1 mt-2">
        {/* address */}
        <p>
          <span className="font-semibold w-20 inline-block align-top">address</span>
          {address ? (
            <>
              <code
                onClick={() => copyToClipboard(address)}
                className="font-mono bg-primary/10 py-0.5 rounded break-all cursor-pointer hover:bg-primary/20 transition-colors [box-decoration-break:clone] [-webkit-box-decoration-break:clone]"
                title="Click to copy"
              >
                {address}
              </code>
              {checks && <CheckMark valid={checks.addressMatch} />}
            </>
          ) : (
            <span className="text-muted-foreground">wallet address</span>
          )}
        </p>

        {/* public key */}
        <p>
          <span className="font-semibold w-20 inline-block align-top">public key</span>
          {publicKey ? (
            <>
              <code
                onClick={() => copyToClipboard(publicKey)}
                className="font-mono bg-primary/10 py-0.5 rounded break-all cursor-pointer hover:bg-primary/20 transition-colors [box-decoration-break:clone] [-webkit-box-decoration-break:clone]"
                title="Click to copy"
              >
                {publicKey}
              </code>
              {checks && <CheckMark valid={checks.publicKeyMatch} />}
            </>
          ) : (
            <span className="text-muted-foreground">Ed25519 public key</span>
          )}
        </p>
      </div>

      {/* Implementation details */}
      <Collapsible>
        <CollapsibleTrigger className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
          <ChevronRight className="h-3 w-3 transition-transform duration-200 [[data-state=open]>&]:rotate-90" />
          Implementation details
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-1.5 pl-4">
          <p>
            <span className="font-semibold w-20 inline-block align-top">JWT</span>
            {payloadToken ? (
              <>
                <code
                  onClick={() => copyToClipboard(payloadToken)}
                  className="font-mono bg-primary/10 py-0.5 rounded break-all cursor-pointer hover:bg-primary/20 transition-colors [box-decoration-break:clone] [-webkit-box-decoration-break:clone]"
                  title="Click to copy"
                >
                  {payloadToken}
                </code>
                {checks && <CheckMark valid={checks.jwtValid} />}
              </>
            ) : (
              <span className="text-muted-foreground">stateless auth token</span>
            )}
          </p>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

function PayloadDisplay({ response }: { response: Record<string, unknown> }) {
  const payloadToken = String(response.payloadToken || '')
  const payloadTokenHash = String(response.payloadTokenHash || '')

  return (
    <div className="space-y-3">
      {/* Challenge - inline text flow */}
      <p className="text-xs">
        <span className="font-semibold">Challenge</span>{' '}
        <code className="font-mono bg-primary/10 px-1 py-0.5 rounded break-all [box-decoration-break:clone] [-webkit-box-decoration-break:clone]">
          {payloadTokenHash}
        </code>
        <InlineCopyButton text={payloadTokenHash} />
      </p>

      {/* Implementation detail */}
      <Collapsible>
        <CollapsibleTrigger className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ChevronRight className="h-3 w-3 transition-transform duration-200 [[data-state=open]>&]:rotate-90" />
          Implementation details (JWT)
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2">
          <div className="space-y-2 pl-4 border-l-2 border-muted">
            <FieldLabel fieldId="payloadToken">
              <code className="text-xs font-semibold">payloadToken</code>
            </FieldLabel>
            <div className="bg-muted/30 rounded-md p-2 font-mono text-[10px] break-all max-h-16 overflow-auto">
              {payloadToken}
            </div>
            <p className="text-[10px] text-muted-foreground">
              This demo uses JWT to create a stateless backend. Your implementation may differ.
            </p>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

export function ConnectTab() {
  const {
    wallet,
    hasProof,
    isAuthenticated,

    operations,
    clearOperations,
    deleteOperation,

    isGeneratingPayload,
    isConnecting,
    isVerifying,
    isFetchingAccount,

    connect,
    disconnect,
    generatePayload,
    connectWithProof,
    verifyProof,
    getAccountInfo,

    payloadResult,
    verifyResult,
    accountResult,

    canConnect,
    canConnectWithProof,
    canVerify,
    canGetAccount
  } = useConnect()

  return (
    <div className="space-y-6">
      {/* Connected Wallet Card - TOP */}
      <ConnectedWalletCard
        wallet={wallet}
        isAuthenticated={isAuthenticated}
        onDisconnect={disconnect}
      />

      {/* Two columns: 1fr / 2fr */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Simple Connection */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plug className="h-5 w-5" />
              Simple Connection
            </CardTitle>
            <CardDescription>
              Connect wallet without TonProof
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={connect}
              disabled={!canConnect}
              className="gap-2"
            >
              {isConnecting && !hasProof ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plug className="h-4 w-4" />
              )}
              Connect
            </Button>
          </CardContent>
        </Card>

        {/* Right: TonProof Connect */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              TonProof Connect
            </CardTitle>
            <CardDescription>
              Connect with cryptographic proof of wallet ownership
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Backend Challenge */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-medium">
                  1
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <FieldLabel fieldId="backendChallenge">
                      <span className="font-medium text-sm">Backend Challenge</span>
                    </FieldLabel>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-5 w-5 ml-auto"
                      onClick={generatePayload}
                      disabled={isGeneratingPayload}
                      title="Regenerate challenge"
                    >
                      {isGeneratingPayload ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Your backend generates a challenge for wallet to sign</p>
                </div>
                {payloadResult?.status === 'error' && (
                  <XCircle className="h-4 w-4 text-destructive" />
                )}
              </div>

              <div className="pl-9 space-y-3">
                {/* Loading state */}
                {isGeneratingPayload && !payloadResult && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating challenge...
                  </div>
                )}

                {/* Payload Data */}
                {payloadResult?.status === 'success' && payloadResult.response != null && (
                  <PayloadDisplay response={payloadResult.response as Record<string, unknown>} />
                )}

                {/* Error */}
                {payloadResult?.status === 'error' && (
                  <Alert variant="destructive" className="py-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">{payloadResult.error}</AlertDescription>
                  </Alert>
                )}
              </div>
            </div>

            {/* Step 2: Connect with Proof */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-medium">
                  2
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <FieldLabel fieldId="connectWithProof">
                      <span className="font-medium text-sm">Connect with Proof</span>
                    </FieldLabel>
                    <Button
                      size="sm"
                      variant={hasProof ? "outline" : "default"}
                      className="ml-auto gap-2"
                      onClick={connectWithProof}
                      disabled={!canConnectWithProof}
                    >
                      {isConnecting ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Key className="h-3 w-3" />
                      )}
                      Connect
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Opens wallet with TonProof request</p>
                </div>
              </div>
            </div>

            {/* Step 3: Verify Proof */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-medium">
                  3
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <FieldLabel fieldId="verifyProof">
                      <span className="font-medium text-sm">Verify Proof</span>
                    </FieldLabel>
                    <Button
                      size="sm"
                      variant={isAuthenticated ? "outline" : "default"}
                      className={`ml-auto gap-2 ${isAuthenticated ? "border-green-600 text-green-600 hover:bg-green-600/10 dark:border-green-400 dark:text-green-400" : ""}`}
                      onClick={verifyProof}
                      disabled={!canVerify && !isAuthenticated}
                      title={isAuthenticated ? "Click to re-verify" : undefined}
                    >
                      {isVerifying ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : isAuthenticated ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <ShieldCheck className="h-3 w-3" />
                      )}
                      {isAuthenticated ? "Verified" : "Verify"}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Send proof to backend for cryptographic verification
                  </p>
                </div>
              </div>

            </div>

            {/* Wallet Response */}
            <hr className="border-border" />
            <WalletResponseDisplay
              proof={hasProof && wallet?.connectItems?.tonProof && !('error' in wallet.connectItems.tonProof)
                ? wallet.connectItems.tonProof.proof as TonProof
                : null}
              address={wallet?.account?.address ?? null}
              publicKey={wallet?.account?.publicKey ?? null}
              checks={(verifyResult?.response as { checks?: VerifyChecks } | undefined)?.checks ?? null}
              payloadToken={(payloadResult?.response as { payloadToken?: string } | undefined)?.payloadToken ?? null}
            />

            {/* Example: Using Auth Token (collapsible, only after verification) */}
            {isAuthenticated && (
              <Collapsible className="mt-6 pt-6 border-t">
                <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground w-full transition-colors">
                  <ChevronRight className="h-4 w-4 transition-transform duration-200 [[data-state=open]>&]:rotate-90" />
                  <span>Example: Using the Auth Token</span>
                  <Badge variant="outline" className="ml-auto text-[10px]">Optional</Badge>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-4">
                  <div className="pl-6 space-y-3">
                    <p className="text-xs text-muted-foreground">
                      After successful verification, your backend returns an auth token.
                      This example shows how to use it for authenticated API calls.
                    </p>
                    <Button
                      onClick={getAccountInfo}
                      disabled={!canGetAccount}
                      size="sm"
                      variant="outline"
                      className="gap-2"
                    >
                      {isFetchingAccount ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                      Get Account Info
                    </Button>
                    {accountResult && (
                      <div className="space-y-2">
                        {accountResult.status === 'error' && (
                          <Alert variant="destructive" className="py-2">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="text-xs">{accountResult.error}</AlertDescription>
                          </Alert>
                        )}
                        {accountResult.request != null && (
                          <JsonViewer
                            title="Request"
                            json={JSON.stringify(accountResult.request, null, 2)}
                            maxHeight={100}
                            defaultExpanded={false}
                          />
                        )}
                        {accountResult.status === 'success' && accountResult.response != null && (
                          <JsonViewer
                            title="Response"
                            json={JSON.stringify(accountResult.response, null, 2)}
                            maxHeight={100}
                            defaultExpanded={true}
                          />
                        )}
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Connection Events */}
      <ConnectionEventsCard
        operations={operations}
        onClear={clearOperations}
        onDelete={deleteOperation}
      />

      {/* How It Works */}
      <HowItWorksCard sectionId="connect" />
    </div>
  )
}
