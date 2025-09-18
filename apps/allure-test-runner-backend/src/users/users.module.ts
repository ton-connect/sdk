import { Module } from '@nestjs/common';
import * as Services from './services';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities';
import { UsersService } from './services';

@Module({
    imports: [TypeOrmModule.forFeature([UserEntity])],
    providers: Object.values(Services),
    exports: [UsersService]
})
export class UsersModule {}
