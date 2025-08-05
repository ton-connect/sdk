import {CHAIN} from "@tonconnect/ui-react";
import zod from "zod";

export const CheckProofRequest = zod.object({
  address: zod.string(),
  network: zod.enum([CHAIN.MAINNET, CHAIN.TESTNET]),
  public_key: zod.string(),
  proof: zod.object({
    timestamp: zod.number(),
    domain: zod.object({
      lengthBytes: zod.number(),
      value: zod.string(),
    }),
    payload: zod.string(),
    signature: zod.string(),
    state_init: zod.string(),
  }),
  payloadToken: zod.string(),
});

export type CheckProofRequestDto = zod.infer<typeof CheckProofRequest>;
