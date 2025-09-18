import { ExecutionContext, Injectable } from '@nestjs/common';
import { JwtAuthGuard } from './jwt.guard';

@Injectable()
export class OptionalJwtGuard extends JwtAuthGuard {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            await super.canActivate(context);
            return true;
        } catch {
            return true;
        }
    }
}
