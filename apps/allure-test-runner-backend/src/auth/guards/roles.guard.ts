import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { USER_ROLE } from '../../users';
import { ROLES_KEY } from '../constants';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const required = this.reflector.getAllAndOverride<USER_ROLE[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass()
        ]);
        if (!required || required.length === 0) return true;
        const req = context.switchToHttp().getRequest();
        const user = req.user as { role?: USER_ROLE } | undefined;
        if (!user || !user.role || !required.includes(user.role)) {
            throw new ForbiddenException();
        }
        return true;
    }
}
