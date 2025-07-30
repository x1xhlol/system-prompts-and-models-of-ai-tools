import { Router, Request, Response } from 'express';
import { NowhereCore, CommandRequest, AIResponse } from '../core/nowhere';
import { Logger } from '../utils/logger';

const router = Router();
const nowhere = new NowhereCore();
const logger = new Logger('Routes');

/**
 * Process text commands
 */
router.post('/command', async (req: Request, res: Response) => {
  try {
    const { command, userId, context, autopilot } = req.body;

    if (!command) {
      return res.status(400).json({
        success: false,
        message: 'Command is required'
      });
    }

    logger.info('Processing command request', { 
      command: command.substring(0, 100), 
      userId, 
      autopilot 
    });

    const request: CommandRequest = {
      command,
      userId: userId || 'default',
      context,
      autopilot: autopilot || false
    };

    const response: AIResponse = await nowhere.processCommand(request);

    res.json(response);

  } catch (error) {
    logger.error('Command processing error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * Process voice commands
 */
router.post('/voice', async (req: Request, res: Response) => {
  try {
    const { audioData, userId, context } = req.body;

    if (!audioData) {
      return res.status(400).json({
        success: false,
        message: 'Audio data is required'
      });
    }

    logger.info('Processing voice request', { 
      audioSize: audioData.length, 
      userId 
    });

    // Convert base64 audio data to buffer
    const audioBuffer = Buffer.from(audioData, 'base64');

    // Process voice input
    const voiceCommand = await nowhere['voice'].processVoiceInput(audioBuffer);
    
    // Process the voice command
    const request: CommandRequest = {
      command: voiceCommand.text,
      userId: userId || 'default',
      context,
      voice: true
    };

    const response: AIResponse = await nowhere.processCommand(request);

    // Generate voice response if needed
    if (response.success && req.body.generateVoice) {
      const voiceResponse = await nowhere['voice'].generateVoiceResponse({
        text: response.message,
        mode: 'brief'
      });
      
      response.data = {
        ...response.data,
        voiceResponse: voiceResponse.toString('base64')
      };
    }

    res.json(response);

  } catch (error) {
    logger.error('Voice processing error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Voice processing failed',
      error: error.message
    });
  }
});

/**
 * Toggle autopilot mode
 */
router.post('/autopilot', async (req: Request, res: Response) => {
  try {
    const { enabled, userId } = req.body;

    logger.info('Toggling autopilot mode', { enabled, userId });

    const response = await nowhere.toggleAutopilot(enabled);

    res.json(response);

  } catch (error) {
    logger.error('Autopilot toggle error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to toggle autopilot mode',
      error: error.message
    });
  }
});

/**
 * Get user memory
 */
router.get('/memory/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { query } = req.query;

    logger.info('Getting user memory', { userId, query });

    if (query) {
      // Query specific memory
      const memoryEntries = await nowhere['memory'].queryMemory(query as string);
      res.json({
        success: true,
        data: memoryEntries
      });
    } else {
      // Get user context
      const userContext = await nowhere['memory'].getUserContext(userId);
      res.json({
        success: true,
        data: userContext
      });
    }

  } catch (error) {
    logger.error('Memory retrieval error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve memory',
      error: error.message
    });
  }
});

/**
 * Clear user memory
 */
router.delete('/memory/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    logger.info('Clearing user memory', { userId });

    await nowhere['memory'].clearUserMemory(userId);

    res.json({
      success: true,
      message: 'User memory cleared successfully'
    });

  } catch (error) {
    logger.error('Memory clearing error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to clear memory',
      error: error.message
    });
  }
});

/**
 * Get system status
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    logger.info('Getting system status');

    const status = await nowhere.getStatus();

    res.json({
      success: true,
      data: status
    });

  } catch (error) {
    logger.error('Status retrieval error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to get system status',
      error: error.message
    });
  }
});

/**
 * Execute tools directly
 */
router.post('/tools/execute', async (req: Request, res: Response) => {
  try {
    const { operation, params, userId } = req.body;

    if (!operation) {
      return res.status(400).json({
        success: false,
        message: 'Operation is required'
      });
    }

    logger.info('Executing tool', { operation, userId });

    let result;
    switch (operation) {
      case 'file_operation':
        result = await nowhere['tools'].executeFileOperation(params);
        break;
      
      case 'terminal_command':
        result = await nowhere['tools'].executeTerminalCommand(params.command);
        break;
      
      case 'code_analysis':
        result = await nowhere['tools'].analyzeCode(params.file);
        break;
      
      case 'web_search':
        result = await nowhere['tools'].searchWeb(params.query);
        break;
      
      default:
        return res.status(400).json({
          success: false,
          message: `Unknown operation: ${operation}`
        });
    }

    res.json(result);

  } catch (error) {
    logger.error('Tool execution error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Tool execution failed',
      error: error.message
    });
  }
});

/**
 * Voice settings management
 */
router.put('/voice/settings', async (req: Request, res: Response) => {
  try {
    const { settings } = req.body;

    logger.info('Updating voice settings', { settings });

    await nowhere['voice'].updateSettings(settings);

    res.json({
      success: true,
      message: 'Voice settings updated successfully'
    });

  } catch (error) {
    logger.error('Voice settings update error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to update voice settings',
      error: error.message
    });
  }
});

/**
 * Start voice listening
 */
router.post('/voice/listen', async (req: Request, res: Response) => {
  try {
    logger.info('Starting voice listening');

    await nowhere['voice'].startListening();

    res.json({
      success: true,
      message: 'Voice listening started'
    });

  } catch (error) {
    logger.error('Voice listening start error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to start voice listening',
      error: error.message
    });
  }
});

/**
 * Stop voice listening
 */
router.post('/voice/stop', async (req: Request, res: Response) => {
  try {
    logger.info('Stopping voice listening');

    await nowhere['voice'].stopListening();

    res.json({
      success: true,
      message: 'Voice listening stopped'
    });

  } catch (error) {
    logger.error('Voice listening stop error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to stop voice listening',
      error: error.message
    });
  }
});

export function setupRoutes(app: any) {
  app.use('/api/v1', router);
} 