import { Body, Controller, Get, Post } from '@nestjs/common';
import { GetMeResponseDTO, SignInBodyDTO, SignInResponseDTO, SignUpBodyDTO } from '../dtos';
import { AuthService } from '../services';
import { ApiTags } from '@nestjs/swagger';
import { Auth, AuthUser } from '../decorators';
import { type Principal } from '../types';
import { ZodResponse } from 'nestjs-zod';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('sign-up')
    async signUp(@Body() body: SignUpBodyDTO) {
        await this.authService.signUp(body);
    }

    @Post('sign-in')
    @ZodResponse({ type: SignInResponseDTO })
    async signIn(@Body() body: SignInBodyDTO) {
        return await this.authService.signIn(body);
    }

    @Auth()
    @Get('me')
    @ZodResponse({ type: GetMeResponseDTO })
    async me(@AuthUser() user: Principal) {
        return user;
    }
}
