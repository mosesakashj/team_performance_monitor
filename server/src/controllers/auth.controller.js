import { AppError } from '../utils/AppError.js';
import { runQuery } from '../db/driver.js';
import {
  findUserForAuth,
  findUserById,
  createUser,
  verifyPassword,
  generateToken,
} from '../queries/auth.queries.js';

export async function login(req, res) {
  const { email, password } = req.body;

  const user = await findUserForAuth(email);
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
  const { email, name, password, role, personId } = req.body;

  const existing = await findUserForAuth(email);
  if (existing) {
    throw new AppError(409, 'Email already registered', 'CONFLICT');
  }

  const user = await createUser({ email, name, password, role, personId });
  const token = generateToken(user);

  res.status(201).json({ token, user });
}

export async function getMe(req, res) {
  res.json({ user: req.user });
}

export async function updateMe(req, res) {
  const { name, email } = req.body;
  const updates = [];
  const params = { id: req.user.id };

  if (name) {
    updates.push('u.name = $name');
    params.name = name;
  }
  if (email) {
    updates.push('u.email = $email');
    params.email = email;
  }

  if (updates.length > 0) {
    await runQuery(
      `
      MATCH (u:User {id: $id})
      SET ${updates.join(', ')}, u.updatedAt = datetime()
      `,
      params
    );
  }

  const updatedUser = await findUserById(req.user.id);
  res.json({ user: updatedUser });
}
