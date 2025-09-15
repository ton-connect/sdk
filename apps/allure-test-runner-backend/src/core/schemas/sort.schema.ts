import { z } from 'zod';

export function sortArraySchema<T extends string[]>(sortKeys: T) {
    return z.array(
        z
            .string()
            .transform(s => s.split(','))
            .pipe(z.tuple([z.enum(sortKeys), z.enum(['ASC', 'DESC'])]))
    );
}
