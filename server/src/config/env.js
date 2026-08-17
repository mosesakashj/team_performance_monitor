import 'dotenv/config';

const required = ['COGNODB_URI', 'COGNODB_USER', 'COGNODB_PASSWORD'];
const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(
    `[config] Missing required environment variable(s): ${missing.join(', ')}.\n` +
      '[config] Copy server/.env.example to server/.env and fill in your CognoDB connection details.'
  );
}

export const env = {
  cognodbUri: process.env.COGNODB_URI ?? '',
  cognodbUser: process.env.COGNODB_USER ?? '',
  cognodbPassword: process.env.COGNODB_PASSWORD ?? '',
  port: Number(process.env.PORT ?? 4000),
  corsOrigin: (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim()),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isConfigured: missing.length === 0,
};
