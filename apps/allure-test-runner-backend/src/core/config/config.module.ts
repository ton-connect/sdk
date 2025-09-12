import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppConfig, configurationSchema } from './config';

@Module({})
export class AppConfigModule {
    static forRoot({ isGlobal }: { isGlobal: boolean }): DynamicModule {
        return {
            module: AppConfigModule,
            global: isGlobal,
            imports: [
                ConfigModule.forRoot({
                    validate: config => configurationSchema.parse(config)
                })
            ],
            providers: [AppConfig],
            exports: [
                {
                    provide: AppConfig,
                    useClass: ConfigService
                }
            ]
        };
    }
}
