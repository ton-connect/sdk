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

export async function checkProof(
  payload: CheckProofPayload,
  getWalletPublicKey: (address: string) => Promise<Buffer | null>
): Promise<boolean> {
  try {
    const stateInit = loadStateInit(Cell.fromBase64(payload.proof.state_init).beginParse());

    // Try to get public key from stateInit first, then from blockchain
    let publicKey = tryParsePublicKey(stateInit) ?? (await getWalletPublicKey(payload.address));
    if (!publicKey) {
      return false;
    }

    // Check public key matches
    const wantedPublicKey = Buffer.from(payload.public_key, 'hex');
    if (!publicKey.equals(wantedPublicKey)) {
      return false;
    }

    // Check address matches stateInit
    const wantedAddress = Address.parse(payload.address);
    const address = contractAddress(wantedAddress.workChain, stateInit);
    if (!address.equals(wantedAddress)) {
      return false;
    }

    // Check domain is allowed
    if (!isAllowedDomain(payload.proof.domain.value)) {
      console.warn('Domain not allowed:', payload.proof.domain.value);
      return false;
    }

    // Check timestamp
    const now = Math.floor(Date.now() / 1000);
    if (now - validAuthTime > payload.proof.timestamp) {
      return false;
    }

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

    return sign.detached.verify(result, signature, publicKey);
  } catch (e) {
    console.error('checkProof error:', e);
    return false;
  }
}
