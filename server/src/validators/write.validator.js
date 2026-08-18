import { z } from 'zod';

export const createPersonSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  title: z.string().min(1).max(100),
  seniority: z.enum(['junior', 'mid', 'senior', 'staff', 'principal']),
  location: z.string().optional(),
  timezone: z.string().optional(),
  weekly_capacity_hours: z.number().min(0).max(60).optional(),
  current_utilization_pct: z.number().min(0).max(100).optional(),
  available_from: z.string().optional(),
  hourly_cost: z.number().min(0).optional(),
});

export const updatePersonSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  title: z.string().min(1).max(100).optional(),
  seniority: z.enum(['junior', 'mid', 'senior', 'staff', 'principal']).optional(),
  location: z.string().optional(),
  timezone: z.string().optional(),
  weekly_capacity_hours: z.number().min(0).max(60).optional(),
  current_utilization_pct: z.number().min(0).max(100).optional(),
  available_from: z.string().optional(),
  hourly_cost: z.number().min(0).optional(),
});

export const createProjectSchema = z.object({
  name: z.string().min(1).max(200),
  client_name: z.string().min(1).max(200),
  status: z.enum(['active', 'proposed', 'on_hold', 'completed']),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  budget: z.number().min(0).optional(),
  priority: z.number().int().min(1).max(5),
  description: z.string().optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  client_name: z.string().min(1).max(200).optional(),
  status: z.enum(['active', 'proposed', 'on_hold', 'completed']).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  budget: z.number().min(0).optional(),
  priority: z.number().int().min(1).max(5).optional(),
  description: z.string().optional(),
});

export const createSkillSchema = z.object({
  name: z.string().min(1).max(100),
  category: z.enum(['Language', 'Framework', 'Cloud', 'Data', 'Soft Skill', 'Domain']),
});

export const updateSkillSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  category: z.enum(['Language', 'Framework', 'Cloud', 'Data', 'Soft Skill', 'Domain']).optional(),
});

export const createTeamSchema = z.object({
  name: z.string().min(1).max(100),
  department: z.string().min(1).max(100),
  departmentId: z.string().optional(),
});

export const updateTeamSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  department: z.string().min(1).max(100).optional(),
  departmentId: z.string().optional(),
});

export const endorsementSchema = z.object({
  skillId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  note: z.string().max(500).optional(),
});

export const assignSkillSchema = z.object({
  skillId: z.string().min(1),
  proficiency: z.number().int().min(1).max(5),
  years_experience: z.number().min(0).optional(),
});

export const assignToProjectSchema = z.object({
  role: z.string().min(1).max(100),
  allocation_pct: z.number().min(0).max(100).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});

export const assignToTeamSchema = z.object({
  role: z.string().min(1).max(100),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});
