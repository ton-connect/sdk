import { Body, Controller, Post } from '@nestjs/common';
import { SignInBodyDTO, SignInResponseDTO, SignUpBodyDTO } from '../dtos';
import { AuthService } from '../services';
import { ZodResponse } from 'nestjs-zod';
import { ApiTags } from '@nestjs/swagger';

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
        return this.authService.signIn(body);
    }
}
