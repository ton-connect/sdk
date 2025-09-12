import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { USER_ROLE } from '../../users';
import { ROLES_KEY } from '../constants';
import { Principal } from '../types';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<USER_ROLE[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass()
        ]);

        if (!requiredRoles || requiredRoles.length === 0) return true;

        const req = context.switchToHttp().getRequest();
        const user = req.user as Principal | undefined;

        if (!user || !user.role || !requiredRoles.includes(user.role)) {
            throw new ForbiddenException();
        }

        return true;
    }
}
