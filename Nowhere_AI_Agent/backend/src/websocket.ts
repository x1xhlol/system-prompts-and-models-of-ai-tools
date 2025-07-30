import { Server as SocketIOServer, Socket } from 'socket.io';
import { Logger } from './utils/logger';
import { NowhereCore, CommandRequest, AIResponse } from './core/nowhere';

const logger = new Logger('WebSocket');

export function setupWebSocket(io: SocketIOServer) {
  const nowhere = new NowhereCore();

  io.on('connection', (socket: Socket) => {
    logger.info('Client connected', { 
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
    socket.on('command', async (data: any) => {
      try {
        logger.info('Processing WebSocket command', { 
          socketId: socket.id, 
          command: data.command?.substring(0, 100) 
        });

        const request: CommandRequest = {
          command: data.command,
          userId: data.userId || socket.id,
          context: data.context,
          autopilot: data.autopilot || false
        };

        const response: AIResponse = await nowhere.processCommand(request);

        socket.emit('command_response', response);

      } catch (error) {
        logger.error('WebSocket command error', { 
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

    // Handle voice commands
    socket.on('voice_command', async (data: any) => {
      try {
        logger.info('Processing WebSocket voice command', { 
          socketId: socket.id,
          audioSize: data.audioData?.length 
        });

        // Process voice input
        const voiceCommand = await nowhere['voice'].processVoiceInput(
          Buffer.from(data.audioData, 'base64')
        );

        // Process the voice command
        const request: CommandRequest = {
          command: voiceCommand.text,
          userId: data.userId || socket.id,
          context: data.context,
          voice: true
        };

        const response: AIResponse = await nowhere.processCommand(request);

        socket.emit('voice_response', {
          ...response,
          voiceCommand: voiceCommand.text
        });

      } catch (error) {
        logger.error('WebSocket voice command error', { 
          socketId: socket.id, 
          error: error.message 
        });

        socket.emit('error', {
          success: false,
          message: 'Voice command processing failed',
          error: error.message
        });
      }
    });

    // Handle autopilot toggle
    socket.on('toggle_autopilot', async (data: any) => {
      try {
        logger.info('Toggling autopilot via WebSocket', { 
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
        logger.error('WebSocket autopilot toggle error', { 
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

    // Handle memory queries
    socket.on('query_memory', async (data: any) => {
      try {
        logger.info('Querying memory via WebSocket', { 
          socketId: socket.id, 
          query: data.query 
        });

        const memoryEntries = await nowhere['memory'].queryMemory(data.query);

        socket.emit('memory_response', {
          success: true,
          data: memoryEntries
        });

      } catch (error) {
        logger.error('WebSocket memory query error', { 
          socketId: socket.id, 
          error: error.message 
        });

        socket.emit('error', {
          success: false,
          message: 'Memory query failed',
          error: error.message
        });
      }
    });

    // Handle status requests
    socket.on('get_status', async () => {
      try {
        logger.info('Getting status via WebSocket', { socketId: socket.id });

        const status = await nowhere.getStatus();

        socket.emit('status_response', {
          success: true,
          data: status
        });

      } catch (error) {
        logger.error('WebSocket status error', { 
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

    // Handle voice listening
    socket.on('start_voice_listening', async () => {
      try {
        logger.info('Starting voice listening via WebSocket', { socketId: socket.id });

        await nowhere['voice'].startListening();

        socket.emit('voice_listening_started', {
          success: true,
          message: 'Voice listening started'
        });

      } catch (error) {
        logger.error('WebSocket voice listening start error', { 
          socketId: socket.id, 
          error: error.message 
        });

        socket.emit('error', {
          success: false,
          message: 'Failed to start voice listening',
          error: error.message
        });
      }
    });

    socket.on('stop_voice_listening', async () => {
      try {
        logger.info('Stopping voice listening via WebSocket', { socketId: socket.id });

        await nowhere['voice'].stopListening();

        socket.emit('voice_listening_stopped', {
          success: true,
          message: 'Voice listening stopped'
        });

      } catch (error) {
        logger.error('WebSocket voice listening stop error', { 
          socketId: socket.id, 
          error: error.message 
        });

        socket.emit('error', {
          success: false,
          message: 'Failed to stop voice listening',
          error: error.message
        });
      }
    });

    // Handle ping/pong for connection health
    socket.on('ping', () => {
      socket.emit('pong', {
        timestamp: new Date().toISOString(),
        serverTime: Date.now()
      });
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      logger.info('Client disconnected', { 
        id: socket.id, 
        reason 
      });
    });

    // Handle errors
    socket.on('error', (error) => {
      logger.error('Socket error', { 
        id: socket.id, 
        error: error.message 
      });
    });
  });

  // Broadcast system events to all clients
  setInterval(() => {
    io.emit('heartbeat', {
      timestamp: new Date().toISOString(),
      activeConnections: io.engine.clientsCount
    });
  }, 30000); // Every 30 seconds

  logger.info('WebSocket server initialized');
} 