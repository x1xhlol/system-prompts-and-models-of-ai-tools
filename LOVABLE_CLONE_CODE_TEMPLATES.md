# 🎯 Lovable Clone - Complete Code Templates

> Production-ready code templates để build Lovable Clone nhanh chóng

---

## 📁 Project Structure

```
lovable-clone/
├── apps/
│   ├── web/                    # Next.js Frontend
│   └── api/                    # Backend API
├── packages/
│   ├── agent/                  # AI Agent Logic
│   ├── database/               # Database Schema
│   ├── ui/                     # Shared UI Components
│   └── config/                 # Shared Configs
└── templates/                  # Project Templates
```

---

# 🤖 I. AI AGENT LAYER

## 1. Agent System Core

**File: `packages/agent/src/index.ts`**

```typescript
import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';
import { HumanMessage, SystemMessage, AIMessage } from '@langchain/core/messages';

export interface AgentConfig {
  provider: 'openai' | 'anthropic';
  model: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AgentContext {
  projectId: string;
  fileTree: FileTree;
  designSystem: DesignSystem;
  conversationHistory: Message[];
  userPreferences?: UserPreferences;
}

export class LovableAgent {
  private llm: ChatOpenAI | ChatAnthropic;
  private systemPrompt: string;
  private tools: AgentTool[];

  constructor(config: AgentConfig, systemPrompt: string) {
    if (config.provider === 'openai') {
      this.llm = new ChatOpenAI({
        modelName: config.model,
        temperature: config.temperature ?? 0.7,
        maxTokens: config.maxTokens ?? 4000,
        openAIApiKey: process.env.OPENAI_API_KEY
      });
    } else {
      this.llm = new ChatAnthropic({
        modelName: config.model,
        temperature: config.temperature ?? 0.7,
        maxTokens: config.maxTokens ?? 4000,
        anthropicApiKey: process.env.ANTHROPIC_API_KEY
      });
    }

    this.systemPrompt = systemPrompt;
    this.tools = [];
  }

  registerTool(tool: AgentTool): void {
    this.tools.push(tool);
  }

  async chat(
    message: string,
    context: AgentContext,
    options?: {
      stream?: boolean;
      onToken?: (token: string) => void;
    }
  ): Promise<AgentResponse> {
    // Build messages
    const messages = [
      new SystemMessage(this.buildSystemPrompt(context)),
      ...this.buildConversationHistory(context.conversationHistory),
      new HumanMessage(message)
    ];

    if (options?.stream) {
      return await this.streamResponse(messages, context, options.onToken);
    } else {
      return await this.generateResponse(messages, context);
    }
  }

  private async generateResponse(
    messages: any[],
    context: AgentContext
  ): Promise<AgentResponse> {
    const response = await this.llm.invoke(messages);

    // Check if response contains tool calls
    const toolCalls = this.parseToolCalls(response.content as string);

    if (toolCalls.length > 0) {
      // Execute tools
      const toolResults = await this.executeTools(toolCalls, context);

      return {
        content: response.content as string,
        toolCalls,
        toolResults,
        finishReason: 'tool_calls'
      };
    }

    return {
      content: response.content as string,
      finishReason: 'stop'
    };
  }

  private async streamResponse(
    messages: any[],
    context: AgentContext,
    onToken?: (token: string) => void
  ): Promise<AgentResponse> {
    let fullContent = '';

    const stream = await this.llm.stream(messages);

    for await (const chunk of stream) {
      const token = chunk.content as string;
      fullContent += token;

      if (onToken) {
        onToken(token);
      }
    }

    // Check for tool calls in completed response
    const toolCalls = this.parseToolCalls(fullContent);

    if (toolCalls.length > 0) {
      const toolResults = await this.executeTools(toolCalls, context);

      return {
        content: fullContent,
        toolCalls,
        toolResults,
        finishReason: 'tool_calls'
      };
    }

    return {
      content: fullContent,
      finishReason: 'stop'
    };
  }

  private buildSystemPrompt(context: AgentContext): string {
    return `${this.systemPrompt}

## Current Context

Project ID: ${context.projectId}

