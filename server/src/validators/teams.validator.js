import { z } from 'zod';

export const teamIdSchema = z.object({
  id: z.string().min(1),
});
