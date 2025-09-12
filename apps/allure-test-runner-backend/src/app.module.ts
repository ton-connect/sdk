import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersModule } from './users';
import { AppConfig } from './core/config/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod';
import { AppExceptionFilter } from './core/exception.filter';
import { AuthModule } from './auth';
import { AllureModule } from './allure';
import { AppConfigModule } from './core/config';

@Module({
    imports: [
        AppConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRootAsync({
            inject: [AppConfig],
            useFactory: (configService: AppConfig) => {
                return {
                    type: 'postgres',
                    host: configService.getOrThrow('DB_HOST', { infer: true }),
                    port: configService.getOrThrow('DB_PORT', { infer: true }),
                    username: configService.getOrThrow('DB_USERNAME', { infer: true }),
                    password: configService.getOrThrow('DB_PASSWORD', { infer: true }),
                    database: configService.getOrThrow('DB_DATABASE', { infer: true }),
                    entities: [__dirname + '/**/*.entity{.ts,.js}'],
                    synchronize: true, // TODO: disable in production
                    logging: true // TODO: disable in production
                };
            }
        }),
        UsersModule,
        AuthModule,
        AllureModule
    ],
    providers: [
        {
            provide: APP_PIPE,
            useClass: ZodValidationPipe
        },
        {
            provide: APP_FILTER,
            useClass: AppExceptionFilter
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: ZodSerializerInterceptor
        }
    ]
})
export class AppModule {}
