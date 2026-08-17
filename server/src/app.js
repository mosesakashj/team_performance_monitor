import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { env } from './config/env.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';
import healthRoutes from './routes/health.routes.js';
import statsRoutes from './routes/stats.routes.js';
import peopleRoutes from './routes/people.routes.js';
import projectsRoutes from './routes/projects.routes.js';
import skillsRoutes from './routes/skills.routes.js';
import teamsRoutes from './routes/teams.routes.js';
import searchRoutes from './routes/search.routes.js';
import hierarchyRoutes from './routes/hierarchy.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import recommendationsRoutes from './routes/recommendations.routes.js';

export function createApp() {
  const app = express();

  app.use(cors({ origin: env.corsOrigin }));
  app.use(express.json());
  app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

  app.use('/api/health', healthRoutes);
  app.use('/api/stats', statsRoutes);
  app.use('/api/people', peopleRoutes);
  app.use('/api/projects', projectsRoutes);
  app.use('/api/skills', skillsRoutes);
  app.use('/api/teams', teamsRoutes);
  app.use('/api/search', searchRoutes);
  app.use('/api/hierarchy', hierarchyRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/recommendations', recommendationsRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