File Tree:
\`\`\`json
${JSON.stringify(context.fileTree, null, 2)}
\`\`\`

Design System:
\`\`\`json
${JSON.stringify(context.designSystem, null, 2)}
\`\`\`

Available Tools:
${this.tools.map(t => `- ${t.name}: ${t.description}`).join('\n')}
`;
  }

  private buildConversationHistory(history: Message[]): any[] {
    return history.map(msg => {
      if (msg.role === 'user') {
        return new HumanMessage(msg.content);
      } else if (msg.role === 'assistant') {
        return new AIMessage(msg.content);
      } else {
        return new SystemMessage(msg.content);
      }
    });
  }

  private parseToolCalls(content: string): ToolCall[] {
    // Parse XML-like tool call syntax
    // Example: <tool_call name="lov-write" file_path="src/App.tsx">...</tool_call>
    const toolCallRegex = /<tool_call\s+name="([^"]+)"([^>]*)>([\s\S]*?)<\/tool_call>/g;
    const toolCalls: ToolCall[] = [];

    let match;
    while ((match = toolCallRegex.exec(content)) !== null) {
      const [, name, paramsStr, callContent] = match;

      // Parse parameters
      const params: Record<string, any> = {};
      const paramRegex = /(\w+)="([^"]*)"/g;
      let paramMatch;
      while ((paramMatch = paramRegex.exec(paramsStr)) !== null) {
        params[paramMatch[1]] = paramMatch[2];
      }

      // If there's content, add it as 'content' param
      if (callContent.trim()) {
        params.content = callContent.trim();
      }

      toolCalls.push({ name, parameters: params });
    }

    return toolCalls;
  }

  private async executeTools(
    toolCalls: ToolCall[],
    context: AgentContext
  ): Promise<ToolResult[]> {
    const results: ToolResult[] = [];

    for (const call of toolCalls) {
      const tool = this.tools.find(t => t.name === call.name);

      if (!tool) {
        results.push({
          toolName: call.name,
          success: false,
          error: `Tool '${call.name}' not found`
        });
        continue;
      }

      try {
        const result = await tool.execute(call.parameters, context);
        results.push({
          toolName: call.name,
          success: true,
          result
        });
      } catch (error) {
        results.push({
          toolName: call.name,
          success: false,
          error: (error as Error).message
        });
      }
    }

    return results;
  }
}

// Types
export interface AgentResponse {
  content: string;
  toolCalls?: ToolCall[];
  toolResults?: ToolResult[];
  finishReason: 'stop' | 'tool_calls' | 'length';
}

export interface ToolCall {
  name: string;
  parameters: Record<string, any>;
}

export interface ToolResult {
  toolName: string;
  success: boolean;
  result?: any;
  error?: string;
}

export interface AgentTool {
  name: string;
  description: string;
  parameters: Record<string, any>;
  execute: (params: Record<string, any>, context: AgentContext) => Promise<any>;
}
```

---

## 2. Agent Tools Implementation

**File: `packages/agent/src/tools/index.ts`**

```typescript
import { AgentTool, AgentContext } from '../index';
import * as fs from 'fs/promises';
import * as path from 'path';

// Tool: Write File
export const writeFileTool: AgentTool = {
  name: 'lov-write',
  description: 'Write or create a file in the project',
  parameters: {
    file_path: 'string',
    content: 'string'
  },
  execute: async (params, context) => {
    const { file_path, content } = params;
    const fullPath = path.join(
      process.env.PROJECTS_DIR!,
      context.projectId,
      file_path
    );

    // Ensure directory exists
    await fs.mkdir(path.dirname(fullPath), { recursive: true });

    // Write file
    await fs.writeFile(fullPath, content, 'utf-8');

    return {
      success: true,
      filePath: file_path,
      size: Buffer.byteLength(content)
    };
  }
};

// Tool: Read File
export const readFileTool: AgentTool = {
  name: 'lov-view',
  description: 'Read contents of a file',
  parameters: {
    file_path: 'string',
    lines: 'string (optional, e.g., "1-100")'
  },
  execute: async (params, context) => {
    const { file_path, lines } = params;
    const fullPath = path.join(
      process.env.PROJECTS_DIR!,
      context.projectId,
      file_path
    );

    const content = await fs.readFile(fullPath, 'utf-8');

    if (lines) {
      const [start, end] = lines.split('-').map(Number);
      const allLines = content.split('\n');
      const selectedLines = allLines.slice(start - 1, end);

      return {
        filePath: file_path,
        content: selectedLines.join('\n'),
        lineRange: { start, end },
        totalLines: allLines.length
      };
    }

    return {
      filePath: file_path,
      content,
      totalLines: content.split('\n').length
    };
  }
};

