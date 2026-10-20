import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { apiMiddleware } from './apiMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Mount API middleware
app.use(apiMiddleware);

// Serve static frontend assets from dist in production
const distPath = path.resolve(__dirname, '../dist');
app.use(express.static(distPath));

// Catch-all route to serve SPA index.html
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`HIsabkhata server running on port ${PORT}`);
});
