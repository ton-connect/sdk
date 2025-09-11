import { z } from 'zod';
import { ConfigService } from '@nestjs/config';

export const configurationSchema = z.object({
    PORT: z.coerce.number().optional().default(3000),
    DB_HOST: z.hostname(),
    DB_PORT: z.coerce.number(),
    DB_USERNAME: z.string(),
    DB_PASSWORD: z.string(),
    DB_DATABASE: z.string()
});

export type Configuration = z.infer<typeof configurationSchema>;

export type AppConfigService = ConfigService<Configuration, true>;
