import { runQuery } from '../db/driver.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

const JWT_EXPIRES_IN = '7d';
const SALT_ROUNDS = 10;

/**
 * Find a user by email for authentication.
 * Returns passwordHash for verification — never expose this to callers.
 */
export async function findUserForAuth(email) {
  const rows = await runQuery(
    `
    MATCH (u:User {email: $email})
    RETURN u { .id, .email, .name, .role, .passwordHash } AS user
    `,
    { email }
  );
  return rows[0]?.user ?? null;
}

/**
 * Find a user by ID (without password hash).
 * Safe for profile responses.
 */
export async function findUserById(id) {
  const rows = await runQuery(
    `
    MATCH (u:User {id: $id})
    OPTIONAL (u)-[:IS_PROFILE_OF]->(p:Person)
    RETURN u { .id, .email, .name, .role, personId: p.id } AS user
    `,
    { id }
  );
  return rows[0]?.user ?? null;
}

/**
 * Create a new user with hashed password.
 * Optionally links to an existing Person node.
 */
export async function createUser({ email, name, password, role = 'member', personId }) {
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const id = crypto.randomUUID();

  if (personId) {
    await runQuery(
      `
      CREATE (u:User {
        id: $id,
        email: $email,
        name: $name,
        passwordHash: $passwordHash,
        role: $role,
        createdAt: datetime()
      })
      WITH u
      MATCH (p:Person {id: $personId})
      CREATE (u)-[:IS_PROFILE_OF]->(p)
      `,
      { id, email, name, passwordHash, role, personId }
    );
  } else {
    await runQuery(
      `
      CREATE (u:User {
        id: $id,
        email: $email,
        name: $name,
        passwordHash: $passwordHash,
        role: $role,
        createdAt: datetime()
      })
      `,
      { id, email, name, passwordHash, role }
    );
  }

  return { id, email, name, role };
}

/**
 * Verify password against stored hash.
 */
export async function verifyPassword(plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword);
}

/**
 * Generate JWT token for authenticated user.
 */
export function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    env.jwtSecret,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Verify and decode a JWT token.
 */
export function verifyToken(token) {
  return jwt.verify(token, env.jwtSecret);
}