// Tool: Line Replace
export const lineReplaceTool: AgentTool = {
  name: 'lov-line-replace',
  description: 'Replace specific lines in a file',
  parameters: {
    file_path: 'string',
    search: 'string',
    replace: 'string',
    first_replaced_line: 'number',
    last_replaced_line: 'number'
  },
  execute: async (params, context) => {
    const {
      file_path,
      search,
      replace,
      first_replaced_line,
      last_replaced_line
    } = params;

    const fullPath = path.join(
      process.env.PROJECTS_DIR!,
      context.projectId,
      file_path
    );

    // Read file
    const content = await fs.readFile(fullPath, 'utf-8');
    const lines = content.split('\n');

    // Validate line range
    const targetContent = lines
      .slice(first_replaced_line - 1, last_replaced_line)
      .join('\n');

    // Handle ellipsis in search
    const searchPattern = search.replace(/\.\.\./g, '[\\s\\S]*?');
    const regex = new RegExp(searchPattern);

    if (!regex.test(targetContent)) {
      throw new Error(
        `Search content not found at lines ${first_replaced_line}-${last_replaced_line}`
      );
    }

    // Replace
    const replaced = targetContent.replace(regex, replace);
    const newLines = [
      ...lines.slice(0, first_replaced_line - 1),
      ...replaced.split('\n'),
      ...lines.slice(last_replaced_line)
    ];

    // Write back
    await fs.writeFile(fullPath, newLines.join('\n'), 'utf-8');

    return {
      success: true,
      filePath: file_path,
      linesReplaced: last_replaced_line - first_replaced_line + 1
    };
  }
};

// Tool: Search Files
export const searchFilesTool: AgentTool = {
  name: 'lov-search-files',
  description: 'Search for code patterns in project files',
  parameters: {
    query: 'string (regex pattern)',
    include_pattern: 'string (glob pattern)',
    exclude_pattern: 'string (optional)',
    case_sensitive: 'boolean (optional)'
  },
  execute: async (params, context) => {
    const { query, include_pattern, exclude_pattern, case_sensitive } = params;

    // Use ripgrep or similar
    const { execSync } = require('child_process');
    const projectPath = path.join(process.env.PROJECTS_DIR!, context.projectId);

    let cmd = `rg "${query}" "${projectPath}"`;
    if (include_pattern) {
      cmd += ` --glob "${include_pattern}"`;
    }
    if (exclude_pattern) {
      cmd += ` --glob "!${exclude_pattern}"`;
    }
    if (!case_sensitive) {
      cmd += ' -i';
    }

    try {
      const output = execSync(cmd, { encoding: 'utf-8' });
      const results = output
        .split('\n')
        .filter(Boolean)
        .map(line => {
          const [file, ...rest] = line.split(':');
          return {
            file: file.replace(projectPath + '/', ''),
            match: rest.join(':')
          };
        });

      return { matches: results, count: results.length };
    } catch (error) {
      return { matches: [], count: 0 };
    }
  }
};

// Tool: Delete File
export const deleteFileTool: AgentTool = {
  name: 'lov-delete',
  description: 'Delete a file from the project',
  parameters: {
    file_path: 'string'
  },
  execute: async (params, context) => {
    const { file_path } = params;
    const fullPath = path.join(
      process.env.PROJECTS_DIR!,
      context.projectId,
      file_path
    );

    await fs.unlink(fullPath);

    return {
      success: true,
      filePath: file_path
    };
  }
};

