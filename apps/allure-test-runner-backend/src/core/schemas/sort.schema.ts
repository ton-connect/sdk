import { z } from 'zod';

export function sortArraySchema<T extends string[]>(sortKeys: T) {
    const arrayItem = z
        .string()
        .transform(s => s.split(','))
        .pipe(z.tuple([z.enum(sortKeys), z.enum(['ASC', 'DESC'])]));

    return z.union([arrayItem.transform(v => [v]), z.array(arrayItem)]);
}
