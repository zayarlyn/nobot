import { z } from 'zod';

export const CreateThreadDto = z.object({
  flair: z.enum(['HUMAN', 'BOT', 'META', 'STRATEGY', 'GLITCH']),
  title: z.string().min(1).max(120),
  body: z.string().max(600).optional(),
});

export const CreateCommentDto = z.object({
  body: z.string().min(1).max(600),
  parentId: z.number().optional(),
});

export const VoteDto = z.object({
  threadId: z.number().optional(),
  commentId: z.number().optional(),
  value: z.union([z.literal(1), z.literal(-1)]),
});