// Tool: Rename File
export const renameFileTool: AgentTool = {
  name: 'lov-rename',
  description: 'Rename a file',
  parameters: {
    original_file_path: 'string',
    new_file_path: 'string'
  },
  execute: async (params, context) => {
    const { original_file_path, new_file_path } = params;

    const oldPath = path.join(
      process.env.PROJECTS_DIR!,
      context.projectId,
      original_file_path
    );
    const newPath = path.join(
      process.env.PROJECTS_DIR!,
      context.projectId,
      new_file_path
    );

    // Ensure new directory exists
    await fs.mkdir(path.dirname(newPath), { recursive: true });

    await fs.rename(oldPath, newPath);

    return {
      success: true,
      oldPath: original_file_path,
      newPath: new_file_path
    };
  }
};

// Export all tools
export const allTools: AgentTool[] = [
  writeFileTool,
  readFileTool,
  lineReplaceTool,
  searchFilesTool,
  deleteFileTool,
  renameFileTool
];
```

---

## 3. Code Generator

**File: `packages/agent/src/generators/react-component.ts`**

```typescript
import { LovableAgent, AgentContext } from '../index';

export interface ComponentSpec {
  name: string;
  type: 'page' | 'component' | 'layout' | 'hook';
  description: string;
  props?: PropDefinition[];
  features?: string[];
  designSystem?: DesignSystem;
}

export interface PropDefinition {
  name: string;
  type: string;
  required: boolean;
  description?: string;
}

export class ReactComponentGenerator {
  private agent: LovableAgent;

  constructor(agent: LovableAgent) {
    this.agent = agent;
  }

  async generate(
    spec: ComponentSpec,
    context: AgentContext
  ): Promise<GeneratedComponent> {
    const prompt = this.buildPrompt(spec);

    const response = await this.agent.chat(prompt, context);

    // Parse response to extract code
    const parsed = this.parseResponse(response.content);

    return {
      name: spec.name,
      code: parsed.code,
      filePath: parsed.filePath,
      imports: parsed.imports,
      exports: parsed.exports,
      tests: parsed.tests
    };
  }

  private buildPrompt(spec: ComponentSpec): string {
    return `Generate a React TypeScript ${spec.type} component.

**Specification:**
- Name: ${spec.name}
- Type: ${spec.type}
- Description: ${spec.description}

${spec.props?.length ? `**Props:**
${spec.props.map(p => `- ${p.name}: ${p.type}${p.required ? ' (required)' : ''} - ${p.description || ''}`).join('\n')}` : ''}

${spec.features?.length ? `**Features:**
${spec.features.map(f => `- ${f}`).join('\n')}` : ''}

**Requirements:**
1. Use TypeScript with strict types
2. Follow React best practices (hooks, composition)
3. Use the design system tokens (NO hardcoded colors)
4. Implement responsive design
5. Add ARIA attributes for accessibility
6. Use semantic HTML
7. Add JSDoc comments for props
8. Export component as default

${spec.designSystem ? `**Design System:**
\`\`\`json
${JSON.stringify(spec.designSystem, null, 2)}
\`\`\`

Use design tokens like:
- Colors: \`bg-primary\`, \`text-foreground\`, etc.
- Spacing: Design system spacing scale
- Typography: Design system font sizes
` : ''}

Generate the complete component code.`;
  }

  private parseResponse(response: string): ParsedComponent {
    // Extract code blocks
    const codeBlockRegex = /```(?:typescript|tsx|jsx)?\n([\s\S]*?)```/g;
    const matches = [...response.matchAll(codeBlockRegex)];

    if (matches.length === 0) {
      throw new Error('No code block found in response');
    }

    const code = matches[0][1];

    // Extract file path
    const filePathMatch = response.match(/File:\s*`?([^`\n]+)`?/i);
    const filePath = filePathMatch
      ? filePathMatch[1]
      : 'src/components/Generated.tsx';

    // Extract imports
    const imports = this.extractImports(code);

    // Extract exports
    const exports = this.extractExports(code);

    // Check for test code
    const testCode = matches.find(m =>
      m[0].includes('test') || m[0].includes('spec')
    );

    return {
      code,
      filePath,
      imports,
      exports,
      tests: testCode ? testCode[1] : undefined
    };
  }

