import { Module } from '@nestjs/common';
import * as Controllers from './controllers';
import * as Services from './services';
import { UsersModule } from '../users';

@Module({
  imports: [UsersModule],
  controllers: Object.values(Controllers),
  providers: Object.values(Services),
})
export class AuthModule {}
