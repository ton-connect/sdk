import { Injectable } from '@nestjs/common';
import { GetUsersParams, UpdateUserProps } from '../types';
import { UsersService } from '../../users';
import { buildSearchQuery } from '../../core/database';
import { HasherService } from '../../auth';

@Injectable()
export class UsersManagementService {
    constructor(
        private readonly usersService: UsersService,
        private readonly hasherService: HasherService
    ) {}

    async updateUser(userId: number, props: UpdateUserProps) {
        let passwordHash = props.password && (await this.hasherService.hash(props.password));
        return this.usersService.updateById(userId, {
            role: props.role,
            walletName: props.walletName,
            passwordHash
        });
    }

    async getUsersWithCount(params: GetUsersParams) {
        const filter = params.search
            ? [
                  { walletName: buildSearchQuery(params.search) },
                  { login: buildSearchQuery(params.search) }
              ]
            : undefined;

        const [users, total] = await Promise.all([
            this.usersService.find({
                take: params.limit,
                skip: params.offset,
                order: Object.fromEntries(params.sort),
                where: filter
            }),
            this.usersService.count(filter)
        ]);

        return [users, total] as const;
    }
}
