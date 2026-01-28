import { getSecureRandomBytes, sha256 } from '@ton/crypto';
import { Address, Cell, contractAddress, loadStateInit } from '@ton/ton';
import { Buffer } from 'buffer';
import { sign } from 'tweetnacl';
import { tryParsePublicKey } from '../utils/wallet-parsers';

const tonProofPrefix = 'ton-proof-item-v2/';
const tonConnectPrefix = 'ton-connect';

// For demo - allow any domain (in production you should whitelist specific domains)
const isAllowedDomain = (_domain: string): boolean => {
  return true;
};

const validAuthTime = 15 * 60; // 15 minutes

export interface CheckProofPayload {
  address: string;
  public_key: string;
  proof: {
    timestamp: number;
    domain: {
      lengthBytes: number;
      value: string;
    };
    payload: string;
    signature: string;
    state_init: string;
  };
}

export async function generateRandomBytes(): Promise<Buffer> {
  return await getSecureRandomBytes(32);
}

export interface ProofChecks {
  publicKeyMatch: boolean
  addressMatch: boolean
  domainAllowed: boolean
  timestampValid: boolean
  signatureValid: boolean
}

export interface CheckProofResult {
  valid: boolean
  checks: ProofChecks
  error?: string
}

export async function checkProof(
  payload: CheckProofPayload,
  getWalletPublicKey: (address: string) => Promise<Buffer | null>
): Promise<boolean> {
  const result = await checkProofDetailed(payload, getWalletPublicKey);
  return result.valid;
}

export async function checkProofDetailed(
  payload: CheckProofPayload,
  getWalletPublicKey: (address: string) => Promise<Buffer | null>
): Promise<CheckProofResult> {
  const checks: ProofChecks = {
    publicKeyMatch: false,
    addressMatch: false,
    domainAllowed: false,
    timestampValid: false,
    signatureValid: false
  };

  try {
    const stateInit = loadStateInit(Cell.fromBase64(payload.proof.state_init).beginParse());

    // Try to get public key from stateInit first, then from blockchain
    const publicKey = tryParsePublicKey(stateInit) ?? (await getWalletPublicKey(payload.address));
    if (!publicKey) {
      return { valid: false, checks, error: 'Could not get public key' };
    }

    // Check public key matches
    const wantedPublicKey = Buffer.from(payload.public_key, 'hex');
    checks.publicKeyMatch = publicKey.equals(wantedPublicKey);

    // Check address matches stateInit
    const wantedAddress = Address.parse(payload.address);
    const address = contractAddress(wantedAddress.workChain, stateInit);
    checks.addressMatch = address.equals(wantedAddress);

    // Check domain is allowed
    checks.domainAllowed = isAllowedDomain(payload.proof.domain.value);

    // Check timestamp
    const now = Math.floor(Date.now() / 1000);
    checks.timestampValid = now - validAuthTime <= payload.proof.timestamp;

    // Build message for verification
    const wc = Buffer.alloc(4);
    wc.writeUInt32BE(address.workChain, 0);

    const ts = Buffer.alloc(8);
    ts.writeBigUInt64LE(BigInt(payload.proof.timestamp), 0);

    const dl = Buffer.alloc(4);
    dl.writeUInt32LE(payload.proof.domain.lengthBytes, 0);

    const msg = Buffer.concat([
      Buffer.from(tonProofPrefix),
      wc,
      address.hash,
      dl,
      Buffer.from(payload.proof.domain.value),
      ts,
      Buffer.from(payload.proof.payload)
    ]);

    const msgHash = Buffer.from(await sha256(msg));

    const fullMsg = Buffer.concat([
      Buffer.from([0xff, 0xff]),
      Buffer.from(tonConnectPrefix),
      msgHash
    ]);

    const result = Buffer.from(await sha256(fullMsg));
    const signature = Buffer.from(payload.proof.signature, 'base64');

    checks.signatureValid = sign.detached.verify(result, signature, publicKey);

    // Determine overall validity and error message
    const valid = Object.values(checks).every(Boolean);
    let error: string | undefined;

    if (!valid) {
      if (!checks.publicKeyMatch) error = 'Public key mismatch';
      else if (!checks.addressMatch) error = 'Address mismatch';
      else if (!checks.domainAllowed) error = 'Domain not allowed';
      else if (!checks.timestampValid) error = 'Proof expired (older than 15 minutes)';
      else if (!checks.signatureValid) error = 'Invalid signature';
    }

    return { valid, checks, error };
  } catch (e) {
    console.error('checkProof error:', e);
    return { valid: false, checks, error: 'Verification failed' };
  }
}
