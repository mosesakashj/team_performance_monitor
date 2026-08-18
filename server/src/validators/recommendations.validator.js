import { z } from 'zod';

export const skillRecsSchema = z.object({
  id: z.string().min(1),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

export const projectRecsSchema = z.object({
  id: z.string().min(1),
  limit: z.coerce.number().int().min(1).max(20).optional(),
});

export const teamCompatibilitySchema = z.object({
  personIds: z.array(z.string().min(1)).min(2).max(20),
});
