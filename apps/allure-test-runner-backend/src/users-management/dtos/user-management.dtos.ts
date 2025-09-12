import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const paginationSchema = z.object({
    limit: z.number().positive().int().default(10),
    offset: z.number().nonnegative().int().default(0)
});
export class GetUsersQueryDTO extends createZodDto(paginationSchema) {}
