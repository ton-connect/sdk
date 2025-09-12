import { z } from 'zod';
import { ConfigService } from '@nestjs/config';

export const configurationSchema = z.object({
    PORT: z.coerce.number().optional().default(3000),
    DB_HOST: z.hostname(),
    DB_PORT: z.coerce.number(),
    DB_USERNAME: z.string(),
    DB_PASSWORD: z.string(),
    DB_DATABASE: z.string(),
    ALLURE_API_TOKEN: z.string(),
    ALLURE_BASE_URL: z.url().optional().default('https://tontech.testops.cloud'),
    JWT_ACCESS_SECRET: z.string().min(32),
    JWT_ACCESS_EXPIRES_DAYS: z.coerce.number().positive().int().optional().default(7)
});

export type Configuration = z.infer<typeof configurationSchema>;

export class AppConfig extends ConfigService<Configuration, true> {}
