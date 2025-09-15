import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, FindOptionsWhere } from 'typeorm';
import { UserEntity } from '../entities';
import { NotFoundException } from '../../core/exceptions';
import { USER_NOT_FOUND } from '../errors';
import { Creatable } from '../../core/types';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>
    ) {}

    async create(props: Creatable<UserEntity>) {
        await this.userRepository.insert(props);
    }

    async findOneBy(where: Partial<Pick<UserEntity, 'id' | 'login'>>) {
        return this.userRepository.findOneBy(where);
    }

    async findOneByOrFail(where: Partial<Pick<UserEntity, 'id' | 'login'>>) {
        const user = await this.userRepository.findOneBy(where);

        if (!user) {
            throw new NotFoundException(USER_NOT_FOUND);
        }

        return user;
    }

    async updateById(
        userId: number,
        props: Partial<Pick<UserEntity, 'walletName' | 'role' | 'passwordHash'>>
    ) {
        await this.userRepository.update(userId, props);
        return this.findOneByOrFail({ id: userId });
    }

    async count(where: FindOptionsWhere<UserEntity> = {}) {
        return this.userRepository.countBy(where);
    }

    async find(options: FindManyOptions<UserEntity>) {
        return this.userRepository.find(options);
    }
}
