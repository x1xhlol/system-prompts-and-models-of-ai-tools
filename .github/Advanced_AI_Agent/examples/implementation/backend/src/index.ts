import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { Logger } from './utils/logger';
import { NowhereCore } from './core/nowhere';
import { setupRoutes } from './routes';
import { setupWebSocket } from './websocket';
import { errorHandler } from './middleware/error-handler';
import { rateLimiter } from './middleware/rate-limiter';
import { authMiddleware } from './middleware/auth';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

const logger = new Logger('Server');
const PORT = process.env.PORT || 3001;

// Initialize Nowhere core
const nowhere = new NowhereCore();

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use(rateLimiter);

// Authentication middleware (optional for development)
if (process.env.NODE_ENV === 'production') {
  app.use(authMiddleware);
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    agent: 'Nowhere',
  });
});

// Setup routes
setupRoutes(app, nowhere);

// Setup WebSocket
setupWebSocket(io, nowhere);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
  });
});

// Start server
server.listen(PORT, () => {
  logger.info(`🚀 Nowhere AI Agent Server running on port ${PORT}`);
  logger.info(`📡 WebSocket server ready for real-time communication`);
  logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
  
  if (process.env.NODE_ENV === 'development') {
    logger.info(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
    logger.info(`🔑 OpenAI API: ${process.env.OPENAI_API_KEY ? 'Configured' : 'Missing'}`);
    logger.info(`🔑 Anthropic API: ${process.env.ANTHROPIC_API_KEY ? 'Configured' : 'Missing'}`);
  }
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
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export { app, server, io, nowhere }; 