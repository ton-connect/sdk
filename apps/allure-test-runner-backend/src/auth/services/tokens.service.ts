import { Injectable } from '@nestjs/common';
import { USER_ROLE } from '../../users';

import { sign, verify } from 'jsonwebtoken';
import { AppConfig } from '../../core/config/config';
import { Principal } from '../types';
import { UnauthorizedException } from '../../core/exceptions';
import { INVALID_ACCESS_TOKEN } from '../errors';

@Injectable()
export class TokensService {
    constructor(private readonly config: AppConfig) {}

    private get accessSecret(): string {
        return this.config.getOrThrow('JWT_ACCESS_SECRET', { infer: true });
    }

    private get jwtAccessExpiresIn() {
        const days = this.config.getOrThrow('JWT_ACCESS_EXPIRES_DAYS', { infer: true });
        return `${days}d` as const;
    }

    async issueTokens(user: Principal) {
        const accessToken = sign({ sub: String(user.id), role: user.role }, this.accessSecret, {
            expiresIn: this.jwtAccessExpiresIn
        });

        return { accessToken };
    }

    extractPrincipal(accessToken: string): Principal {
        try {
            const payload = verify(accessToken, this.accessSecret) as {
                sub: string;
                role: USER_ROLE;
            };
            return {
                id: Number(payload.sub),
                role: payload.role
            };
        } catch (error) {
            throw new UnauthorizedException(INVALID_ACCESS_TOKEN);
        }
    }
}
