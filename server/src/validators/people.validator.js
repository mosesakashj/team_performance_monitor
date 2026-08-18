import { z } from 'zod';

export const listPeopleSchema = z.object({
  search: z.string().max(100).optional(),
  skillId: z.string().optional(),
  teamId: z.string().optional(),
  availableOnly: z.enum(['true', 'false']).optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

export const personIdSchema = z.object({
  id: z.string().min(1),
});

export const pathSchema = z.object({
  id: z.string().min(1),
  otherId: z.string().min(1),
});
