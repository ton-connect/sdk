import { UsersService } from '../../users/services';
import { Injectable } from '@nestjs/common';
import { HasherService } from './hasher.service';
import { LogicException, UnauthorizedException } from '../../core/exceptions';
import { INCORRECT_PASSWORD, USER_ALREADY_EXISTS } from '../errors';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly hasherService: HasherService,
  ) {}

  async signUp(params: { login: string; password: string }) {
    const { login, password } = params;

    const user = await this.usersService.findOneBy({ login });
    if (user) {
      throw new LogicException(USER_ALREADY_EXISTS);
    }

    const passwordHash = await this.hasherService.hash(password);

    await this.usersService.create({
      login,
      passwordHash,
    });
  }

  async signIn(params: { login: string; password: string }) {
    const { login, password } = params;

    const user = await this.usersService.findOneByOrFail({ login });

    const isHashValid = await this.hasherService.isValidHash(
      password,
      user.passwordHash,
    );

    if (!isHashValid) {
      throw new UnauthorizedException(INCORRECT_PASSWORD);
    }

    return user;
  }
}
