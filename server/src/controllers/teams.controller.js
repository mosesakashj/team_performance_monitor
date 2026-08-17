import { AppError } from '../utils/AppError.js';
import * as teamQueries from '../queries/teams.queries.js';

export async function listTeams(req, res) {
  const teams = await teamQueries.listTeams();
  res.json({ teams });
}

export async function getTeam(req, res) {
  const team = await teamQueries.getTeamById(req.params.id);
  if (!team) throw new AppError(404, 'Team not found', 'NOT_FOUND');
  res.json(team);
}
