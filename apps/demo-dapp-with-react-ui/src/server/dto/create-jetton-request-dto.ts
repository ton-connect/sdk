import zod from "zod";

export const CreateJettonRequest = zod.object({
  name: zod.string(),
  description: zod.string(),
  image_data: zod.string(),
  symbol: zod.string(),
  decimals: zod.number(),
  amount: zod.string(),
});

export type CreateJettonRequestDto = zod.infer<typeof CreateJettonRequest>;
