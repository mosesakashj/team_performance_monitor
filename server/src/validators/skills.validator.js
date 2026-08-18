import { z } from 'zod';

export const listSkillsSchema = z.object({
  category: z.string().optional(),
  limit: z.coerce.number().int().positive().default(50),
  offset: z.coerce.number().int().default(0),
});

export const skillIdSchema = z.object({
  id: z.string().min(1),
});
