import { AppError } from '../utils/AppError.js';
import * as peopleQueries from '../queries/people.queries.js';

export async function listPeople(req, res) {
  const { search, skillId, teamId, availableOnly, limit, offset } = req.query;
  const result = await peopleQueries.listPeople({
    search,
    skillId,
    teamId,
    availableOnly: availableOnly === 'true',
    limit: limit ? Number(limit) : undefined,
    offset: offset ? Number(offset) : undefined,
  });
  res.json(result);
}

export async function getPerson(req, res) {
  const person = await peopleQueries.getPersonById(req.params.id);
  if (!person) throw new AppError(404, 'Person not found', 'NOT_FOUND');
  res.json(person);
}

export async function getPersonNetwork(req, res) {
  const network = await peopleQueries.getPersonNetwork(req.params.id);
  res.json({ colleagues: network });
}

export async function getPersonPath(req, res) {
  const path = await peopleQueries.getShortestPath(req.params.id, req.params.otherId);
  if (!path) throw new AppError(404, 'No path found between these two people', 'NOT_FOUND');
  res.json(path);
}
