import { z } from 'zod';

export const endorsementsSchema = z.object({
  skillId: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});
