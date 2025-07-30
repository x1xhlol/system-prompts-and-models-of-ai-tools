import winston from 'winston';

export class Logger {
  private logger: winston.Logger;

  constructor(service: string) {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { service },
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          ),
        }),
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
        }),
        new winston.transports.File({
          filename: 'logs/combined.log',
        }),
      ],
    });

    // Create logs directory if it doesn't exist
    const fs = require('fs');
    const path = require('path');
    const logsDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
  }

  info(message: string, meta?: any) {
    this.logger.info(message, meta);
  }

  warn(message: string, meta?: any) {
    this.logger.warn(message, meta);
  }

  error(message: string, meta?: any) {
    this.logger.error(message, meta);
  }

  debug(message: string, meta?: any) {
    this.logger.debug(message, meta);
  }

  verbose(message: string, meta?: any) {
    this.logger.verbose(message, meta);
  }

  // Specialized logging methods for Nowhere
  command(command: string, context: any) {
    this.info('Command processed', { command, context });
  }

  voiceCommand(voiceInput: string, processedCommand: string, confidence: number) {
    this.info('Voice command processed', {
      voiceInput,
      processedCommand,
      confidence,
    });
  }

  autopilotAction(action: string, context: any) {
    this.info('Autopilot action executed', { action, context });
  }

  memoryOperation(operation: string, context: any) {
    this.debug('Memory operation', { operation, context });
  }

  toolExecution(tool: string, result: any, duration: number) {
    this.info('Tool executed', { tool, result, duration });
  }

  aiResponse(model: string, response: string, confidence: number) {
    this.debug('AI response generated', { model, response, confidence });
  }
} 