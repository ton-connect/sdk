import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { TokensService } from '../services';
import { INVALID_ACCESS_TOKEN } from '../errors';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly tokensService: TokensService
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest();
        const auth = req.headers['authorization'] as string | undefined;

        if (!auth || !auth.startsWith('Bearer ')) {
            throw new UnauthorizedException(INVALID_ACCESS_TOKEN);
        }

        const accessToken = auth.replace('Bearer ', '');
        const payload = this.tokensService.extractPrincipal(accessToken);
        req.user = payload;

        return true;
    }
}
