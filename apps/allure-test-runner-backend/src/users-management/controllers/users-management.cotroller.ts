import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdminOnly } from '../../auth';
import {
    GetUsersQueryDTO,
    GetUsersResponseDTO,
    UpdateUserBodyDTO,
    UpdateUserParamsDTO,
    UpdateUserResponseDTO
} from '../dtos';
import { UsersManagementService } from '../services';
import { ZodResponse } from 'nestjs-zod';

@ApiTags('users-management')
@AdminOnly()
@Controller('users')
export class UsersManagementController {
    constructor(private readonly usersManagementService: UsersManagementService) {}

    @Patch(':userId')
    @ZodResponse({ type: UpdateUserResponseDTO })
    async updateUser(@Param() { userId }: UpdateUserParamsDTO, @Body() body: UpdateUserBodyDTO) {
        return this.usersManagementService.updateUser(userId, body);
    }

    @Get('')
    @ZodResponse({ type: GetUsersResponseDTO })
    async getUsers(@Query() query: GetUsersQueryDTO) {
        const [users, total] = await this.usersManagementService.getUsersWithCount(query);
        return {
            total,
            items: users
        };
    }
}
