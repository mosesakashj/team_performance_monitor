import { z } from 'zod';

export const dashboardBottlenecksSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
});
