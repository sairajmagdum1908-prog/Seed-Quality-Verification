import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import authRouter from "./api/auth";
import usersRouter from "./api/users";
import seedsRouter from "./api/seeds";
import transactionsRouter from "./api/transactions";
import reportsRouter from "./api/reports";
import statsRouter from "./api/stats";
import { initDb } from "./api/lib/db";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Initialize database
initDb().catch(err => console.error('Failed to initialize database on startup:', err));

app.use(express.json({ limit: '50mb' }));

// Mount API routes
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/seeds", seedsRouter);
app.use("/api/transactions", transactionsRouter);
app.use("/api/reports", reportsRouter);
app.use("/api/stats", statsRouter);

// Serve static files from the Vite build
const distPath = path.join(__dirname, "dist");
app.use(express.static(distPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
