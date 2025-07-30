import { exec } from 'child_process';
import { promisify } from 'util';
import { readFile, writeFile, readdir, stat, mkdir } from 'fs/promises';
import { join, dirname, extname } from 'path';
import { Logger } from '../utils/logger';

const execAsync = promisify(exec);

export interface FileOperation {
  type: 'read' | 'write' | 'list' | 'search';
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

export interface ToolResult {
  success: boolean;
  result: any;
  error?: string;
  metadata?: any;
}

export class ToolExecutor {
  private logger: Logger;

  constructor() {
    this.logger = new Logger('ToolExecutor');
  }

  async executeFileOperation(operation: FileOperation): Promise<ToolResult> {
    try {
      this.logger.info('Executing file operation', { operation });

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
          return {
            success: false,
            result: null,
            error: `Unknown file operation: ${operation.type}`
          };
      }
    } catch (error) {
      this.logger.error('File operation failed', { error: error.message, operation });
      return {
        success: false,
        result: null,
        error: error.message
      };
    }
  }

  private async readFile(path: string): Promise<ToolResult> {
    try {
      const content = await readFile(path, 'utf-8');
      const stats = await stat(path);
      
      return {
        success: true,
        result: {
          content,
          size: stats.size,
          modified: stats.mtime,
          path
        },
        metadata: {
          type: 'file_read',
          path,
          size: stats.size
        }
      };
    } catch (error) {
      return {
        success: false,
        result: null,
        error: `Failed to read file: ${error.message}`
      };
    }
  }

  private async writeFile(path: string, content: string): Promise<ToolResult> {
    try {
      // Ensure directory exists
      const dir = dirname(path);
      await mkdir(dir, { recursive: true });
      
      await writeFile(path, content, 'utf-8');
      const stats = await stat(path);
      
      return {
        success: true,
        result: {
          path,
          size: stats.size,
          modified: stats.mtime
        },
        metadata: {
          type: 'file_write',
          path,
          size: stats.size
        }
      };
    } catch (error) {
      return {
        success: false,
        result: null,
        error: `Failed to write file: ${error.message}`
      };
    }
  }

  private async listDirectory(path: string): Promise<ToolResult> {
    try {
      const items = await readdir(path, { withFileTypes: true });
      const result = items.map(item => ({
        name: item.name,
        type: item.isDirectory() ? 'directory' : 'file',
        path: join(path, item.name)
      }));
      
      return {
        success: true,
        result: {
          path,
          items: result,
          count: result.length
        },
        metadata: {
          type: 'directory_list',
          path,
          count: result.length
        }
      };
    } catch (error) {
      return {
        success: false,
        result: null,
        error: `Failed to list directory: ${error.message}`
      };
    }
  }

  private async searchFiles(directory: string, options: any = {}): Promise<ToolResult> {
    try {
      const {
        pattern = '*',
        extensions = [],
        maxDepth = 3,
        includeHidden = false
      } = options;

      const results: any[] = [];
      await this.searchRecursive(directory, pattern, extensions, maxDepth, 0, results, includeHidden);
      
      return {
        success: true,
        result: {
          directory,
          pattern,
          results,
          count: results.length
        },
        metadata: {
          type: 'file_search',
          directory,
          pattern,
          count: results.length
        }
      };
    } catch (error) {
      return {
        success: false,
        result: null,
        error: `Failed to search files: ${error.message}`
      };
    }
  }

  private async searchRecursive(
    dir: string, 
    pattern: string, 
    extensions: string[], 
    maxDepth: number, 
    currentDepth: number, 
    results: any[], 
    includeHidden: boolean
  ): Promise<void> {
    if (currentDepth > maxDepth) return;

    try {
      const items = await readdir(dir, { withFileTypes: true });
      
      for (const item of items) {
        if (!includeHidden && item.name.startsWith('.')) continue;
        
        const fullPath = join(dir, item.name);
        
        if (item.isDirectory()) {
          await this.searchRecursive(fullPath, pattern, extensions, maxDepth, currentDepth + 1, results, includeHidden);
        } else if (item.isFile()) {
          const matchesPattern = pattern === '*' || item.name.includes(pattern);
          const matchesExtension = extensions.length === 0 || extensions.includes(extname(item.name));
          
          if (matchesPattern && matchesExtension) {
            const stats = await stat(fullPath);
            results.push({
              name: item.name,
              path: fullPath,
              size: stats.size,
              modified: stats.mtime,
              type: 'file'
            });
          }
        }
      }
    } catch (error) {
      // Skip directories we can't access
      this.logger.warn('Cannot access directory', { dir, error: error.message });
    }
  }

  async executeTerminalCommand(command: TerminalCommand): Promise<ToolResult> {
    try {
      this.logger.info('Executing terminal command', { command: command.command, cwd: command.cwd });

      const { stdout, stderr } = await execAsync(command.command, {
        cwd: command.cwd || process.cwd(),
        timeout: command.timeout || 30000
      });

      return {
        success: true,
        result: {
          stdout,
          stderr,
          command: command.command,
          exitCode: 0
        },
        metadata: {
          type: 'terminal_command',
          command: command.command,
          cwd: command.cwd
        }
      };
    } catch (error: any) {
      return {
        success: false,
        result: {
          stdout: error.stdout || '',
          stderr: error.stderr || '',
          command: command.command,
          exitCode: error.code || -1
        },
        error: error.message,
        metadata: {
          type: 'terminal_command_error',
          command: command.command,
          cwd: command.cwd
        }
      };
    }
  }

