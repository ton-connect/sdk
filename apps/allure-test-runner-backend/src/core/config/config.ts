import { z } from 'zod';
import { ConfigService } from '@nestjs/config';

export const configurationSchema = z.object({
    PORT: z.coerce.number().default(3000),
    DB_HOST: z.hostname(),
    DB_PORT: z.coerce.number(),
    DB_USERNAME: z.string().trim(),
    DB_PASSWORD: z.string().trim(),
    DB_DATABASE: z.string().trim(),
    ALLURE_API_TOKEN: z.string().trim(),
    ALLURE_BASE_URL: z.url().default('https://tontech.testops.cloud'),
    JWT_ACCESS_SECRET: z.string().trim().min(32),
    JWT_ACCESS_EXPIRES_DAYS: z.coerce.number().positive().int().default(7)
});

export type Configuration = z.infer<typeof configurationSchema>;

export class AppConfig extends ConfigService<Configuration, true> {}
