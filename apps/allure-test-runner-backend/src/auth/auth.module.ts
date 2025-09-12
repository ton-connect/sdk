import { DynamicModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Controllers from './controllers';
import * as Services from './services';
import { UsersModule } from '../users';
import { TokensService } from './services';

export class AuthModule {
    static forRoot(): DynamicModule {
        return {
            module: AuthModule,

            // for use of Auth decorators
            global: true,
            exports: [TokensService],

            imports: [UsersModule, ConfigModule],
            controllers: Object.values(Controllers),
            providers: Object.values(Services)
        };
    }
}
