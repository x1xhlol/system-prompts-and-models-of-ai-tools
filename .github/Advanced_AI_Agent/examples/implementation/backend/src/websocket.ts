import { Server, Socket } from 'socket.io';
import { NowhereCore, NowhereContext } from './core/nowhere';
import { Logger } from './utils/logger';

export interface WebSocketMessage {
  type: 'command' | 'voice' | 'autopilot' | 'memory' | 'status' | 'error';
  data: any;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
}

export interface WebSocketResponse {
  type: 'response' | 'status' | 'error' | 'voice_response';
  data: any;
  timestamp: Date;
  success: boolean;
}

export function setupWebSocket(io: Server, nowhere: NowhereCore) {
  const logger = new Logger('WebSocket');

  io.on('connection', (socket: Socket) => {
    logger.info('Client connected', { 
      id: socket.id, 
      address: socket.handshake.address 
    });

    // Handle authentication
    socket.on('authenticate', async (data: { token: string }) => {
      try {
        // In a real implementation, you would verify the JWT token
        const userId = 'user-' + Math.random().toString(36).substr(2, 9);
        socket.data.userId = userId;
        socket.data.authenticated = true;
        
        socket.emit('authenticated', { 
          success: true, 
          userId,
          message: 'Successfully authenticated with Nowhere'
        });
        
        logger.info('Client authenticated', { socketId: socket.id, userId });
      } catch (error) {
        socket.emit('authenticated', { 
          success: false, 
          error: 'Authentication failed' 
        });
        logger.error('Authentication failed', { socketId: socket.id, error });
      }
    });

    // Handle text commands
    socket.on('command', async (message: WebSocketMessage) => {
      try {
        if (!socket.data.authenticated) {
          socket.emit('error', { 
            type: 'authentication_error',
            message: 'Please authenticate first' 
          });
          return;
        }

        const context: NowhereContext = {
          userId: socket.data.userId,
          sessionId: socket.id,
          projectId: message.data.projectId || 'default',
          timestamp: new Date(),
          metadata: {
            source: 'websocket',
            clientId: socket.id,
            userAgent: socket.handshake.headers['user-agent']
          }
        };

        logger.info('Processing command via WebSocket', { 
          command: message.data.command,
          userId: context.userId,
          sessionId: context.sessionId
        });

        const response = await nowhere.processCommand(
          message.data.command, 
          context, 
          false
        );

        socket.emit('response', {
          type: 'command_response',
          data: response,
          timestamp: new Date(),
          success: true
        });

        logger.info('Command processed successfully', { 
          command: message.data.command,
          responseTime: Date.now() - message.timestamp.getTime()
        });

      } catch (error) {
        logger.error('Command processing failed', { 
          error: error.message,
          command: message.data.command 
        });

        socket.emit('error', {
          type: 'command_error',
          message: 'Failed to process command',
          error: error.message
        });
      }
    });

    // Handle voice commands
    socket.on('voice_command', async (message: WebSocketMessage) => {
      try {
        if (!socket.data.authenticated) {
          socket.emit('error', { 
            type: 'authentication_error',
            message: 'Please authenticate first' 
          });
          return;
        }

        const context: NowhereContext = {
          userId: socket.data.userId,
          sessionId: socket.id,
          projectId: message.data.projectId || 'default',
          timestamp: new Date(),
          metadata: {
            source: 'websocket_voice',
            clientId: socket.id,
            audioData: message.data.audioData
          }
        };

        logger.info('Processing voice command via WebSocket', { 
          userId: context.userId,
          sessionId: context.sessionId
        });

        const response = await nowhere.processVoiceCommand(
          message.data.voiceInput, 
          context
        );

        socket.emit('voice_response', {
          type: 'voice_response',
          data: response,
          timestamp: new Date(),
          success: true
        });

        logger.info('Voice command processed successfully', { 
          responseTime: Date.now() - message.timestamp.getTime()
        });

      } catch (error) {
        logger.error('Voice command processing failed', { 
          error: error.message 
        });

        socket.emit('error', {
          type: 'voice_error',
          message: 'Failed to process voice command',
          error: error.message
        });
      }
    });

    // Handle autopilot mode
    socket.on('autopilot', async (message: WebSocketMessage) => {
      try {
        if (!socket.data.authenticated) {
          socket.emit('error', { 
            type: 'authentication_error',
            message: 'Please authenticate first' 
          });
          return;
        }

        const context: NowhereContext = {
          userId: socket.data.userId,
          sessionId: socket.id,
          projectId: message.data.projectId || 'default',
          timestamp: new Date(),
          metadata: {
            source: 'websocket_autopilot',
            clientId: socket.id
          }
        };

        if (message.data.action === 'enable') {
          await nowhere.enableAutopilotMode(context);
          socket.emit('autopilot_status', {
            type: 'autopilot_enabled',
            data: { enabled: true },
            timestamp: new Date(),
            success: true
          });
          logger.info('Autopilot mode enabled', { userId: context.userId });
        } else if (message.data.action === 'disable') {
          await nowhere.disableAutopilotMode(context);
          socket.emit('autopilot_status', {
            type: 'autopilot_disabled',
            data: { enabled: false },
            timestamp: new Date(),
            success: true
          });
          logger.info('Autopilot mode disabled', { userId: context.userId });
        }

      } catch (error) {
        logger.error('Autopilot operation failed', { 
          error: error.message,
          action: message.data.action 
        });

        socket.emit('error', {
          type: 'autopilot_error',
          message: 'Failed to process autopilot command',
          error: error.message
        });
      }
    });

    // Handle memory operations
    socket.on('memory', async (message: WebSocketMessage) => {
      try {
        if (!socket.data.authenticated) {
          socket.emit('error', { 
            type: 'authentication_error',
            message: 'Please authenticate first' 
          });
          return;
        }

        const context: NowhereContext = {
          userId: socket.data.userId,
          sessionId: socket.id,
          projectId: message.data.projectId || 'default',
          timestamp: new Date(),
          metadata: {
            source: 'websocket_memory',
            clientId: socket.id
          }
        };

        if (message.data.action === 'get') {
          const memory = await nowhere.getMemory(context);
          socket.emit('memory_response', {
            type: 'memory_data',
            data: memory,
            timestamp: new Date(),
            success: true
          });
        } else if (message.data.action === 'clear') {
          await nowhere.clearMemory(context);
          socket.emit('memory_response', {
            type: 'memory_cleared',
            data: { cleared: true },
            timestamp: new Date(),
            success: true
          });
        }

      } catch (error) {
        logger.error('Memory operation failed', { 
          error: error.message,
          action: message.data.action 
        });

        socket.emit('error', {
          type: 'memory_error',
          message: 'Failed to process memory operation',
          error: error.message
        });
      }
    });

    // Handle status requests
    socket.on('status', async () => {
      try {
        const status = {
          server: 'running',
          timestamp: new Date(),
          version: '1.0.0',
          features: [
            'voice_commands',
            'autopilot_mode',
            'memory_system',
            'real_time_communication'
          ]
        };

        socket.emit('status_response', {
          type: 'status',
          data: status,
          timestamp: new Date(),
          success: true
        });

      } catch (error) {
        logger.error('Status request failed', { error: error.message });
        socket.emit('error', {
          type: 'status_error',
          message: 'Failed to get status',
          error: error.message
        });
      }
    });

    // Handle voice status
    socket.on('voice_status', async () => {
      try {
        // This would integrate with the VoiceProcessor
        const voiceStatus = {
          isListening: false,
          isSpeaking: false,
          language: 'en-US',
          available: true
        };

        socket.emit('voice_status_response', {
          type: 'voice_status',
          data: voiceStatus,
          timestamp: new Date(),
          success: true
        });

      } catch (error) {
        logger.error('Voice status request failed', { error: error.message });
        socket.emit('error', {
          type: 'voice_status_error',
          message: 'Failed to get voice status',
          error: error.message
        });
      }
    });

    // Handle disconnection
    socket.on('disconnect', (reason: string) => {
      logger.info('Client disconnected', { 
        socketId: socket.id,
        reason,
        userId: socket.data.userId 
      });

      // Clean up any ongoing operations for this session
      if (socket.data.userId) {
        // In a real implementation, you might want to clean up
        // any ongoing autopilot operations or memory sessions
      }
    });

    // Handle errors
    socket.on('error', (error: any) => {
      logger.error('WebSocket error', { 
        socketId: socket.id,
        error: error.message 
      });
    });

    // Send welcome message
    socket.emit('welcome', {
      type: 'welcome',
      data: {
        message: 'Welcome to Nowhere AI Agent',
        version: '1.0.0',
        features: [
          'Voice Commands',
          'Autopilot Mode',
          'Real-time Communication',
          'Memory System'
        ]
      },
      timestamp: new Date(),
      success: true
    });
  });

  // Broadcast system messages to all connected clients
  function broadcastSystemMessage(message: string, type: string = 'info') {
    io.emit('system_message', {
      type: 'system',
      data: {
        message,
        type,
        timestamp: new Date()
      },
      timestamp: new Date(),
      success: true
    });
  }

  // Handle server shutdown
  process.on('SIGTERM', () => {
    broadcastSystemMessage('Server is shutting down', 'warning');
    io.close();
  });

  process.on('SIGINT', () => {
    broadcastSystemMessage('Server is shutting down', 'warning');
    io.close();
  });

  logger.info('WebSocket server setup complete');
} 