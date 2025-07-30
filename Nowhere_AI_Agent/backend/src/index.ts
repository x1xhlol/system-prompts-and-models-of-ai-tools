import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

import { Logger } from './utils/logger';
import { errorHandler } from './middleware/error-handler';
import { rateLimiter } from './middleware/rate-limiter';
import { authMiddleware } from './middleware/auth';
import { setupWebSocket } from './websocket';
import { setupRoutes } from './routes';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const logger = new Logger('Server');
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use(rateLimiter);

// Authentication middleware (optional for public endpoints)
app.use('/api/v1/public', (req, res, next) => next());
app.use('/api/v1', authMiddleware);

// Setup WebSocket
setupWebSocket(io);

// Setup routes
setupRoutes(app);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
});

// Start server
server.listen(PORT, () => {
  logger.info('🚀 Nowhere AI Agent Server Started', {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });

  // Log startup information
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    🚀 Nowhere AI Agent                      ║
║                                                              ║
║  🌐 Server running on: http://localhost:${PORT}                    ║
║  📡 WebSocket available at: ws://localhost:${PORT}                ║
║  🔧 Environment: ${process.env.NODE_ENV || 'development'}                    ║
║  📊 Health check: http://localhost:${PORT}/health              ║
║                                                              ║
║  🎤 Voice Integration: ${process.env.AZURE_SPEECH_KEY ? 'Enabled' : 'Disabled'}                    ║
║  🧠 Memory System: ${process.env.REDIS_URL ? 'Redis + PostgreSQL' : 'In-Memory'}                    ║
║  🤖 Autopilot Mode: Available                               ║
║                                                              ║
║  📋 Available Endpoints:                                    ║
║     • POST /api/v1/command - Process text commands          ║
║     • POST /api/v1/voice - Process voice commands           ║
║     • POST /api/v1/autopilot - Toggle autopilot mode       ║
║     • GET  /api/v1/memory/:userId - Get user memory        ║
║     • GET  /api/v1/status - Get system status              ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason, promise });
  process.exit(1);
});

export { app, server, io }; 