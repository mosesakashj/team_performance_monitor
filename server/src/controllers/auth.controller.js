import { AppError } from '../utils/AppError.js';
import { runQuery } from '../db/driver.js';
import {
  findUserByEmail,
  findUserById,
  createUser,
  verifyPassword,
  generateToken,
} from '../queries/auth.queries.js';

export async function login(req, res) {
  const { email, password } = req.body;

  const user = await findUserByEmail(email);
  if (!user) {
    throw new AppError(401, 'Invalid email or password', 'AUTH_INVALID');
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    throw new AppError(401, 'Invalid email or password', 'AUTH_INVALID');
  }

  const token = generateToken(user);
  const { passwordHash, ...safeUser } = user;

  res.json({ token, user: safeUser });
}

export async function register(req, res) {
  const { email, name, password, role } = req.body;

  const existing = await findUserByEmail(email);
  if (existing) {
    throw new AppError(409, 'Email already registered', 'CONFLICT');
  }

  const user = await createUser({ email, name, password, role });
  const token = generateToken(user);

  res.status(201).json({ token, user });
}

export async function getMe(req, res) {
  res.json({ user: req.user });
}

export async function updateMe(req, res) {
  const { name } = req.body;
  if (name) {
    await runQuery(
      `
      MATCH (u:User {id: $id})
      SET u.name = $name
      `,
      { id: req.user.id, name }
    );
  }
  const updatedUser = await findUserById(req.user.id);
  res.json({ user: updatedUser });
}
