import { AppError } from '../utils/AppError.js';
import * as certificationQueries from '../queries/certifications.queries.js';

export async function listCertifications(_req, res) {
  const certifications = await certificationQueries.listCertifications();
  res.json({ certifications });
}

export async function getCertification(req, res) {
  const certification = await certificationQueries.getCertificationById(req.params.id);
  if (!certification) throw new AppError(404, 'Certification not found', 'NOT_FOUND');
  res.json(certification);
}

export async function getExpiringCertifications(req, res) {
  const { days } = req.query;
  const certifications = await certificationQueries.getExpiringCertifications({
    days: days ? Number(days) : undefined,
  });
  res.json({ certifications });
}
