import * as writeQueries from '../queries/write.queries.js';

export async function createEndorsement(req, res) {
  const endorsement = await writeQueries.createEndorsement({
    endorserId: req.user.id,
    endorseeId: req.params.personId,
    ...req.body,
  });
  res.status(201).json(endorsement);
}

export async function assignSkill(req, res) {
  await writeQueries.assignSkill(req.params.personId, req.body);
  res.status(201).json({ message: 'Skill assigned' });
}

export async function removeSkill(req, res) {
  await writeQueries.removeSkill(req.params.personId, req.params.skillId);
  res.status(204).end();
}
