import { Module } from '@nestjs/common';
import * as Services from './services';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Entities from './entities';

@Module({
    imports: [TypeOrmModule.forFeature(Object.values(Entities))],
    providers: Object.values(Services),
    exports: Object.values(Services)
})
export class UsersModule {}
