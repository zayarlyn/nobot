import { z } from 'zod';

export const RegisterDto = z.object({
  username: z.string().min(3).max(32),
  password: z.string().min(6).max(64),
});

export const LoginDto = z.object({
  username: z.string(),
  password: z.string(),
});
