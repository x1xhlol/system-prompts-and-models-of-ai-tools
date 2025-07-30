import winston from 'winston';
import { join } from 'path';

export class Logger {
  private logger: winston.Logger;

  constructor(service: string) {
    const logDir = join(__dirname, '../../logs');
    
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { service },
      transports: [
        new winston.transports.File({
          filename: join(logDir, 'error.log'),
          level: 'error',
          maxsize: 5242880, // 5MB
          maxFiles: 5
        }),
        new winston.transports.File({
          filename: join(logDir, 'combined.log'),
          maxsize: 5242880, // 5MB
          maxFiles: 5
        })
      ]
    });

    // Add console transport in development
    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
      }));
    }
  }

  info(message: string, meta?: any): void {
    this.logger.info(message, meta);
  }

  error(message: string, meta?: any): void {
    this.logger.error(message, meta);
  }

  warn(message: string, meta?: any): void {
    this.logger.warn(message, meta);
  }

  debug(message: string, meta?: any): void {
    this.logger.debug(message, meta);
  }

  // Specialized logging for agent activities
  agentAction(action: string, userId: string, details?: any): void {
    this.info(`Agent Action: ${action}`, {
      userId,
      action,
      details,
      timestamp: new Date().toISOString()
    });
  }

  commandProcessed(command: string, userId: string, response: any): void {
    this.info('Command Processed', {
      userId,
      command,
      responseLength: response.response?.length || 0,
      confidence: response.confidence,
      model: response.model,
      tokens: response.tokens
    });
  }

  voiceCommandProcessed(command: string, userId: string, confidence: number): void {
    this.info('Voice Command Processed', {
      userId,
      command,
      confidence,
      timestamp: new Date().toISOString()
    });
  }

  autopilotToggle(userId: string, enabled: boolean): void {
    this.info('Autopilot Toggle', {
      userId,
      enabled,
      timestamp: new Date().toISOString()
    });
  }

  memoryOperation(operation: string, userId: string, details?: any): void {
    this.info(`Memory Operation: ${operation}`, {
      userId,
      operation,
      details,
      timestamp: new Date().toISOString()
    });
  }

  errorWithContext(error: Error, context: string, userId?: string): void {
    this.error('Error with context', {
      error: error.message,
      stack: error.stack,
      context,
      userId,
      timestamp: new Date().toISOString()
    });
  }
} 