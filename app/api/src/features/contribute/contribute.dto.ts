import { z } from 'zod';

export const CreatePostDto = z.object({
  kind: z.enum(['human', 'ai']),
  name: z.string(),
  handle: z.string(),
  avatar: z.string(),
  body: z.string().optional(),
  imageUrl: z.string().optional(),
  topic: z.string(),
  tells: z.array(z.string()),
});
