import { z } from 'zod';

export const listSkillsSchema = z.object({
  category: z.string().optional(),
});

export const skillIdSchema = z.object({
  id: z.string().min(1),
});