  private extractImports(code: string): string[] {
    const importRegex = /^import\s+.+\s+from\s+['"].+['"];?$/gm;
    return code.match(importRegex) || [];
  }

  private extractExports(code: string): string[] {
    const exportRegex = /^export\s+(?:default\s+)?(?:function|const|class|interface|type)\s+(\w+)/gm;
    const exports: string[] = [];

    let match;
    while ((match = exportRegex.exec(code)) !== null) {
      exports.push(match[1]);
    }

    return exports;
  }
}

interface ParsedComponent {
  code: string;
  filePath: string;
  imports: string[];
  exports: string[];
  tests?: string;
}

export interface GeneratedComponent {
  name: string;
  code: string;
  filePath: string;
  imports: string[];
  exports: string[];
  tests?: string;
}
```

---

## 4. Error Detection & Fixer

**File: `packages/agent/src/fixer/error-detector.ts`**

```typescript
import * as ts from 'typescript';
import { ESLint } from 'eslint';

export interface CodeError {
  type: 'typescript' | 'eslint' | 'build' | 'runtime';
  file: string;
  line: number;
  column?: number;
  message: string;
  code?: string;
  severity: 'error' | 'warning';
  suggestion?: string;
}

export class ErrorDetector {
  private eslint: ESLint;

  constructor() {
    this.eslint = new ESLint({
      useEslintrc: false,
      baseConfig: {
        extends: ['next/core-web-vitals', 'plugin:@typescript-eslint/recommended'],
        parser: '@typescript-eslint/parser',
        parserOptions: {
          ecmaVersion: 'latest',
          sourceType: 'module',
          ecmaFeatures: { jsx: true }
        }
      }
    });
  }

  async detectAllErrors(projectPath: string): Promise<CodeError[]> {
    const errors: CodeError[] = [];

    // TypeScript errors
    const tsErrors = await this.detectTypeScriptErrors(projectPath);
    errors.push(...tsErrors);

    // ESLint errors
    const eslintErrors = await this.detectESLintErrors(projectPath);
    errors.push(...eslintErrors);

    return errors;
  }

  async detectTypeScriptErrors(projectPath: string): Promise<CodeError[]> {
    const configPath = ts.findConfigFile(
      projectPath,
      ts.sys.fileExists,
      'tsconfig.json'
    );

    if (!configPath) {
      return [];
    }

    const { config } = ts.readConfigFile(configPath, ts.sys.readFile);
    const { options, fileNames, errors: configErrors } = ts.parseJsonConfigFileContent(
      config,
      ts.sys,
      projectPath
    );

    // Create program
    const program = ts.createProgram(fileNames, options);

    // Get diagnostics
    const diagnostics = [
      ...program.getSemanticDiagnostics(),
      ...program.getSyntacticDiagnostics()
    ];

    return diagnostics.map(diagnostic => {
      const message = ts.flattenDiagnosticMessageText(
        diagnostic.messageText,
        '\n'
      );

      let file = 'unknown';
      let line = 0;
      let column = 0;

      if (diagnostic.file && diagnostic.start) {
        file = diagnostic.file.fileName;
        const { line: l, character } = diagnostic.file.getLineAndCharacterOfPosition(
          diagnostic.start
        );
        line = l + 1;
        column = character + 1;
      }

      return {
        type: 'typescript',
        file,
        line,
        column,
        message,
        code: diagnostic.code?.toString(),
        severity: diagnostic.category === ts.DiagnosticCategory.Error
          ? 'error'
          : 'warning'
      };
    });
  }

  async detectESLintErrors(projectPath: string): Promise<CodeError[]> {
    const results = await this.eslint.lintFiles(`${projectPath}/**/*.{ts,tsx,js,jsx}`);

    const errors: CodeError[] = [];

    for (const result of results) {
      for (const message of result.messages) {
        errors.push({
          type: 'eslint',
          file: result.filePath,
          line: message.line,
          column: message.column,
          message: message.message,
          code: message.ruleId || undefined,
          severity: message.severity === 2 ? 'error' : 'warning',
          suggestion: message.suggestions?.[0]?.desc
        });
      }
    }

    return errors;
  }

