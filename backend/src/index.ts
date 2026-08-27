import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { db } from './database/schema';
import { apiRouter } from './api/routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

// Enable CORS for all devices (mobile, desktop, preview domains)
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

// Register API Routes
app.use('/api', apiRouter);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'SENTINEL AI Backend Control Plane',
    armorIq: 'ACTIVE_CRYPTOGRAPHIC_VERIFIER',
    timestamp: new Date().toISOString()
  });
});

// Serve frontend static build in production (supports single-port Zop.dev / cloud deployments)
const potentialDistPaths = [
  path.resolve(__dirname, '../../frontend/dist'),
  path.resolve(__dirname, '../frontend/dist'),
  path.resolve(process.cwd(), 'frontend/dist'),
  path.resolve(process.cwd(), 'dist')
];

const distPath = potentialDistPaths.find(p => fs.existsSync(p));

if (distPath) {
  console.log(`🌐 Serving production frontend static assets from: ${distPath}`);
  app.use(express.static(distPath));
  
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

async function startServer() {
  try {
    console.log('🛡️  Initializing Sentinel AI Database & Sandbox Schema...');
    await db.init();
    console.log('✅ Database & Seed Data Ready.');

    app.listen(Number(PORT), '0.0.0.0', () => {
      console.log(`=======================================================`);
      console.log(`🛡️  SENTINEL AI Control Plane Online on port ${PORT}`);
      console.log(`🌐 Public Access: Bound to 0.0.0.0:${PORT}`);
      console.log(`📡 SSE Stream: /api/events/stream`);
      console.log(`🔐 ArmorIQ Verification Engine: READY`);
      console.log(`=======================================================`);
    });
  } catch (error) {
    console.error('❌ Failed to start Sentinel AI server:', error);
    process.exit(1);
  }
}

startServer();

export { app };

