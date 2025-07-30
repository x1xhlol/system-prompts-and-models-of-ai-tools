import { exec } from 'child_process';
import { promisify } from 'util';
import { readFile, writeFile, readdir, stat, mkdir } from 'fs/promises';
import { join, dirname, extname } from 'path';
import { Logger } from '../utils/logger';

const execAsync = promisify(exec);

export interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
  duration: number;
  metadata?: {
    tool: string;
    operation: string;
    timestamp: Date;
  };
}

export interface FileOperation {
  type: 'read' | 'write' | 'delete' | 'list' | 'search';
  path: string;
  content?: string;
  options?: any;
}

export interface TerminalCommand {
  command: string;
  cwd?: string;
  timeout?: number;
}

export interface WebSearchQuery {
  query: string;
  maxResults?: number;
  filters?: any;
}

export class ToolExecutor {
  private logger: Logger;

  constructor() {
    this.logger = new Logger('ToolExecutor');
  }

  async executeFileOperation(operation: FileOperation): Promise<ToolResult> {
    const startTime = Date.now();
    
    try {
      switch (operation.type) {
        case 'read':
          return await this.readFile(operation.path);
        case 'write':
          return await this.writeFile(operation.path, operation.content || '');
        case 'list':
          return await this.listDirectory(operation.path);
        case 'search':
          return await this.searchFiles(operation.path, operation.options);
        default:
          throw new Error(`Unsupported file operation: ${operation.type}`);
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error('File operation failed', { operation, error: error.message });
      return {
        success: false,
        error: error.message,
        duration,
        metadata: {
          tool: 'file_operation',
          operation: operation.type,
          timestamp: new Date()
        }
      };
    }
  }

  private async readFile(path: string): Promise<ToolResult> {
    const startTime = Date.now();
    
    try {
      const content = await readFile(path, 'utf-8');
      const stats = await stat(path);
      
      const duration = Date.now() - startTime;
      this.logger.toolExecution('read_file', { path, size: stats.size }, duration);
      
      return {
        success: true,
        data: {
          content,
          metadata: {
            size: stats.size,
            modified: stats.mtime,
            created: stats.birthtime
          }
        },
        duration,
        metadata: {
          tool: 'file_operation',
          operation: 'read',
          timestamp: new Date()
        }
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        success: false,
        error: error.message,
        duration,
        metadata: {
          tool: 'file_operation',
          operation: 'read',
          timestamp: new Date()
        }
      };
    }
  }

  private async writeFile(path: string, content: string): Promise<ToolResult> {
    const startTime = Date.now();
    
    try {
      // Ensure directory exists
      await mkdir(dirname(path), { recursive: true });
      
      await writeFile(path, content, 'utf-8');
      const stats = await stat(path);
      
      const duration = Date.now() - startTime;
      this.logger.toolExecution('write_file', { path, size: stats.size }, duration);
      
      return {
        success: true,
        data: {
          path,
          size: stats.size,
          modified: stats.mtime
        },
        duration,
        metadata: {
          tool: 'file_operation',
          operation: 'write',
          timestamp: new Date()
        }
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        success: false,
        error: error.message,
        duration,
        metadata: {
          tool: 'file_operation',
          operation: 'write',
          timestamp: new Date()
        }
      };
    }
  }

  private async listDirectory(path: string): Promise<ToolResult> {
    const startTime = Date.now();
    
    try {
      const items = await readdir(path, { withFileTypes: true });
      const files = items
        .filter(item => item.isFile())
        .map(item => ({
          name: item.name,
          type: 'file',
          extension: extname(item.name)
        }));
      
      const directories = items
        .filter(item => item.isDirectory())
        .map(item => ({
          name: item.name,
          type: 'directory'
        }));
      
      const duration = Date.now() - startTime;
      this.logger.toolExecution('list_directory', { path, count: items.length }, duration);
      
      return {
        success: true,
        data: {
          path,
          files,
          directories,
          total: items.length
        },
        duration,
        metadata: {
          tool: 'file_operation',
          operation: 'list',
          timestamp: new Date()
        }
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        success: false,
        error: error.message,
        duration,
        metadata: {
          tool: 'file_operation',
          operation: 'list',
          timestamp: new Date()
        }
      };
    }
  }

  private async searchFiles(directory: string, options: any = {}): Promise<ToolResult> {
    const startTime = Date.now();
    
    try {
      const { pattern, extensions, maxDepth = 3 } = options;
      const results: any[] = [];
      
      await this.searchRecursive(directory, pattern, extensions, maxDepth, 0, results);
      
      const duration = Date.now() - startTime;
      this.logger.toolExecution('search_files', { directory, pattern, count: results.length }, duration);
      
      return {
        success: true,
        data: {
          directory,
          pattern,
          results,
          count: results.length
        },
        duration,
        metadata: {
          tool: 'file_operation',
          operation: 'search',
          timestamp: new Date()
        }
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        success: false,
        error: error.message,
        duration,
        metadata: {
          tool: 'file_operation',
          operation: 'search',
          timestamp: new Date()
        }
      };
    }
  }

  private async searchRecursive(
    dir: string, 
    pattern: string, 
    extensions: string[], 
    maxDepth: number, 
    currentDepth: number, 
    results: any[]
  ): Promise<void> {
    if (currentDepth > maxDepth) return;
    
    try {
      const items = await readdir(dir, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = join(dir, item.name);
        
        if (item.isDirectory()) {
          await this.searchRecursive(fullPath, pattern, extensions, maxDepth, currentDepth + 1, results);
        } else if (item.isFile()) {
          const matchesPattern = !pattern || item.name.toLowerCase().includes(pattern.toLowerCase());
          const matchesExtension = !extensions || extensions.length === 0 || 
            extensions.some(ext => item.name.toLowerCase().endsWith(ext.toLowerCase()));
          
          if (matchesPattern && matchesExtension) {
            const stats = await stat(fullPath);
            results.push({
              name: item.name,
              path: fullPath,
              size: stats.size,
              modified: stats.mtime,
              extension: extname(item.name)
            });
          }
        }
      }
    } catch (error) {
      // Skip directories we can't access
      this.logger.debug('Skipping directory', { dir, error: error.message });
    }
  }

  async executeTerminalCommand(command: TerminalCommand): Promise<ToolResult> {
    const startTime = Date.now();
    
    try {
      const { stdout, stderr } = await execAsync(command.command, {
        cwd: command.cwd,
        timeout: command.timeout || 30000 // 30 second default timeout
      });
      
      const duration = Date.now() - startTime;
      this.logger.toolExecution('terminal_command', { command: command.command }, duration);
      
      return {
        success: true,
        data: {
          stdout,
          stderr,
          command: command.command,
          cwd: command.cwd
        },
        duration,
        metadata: {
          tool: 'terminal',
          operation: 'execute',
          timestamp: new Date()
        }
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      this.logger.error('Terminal command failed', { command: command.command, error: error.message });
      
      return {
        success: false,
        error: error.message,
        data: {
          stdout: error.stdout || '',
          stderr: error.stderr || '',
          command: command.command,
          cwd: command.cwd
        },
        duration,
        metadata: {
          tool: 'terminal',
          operation: 'execute',
          timestamp: new Date()
        }
      };
    }
  }

  async executeWebSearch(query: WebSearchQuery): Promise<ToolResult> {
    const startTime = Date.now();
    
    try {
      // This is a placeholder for web search functionality
      // In a real implementation, you would integrate with search APIs
      const mockResults = [
        {
          title: `Search results for: ${query.query}`,
          url: 'https://example.com',
          snippet: `This is a mock search result for "${query.query}". In a real implementation, this would be actual search results.`
        }
      ];
      
      const duration = Date.now() - startTime;
      this.logger.toolExecution('web_search', { query: query.query, results: mockResults.length }, duration);
      
      return {
        success: true,
        data: {
          query: query.query,
          results: mockResults,
          count: mockResults.length
        },
        duration,
        metadata: {
          tool: 'web_search',
          operation: 'search',
          timestamp: new Date()
        }
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        success: false,
        error: error.message,
        duration,
        metadata: {
          tool: 'web_search',
          operation: 'search',
          timestamp: new Date()
        }
      };
    }
  }

  async analyzeCode(filePath: string): Promise<ToolResult> {
    const startTime = Date.now();
    
    try {
      const content = await readFile(filePath, 'utf-8');
      const extension = extname(filePath).toLowerCase();
      
      // Basic code analysis
      const analysis = {
        language: this.detectLanguage(extension),
        lines: content.split('\n').length,
        characters: content.length,
        functions: this.countFunctions(content, extension),
        imports: this.extractImports(content, extension),
        complexity: this.calculateComplexity(content)
      };
      
      const duration = Date.now() - startTime;
      this.logger.toolExecution('code_analysis', { filePath, language: analysis.language }, duration);
      
      return {
        success: true,
        data: {
          filePath,
          analysis
        },
        duration,
        metadata: {
          tool: 'code_analysis',
          operation: 'analyze',
          timestamp: new Date()
        }
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        success: false,
        error: error.message,
        duration,
        metadata: {
          tool: 'code_analysis',
          operation: 'analyze',
          timestamp: new Date()
        }
      };
    }
  }

  private detectLanguage(extension: string): string {
    const languageMap: { [key: string]: string } = {
      '.js': 'JavaScript',
      '.ts': 'TypeScript',
      '.py': 'Python',
      '.java': 'Java',
      '.cpp': 'C++',
      '.c': 'C',
      '.cs': 'C#',
      '.php': 'PHP',
      '.rb': 'Ruby',
      '.go': 'Go',
      '.rs': 'Rust',
      '.swift': 'Swift',
      '.kt': 'Kotlin',
      '.scala': 'Scala',
      '.html': 'HTML',
      '.css': 'CSS',
      '.json': 'JSON',
      '.xml': 'XML',
      '.md': 'Markdown'
    };
    
    return languageMap[extension] || 'Unknown';
  }

  private countFunctions(content: string, extension: string): number {
    const patterns: { [key: string]: RegExp[] } = {
      '.js': [/function\s+\w+\s*\(/g, /const\s+\w+\s*=\s*\(/g, /let\s+\w+\s*=\s*\(/g, /var\s+\w+\s*=\s*\(/g],
      '.ts': [/function\s+\w+\s*\(/g, /const\s+\w+\s*=\s*\(/g, /let\s+\w+\s*=\s*\(/g, /var\s+\w+\s*=\s*\(/g],
      '.py': [/def\s+\w+\s*\(/g],
      '.java': [/public\s+\w+\s+\w+\s*\(/g, /private\s+\w+\s+\w+\s*\(/g, /protected\s+\w+\s+\w+\s*\(/g],
      '.cpp': [/void\s+\w+\s*\(/g, /int\s+\w+\s*\(/g, /string\s+\w+\s*\(/g],
      '.cs': [/public\s+\w+\s+\w+\s*\(/g, /private\s+\w+\s+\w+\s*\(/g, /protected\s+\w+\s+\w+\s*\(/g]
    };
    
    const patternsForLang = patterns[extension] || [];
    let count = 0;
    
    patternsForLang.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) count += matches.length;
    });
    
    return count;
  }

  private extractImports(content: string, extension: string): string[] {
    const patterns: { [key: string]: RegExp } = {
      '.js': /import\s+.*?from\s+['"]([^'"]+)['"]/g,
      '.ts': /import\s+.*?from\s+['"]([^'"]+)['"]/g,
      '.py': /import\s+([a-zA-Z_][a-zA-Z0-9_]*)/g,
      '.java': /import\s+([a-zA-Z_][a-zA-Z0-9_.]*);/g,
      '.cpp': /#include\s+[<"]([^>"]+)[>"]/g,
      '.cs': /using\s+([a-zA-Z_][a-zA-Z0-9_.]*);/g
    };
    
    const pattern = patterns[extension];
    if (!pattern) return [];
    
    const imports: string[] = [];
    let match;
    
    while ((match = pattern.exec(content)) !== null) {
      imports.push(match[1]);
    }
    
    return imports;
  }

  private calculateComplexity(content: string): number {
    // Simple cyclomatic complexity calculation
    const complexityFactors = [
      /if\s*\(/g,
      /else\s*if\s*\(/g,
      /for\s*\(/g,
      /while\s*\(/g,
      /switch\s*\(/g,
      /case\s+/g,
      /catch\s*\(/g,
      /\|\|/g,
      /&&/g
    ];
    
    let complexity = 1; // Base complexity
    
    complexityFactors.forEach(factor => {
      const matches = content.match(factor);
      if (matches) complexity += matches.length;
    });
    
    return complexity;
  }

  async executeTool(toolName: string, params: any): Promise<ToolResult> {
    const startTime = Date.now();
    
    try {
      switch (toolName) {
        case 'file_operation':
          return await this.executeFileOperation(params);
        case 'terminal_command':
          return await this.executeTerminalCommand(params);
        case 'web_search':
          return await this.executeWebSearch(params);
        case 'code_analysis':
          return await this.analyzeCode(params.filePath);
        default:
          throw new Error(`Unknown tool: ${toolName}`);
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error('Tool execution failed', { toolName, params, error: error.message });
      return {
        success: false,
        error: error.message,
        duration,
        metadata: {
          tool: toolName,
          operation: 'execute',
          timestamp: new Date()
        }
      };
    }
  }
} 