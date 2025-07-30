import { Logger } from '../utils/logger';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';

const execAsync = promisify(exec);

export interface ToolResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
  executionTime?: number;
}

export interface FileOperation {
  operation: 'read' | 'write' | 'create' | 'delete' | 'list';
  path: string;
  content?: string;
  options?: any;
}

export interface CodeAnalysis {
  file: string;
  analysis: {
    complexity: number;
    lines: number;
    functions: number;
    issues: string[];
    suggestions: string[];
  };
}

export class ToolExecutor {
  private logger: Logger;
  private allowedCommands: Set<string>;
  private safePaths: Set<string>;

  constructor() {
    this.logger = new Logger('ToolExecutor');
    this.allowedCommands = new Set([
      'ls', 'dir', 'pwd', 'echo', 'cat', 'type',
      'npm', 'yarn', 'git', 'node', 'tsc',
      'mkdir', 'rmdir', 'cp', 'copy', 'mv', 'move'
    ]);
    this.safePaths = new Set([
      process.cwd(),
      path.join(process.cwd(), 'src'),
      path.join(process.cwd(), 'frontend')
    ]);
  }

  /**
   * Execute file operations
   */
  async executeFileOperation(operation: FileOperation): Promise<ToolResult> {
    const startTime = Date.now();
    
    try {
      this.logger.info('Executing file operation', { operation: operation.operation, path: operation.path });

      switch (operation.operation) {
        case 'read':
          return await this.readFile(operation.path);
        
        case 'write':
          return await this.writeFile(operation.path, operation.content || '');
        
        case 'create':
          return await this.createFile(operation.path, operation.content || '');
        
        case 'delete':
          return await this.deleteFile(operation.path);
        
        case 'list':
          return await this.listDirectory(operation.path);
        
        default:
          throw new Error(`Unsupported file operation: ${operation.operation}`);
      }

    } catch (error) {
      this.logger.error('File operation failed', { 
        operation: operation.operation, 
        path: operation.path, 
        error: error.message 
      });
      
      return {
        success: false,
        message: `File operation failed: ${error.message}`,
        error: error.message,
        executionTime: Date.now() - startTime
      };
    }
  }

  /**
   * Execute terminal commands safely
   */
  async executeTerminalCommand(command: string): Promise<ToolResult> {
    const startTime = Date.now();
    
    try {
      this.logger.info('Executing terminal command', { command });

      // Validate command safety
      if (!this.isCommandSafe(command)) {
        throw new Error('Command not allowed for security reasons');
      }

      const { stdout, stderr } = await execAsync(command, {
        cwd: process.cwd(),
        timeout: 30000 // 30 second timeout
      });

      return {
        success: true,
        message: 'Command executed successfully',
        data: {
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          command
        },
        executionTime: Date.now() - startTime
      };

    } catch (error) {
      this.logger.error('Terminal command failed', { command, error: error.message });
      
      return {
        success: false,
        message: `Command execution failed: ${error.message}`,
        error: error.message,
        executionTime: Date.now() - startTime
      };
    }
  }

  /**
   * Analyze code files
   */
  async analyzeCode(filePath: string): Promise<ToolResult> {
    const startTime = Date.now();
    
    try {
      this.logger.info('Analyzing code file', { filePath });

      const content = await fs.readFile(filePath, 'utf-8');
      const analysis = this.performCodeAnalysis(content, filePath);

      return {
        success: true,
        message: 'Code analysis completed',
        data: {
          file: filePath,
          analysis
        },
        executionTime: Date.now() - startTime
      };

    } catch (error) {
      this.logger.error('Code analysis failed', { filePath, error: error.message });
      
      return {
        success: false,
        message: `Code analysis failed: ${error.message}`,
        error: error.message,
        executionTime: Date.now() - startTime
      };
    }
  }

