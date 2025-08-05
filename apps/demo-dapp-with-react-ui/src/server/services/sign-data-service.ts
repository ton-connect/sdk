import {
  Address,
  beginCell,
  Cell,
  contractAddress,
  loadStateInit,
} from "@ton/core";
import { sha256 } from "@ton/crypto";
import { Buffer } from "buffer";
import nacl from "tweetnacl";
import crc32 from "crc-32";
import {
  CheckSignDataRequestDto,
  SignDataPayloadText,
  SignDataPayloadBinary,
  SignDataPayload,
} from "../dto/check-sign-data-request-dto";
import { tryParsePublicKey } from "../wrappers/wallets-data";

const allowedDomains = ["ton-connect.github.io", "localhost:5173"];
const validAuthTime = 15 * 60; // 15 minutes

export class SignDataService {
  /**
   * Verifies sign-data signature.
   *
   * Supports three payload types:
   * 1. text - for text messages
   * 2. binary - for arbitrary binary data
   * 3. cell - for TON Cell with TL-B schema
   */
  public async checkSignData(
    payload: CheckSignDataRequestDto,
    getWalletPublicKey: (address: string) => Promise<Buffer | null>
  ): Promise<boolean> {
    try {
      const {
        signature,
        address,
        timestamp,
        domain,
        payload: signDataPayload,
        public_key,
        walletStateInit,
      } = payload;

      // Check domain
      if (!allowedDomains.includes(domain)) {
        return false;
      }

      // Check timestamp
      const now = Math.floor(Date.now() / 1000);
      if (now - validAuthTime > timestamp) {
        return false;
      }

      // Parse address and state init
      const parsedAddr = Address.parse(address);
      const stateInit = loadStateInit(
        Cell.fromBase64(walletStateInit).beginParse()
      );

      // 1. First, try to obtain public key via get_public_key get-method on smart contract deployed at Address.
      // 2. If the smart contract is not deployed yet, or the get-method is missing, you need:
      //  2.1. Parse walletStateInit and get public key from stateInit.
      let publicKey =
        tryParsePublicKey(stateInit) ?? (await getWalletPublicKey(address));
      if (!publicKey) {
        return false;
      }

      // 2.2. Check that provided public key equals to obtained public key
      const wantedPublicKey = Buffer.from(public_key, "hex");
      if (!publicKey.equals(wantedPublicKey)) {
        return false;
      }

      // 2.3. Check that walletStateInit.hash() equals to address
      const wantedAddress = Address.parse(address);
      const contractAddr = contractAddress(wantedAddress.workChain, stateInit);
      if (!contractAddr.equals(wantedAddress)) {
        return false;
      }

      // Create hash based on payload type
      const finalHash =
        signDataPayload.type === "cell"
          ? this.createCellHash(signDataPayload, parsedAddr, domain, timestamp)
          : await this.createTextBinaryHash(
              signDataPayload,
              parsedAddr,
              domain,
              timestamp
            );

      // Verify Ed25519 signature
      const isValid = nacl.sign.detached.verify(
        new Uint8Array(finalHash),
        new Uint8Array(Buffer.from(signature, "base64")),
        new Uint8Array(publicKey)
      );

      return isValid;
    } catch (e) {
      console.error("Sign data verification error:", e);
      return false;
    }
  }

  /**
   * Creates hash for text or binary payload.
   * Message format:
   * message = 0xffff || "ton-connect/sign-data/" || workchain || address_hash || domain_len || domain || timestamp || payload
   */
  private async createTextBinaryHash(
    payload: SignDataPayloadText | SignDataPayloadBinary,
    parsedAddr: Address,
    domain: string,
    timestamp: number
  ): Promise<Buffer> {
    // Create workchain buffer
    const wcBuffer = Buffer.alloc(4);
    wcBuffer.writeInt32BE(parsedAddr.workChain);

    // Create domain buffer
    const domainBuffer = Buffer.from(domain, "utf8");
    const domainLenBuffer = Buffer.alloc(4);
    domainLenBuffer.writeUInt32BE(domainBuffer.length);

    // Create timestamp buffer
    const tsBuffer = Buffer.alloc(8);
    tsBuffer.writeBigUInt64BE(BigInt(timestamp));

    // Create payload buffer
    const typePrefix = payload.type === "text" ? "txt" : "bin";
    const content = payload.type === "text" ? payload.text : payload.bytes;
    const encoding = payload.type === "text" ? "utf8" : "base64";

    const payloadPrefix = Buffer.from(typePrefix);
    const payloadBuffer = Buffer.from(content, encoding);
    const payloadLenBuffer = Buffer.alloc(4);
    payloadLenBuffer.writeUInt32BE(payloadBuffer.length);

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
      payloadBuffer,
    ]);

    // Hash message with sha256
    const hash = await sha256(message);
    return Buffer.from(hash);
  }

  /**
   * Creates hash for Cell payload according to TON Connect specification.
   */
  private createCellHash(
    payload: SignDataPayload & { type: "cell" },
    parsedAddr: Address,
    domain: string,
    timestamp: number
  ): Buffer {
    const cell = Cell.fromBase64(payload.cell);
    const schemaHash = crc32.buf(Buffer.from(payload.schema, "utf8")) >>> 0; // unsigned crc32 hash

    // Encode domain in DNS-like format (e.g. "example.com" -> "com\0example\0")
    const encodedDomain = this.encodeDomainDnsLike(domain);

    const message = beginCell()
      .storeUint(0x75569022, 32) // prefix
      .storeUint(schemaHash, 32) // schema hash
      .storeUint(timestamp, 64) // timestamp
      .storeAddress(parsedAddr) // user wallet address
      .storeStringRefTail(encodedDomain.toString("utf8")) // app domain (DNS-like encoded, snake stored)
      .storeRef(cell) // payload cell
      .endCell();

    return Buffer.from(message.hash());
  }

  /**
   * Encodes domain name in DNS-like format.
   * Example: "example.com" -> "com\0example\0"
   */
  private encodeDomainDnsLike(domain: string): Buffer {
    const parts = domain.split(".").reverse(); // reverse for DNS-like encoding
    const encoded: number[] = [];

    for (const part of parts) {
      // Add the part characters
      for (let i = 0; i < part.length; i++) {
        encoded.push(part.charCodeAt(i));
      }
      encoded.push(0); // null byte after each part
    }

    return Buffer.from(encoded);
  }
}
