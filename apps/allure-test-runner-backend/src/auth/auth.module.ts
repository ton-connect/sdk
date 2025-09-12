import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Controllers from './controllers';
import * as Services from './services';
import { UsersModule } from '../users';

@Module({
    imports: [UsersModule, ConfigModule],
    controllers: Object.values(Controllers),
    providers: Object.values(Services)
})
export class AuthModule {}
