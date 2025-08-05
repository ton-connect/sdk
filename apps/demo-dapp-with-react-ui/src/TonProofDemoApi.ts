import {
  Account,
  ConnectAdditionalRequest,
  SendTransactionRequest,
  TonProofItemReplySuccess,
} from "@tonconnect/ui-react";
import "./patch-local-storage-for-github-pages";
import { CreateJettonRequestDto } from "./server/dto/create-jetton-request-dto";

// Simple LRU Cache for payload tokens
class PayloadTokenCache {
  private cache = new Map<string, { value: string; createdAt: number }>();
  private maxSize = 10;
  private storageKey = "demo-api-payload-tokens-cache";

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        this.cache = new Map(data);
        this.cleanup(); // Ensure we don't exceed maxSize after loading
      }
    } catch (e) {
      console.warn("Failed to load payload token cache from storage:", e);
      this.cache.clear();
    }
  }

  private saveToStorage(): void {
    try {
      const data = Array.from(this.cache.entries());
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (e) {
      console.warn("Failed to save payload token cache to storage:", e);
    }
  }

  private cleanup(): void {
    // Remove oldest entries if cache exceeds maxSize
    while (this.cache.size > this.maxSize) {
      const sortedEntries = Array.from(this.cache.entries()).sort(
        ([, a], [, b]) => a.createdAt - b.createdAt
      );

      // Remove oldest entry
      this.cache.delete(sortedEntries[0][0]);
    }
  }

  set(key: string, value: string): void {
    this.cache.set(key, { value, createdAt: Date.now() });
    this.cleanup();
    this.saveToStorage();
  }

  get(key: string): string | null {
    const entry = this.cache.get(key);
    return entry ? entry.value : null;
  }

  clear(): void {
    this.cache.clear();
    localStorage.removeItem(this.storageKey);
  }
}

class TonProofDemoApiService {
  private readonly accessTokenKey = "demo-api-access-token";
  private payloadTokenCache = new PayloadTokenCache();

  private host = document.baseURI.replace(/\/$/, "");

  public accessToken: string | null = null;

  public readonly refreshIntervalMs = 9 * 60 * 1000;

  constructor() {
    this.accessToken = localStorage.getItem(this.accessTokenKey);
  }

  private setPayloadToken(payload: string, token: string): void {
    this.payloadTokenCache.set(payload, token);
  }

  private getPayloadToken(payload: string): string | null {
    return this.payloadTokenCache.get(payload);
  }

  async generatePayload(): Promise<ConnectAdditionalRequest | null> {
    try {
      const response = await (
        await fetch(`${this.host}/api/generate_payload`, {
          method: "POST",
        })
      ).json();
      this.setPayloadToken(response.payloadTokenHash, response.payloadToken);
      return {
        tonProof: response.payloadTokenHash,
      };
    } catch {
      return null;
    }
  }

  async checkProof(
    proof: TonProofItemReplySuccess["proof"],
    account: Account
  ): Promise<void> {
    try {
      const reqBody = {
        address: account.address,
        network: account.chain,
        public_key: account.publicKey,
        proof: {
          ...proof,
          state_init: account.walletStateInit,
        },
        payloadToken: this.getPayloadToken(proof.payload),
      };

      const response = await (
        await fetch(`${this.host}/api/check_proof`, {
          method: "POST",
          body: JSON.stringify(reqBody),
        })
      ).json();

      if (response?.token) {
        localStorage.setItem(this.accessTokenKey, response.token);
        this.accessToken = response.token;
      }
    } catch (e) {
      console.log("checkProof error:", e);
    }
  }

  async getAccountInfo(account: Account) {
    const response = await (
      await fetch(`${this.host}/api/get_account_info`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
      })
    ).json();

    return response as {};
  }

  async createJetton(
    jetton: CreateJettonRequestDto
  ): Promise<SendTransactionRequest> {
    return await (
      await fetch(`${this.host}/api/create_jetton`, {
        body: JSON.stringify(jetton),
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
        method: "POST",
      })
    ).json();
  }

  async merkleProof(): Promise<SendTransactionRequest> {
    return await (
      await fetch(`${this.host}/api/merkle_proof`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-type": "application/json",
        },
        method: "POST",
        body: "",
      })
    ).json();
  }

  async merkleUpdate(): Promise<SendTransactionRequest> {
    return await (
      await fetch(`${this.host}/api/merkle_update`, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-type": "application/json",
        },
        method: "POST",
      })
    ).json();
  }

  async checkSignData(signDataResult: any, account: Account) {
    try {
      const reqBody = {
        address: account.address,
        network: account.chain,
        public_key: account.publicKey,
        signature: signDataResult.signature,
        timestamp: signDataResult.timestamp,
        domain: signDataResult.domain,
        payload: signDataResult.payload,
        walletStateInit: account.walletStateInit,
      };

      const response = await (
        await fetch(`${this.host}/api/check_sign_data`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(reqBody),
        })
      ).json();

      return response;
    } catch (e) {
      console.log("checkSignData error:", e);
      return { error: "Failed to verify signature" };
    }
  }

  async findTransactionByExternalMessage(boc: string, network: 'mainnet' | 'testnet') {
    const response = await (
      await fetch(`${this.host}/api/find_transaction_by_external_message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ boc, network }),
      })
    ).json();
    return response.transaction;
  }

  reset() {
    this.accessToken = null;
    localStorage.removeItem(this.accessTokenKey);
  }

  async waitForTransaction(inMessageBoc: string, network: 'mainnet' | 'testnet') {
    const response = await (
      await fetch(`${this.host}/api/wait_for_transaction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inMessageBoc, network }),
      })
    ).json();

    return response.transaction;
  }
}

export const TonProofDemoApi = new TonProofDemoApiService();
