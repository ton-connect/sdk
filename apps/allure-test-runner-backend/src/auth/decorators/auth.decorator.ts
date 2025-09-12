import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { USER_ROLE } from '../../users';
import { JwtAuthGuard } from '../guards';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ROLES_KEY } from '../constants';

export const Auth = (roles: USER_ROLE[] = []) => {
    return applyDecorators(ApiBearerAuth(), UseGuards(JwtAuthGuard), SetMetadata(ROLES_KEY, roles));
};
