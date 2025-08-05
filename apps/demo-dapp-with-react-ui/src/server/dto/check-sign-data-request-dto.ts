import { CHAIN } from "@tonconnect/ui-react";
import zod from "zod";

const SignDataPayloadText = zod.object({
  type: zod.literal("text"),
  text: zod.string(),
  network: zod.string().optional(),
  from: zod.string().optional(),
});

const SignDataPayloadBinary = zod.object({
  type: zod.literal("binary"),
  bytes: zod.string(), // base64 (not url safe) encoded bytes array
  network: zod.string().optional(),
  from: zod.string().optional(),
});

const SignDataPayloadCell = zod.object({
  type: zod.literal("cell"),
  schema: zod.string(), // TL-B scheme of the cell payload
  cell: zod.string(), // base64 (not url safe) encoded cell
  network: zod.string().optional(),
  from: zod.string().optional(),
});

const SignDataPayload = zod.union([
  SignDataPayloadText,
  SignDataPayloadBinary,
  SignDataPayloadCell,
]);

export const CheckSignDataRequest = zod.object({
  address: zod.string(),
  network: zod.enum([CHAIN.MAINNET, CHAIN.TESTNET]),
  public_key: zod.string(),
  signature: zod.string(), // base64
  timestamp: zod.number(),
  domain: zod.string(),
  payload: SignDataPayload,
  walletStateInit: zod.string(), // base64 encoded state init
});

export type CheckSignDataRequestDto = zod.infer<typeof CheckSignDataRequest>;
export type SignDataPayloadText = zod.infer<typeof SignDataPayloadText>;
export type SignDataPayloadBinary = zod.infer<typeof SignDataPayloadBinary>;
export type SignDataPayloadCell = zod.infer<typeof SignDataPayloadCell>;
export type SignDataPayload = zod.infer<typeof SignDataPayload>;
