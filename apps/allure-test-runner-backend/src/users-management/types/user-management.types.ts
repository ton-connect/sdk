import { z } from 'zod';
import { paginationSchema, updateUserBodySchema } from '../dtos';

export type UpdateUserProps = z.infer<typeof updateUserBodySchema>;
export type GetUsersParams = z.infer<typeof paginationSchema>;