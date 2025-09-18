import { z } from 'zod';

export const dateOutputSchema = z.codec(z.date(), z.iso.datetime(), {
    decode: date => date.toISOString(),
    encode: isoString => new Date(isoString)
});
