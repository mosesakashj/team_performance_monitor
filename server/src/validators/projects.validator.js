import { z } from 'zod';

export const listProjectsSchema = z.object({
  status: z.enum(['active', 'proposed', 'on_hold', 'completed', 'all']).optional(),
  teamId: z.string().optional(),
  search: z.string().max(100).optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

export const projectIdSchema = z.object({
  id: z.string().min(1),
});
