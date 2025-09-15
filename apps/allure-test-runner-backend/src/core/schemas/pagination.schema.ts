import { z } from 'zod';

export function paginationResponseSchema<TSchema extends z.ZodSchema>(itemSchema: TSchema) {
    return z.object({
        total: z.number().nonnegative().int(),
        items: z.array(itemSchema)
    });
}
