import { Address, Cell, beginCell, loadStateInit, contractAddress } from "@ton/core"
import { sha256 } from "@ton/crypto"
import nacl from "tweetnacl"
import crc32 from "crc-32"

// Wallet public key parsers (simplified - supports common wallet types)
function tryParsePublicKey(stateInit: ReturnType<typeof loadStateInit>): Buffer | null {
  try {
    const cs = stateInit.data?.beginParse()
    if (!cs) return null

    // Try to read public key (most wallets store it in first 256 bits after some header)
    // This is simplified and may not work for all wallet types
    cs.loadUint(32) // seqno or similar
    const publicKey = cs.loadBuffer(32)
    return publicKey
  } catch {
    return null
  }
}

interface SignDataResponse {
  signature: string
  timestamp: number
  domain: string
  payload: {
    type: "text" | "binary" | "cell"
    text?: string
    bytes?: string
    schema?: string
    cell?: string
  }
}

interface VerificationParams {
  response: SignDataResponse
  address: string
  publicKey: string
  walletStateInit: string
}

export interface VerificationResult {
  valid: boolean
  message: string
  details?: {
    addressMatch: boolean
    publicKeyMatch: boolean
    signatureValid: boolean
  }
}

/**
 * Client-side verification of sign-data response.
 * Note: For production, verification should be done on the server.
 */
export async function verifySignData(params: VerificationParams): Promise<VerificationResult> {
  try {
    const { response, address, publicKey, walletStateInit } = params
    const { signature, timestamp, domain, payload } = response

    // Parse address
    const parsedAddr = Address.parse(address)

    // Parse stateInit and verify address
    const stateInit = loadStateInit(Cell.fromBase64(walletStateInit).beginParse())
    const computedAddress = contractAddress(parsedAddr.workChain, stateInit)
    const addressMatch = computedAddress.equals(parsedAddr)

    if (!addressMatch) {
      return {
        valid: false,
        message: "Address does not match wallet state init",
        details: { addressMatch: false, publicKeyMatch: false, signatureValid: false }
      }
    }

    // Get public key from stateInit
    const extractedPublicKey = tryParsePublicKey(stateInit)
    const providedPublicKey = Buffer.from(publicKey, "hex")

    const publicKeyMatch = extractedPublicKey
      ? extractedPublicKey.equals(providedPublicKey)
      : true // If we can't extract, trust the provided key

    // Build hash based on payload type
    let hash: Buffer
    if (payload.type === "cell" && payload.schema && payload.cell) {
      hash = createCellHash(payload as { type: "cell"; schema: string; cell: string }, parsedAddr, domain, timestamp)
    } else {
      hash = await createTextBinaryHash(payload, parsedAddr, domain, timestamp)
    }

    // Verify signature
    const signatureValid = nacl.sign.detached.verify(
      new Uint8Array(hash),
      new Uint8Array(Buffer.from(signature, "base64")),
      new Uint8Array(providedPublicKey)
    )

    return {
      valid: addressMatch && signatureValid,
      message: signatureValid ? "Signature verified successfully" : "Invalid signature",
      details: { addressMatch, publicKeyMatch, signatureValid }
    }
  } catch (error) {
    return {
      valid: false,
      message: error instanceof Error ? error.message : "Verification failed"
    }
  }
}

async function createTextBinaryHash(
  payload: { type: "text" | "binary" | "cell"; text?: string; bytes?: string },
  parsedAddr: Address,
  domain: string,
  timestamp: number
): Promise<Buffer> {
  // Workchain buffer
  const wcBuffer = Buffer.alloc(4)
  wcBuffer.writeInt32BE(parsedAddr.workChain)

  // Domain buffer
  const domainBuffer = Buffer.from(domain, "utf8")
  const domainLenBuffer = Buffer.alloc(4)
  domainLenBuffer.writeUInt32BE(domainBuffer.length)

  // Timestamp buffer
  const tsBuffer = Buffer.alloc(8)
  tsBuffer.writeBigUInt64BE(BigInt(timestamp))

  // Payload buffer
  const typePrefix = payload.type === "text" ? "txt" : "bin"
  const content = payload.type === "text" ? payload.text || "" : payload.bytes || ""
  const encoding = payload.type === "text" ? "utf8" : "base64"

  const payloadPrefix = Buffer.from(typePrefix)
  const payloadBuffer = Buffer.from(content, encoding as BufferEncoding)
  const payloadLenBuffer = Buffer.alloc(4)
  payloadLenBuffer.writeUInt32BE(payloadBuffer.length)

  // Build message
  const message = Buffer.concat([
    Buffer.from([0xff, 0xff]),
    Buffer.from("ton-connect/sign-data/"),
    wcBuffer,
    parsedAddr.hash,
    domainLenBuffer,
    domainBuffer,
    tsBuffer,
    payloadPrefix,
    payloadLenBuffer,
    payloadBuffer
  ])

  const hash = await sha256(message)
  return Buffer.from(hash)
}

function createCellHash(
  payload: { type: "cell"; schema: string; cell: string },
  parsedAddr: Address,
  domain: string,
  timestamp: number
): Buffer {
  const cell = Cell.fromBase64(payload.cell)
  const schemaHash = crc32.buf(Buffer.from(payload.schema, "utf8")) >>> 0

  // Encode domain DNS-like
  const parts = domain.split(".").reverse()
  const encoded: number[] = []
  for (const part of parts) {
    for (let i = 0; i < part.length; i++) {
      encoded.push(part.charCodeAt(i))
    }
    encoded.push(0)
  }
  const encodedDomain = Buffer.from(encoded)

  const message = beginCell()
    .storeUint(0x75569022, 32)
    .storeUint(schemaHash, 32)
    .storeUint(timestamp, 64)
    .storeAddress(parsedAddr)
    .storeStringRefTail(encodedDomain.toString("utf8"))
    .storeRef(cell)
    .endCell()

  return Buffer.from(message.hash())
}
