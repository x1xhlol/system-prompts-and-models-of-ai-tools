import { Server, Socket } from 'socket.io';
import { NowhereCore, NowhereContext } from './core/nowhere';
import { Logger } from './utils/logger';
import { verifyToken } from './middleware/auth';

interface WebSocketMessage {
  type: string;
  data: any;
  userId?: string;
  timestamp?: Date;
}

const logger = new Logger('WebSocket');

export function setupWebSocket(io: Server, nowhere: NowhereCore): void {
  io.on('connection', (socket: Socket) => {
    logger.info('Client connected', { 
      id: socket.id, 
      address: socket.handshake.address,
      userAgent: socket.handshake.headers['user-agent']
    });

    // Send welcome message
    socket.emit('welcome', {
      type: 'welcome',
      data: {
        message: 'Welcome to Nowhere AI Agent',
        version: '2.0.0',
        features: [
          'Voice Commands',
          'Autopilot Mode',
          'Real-time Communication',
          'Memory System',
          'Advanced AI Processing',
          'Multi-model Support'
        ],
        sessionId: socket.id
      },
      timestamp: new Date(),
      success: true
    });

    // Handle authentication
    socket.on('authenticate', async (data: { token: string }) => {
      try {
        const decoded = verifyToken(data.token);
        if (decoded) {
          socket.data.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role || 'user',
            permissions: decoded.permissions || []
          };
          
          logger.info('Socket authenticated', { 
            socketId: socket.id, 
            userId: socket.data.user.id 
          });
          
          socket.emit('authenticated', {
            type: 'authenticated',
            data: {
              user: socket.data.user,
              message: 'Authentication successful'
            },
            timestamp: new Date(),
            success: true
          });
        } else {
          socket.emit('auth_error', {
            type: 'auth_error',
            data: {
              message: 'Invalid token'
            },
            timestamp: new Date(),
            success: false
          });
        }
      } catch (error: any) {
        logger.error('Socket authentication error', { error: error.message });
        socket.emit('auth_error', {
          type: 'auth_error',
          data: {
            message: 'Authentication failed'
          },
          timestamp: new Date(),
          success: false
        });
      }
    });

    // Handle command messages
    socket.on('command', async (message: WebSocketMessage) => {
      try {
        const userId = socket.data.user?.id || message.userId || 'default';
        
        logger.info('Processing WebSocket command', { 
          command: message.data.command, 
          userId,
          socketId: socket.id 
        });

        const response = await nowhere.processCommand(message.data.command, userId);
        
        socket.emit('response', {
          type: 'command_response',
          data: {
            response: response.response,
            actions: response.actions,
            confidence: response.confidence,
            model: response.model,
            tokens: response.tokens,
            timestamp: response.timestamp
          },
          timestamp: new Date(),
          success: true
        });

        // Broadcast to other clients if it's a system command
        if (message.data.command.toLowerCase().includes('system') || 
            message.data.command.toLowerCase().includes('broadcast')) {
          socket.broadcast.emit('system_message', {
            type: 'system_message',
            data: {
              message: `System: ${response.response}`,
              userId: userId
            },
            timestamp: new Date()
          });
        }
      } catch (error: any) {
        logger.error('WebSocket command error', { error: error.message });
        socket.emit('error', {
          type: 'command_error',
          data: {
            message: 'Failed to process command',
            error: error.message
          },
          timestamp: new Date(),
          success: false
        });
      }
    });

    // Handle voice command messages
    socket.on('voice_command', async (message: WebSocketMessage) => {
      try {
        const userId = socket.data.user?.id || message.userId || 'default';
        
        logger.info('Processing WebSocket voice command', { 
          voiceInput: message.data.voiceInput, 
          userId,
          socketId: socket.id 
        });

        const response = await nowhere.processCommand(`voice: ${message.data.voiceInput}`, userId);
        
        socket.emit('voice_response', {
          type: 'voice_response',
          data: {
            response: response.response,
            actions: response.actions,
            confidence: response.confidence,
            model: response.model,
            tokens: response.tokens,
            timestamp: response.timestamp
          },
          timestamp: new Date(),
          success: true
        });
      } catch (error: any) {
        logger.error('WebSocket voice command error', { error: error.message });
        socket.emit('error', {
          type: 'voice_error',
          data: {
            message: 'Failed to process voice command',
            error: error.message
          },
          timestamp: new Date(),
          success: false
        });
      }
    });

    // Handle autopilot messages
    socket.on('autopilot', async (message: WebSocketMessage) => {
      try {
        const userId = socket.data.user?.id || message.userId || 'default';
        const action = message.data.action; // 'enable' or 'disable'
        
        logger.info('Processing autopilot action', { 
          action, 
          userId,
          socketId: socket.id 
        });

        const command = action === 'enable' ? 'enable autopilot mode' : 'disable autopilot mode';
        const response = await nowhere.processCommand(command, userId);
        
        socket.emit('autopilot_response', {
          type: 'autopilot_response',
          data: {
            enabled: action === 'enable',
            message: response.response,
            actions: response.actions
          },
          timestamp: new Date(),
          success: true
        });
      } catch (error: any) {
        logger.error('WebSocket autopilot error', { error: error.message });
        socket.emit('error', {
          type: 'autopilot_error',
          data: {
            message: 'Failed to process autopilot action',
            error: error.message
          },
          timestamp: new Date(),
          success: false
        });
      }
    });

    // Handle memory operations
    socket.on('memory', async (message: WebSocketMessage) => {
      try {
        const userId = socket.data.user?.id || message.userId || 'default';
        const operation = message.data.operation; // 'get', 'clear', 'add'
        
        logger.info('Processing memory operation', { 
          operation, 
          userId,
          socketId: socket.id 
        });

        let response;
        switch (operation) {
          case 'get':
            response = await nowhere.processCommand('show me my memory', userId);
            break;
          case 'clear':
            response = await nowhere.processCommand('clear my memory', userId);
            break;
          case 'add':
            response = await nowhere.processCommand(`remember: ${message.data.content}`, userId);
            break;
          default:
            response = await nowhere.processCommand('show me my memory', userId);
        }
        
        socket.emit('memory_response', {
          type: 'memory_response',
          data: {
            operation,
            response: response.response,
            actions: response.actions
          },
          timestamp: new Date(),
          success: true
        });
      } catch (error: any) {
        logger.error('WebSocket memory error', { error: error.message });
        socket.emit('error', {
          type: 'memory_error',
          data: {
            message: 'Failed to process memory operation',
            error: error.message
          },
          timestamp: new Date(),
          success: false
        });
      }
    });

    // Handle status requests
    socket.on('status', async () => {
      try {
        const status = await nowhere.getStatus();
        
        socket.emit('status_response', {
          type: 'status_response',
          data: status,
          timestamp: new Date(),
          success: true
        });
      } catch (error: any) {
        logger.error('WebSocket status error', { error: error.message });
        socket.emit('error', {
          type: 'status_error',
          data: {
            message: 'Failed to get status',
            error: error.message
          },
          timestamp: new Date(),
          success: false
        });
      }
    });

    // Handle voice status requests
    socket.on('voice_status', async () => {
      try {
        socket.emit('voice_status_response', {
          type: 'voice_status_response',
          data: {
            available: true,
            isListening: false,
            isSpeaking: false,
            language: 'en-US',
            mode: 'brief'
          },
          timestamp: new Date(),
          success: true
        });
      } catch (error: any) {
        logger.error('WebSocket voice status error', { error: error.message });
        socket.emit('error', {
          type: 'voice_status_error',
          data: {
            message: 'Failed to get voice status',
            error: error.message
          },
          timestamp: new Date(),
          success: false
        });
      }
    });

    // Handle ping/pong for connection health
    socket.on('ping', () => {
      socket.emit('pong', {
        type: 'pong',
        data: {
          timestamp: Date.now()
        },
        timestamp: new Date()
      });
    });

    // Handle disconnect
    socket.on('disconnect', (reason: string) => {
      logger.info('Client disconnected', { 
        socketId: socket.id, 
        reason,
        userId: socket.data.user?.id 
      });
    });

    // Handle errors
    socket.on('error', (error: any) => {
      logger.error('Socket error', { 
        socketId: socket.id, 
        error: error.message 
      });
    });
  });

  // Broadcast system messages to all connected clients
  function broadcastSystemMessage(message: string, type: string = 'info') {
    io.emit('system_broadcast', {
      type: 'system_broadcast',
      data: {
        message,
        type,
        timestamp: new Date()
      },
      timestamp: new Date()
    });
  }

  // Graceful shutdown
  process.on('SIGTERM', () => {
    logger.info('Shutting down WebSocket server');
    broadcastSystemMessage('Server is shutting down', 'warning');
    io.close();
  });

  process.on('SIGINT', () => {
    logger.info('Shutting down WebSocket server');
    broadcastSystemMessage('Server is shutting down', 'warning');
    io.close();
  });

  logger.info('WebSocket server setup complete');
} 