  async detectBuildErrors(buildOutput: string): Promise<CodeError[]> {
    // Parse build output for errors
    const errors: CodeError[] = [];

    // Next.js error pattern
    const nextErrorRegex = /Error: (.+)\n\s+at (.+):(\d+):(\d+)/g;
    let match;

    while ((match = nextErrorRegex.exec(buildOutput)) !== null) {
      errors.push({
        type: 'build',
        file: match[2],
        line: parseInt(match[3]),
        column: parseInt(match[4]),
        message: match[1],
        severity: 'error'
      });
    }

    return errors;
  }
}
```

**File: `packages/agent/src/fixer/code-fixer.ts`**

```typescript
import { LovableAgent, AgentContext } from '../index';
import { CodeError, ErrorDetector } from './error-detector';

export class CodeFixer {
  private agent: LovableAgent;
  private detector: ErrorDetector;

  constructor(agent: LovableAgent) {
    this.agent = agent;
    this.detector = new ErrorDetector();
  }

  async fixErrors(
    errors: CodeError[],
    context: AgentContext
  ): Promise<FixResult[]> {
    const results: FixResult[] = [];

    // Group errors by file
    const errorsByFile = this.groupErrorsByFile(errors);

    for (const [file, fileErrors] of Object.entries(errorsByFile)) {
      const result = await this.fixFileErrors(file, fileErrors, context);
      results.push(result);
    }

    return results;
  }

  private async fixFileErrors(
    filePath: string,
    errors: CodeError[],
    context: AgentContext
  ): Promise<FixResult> {
    // Read file content
    const fileContent = await this.readFile(filePath, context);

    // Build fix prompt
    const prompt = this.buildFixPrompt(filePath, fileContent, errors);

    // Generate fix
    const response = await this.agent.chat(prompt, context);

    // Extract fixed code
    const fixedCode = this.extractCode(response.content);

    return {
      file: filePath,
      originalErrors: errors,
      fixedCode,
      success: true
    };
  }

  private buildFixPrompt(
    filePath: string,
    fileContent: string,
    errors: CodeError[]
  ): string {
    return `Fix the following errors in \`${filePath}\`:

**Current Code:**
\`\`\`typescript
${fileContent}
\`\`\`

**Errors to Fix:**
${errors.map((e, i) => `
${i + 1}. Line ${e.line}${e.column ? `:${e.column}` : ''} - ${e.type.toUpperCase()}
   ${e.message}
   ${e.code ? `Code: ${e.code}` : ''}
`).join('\n')}

**Instructions:**
1. Fix all errors listed above
2. Maintain existing functionality
3. Keep the same code style
4. Do NOT remove existing features
5. Add comments for complex fixes
6. Ensure TypeScript types are correct

Provide the complete fixed code.`;
  }

  private groupErrorsByFile(errors: CodeError[]): Record<string, CodeError[]> {
    const grouped: Record<string, CodeError[]> = {};

    for (const error of errors) {
      if (!grouped[error.file]) {
        grouped[error.file] = [];
      }
      grouped[error.file].push(error);
    }

    return grouped;
  }

  private async readFile(
    filePath: string,
    context: AgentContext
  ): Promise<string> {
    const fs = require('fs/promises');
    const path = require('path');

    const fullPath = path.join(
      process.env.PROJECTS_DIR!,
      context.projectId,
      filePath
    );

    return await fs.readFile(fullPath, 'utf-8');
  }

  private extractCode(response: string): string {
    const codeBlockRegex = /```(?:typescript|tsx|jsx|javascript)?\n([\s\S]*?)```/;
    const match = response.match(codeBlockRegex);

    if (!match) {
      // If no code block, assume entire response is code
      return response;
    }

    return match[1];
  }
}

export interface FixResult {
  file: string;
  originalErrors: CodeError[];
  fixedCode: string;
  success: boolean;
  remainingErrors?: CodeError[];
}
```

---

# 🌐 II. BACKEND API LAYER

## 1. Main API Server

**File: `apps/api/src/index.ts`**

```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Routes
import { chatRouter } from './routes/chat';
import { codegenRouter } from './routes/codegen';
import { projectRouter } from './routes/project';
import { deployRouter } from './routes/deploy';
import { authRouter } from './routes/auth';

// Middleware
import { authMiddleware } from './middleware/auth';
import { rateLimitMiddleware } from './middleware/rate-limit';
import { errorHandler } from './middleware/error-handler';

config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use(rateLimitMiddleware);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Public routes
app.use('/api/auth', authRouter);

// Protected routes
app.use('/api/chat', authMiddleware, chatRouter);
app.use('/api/codegen', authMiddleware, codegenRouter);
app.use('/api/projects', authMiddleware, projectRouter);
app.use('/api/deploy', authMiddleware, deployRouter);

// WebSocket handling
io.use((socket, next) => {
  // Auth middleware for WebSocket
  const token = socket.handshake.auth.token;
  // Verify token...
  next();
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join-project', (projectId) => {
    socket.join(`project:${projectId}`);
    console.log(`Socket ${socket.id} joined project ${projectId}`);
  });