  async executeWebSearch(query: WebSearchQuery): Promise<ToolResult> {
    try {
      this.logger.info('Executing web search', { query: query.query });

      // Mock web search implementation
      // In production, this would integrate with search APIs
      const mockResults = [
        {
          title: `Search results for: ${query.query}`,
          url: `https://example.com/search?q=${encodeURIComponent(query.query)}`,
          snippet: `Mock search results for "${query.query}". This is a placeholder implementation.`
        }
      ];

      return {
        success: true,
        result: {
          query: query.query,
          results: mockResults,
          count: mockResults.length
        },
        metadata: {
          type: 'web_search',
          query: query.query,
          maxResults: query.maxResults
        }
      };
    } catch (error) {
      return {
        success: false,
        result: null,
        error: `Web search failed: ${error.message}`
      };
    }
  }

  async analyzeCode(filePath: string): Promise<ToolResult> {
    try {
      this.logger.info('Analyzing code file', { filePath });

      const fileContent = await readFile(filePath, 'utf-8');
      const extension = extname(filePath);
      const language = this.detectLanguage(extension);
      
      const analysis = {
        filePath,
        language,
        size: fileContent.length,
        lines: fileContent.split('\n').length,
        functions: this.countFunctions(fileContent, extension),
        imports: this.extractImports(fileContent, extension),
        complexity: this.calculateComplexity(fileContent),
        metrics: {
          characters: fileContent.length,
          words: fileContent.split(/\s+/).length,
          functions: this.countFunctions(fileContent, extension),
          imports: this.extractImports(fileContent, extension).length
        }
      };

      return {
        success: true,
        result: analysis,
        metadata: {
          type: 'code_analysis',
          filePath,
          language
        }
      };
    } catch (error) {
      return {
        success: false,
        result: null,
        error: `Code analysis failed: ${error.message}`
      };
    }
  }

  private detectLanguage(extension: string): string {
    const languageMap: Record<string, string> = {
      '.js': 'JavaScript',
      '.ts': 'TypeScript',
      '.jsx': 'React JSX',
      '.tsx': 'React TypeScript',
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
      '.scss': 'SCSS',
      '.sass': 'Sass',
      '.json': 'JSON',
      '.xml': 'XML',
      '.yaml': 'YAML',
      '.yml': 'YAML',
      '.md': 'Markdown',
      '.sql': 'SQL'
    };

    return languageMap[extension] || 'Unknown';
  }

  private countFunctions(content: string, extension: string): number {
    const patterns: Record<string, RegExp> = {
      '.js': /function\s+\w+\s*\(|const\s+\w+\s*=\s*\(|let\s+\w+\s*=\s*\(|var\s+\w+\s*=\s*\(|=>\s*{/g,
      '.ts': /function\s+\w+\s*\(|const\s+\w+\s*=\s*\(|let\s+\w+\s*=\s*\(|var\s+\w+\s*=\s*\(|=>\s*{/g,
      '.py': /def\s+\w+\s*\(/g,
      '.java': /public\s+\w+\s+\w+\s*\(|private\s+\w+\s+\w+\s*\(|protected\s+\w+\s+\w+\s*\(/g,
      '.cpp': /void\s+\w+\s*\(|int\s+\w+\s*\(|string\s+\w+\s*\(/g,
      '.cs': /public\s+\w+\s+\w+\s*\(|private\s+\w+\s+\w+\s*\(|protected\s+\w+\s+\w+\s*\(/g
    };

    const pattern = patterns[extension] || /function\s+\w+\s*\(/g;
    const matches = content.match(pattern);
    return matches ? matches.length : 0;
  }

  private extractImports(content: string, extension: string): string[] {
    const patterns: Record<string, RegExp> = {
      '.js': /import\s+.*?from\s+['"]([^'"]+)['"]/g,
      '.ts': /import\s+.*?from\s+['"]([^'"]+)['"]/g,
      '.py': /import\s+(\w+)|from\s+(\w+)\s+import/g,
      '.java': /import\s+([\w.]+);/g,
      '.cpp': /#include\s+[<"]([^>"]+)[>"]/g,
      '.cs': /using\s+([\w.]+);/g
    };

    const pattern = patterns[extension];
    if (!pattern) return [];

    const imports: string[] = [];
    let match;
    
    while ((match = pattern.exec(content)) !== null) {
      imports.push(match[1] || match[2] || match[0]);
    }

    return imports;
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
      /catch\s*\(/g,
      /\|\|/g,
      /&&/g
    ];

    let complexity = 1; // Base complexity
    
    complexityFactors.forEach(factor => {
      const matches = content.match(factor);
      if (matches) {
        complexity += matches.length;
      }
    });

    return complexity;
  }

  async executeTool(toolName: string, params: any): Promise<ToolResult> {
    try {
      this.logger.info('Executing tool', { toolName, params });

      switch (toolName) {
        case 'read_file':
          return await this.readFile(params.path);
        case 'write_file':
          return await this.writeFile(params.path, params.content);
        case 'list_directory':
          return await this.listDirectory(params.path);
        case 'search_files':
          return await this.searchFiles(params.directory, params.options);
        case 'terminal_command':
          return await this.executeTerminalCommand(params);
        case 'web_search':
          return await this.executeWebSearch(params);
        case 'analyze_code':
          return await this.analyzeCode(params.filePath);
        default:
          return {
            success: false,
            result: null,
            error: `Unknown tool: ${toolName}`
          };
      }
    } catch (error) {
      this.logger.error('Tool execution failed', { error: error.message, toolName, params });
      return {
        success: false,
        result: null,
        error: `Tool execution failed: ${error.message}`
      };
    }
  }
} 