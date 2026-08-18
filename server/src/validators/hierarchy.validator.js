import { z } from 'zod';

export const endorsementsSchema = z.object({
  skillId: z.string().optional(),
});
