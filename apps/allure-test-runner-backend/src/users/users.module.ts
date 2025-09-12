import { Module } from '@nestjs/common';
import * as Services from './services';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities';

@Module({
    imports: [TypeOrmModule.forFeature([UserEntity])],
    providers: Object.values(Services),
    exports: Object.values(Services)
})
export class UsersModule {}
