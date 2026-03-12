import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import authRouter from './api/auth';
import usersRouter from './api/users';
import seedsRouter from './api/seeds';
import transactionsRouter from './api/transactions';
import reportsRouter from './api/reports';
import statsRouter from './api/stats';
import aiRouter from './api/ai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Mount API routes
// Note: The routers in api/*.ts already have /api/prefix in some cases, 
// but we want to be consistent.
app.use(authRouter);
app.use(usersRouter);
app.use(seedsRouter);
app.use(transactionsRouter);
app.use(reportsRouter);
app.use(statsRouter);
app.use(aiRouter);

// Serve static files from the Vite build
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
