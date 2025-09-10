import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const credentialsSchema = z.object({
  // TODO: validation
  login: z.string(),
  password: z.string(),
});

const userSchema = z.object({
  id: z.number(),
  login: z.string(),
  updatedAt: z.coerce.string(),
  createdAt: z.coerce.string(),
});

export class SignUpBodyDTO extends createZodDto(credentialsSchema) {}

export class SignInBodyDTO extends createZodDto(credentialsSchema) {}
export class SignInResponseDTO extends createZodDto(userSchema) {}
