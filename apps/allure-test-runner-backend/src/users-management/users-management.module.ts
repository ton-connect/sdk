import { Module } from '@nestjs/common';
import * as Controllers from './controllers';

@Module({
    controllers: Object.values(Controllers)
})
export class UsersManagementModule {}
