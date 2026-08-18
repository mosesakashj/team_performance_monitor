import { AppError } from '../utils/AppError.js';
import * as departmentQueries from '../queries/departments.queries.js';

export async function listDepartments(_req, res) {
  const departments = await departmentQueries.listDepartments();
  res.json({ departments });
}

export async function getDepartment(req, res) {
  const department = await departmentQueries.getDepartmentById(req.params.id);
  if (!department) throw new AppError(404, 'Department not found', 'NOT_FOUND');
  res.json(department);
}
