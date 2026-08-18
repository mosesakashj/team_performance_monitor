import { z } from 'zod';

export const departmentIdSchema = z.object({
  id: z.string().min(1),
});

export const certificationIdSchema = z.object({
  id: z.string().min(1),
});

export const expiringCertificationsSchema = z.object({
  days: z.coerce.number().int().min(1).max(365).optional(),
});

export const projectIdParamSchema = z.object({
  projectId: z.string().min(1),
});

export const phaseIdSchema = z.object({
  id: z.string().min(1),
});