  socket.on('code-change', async (data) => {
    // Broadcast to other clients in the same project
    socket.to(`project:${data.projectId}`).emit('code-updated', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Error handling
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`🚀 API server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready`);
});

export { io };
```

---

## 2. Chat API Route

**File: `apps/api/src/routes/chat.ts`**

```typescript
import { Router } from 'express';
import { LovableAgent } from '@lovable/agent';
import { allTools } from '@lovable/agent/tools';
import { db } from '../lib/db';
import { io } from '../index';
import fs from 'fs/promises';
import path from 'path';

const router = Router();

// Load system prompt
const SYSTEM_PROMPT = await fs.readFile(
  path.join(__dirname, '../prompts/lovable-system.txt'),
  'utf-8'
);

// Initialize agent
const agent = new LovableAgent(
  {
    provider: process.env.AI_PROVIDER as 'openai' | 'anthropic',
    model: process.env.AI_MODEL || 'gpt-4-turbo-preview',
    temperature: 0.7,
    maxTokens: 4000
  },
  SYSTEM_PROMPT
);

// Register tools
allTools.forEach(tool => agent.registerTool(tool));

router.post('/message', async (req, res) => {
  try {
    const { message, projectId, conversationId } = req.body;
    const userId = req.user!.id;

    // Get project context
    const project = await db.project.findFirst({
      where: { id: projectId, userId }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Get conversation history
    const conversation = await db.conversation.findUnique({
      where: { id: conversationId },
      include: { messages: { orderBy: { createdAt: 'asc' } } }
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Build context
    const context = {
      projectId,
      fileTree: project.fileTree,
      designSystem: project.designSystem,
      conversationHistory: conversation.messages,
      userPreferences: req.user!.preferences
    };

    // Save user message
    await db.message.create({
      data: {
        conversationId,
        role: 'user',
        content: message
      }
    });

    // Generate response
    const response = await agent.chat(message, context);

    // Save assistant message
    const assistantMessage = await db.message.create({
      data: {
        conversationId,
        role: 'assistant',
        content: response.content,
        toolCalls: response.toolCalls || []
      }
    });

    // Emit to WebSocket
    io.to(`project:${projectId}`).emit('new-message', {
      message: assistantMessage,
      toolResults: response.toolResults
    });

    // Track usage
    await db.usage.create({
      data: {
        userId,
        tokens: estimateTokens(message + response.content),
        type: 'chat'
      }
    });

    res.json({
      message: assistantMessage,
      toolResults: response.toolResults
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// Streaming endpoint
router.post('/stream', async (req, res) => {
  try {
    const { message, projectId, conversationId } = req.body;
    const userId = req.user!.id;

    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Get context (same as above)
    const project = await db.project.findFirst({
      where: { id: projectId, userId }
    });

    const conversation = await db.conversation.findUnique({
      where: { id: conversationId },
      include: { messages: true }
    });

    const context = {
      projectId,
      fileTree: project!.fileTree,
      designSystem: project!.designSystem,
      conversationHistory: conversation!.messages,
      userPreferences: req.user!.preferences
    };

    // Save user message
    await db.message.create({
      data: { conversationId, role: 'user', content: message }
    });

    let fullResponse = '';

    // Stream response
    await agent.chat(message, context, {
      stream: true,
      onToken: (token) => {
        fullResponse += token;
        res.write(`data: ${JSON.stringify({ token })}\n\n`);
      }
    });

    // Save complete response
    await db.message.create({
      data: {
        conversationId,
        role: 'assistant',
        content: fullResponse
      }
    });

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('Stream error:', error);
    res.write(`data: ${JSON.stringify({ error: 'Stream failed' })}\n\n`);
    res.end();
  }
});

function estimateTokens(text: string): number {
  // Rough estimate: ~4 characters per token
  return Math.ceil(text.length / 4);
}

export { router as chatRouter };
```

---

## 3. Code Generation Route

**File: `apps/api/src/routes/codegen.ts`**

```typescript
import { Router } from 'express';
import { ReactComponentGenerator } from '@lovable/agent/generators';
import { LovableAgent } from '@lovable/agent';
import { db } from '../lib/db';
import { io } from '../index';

const router = Router();

router.post('/component', async (req, res) => {
  try {
    const { spec, projectId } = req.body;
    const userId = req.user!.id;

    // Get project
    const project = await db.project.findFirst({
      where: { id: projectId, userId }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Create agent
    const agent = new LovableAgent(
      {
        provider: process.env.AI_PROVIDER as any,
        model: process.env.AI_MODEL!
      },
      SYSTEM_PROMPT
    );

    // Generate component
    const generator = new ReactComponentGenerator(agent);

    const context = {
      projectId,
      fileTree: project.fileTree,
      designSystem: project.designSystem,
      conversationHistory: []
    };

    const generated = await generator.generate(spec, context);

    // Write file
    const fs = require('fs/promises');
    const path = require('path');
    const fullPath = path.join(
      process.env.PROJECTS_DIR!,
      projectId,
      generated.filePath
    );

    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, generated.code, 'utf-8');

    // Update file tree
    // ... update logic

    // Emit to WebSocket
    io.to(`project:${projectId}`).emit('file-created', {
      path: generated.filePath,
      content: generated.code
    });

    res.json({ component: generated });
  } catch (error) {
    console.error('Codegen error:', error);
    res.status(500).json({ error: 'Failed to generate component' });
  }
});

router.post('/fix-errors', async (req, res) => {
  try {
    const { errors, projectId } = req.body;
    const userId = req.user!.id;

    // Implement error fixing logic using CodeFixer
    // ...

    res.json({ success: true, fixes: [] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fix errors' });
  }
});

export { router as codegenRouter };
```

---

## 4. Project Management Route

**File: `apps/api/src/routes/project.ts`**

```typescript
import { Router } from 'express';
import { db } from '../lib/db';
import { initializeProjectTemplate } from '../lib/templates';
import archiver from 'archiver';
import { createReadStream } from 'fs';
import { join } from 'path';

const router = Router();

// Create project
router.post('/', async (req, res) => {
  try {
    const { name, description, framework } = req.body;
    const userId = req.user!.id;

    // Create project in database
    const project = await db.project.create({
      data: {
        name,
        description,
        userId,
        framework: framework || 'next',
        fileTree: {},
        designSystem: {},
        dependencies: {}
      }
    });

    // Initialize project template
    await initializeProjectTemplate(project.id, framework);

    res.json({ project });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Get project
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const project = await db.project.findFirst({
      where: { id, userId },
      include: {
        conversation: {
          include: { messages: { orderBy: { createdAt: 'asc' } } }
        }
      }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ project });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// List projects
router.get('/', async (req, res) => {
  try {
    const userId = req.user!.id;

    const projects = await db.project.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' }
    });

    res.json({ projects });
  } catch (error) {
    res.status(500).json({ error: 'Failed to list projects' });
  }
});

// Export project as ZIP
router.get('/:id/export', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const project = await db.project.findFirst({
      where: { id, userId }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const projectPath = join(process.env.PROJECTS_DIR!, id);

    // Create ZIP
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${project.name}.zip"`
    );

    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.on('error', (err) => {
      throw err;
    });

    archive.pipe(res);
    archive.directory(projectPath, false);
    await archive.finalize();
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Failed to export project' });
  }
});

// Delete project
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    await db.project.delete({
      where: { id, userId }
    });

    // Delete project files
    const fs = require('fs/promises');
    const projectPath = join(process.env.PROJECTS_DIR!, id);
    await fs.rm(projectPath, { recursive: true, force: true });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

export { router as projectRouter };
```

---

_Tiếp tục với phần Frontend Components trong file tiếp theo..._
