import * as writeQueries from '../queries/write.queries.js';

export async function createPerson(req, res) {
  const person = await writeQueries.createPerson(req.body);
  res.status(201).json(person);
}

export async function updatePerson(req, res) {
  const person = await writeQueries.updatePerson(req.params.id, req.body);
  res.json(person);
}

export async function deletePerson(req, res) {
  await writeQueries.deletePerson(req.params.id);
  res.status(204).end();
}
