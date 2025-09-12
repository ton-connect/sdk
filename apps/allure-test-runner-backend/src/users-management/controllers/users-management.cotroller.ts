import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdminOnly } from '../../auth';

@ApiTags('users-management')
@Controller('users')
export class UsersManagementController {
    @AdminOnly()
    @Get('')
    async getUsers() {
        return [];
    }
}
