import { z } from 'zod';

export const teamIdSchema = z.object({
  id: z.string().min(1),
});

export const teamListSchema = z.object({
  limit: z.coerce.number().int().positive().default(50),
  offset: z.coerce.number().int().default(0),
});
