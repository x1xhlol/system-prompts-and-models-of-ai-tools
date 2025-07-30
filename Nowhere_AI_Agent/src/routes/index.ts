import { Router, Request, Response } from 'express';
import { NowhereCore } from '../core/nowhere';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth';
import { Logger } from '../utils/logger';

const router = Router();
const logger = new Logger('Routes');

export function setupRoutes(app: any, nowhere: NowhereCore): void {
  // API v1 routes
  app.use('/api/v1', router);

  // Status endpoint
  router.get('/status', async (req: Request, res: Response) => {
    try {
      const status = await nowhere.getStatus();
      res.json({
        success: true,
        data: status
      });
    } catch (error: any) {
      logger.error('Status endpoint error', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to get status'
      });
    }
  });

  // Command processing
  router.post('/command', optionalAuthMiddleware, async (req: Request, res: Response) => {
    try {
      const { command, userId = 'default' } = req.body;
      
      if (!command) {
        return res.status(400).json({
          success: false,
          error: 'Command is required'
        });
      }

      logger.info('Processing command', { command, userId });
      
      const response = await nowhere.processCommand(command, userId);
      
      res.json({
        success: true,
        data: {
          response: response.response,
          actions: response.actions,
          confidence: response.confidence,
          model: response.model,
          tokens: response.tokens,
          timestamp: response.timestamp
        }
      });
    } catch (error: any) {
      logger.error('Command processing error', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to process command'
      });
    }
  });

  // Voice command processing
  router.post('/voice', optionalAuthMiddleware, async (req: Request, res: Response) => {
    try {
      const { voiceInput, userId = 'default' } = req.body;
      
      if (!voiceInput) {
        return res.status(400).json({
          success: false,
          error: 'Voice input is required'
        });
      }

      logger.info('Processing voice command', { voiceInput, userId });
      
      const response = await nowhere.processCommand(`voice: ${voiceInput}`, userId);
      
      res.json({
        success: true,
        data: {
          response: response.response,
          actions: response.actions,
          confidence: response.confidence,
          model: response.model,
          tokens: response.tokens,
          timestamp: response.timestamp
        }
      });
    } catch (error: any) {
      logger.error('Voice command processing error', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to process voice command'
      });
    }
  });

  // Autopilot endpoints
  router.post('/autopilot/enable', optionalAuthMiddleware, async (req: Request, res: Response) => {
    try {
      const { userId = 'default' } = req.body;
      
      logger.info('Enabling autopilot', { userId });
      
      const response = await nowhere.processCommand('enable autopilot mode', userId);
      
      res.json({
        success: true,
        data: {
          enabled: true,
          message: response.response,
          actions: response.actions
        }
      });
    } catch (error: any) {
      logger.error('Autopilot enable error', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to enable autopilot'
      });
    }
  });

  router.post('/autopilot/disable', optionalAuthMiddleware, async (req: Request, res: Response) => {
    try {
      const { userId = 'default' } = req.body;
      
      logger.info('Disabling autopilot', { userId });
      
      const response = await nowhere.processCommand('disable autopilot mode', userId);
      
      res.json({
        success: true,
        data: {
          enabled: false,
          message: response.response,
          actions: response.actions
        }
      });
    } catch (error: any) {
      logger.error('Autopilot disable error', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to disable autopilot'
      });
    }
  });

  // Memory endpoints
  router.get('/memory/:userId', optionalAuthMiddleware, async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      
      logger.info('Retrieving memory', { userId });
      
      const response = await nowhere.processCommand('show me my memory', userId);
      
      res.json({
        success: true,
        data: {
          response: response.response,
          actions: response.actions
        }
      });
    } catch (error: any) {
      logger.error('Memory retrieval error', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve memory'
      });
    }
  });

  router.delete('/memory/:userId', authMiddleware, async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      
      logger.info('Clearing memory', { userId });
      
      // This would clear the user's memory in a real implementation
      
      res.json({
        success: true,
        data: {
          message: 'Memory cleared successfully'
        }
      });
    } catch (error: any) {
      logger.error('Memory clear error', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to clear memory'
      });
    }
  });

  // Voice status endpoint
  router.get('/voice/status', async (req: Request, res: Response) => {
    try {
      res.json({
        success: true,
        data: {
          available: true,
          isListening: false,
          isSpeaking: false,
          language: 'en-US',
          mode: 'brief'
        }
      });
    } catch (error: any) {
      logger.error('Voice status error', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to get voice status'
      });
    }
  });

  // Configuration endpoints
  router.get('/config', optionalAuthMiddleware, async (req: Request, res: Response) => {
    try {
      res.json({
        success: true,
        data: {
          version: '2.0.0',
          features: [
            'voice_commands',
            'autopilot_mode',
            'memory_system',
            'real_time_communication',
            'advanced_ai_processing',
            'multi_model_support'
          ],
          settings: {
            voiceMode: 'brief',
            autopilotEnabled: false,
            memoryEnabled: true,
            loggingEnabled: true
          }
        }
      });
    } catch (error: any) {
      logger.error('Config retrieval error', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to get configuration'
      });
    }
  });

  // Tool execution endpoints
  router.post('/tools/execute', authMiddleware, async (req: Request, res: Response) => {
    try {
      const { toolName, params, userId = 'default' } = req.body;
      
      if (!toolName) {
        return res.status(400).json({
          success: false,
          error: 'Tool name is required'
        });
      }

      logger.info('Executing tool', { toolName, params, userId });
      
      // In a real implementation, this would execute the tool
      const mockResult = {
        success: true,
        result: `Tool ${toolName} executed successfully`,
        metadata: {
          toolName,
          params,
          executionTime: Date.now()
        }
      };
      
      res.json({
        success: true,
        data: mockResult
      });
    } catch (error: any) {
      logger.error('Tool execution error', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to execute tool'
      });
    }
  });

  // Analytics endpoints
  router.get('/analytics/:userId', authMiddleware, async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      
      logger.info('Getting analytics', { userId });
      
      // Mock analytics data
      const analytics = {
        totalCommands: 150,
        voiceCommands: 45,
        autopilotSessions: 12,
        memoryItems: 89,
        averageResponseTime: 1.2,
        mostUsedFeatures: [
          'code_analysis',
          'file_operations',
          'voice_commands'
        ],
        sessionDuration: 3600,
        lastActivity: new Date().toISOString()
      };
      
      res.json({
        success: true,
        data: analytics
      });
    } catch (error: any) {
      logger.error('Analytics error', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'Failed to get analytics'
      });
    }
  });

  // Health check for API
  router.get('/health', async (req: Request, res: Response) => {
    try {
      const status = await nowhere.getStatus();
      res.json({
        success: true,
        data: {
          api: 'healthy',
          core: status.server === 'running' ? 'healthy' : 'unhealthy',
          timestamp: new Date().toISOString(),
          version: '2.0.0'
        }
      });
    } catch (error: any) {
      logger.error('API health check error', { error: error.message });
      res.status(500).json({
        success: false,
        error: 'API health check failed'
      });
    }
  });
} 