  /**
   * Search the web for information
   */
  async searchWeb(query: string): Promise<ToolResult> {
    const startTime = Date.now();
    
    try {
      this.logger.info('Performing web search', { query });

      // Mock web search - in real implementation would use a search API
      const mockResults = [
        {
          title: `Search results for: ${query}`,
          url: `https://example.com/search?q=${encodeURIComponent(query)}`,
          snippet: `Information about ${query} from various sources.`
        }
      ];

      return {
        success: true,
        message: 'Web search completed',
        data: {
          query,
          results: mockResults
        },
        executionTime: Date.now() - startTime
      };

    } catch (error) {
      this.logger.error('Web search failed', { query, error: error.message });
      
      return {
        success: false,
        message: `Web search failed: ${error.message}`,
        error: error.message,
        executionTime: Date.now() - startTime
      };
    }
  }

  /**
   * Get tool execution status
   */
  async getStatus(): Promise<any> {
    return {
      allowedCommands: Array.from(this.allowedCommands),
      safePaths: Array.from(this.safePaths),
      lastUpdated: new Date().toISOString()
    };
  }

  // Private helper methods

  private async readFile(filePath: string): Promise<ToolResult> {
    const content = await fs.readFile(filePath, 'utf-8');
    return {
      success: true,
      message: 'File read successfully',
      data: { content, path: filePath }
    };
  }

  private async writeFile(filePath: string, content: string): Promise<ToolResult> {
    await fs.writeFile(filePath, content, 'utf-8');
    return {
      success: true,
      message: 'File written successfully',
      data: { path: filePath, size: content.length }
    };
  }

  private async createFile(filePath: string, content: string): Promise<ToolResult> {
    // Ensure directory exists
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    
    await fs.writeFile(filePath, content, 'utf-8');
    return {
      success: true,
      message: 'File created successfully',
      data: { path: filePath, size: content.length }
    };
  }

  private async deleteFile(filePath: string): Promise<ToolResult> {
    await fs.unlink(filePath);
    return {
      success: true,
      message: 'File deleted successfully',
      data: { path: filePath }
    };
  }

  private async listDirectory(dirPath: string): Promise<ToolResult> {
    const items = await fs.readdir(dirPath, { withFileTypes: true });
    const files = items
      .filter(item => item.isFile())
      .map(item => ({ name: item.name, type: 'file' }));
    
    const directories = items
      .filter(item => item.isDirectory())
      .map(item => ({ name: item.name, type: 'directory' }));

    return {
      success: true,
      message: 'Directory listed successfully',
      data: { 
        path: dirPath, 
        files, 
        directories,
        totalItems: items.length 
      }
    };
  }

  private isCommandSafe(command: string): boolean {
    const parts = command.split(' ');
    const baseCommand = parts[0].toLowerCase();
    
    // Check if command is in allowed list
    if (!this.allowedCommands.has(baseCommand)) {
      return false;
    }

    // Additional safety checks
    const dangerousPatterns = [
      'rm -rf',
      'del /s',
      'format',
      'shutdown',
      'reboot'
    ];

    const commandLower = command.toLowerCase();
    for (const pattern of dangerousPatterns) {
      if (commandLower.includes(pattern)) {
        return false;
      }
    }

    return true;
  }

  private performCodeAnalysis(content: string, filePath: string): CodeAnalysis['analysis'] {
    const lines = content.split('\n');
    const functions = (content.match(/function\s+\w+/g) || []).length;
    const complexity = this.calculateComplexity(content);
    
    const issues: string[] = [];
    const suggestions: string[] = [];

    // Basic code analysis
    if (lines.length > 500) {
      issues.push('File is very long, consider breaking it into smaller modules');
    }

    if (complexity > 10) {
      issues.push('High cyclomatic complexity detected');
      suggestions.push('Consider refactoring complex functions');
    }

    if (functions > 20) {
      issues.push('Many functions in single file');
      suggestions.push('Consider splitting into multiple files');
    }

    return {
      complexity,
      lines: lines.length,
      functions,
      issues,
      suggestions
    };
  }

  private calculateComplexity(content: string): number {
    // Simple cyclomatic complexity calculation
    const complexityFactors = [
      /if\s*\(/g,
      /else\s*{/g,
      /for\s*\(/g,
      /while\s*\(/g,
      /switch\s*\(/g,
      /case\s+/g,
      /\|\|/g,
      /&&/g
    ];

    let complexity = 1; // Base complexity
    for (const factor of complexityFactors) {
      const matches = content.match(factor);
      if (matches) {
        complexity += matches.length;
      }
    }

    return complexity;
  }
} 