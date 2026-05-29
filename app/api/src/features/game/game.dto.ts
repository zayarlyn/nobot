import { z } from 'zod';

export const CreateGameDto = z.object({
  score: z.number(),
  accuracy: z.number().min(0).max(100),
  verdict: z.string(),
  streak: z.number(),
  purgedBots: z.number(),
  savedHumans: z.number(),
  killedHumans: z.number(),
  escapedBots: z.number(),
});
