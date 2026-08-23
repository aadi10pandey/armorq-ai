import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { db } from './database/schema';
import { apiRouter } from './api/routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

app.use(cors({
  origin: [CLIENT_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173'],
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

async function startServer() {
  try {
    console.log('🛡️  Initializing Sentinel AI Database & Sandbox Schema...');
    await db.init();
    console.log('✅ Database & Seed Data Ready.');

    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`🛡️  SENTINEL AI Control Plane Online on port ${PORT}`);
      console.log(`📡 SSE Stream: http://localhost:${PORT}/api/events/stream`);
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
