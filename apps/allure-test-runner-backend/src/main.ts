import cors, { CorsOptions } from 'cors';

import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';

import { AppModule } from './app.module';
import { AppConfig } from './core/config/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { cleanupOpenApiDoc } from 'nestjs-zod';
import { Logger } from '@nestjs/common';

async function bootstrap() {
    const logger = new Logger();
    const app = await NestFactory.create(AppModule, {
        logger
    });

    app.setGlobalPrefix('api/v1');

    const corsOptions = {
        origin: (_origin, callback): void => {
            callback(null, true);
        },
        credentials: true,
        methods: ['GET', 'PUT', 'POST', 'OPTIONS', 'DELETE', 'PATCH'],
        allowedHeaders: ['x-user', 'X-Signature', 'accept', 'content-type', 'authorization']
    } satisfies CorsOptions;

    app.use(cors(corsOptions));

    const documentBuilder = new DocumentBuilder()
        .setTitle('Example API')
        .addBearerAuth()
        .setDescription('Example API description')
        .setVersion('1.0')
        .build();

    const document = cleanupOpenApiDoc(SwaggerModule.createDocument(app, documentBuilder));

    SwaggerModule.setup('api/v1', app, document);

    const configService = app.get<AppConfig>(ConfigService);
    const port = configService.getOrThrow('PORT', { infer: true });

    await app.listen(port);
}

bootstrap().catch(console.error);
