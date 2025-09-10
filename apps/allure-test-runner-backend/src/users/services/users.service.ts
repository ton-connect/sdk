import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities';
import { NotFoundException } from '../../core/exceptions';
import { USER_NOT_FOUND } from '../errors';
import { Creatable } from '../../core/types';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
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
}
