import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { USER_ROLE } from '../../users';

const credentialsSchema = z.object({
    // TODO: validation
    login: z.string().trim(),
    password: z.string().trim()
});
export class SignUpBodyDTO extends createZodDto(credentialsSchema) {}

export class SignInBodyDTO extends createZodDto(credentialsSchema) {}
const tokensSchema = z.object({ accessToken: z.string().trim() });
export class SignInResponseDTO extends createZodDto(tokensSchema) {}

const principalSchema = z.object({
    id: z.number(),
    login: z.string(),
    role: z.enum(USER_ROLE)
});
export class GetMeResponseDTO extends createZodDto(principalSchema) {}
