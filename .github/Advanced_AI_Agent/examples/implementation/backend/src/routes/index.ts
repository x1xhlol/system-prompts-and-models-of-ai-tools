import { Express } from 'express';
import { NowhereCore, NowhereContext } from '../core/nowhere';
import { Logger } from '../utils/logger';

const logger = new Logger('Routes');

export function setupRoutes(app: Express, nowhere: NowhereCore) {
  // API Routes
  app.use('/api/v1', createAPIRoutes(nowhere));
}

function createAPIRoutes(nowhere: NowhereCore) {
  const router = require('express').Router();

  // Command processing endpoint
  router.post('/command', async (req, res) => {
    try {
      const { command, context } = req.body;
      
      if (!command) {
        return res.status(400).json({
          error: 'Command is required',
        });
      }

      const defaultContext: NowhereContext = {
        userId: context?.userId || 'default-user',
        projectId: context?.projectId || 'default-project',
        currentFile: context?.currentFile,
        codebase: context?.codebase,
        userPreferences: context?.userPreferences,
        sessionId: context?.sessionId || `session-${Date.now()}`,
      };

      const response = await nowhere.processCommand(command, defaultContext);
      
      res.json({
        success: true,
        data: response,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Error processing command', error);
      res.status(500).json({
        error: 'Failed to process command',
        message: error.message,
      });
    }
  });

  // Voice command processing endpoint
  router.post('/voice', async (req, res) => {
    try {
      const { voiceInput, context } = req.body;
      
      if (!voiceInput) {
        return res.status(400).json({
          error: 'Voice input is required',
        });
      }

      const defaultContext: NowhereContext = {
        userId: context?.userId || 'default-user',
        projectId: context?.projectId || 'default-project',
        currentFile: context?.currentFile,
        codebase: context?.codebase,
        userPreferences: context?.userPreferences,
        sessionId: context?.sessionId || `session-${Date.now()}`,
      };

      const response = await nowhere.processVoiceCommand(voiceInput, defaultContext);
      
      res.json({
        success: true,
        data: response,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Error processing voice command', error);
      res.status(500).json({
        error: 'Failed to process voice command',
        message: error.message,
      });
    }
  });

  // Autopilot mode endpoints
  router.post('/autopilot/enable', async (req, res) => {
    try {
      const { context } = req.body;
      
      const defaultContext: NowhereContext = {
        userId: context?.userId || 'default-user',
        projectId: context?.projectId || 'default-project',
        currentFile: context?.currentFile,
        codebase: context?.codebase,
        userPreferences: context?.userPreferences,
        sessionId: context?.sessionId || `session-${Date.now()}`,
      };

      await nowhere.enableAutopilotMode(defaultContext);
      
      res.json({
        success: true,
        message: 'Autopilot mode enabled',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Error enabling autopilot mode', error);
      res.status(500).json({
        error: 'Failed to enable autopilot mode',
        message: error.message,
      });
    }
  });

  router.post('/autopilot/disable', async (req, res) => {
    try {
      const { context } = req.body;
      
      const defaultContext: NowhereContext = {
        userId: context?.userId || 'default-user',
        projectId: context?.projectId || 'default-project',
        currentFile: context?.currentFile,
        codebase: context?.codebase,
        userPreferences: context?.userPreferences,
        sessionId: context?.sessionId || `session-${Date.now()}`,
      };

      await nowhere.disableAutopilotMode(defaultContext);
      
      res.json({
        success: true,
        message: 'Autopilot mode disabled',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Error disabling autopilot mode', error);
      res.status(500).json({
        error: 'Failed to disable autopilot mode',
        message: error.message,
      });
    }
  });

  // Memory management endpoints
  router.get('/memory/:userId/:projectId', async (req, res) => {
    try {
      const { userId, projectId } = req.params;
      const { sessionId } = req.query;
      
      const context: NowhereContext = {
        userId,
        projectId,
        sessionId: sessionId as string || `session-${Date.now()}`,
      };

      const memory = await nowhere.getMemory(context);
      
      res.json({
        success: true,
        data: memory,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Error retrieving memory', error);
      res.status(500).json({
        error: 'Failed to retrieve memory',
        message: error.message,
      });
    }
  });

  router.delete('/memory/:userId/:projectId', async (req, res) => {
    try {
      const { userId, projectId } = req.params;
      const { sessionId } = req.query;
      
      const context: NowhereContext = {
        userId,
        projectId,
        sessionId: sessionId as string || `session-${Date.now()}`,
      };

      await nowhere.clearMemory(context);
      
      res.json({
        success: true,
        message: 'Memory cleared successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Error clearing memory', error);
      res.status(500).json({
        error: 'Failed to clear memory',
        message: error.message,
      });
    }
  });

  // Status endpoint
  router.get('/status', (req, res) => {
    res.json({
      success: true,
      data: {
        status: 'operational',
        agent: 'Nowhere',
        version: '1.0.0',
        features: [
          'voice-commands',
          'autopilot-mode',
          'adaptive-learning',
          'memory-system',
          'real-time-collaboration',
        ],
        timestamp: new Date().toISOString(),
      },
    });
  });

  // Configuration endpoint
  router.get('/config', (req, res) => {
    res.json({
      success: true,
      data: {
        voiceCommands: {
          navigation: [
            'go to file',
            'show me the main function',
            'navigate to',
            'open',
            'find',
            'locate',
          ],
          execution: [
            'run',
            'execute',
            'start',
            'deploy',
            'build',
            'test',
          ],
          analysis: [
            'analyze',
            'find performance issues',
            'check code quality',
            'review',
            'inspect',
          ],
          creation: [
            'create',
            'add',
            'implement',
            'build',
            'generate',
            'make',
          ],
          debugging: [
            'fix',
            'debug',
            'resolve',
            'optimize',
            'troubleshoot',
          ],
        },
        autopilotSettings: {
          enabled: true,
          autonomyLevel: 'medium',
          confirmationThreshold: 0.8,
          riskTolerance: 'medium',
        },
        voiceSettings: {
          recognitionSensitivity: 0.8,
          responseSpeed: 'normal',
          language: 'en-US',
          communicationStyle: 'professional',
        },
      },
    });
  });

  return router;
} 