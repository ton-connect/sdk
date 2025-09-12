import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { USER_ROLE } from '../../users';
import { JwtAuthGuard, RolesGuard } from '../guards';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ROLES_KEY } from '../constants';

export const Auth = (roles: USER_ROLE[] = []) => {
    return applyDecorators(
        ApiBearerAuth(),
        UseGuards(JwtAuthGuard),
        UseGuards(RolesGuard),
        SetMetadata(ROLES_KEY, roles)
    );
};
