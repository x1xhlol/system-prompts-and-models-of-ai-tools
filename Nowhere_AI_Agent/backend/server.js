const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const dotenv = require('dotenv');
const { createServer } = require('http');
const { Server: SocketIOServer } = require('socket.io');

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

// Simple logging
const log = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`, meta);
};

// Mock AI Core
class NowhereCore {
  constructor() {
    this.isAutopilotEnabled = false;
    this.memory = new Map();
  }

  async processCommand(request) {
    try {
      log('info', 'Processing command', { 
        command: request.command?.substring(0, 100), 
        userId: request.userId 
      });

      // Simple command parsing
      const command = request.command.toLowerCase();
      let response = { success: true, message: '', data: {} };

      if (command.includes('autopilot')) {
        this.isAutopilotEnabled = !this.isAutopilotEnabled;
        response.message = `Autopilot mode ${this.isAutopilotEnabled ? 'enabled' : 'disabled'}`;
        response.data.autopilot = this.isAutopilotEnabled;
      } else if (command.includes('analyze') || command.includes('code')) {
        response.message = 'Code analysis completed. Found 3 potential improvements.';
        response.data.analysis = {
          complexity: 5,
          lines: 150,
          issues: ['Consider extracting this function', 'Add error handling', 'Optimize imports']
        };
      } else if (command.includes('search') || command.includes('find')) {
        response.message = 'Search completed. Found relevant documentation and examples.';
        response.data.results = [
          { title: 'Search Results', url: 'https://example.com', snippet: 'Relevant information found.' }
        ];
      } else if (command.includes('create') || command.includes('new')) {
        response.message = 'File created successfully.';
        response.data.file = 'new-component.js';
      } else if (command.includes('run') || command.includes('execute')) {
        response.message = 'Command executed successfully.';
        response.data.output = 'Command completed with exit code 0';
      } else {
        response.message = `I understand you want to ${command}. Let me help you with that.`;
      }

      // Update memory
      this.memory.set(request.userId || 'default', {
        lastCommand: request.command,
        lastResult: response,
        timestamp: new Date().toISOString()
      });

      return response;

    } catch (error) {
      log('error', 'Error processing command', { error: error.message });
      return {
        success: false,
        message: 'Failed to process command',
        error: error.message
      };
    }
  }

  async toggleAutopilot(enabled) {
    this.isAutopilotEnabled = enabled;
    log('info', 'Autopilot mode toggled', { enabled });
    
    return {
      success: true,
      message: `Autopilot mode ${enabled ? 'enabled' : 'disabled'}`,
      data: { autopilot: enabled }
    };
  }

  async getStatus() {
    return {
      autopilot: this.isAutopilotEnabled,
      memory: { size: this.memory.size },
      tools: { status: 'operational' },
      voice: { status: 'available' }
    };
  }
}

const nowhere = new NowhereCore();

// API Routes
app.post('/api/v1/command', async (req, res) => {
  try {
    const { command, userId, context, autopilot } = req.body;

    if (!command) {
      return res.status(400).json({
        success: false,
        message: 'Command is required'
      });
    }

    log('info', 'Processing command request', { 
      command: command.substring(0, 100), 
      userId, 
      autopilot 
    });

    const request = {
      command,
      userId: userId || 'default',
      context,
      autopilot: autopilot || false
    };

    const response = await nowhere.processCommand(request);
    res.json(response);

  } catch (error) {
    log('error', 'Command processing error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

app.post('/api/v1/voice', async (req, res) => {
  try {
    const { audioData, userId, context } = req.body;

    if (!audioData) {
      return res.status(400).json({
        success: false,
        message: 'Audio data is required'
      });
    }

    log('info', 'Processing voice request', { 
      audioSize: audioData.length, 
      userId 
    });

    // Mock voice processing
    const mockVoiceCommands = [
      'Nowhere, analyze this code',
      'Create a new React component',
      'Search for documentation',
      'Enable autopilot mode',
      'What do you remember from our conversation?',
      'Run the tests and show me the results'
    ];

    const voiceCommand = mockVoiceCommands[Math.floor(Math.random() * mockVoiceCommands.length)];

    const request = {
      command: voiceCommand,
      userId: userId || 'default',
      context,
      voice: true
    };

    const response = await nowhere.processCommand(request);

    res.json({
      ...response,
      voiceCommand
    });

  } catch (error) {
    log('error', 'Voice processing error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Voice processing failed',
      error: error.message
    });
  }
});

app.post('/api/v1/autopilot', async (req, res) => {
  try {
    const { enabled, userId } = req.body;

    log('info', 'Toggling autopilot mode', { enabled, userId });

    const response = await nowhere.toggleAutopilot(enabled);
    res.json(response);

  } catch (error) {
    log('error', 'Autopilot toggle error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to toggle autopilot mode',
      error: error.message
    });
  }
});

app.get('/api/v1/memory/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { query } = req.query;

    log('info', 'Getting user memory', { userId, query });

    const userMemory = nowhere.memory.get(userId) || {
      userId,
      preferences: { voiceEnabled: true, autopilotEnabled: false },
      recentCommands: ['analyze this code', 'create a new component'],
      projectContext: { currentProject: 'nowhere-ai-agent' },
      learningHistory: [],
      lastInteraction: new Date().toISOString()
    };

    res.json({
      success: true,
      data: userMemory
    });

  } catch (error) {
    log('error', 'Memory retrieval error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve memory',
      error: error.message
    });
  }
});

app.get('/api/v1/status', async (req, res) => {
  try {
    log('info', 'Getting system status');

    const status = await nowhere.getStatus();

    res.json({
      success: true,
      data: status
    });

  } catch (error) {
    log('error', 'Status retrieval error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to get system status',
      error: error.message
    });
  }
});

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

// WebSocket handling
io.on('connection', (socket) => {
  log('info', 'Client connected', { 
    id: socket.id, 
    ip: socket.handshake.address 
  });

  // Send welcome message
  socket.emit('welcome', {
    message: 'Welcome to Nowhere AI Agent!',
    timestamp: new Date().toISOString(),
    features: [
      'Voice Commands',
      'Autopilot Mode',
      'Memory System',
      'Real-time Communication'
    ]
  });

  // Handle text commands
  socket.on('command', async (data) => {
    try {
      log('info', 'Processing WebSocket command', { 
        socketId: socket.id, 
        command: data.command?.substring(0, 100) 
      });

      const request = {
        command: data.command,
        userId: data.userId || socket.id,
        context: data.context,
        autopilot: data.autopilot || false
      };

      const response = await nowhere.processCommand(request);
      socket.emit('command_response', response);

    } catch (error) {
      log('error', 'WebSocket command error', { 
        socketId: socket.id, 
        error: error.message 
      });

      socket.emit('error', {
        success: false,
        message: 'Command processing failed',
        error: error.message
      });
    }
  });

  // Handle autopilot toggle
  socket.on('toggle_autopilot', async (data) => {
    try {
      log('info', 'Toggling autopilot via WebSocket', { 
        socketId: socket.id, 
        enabled: data.enabled 
      });

      const response = await nowhere.toggleAutopilot(data.enabled);
      socket.emit('autopilot_response', response);

      // Broadcast to all clients
      io.emit('autopilot_status', {
        enabled: data.enabled,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      log('error', 'WebSocket autopilot toggle error', { 
        socketId: socket.id, 
        error: error.message 
      });

      socket.emit('error', {
        success: false,
        message: 'Autopilot toggle failed',
        error: error.message
      });
    }
  });

  // Handle status requests
  socket.on('get_status', async () => {
    try {
      log('info', 'Getting status via WebSocket', { socketId: socket.id });

      const status = await nowhere.getStatus();

      socket.emit('status_response', {
        success: true,
        data: status
      });

    } catch (error) {
      log('error', 'WebSocket status error', { 
        socketId: socket.id, 
        error: error.message 
      });

      socket.emit('error', {
        success: false,
        message: 'Status retrieval failed',
        error: error.message
      });
    }
  });

  // Handle disconnection
  socket.on('disconnect', (reason) => {
    log('info', 'Client disconnected', { 
      id: socket.id, 
      reason 
    });
  });
});

// Start server
server.listen(PORT, () => {
  log('info', '🚀 Nowhere AI Agent Server Started', {
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
║  🎤 Voice Integration: Available                            ║
║  🧠 Memory System: In-Memory                                ║
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
  log('info', 'SIGTERM received, shutting down gracefully');
  server.close(() => {
    log('info', 'Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  log('info', 'SIGINT received, shutting down gracefully');
  server.close(() => {
    log('info', 'Server closed');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  log('error', 'Uncaught Exception', { error: error.message, stack: error.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  log('error', 'Unhandled Rejection', { reason, promise });
  process.exit(1);
}); 