import { applyDecorators, UseGuards } from '@nestjs/common';
import { OptionalJwtGuard } from '../guards';
import { ApiBearerAuth } from '@nestjs/swagger';

export const OptionalAuth = () => {
    return applyDecorators(ApiBearerAuth(), UseGuards(OptionalJwtGuard));
};
