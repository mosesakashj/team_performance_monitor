import { z } from 'zod';

export const skillGapsSchema = z.object({
  id: z.string().min(1),
});

export const bottlenecksSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export const teamCompositionSchema = z.object({
  id: z.string().min(1),
});

export const personTimelineSchema = z.object({
  id: z.string().min(1),
});
