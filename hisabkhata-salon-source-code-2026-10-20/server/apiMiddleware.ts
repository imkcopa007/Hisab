import express from 'express';
import { apiRouter } from './routes.js';

export const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Root health check & API mounting
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', app: 'HIsabkhata — Noble Reflxion Lifestyle Salon', time: new Date().toISOString() });
});

app.use('/api', apiRouter);

// Export for Vite dev server middleware
export const apiMiddleware = app;
