import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { sortArraySchema, paginationResponseSchema, dateOutputSchema } from '../../core/schemas';
import { USER_ROLE } from '../../users';

export const userSchema = z.object({
    id: z.number(),
    login: z.string().trim(),
    walletName: z.string().trim().nullish(),
    role: z.enum(USER_ROLE),
    createdAt: dateOutputSchema
});

const userIdParamsSchema = z.object({ userId: z.coerce.number().positive().int() });
export class UpdateUserParamsDTO extends createZodDto(userIdParamsSchema) {}
export const updateUserBodySchema = z
    .object({
        walletName: z.string().trim().optional(),
        role: z.enum(USER_ROLE).optional(),
        password: z.string().trim().optional()
    })
    .refine(data => Object.values(data).some(value => value), {
        message: 'At least one property must be provided'
    });

export class UpdateUserBodyDTO extends createZodDto(updateUserBodySchema) {}
export class UpdateUserResponseDTO extends createZodDto(userSchema) {}

export const paginationSchema = z.object({
    limit: z.coerce.number().positive().int().default(10),
    offset: z.coerce.number().nonnegative().int().default(0),
    sort: sortArraySchema(['login', 'createdAt'] as const).default([]),
    search: z.string().trim().optional()
});
export class GetUsersQueryDTO extends createZodDto(paginationSchema) {}
export class GetUsersResponseDTO extends createZodDto(paginationResponseSchema(userSchema)) {}
