import { Module } from '@nestjs/common';
import * as Controllers from './controllers';
import * as Services from './services';
import { UsersModule } from '../users';

@Module({
    imports: [UsersModule],
    providers: Object.values(Services),
    controllers: Object.values(Controllers)
})
export class UsersManagementModule {}
