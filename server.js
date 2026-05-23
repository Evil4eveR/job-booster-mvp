import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './src/config/environment.js';
import aiRoutes from './src/routes/aiRountes.js';
import { errorHandler } from './src/middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Secure cross-origin setup
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Server frontend layout files statically
app.use(express.static(path.join(__dirname, 'public')));

// Connect module API routes
app.use('/api/ai', aiRoutes);

// Return SPA scaffold for index route explicitly
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Fallback runtime catch middleware
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`[PRODUCTION SERVER RUNNING]: Listening securely via target port ${config.port}`);
});