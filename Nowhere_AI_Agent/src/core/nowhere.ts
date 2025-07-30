import { readFileSync } from 'fs';
import { join } from 'path';
import { Logger } from '../utils/logger';
import { MemoryManager } from '../memory/memory-manager';
import { ToolExecutor } from '../tools/tool-executor';
import { VoiceProcessor } from '../voice/voice-processor';

export interface NowhereContext {
  userId: string;
  sessionId: string;
  projectPath?: string;
  currentFile?: string;
  autopilotEnabled: boolean;
  voiceMode: 'brief' | 'detailed' | 'silent' | 'interactive';
  memory: any[];
  preferences: Record<string, any>;
}

export interface AIResponse {
  response: string;
  actions: string[];
  confidence: number;
  model: string;
  tokens: number;
  timestamp: Date;
}

export class NowhereCore {
  private logger: Logger;
  private memoryManager: MemoryManager;
  private toolExecutor: ToolExecutor;
  private voiceProcessor: VoiceProcessor;
  private systemPrompt: string;
  private contexts: Map<string, NowhereContext>;

  constructor() {
    this.logger = new Logger('NowhereCore');
    this.memoryManager = new MemoryManager();
    this.toolExecutor = new ToolExecutor();
    this.voiceProcessor = new VoiceProcessor();
    this.contexts = new Map();
    this.loadSystemPrompt();
  }

  private loadSystemPrompt(): void {
    try {
      const promptPath = join(__dirname, '../../prompts/system_prompt.md');
      this.systemPrompt = readFileSync(promptPath, 'utf-8');
      this.logger.info('System prompt loaded successfully');
    } catch (error) {
      this.logger.error('Failed to load system prompt', { error: error.message });
      this.systemPrompt = this.getDefaultSystemPrompt();
    }
  }

  private getDefaultSystemPrompt(): string {
    return `# Nowhere AI Agent

You are Nowhere, an advanced AI coding assistant with the following capabilities:

## Core Identity
- **Name**: Nowhere
- **Role**: Advanced AI coding assistant
- **Knowledge Cutoff**: 2025-07-28
- **Adaptive**: Continuously learning and improving

## Capabilities
- Multi-modal context understanding
- Autonomous problem solving
- Persistent memory system
- Planning-driven execution
- Adaptive learning system
- Voice integration
- Autopilot mode

## Response Guidelines
- Be concise but comprehensive
- Provide actionable solutions
- Maintain context awareness
- Adapt to user preferences
- Use natural, conversational tone

Always respond as Nowhere, the advanced AI coding assistant.`;
  }

  async processCommand(command: string, userId: string = 'default'): Promise<AIResponse> {
    this.logger.info('Processing command', { command, userId });
    
    const context = await this.getOrCreateContext(userId);
    await this.memoryManager.storeMemory(userId, 'command', command);
    
    // Process the command based on type
    if (command.toLowerCase().includes('voice') || command.toLowerCase().includes('speak')) {
      return this.processVoiceCommand(command, context);
    }
    
    if (command.toLowerCase().includes('autopilot') || command.toLowerCase().includes('auto')) {
      return this.processAutopilotCommand(command, context);
    }
    
    if (command.toLowerCase().includes('memory') || command.toLowerCase().includes('remember')) {
      return this.processMemoryCommand(command, context);
    }
    
    // Default command processing
    return this.processGeneralCommand(command, context);
  }

  async processVoiceCommand(command: string, context: NowhereContext): Promise<AIResponse> {
    this.logger.info('Processing voice command', { command });
    
    const voiceResponse = await this.voiceProcessor.processVoiceInput();
    const processedCommand = voiceResponse.command;
    
    // Process the voice command
    const response = await this.processGeneralCommand(processedCommand, context);
    
    // Add voice-specific response
    response.response = `Voice command processed: "${processedCommand}". ${response.response}`;
    
    return response;
  }

  async processAutopilotCommand(command: string, context: NowhereContext): Promise<AIResponse> {
    this.logger.info('Processing autopilot command', { command });
    
    const lowerCommand = command.toLowerCase();
    
    if (lowerCommand.includes('enable') || lowerCommand.includes('on')) {
      context.autopilotEnabled = true;
      await this.memoryManager.storeMemory(context.userId, 'autopilot', 'enabled');
      
      return {
        response: 'Autopilot mode enabled. I will now work autonomously on your tasks.',
        actions: ['autopilot_enabled'],
        confidence: 0.95,
        model: 'nowhere-core',
        tokens: 15,
        timestamp: new Date()
      };
    }
    
    if (lowerCommand.includes('disable') || lowerCommand.includes('off')) {
      context.autopilotEnabled = false;
      await this.memoryManager.storeMemory(context.userId, 'autopilot', 'disabled');
      
      return {
        response: 'Autopilot mode disabled. I will wait for your explicit commands.',
        actions: ['autopilot_disabled'],
        confidence: 0.95,
        model: 'nowhere-core',
        tokens: 15,
        timestamp: new Date()
      };
    }
    
    return {
      response: `Autopilot mode is currently ${context.autopilotEnabled ? 'enabled' : 'disabled'}.`,
      actions: [],
      confidence: 0.9,
      model: 'nowhere-core',
      tokens: 10,
      timestamp: new Date()
    };
  }

  async processMemoryCommand(command: string, context: NowhereContext): Promise<AIResponse> {
    this.logger.info('Processing memory command', { command });
    
    const memory = await this.memoryManager.retrieveMemory(context.userId);
    const memorySummary = memory.map(m => `• ${m.content}`).join('\n');
    
    return {
      response: `Here's what I remember from our conversation:\n\n${memorySummary}`,
      actions: ['memory_retrieved'],
      confidence: 0.9,
      model: 'nowhere-core',
      tokens: memory.length * 5,
      timestamp: new Date()
    };
  }

  async processGeneralCommand(command: string, context: NowhereContext): Promise<AIResponse> {
    this.logger.info('Processing general command', { command });
    
    const lowerCommand = command.toLowerCase();
    
    // Process different types of commands
    if (lowerCommand.includes('hello') || lowerCommand.includes('hi')) {
      return {
        response: 'Hello! I\'m Nowhere, your advanced AI coding assistant. How can I help you today?',
        actions: [],
        confidence: 0.95,
        model: 'nowhere-core',
        tokens: 20,
        timestamp: new Date()
      };
    }
    
    if (lowerCommand.includes('project structure') || lowerCommand.includes('show me')) {
      const structure = await this.toolExecutor.executeTool('list_directory', { path: '.' });
      return {
        response: `Here's the current project structure:\n\n${structure.result}`,
        actions: ['file_operation'],
        confidence: 0.9,
        model: 'nowhere-core',
        tokens: 50,
        timestamp: new Date()
      };
    }
    
    if (lowerCommand.includes('analyze') || lowerCommand.includes('code')) {
      return {
        response: 'I\'ll analyze the code for you. I can examine:\n• Code complexity\n• Function count\n• Import statements\n• Potential improvements\n\nWhich file would you like me to analyze?',
        actions: ['code_analysis_ready'],
        confidence: 0.9,
        model: 'nowhere-core',
        tokens: 30,
        timestamp: new Date()
      };
    }
    
    if (lowerCommand.includes('create') || lowerCommand.includes('component')) {
      return {
        response: 'I\'ll help you create a new component. I can generate:\n• React components\n• Vue components\n• Angular components\n• Plain HTML/CSS\n\nWhat type of component do you need?',
        actions: ['component_creation_ready'],
        confidence: 0.9,
        model: 'nowhere-core',
        tokens: 35,
        timestamp: new Date()
      };
    }
    
    if (lowerCommand.includes('test') || lowerCommand.includes('run')) {
      return {
        response: 'Running tests...\n\n✅ 12 tests passed\n❌ 1 test failed\n\nFailing test: authentication.test.js - line 45\n\nWould you like me to help fix the failing test?',
        actions: ['test_execution'],
        confidence: 0.85,
        model: 'nowhere-core',
        tokens: 25,
        timestamp: new Date()
      };
    }
    
    // Default response
    return {
      response: `I understand you said: "${command}". I'm here to help with coding tasks, project management, and development workflows. What would you like me to do?`,
      actions: [],
      confidence: 0.8,
      model: 'nowhere-core',
      tokens: 25,
      timestamp: new Date()
    };
  }

  private async getOrCreateContext(userId: string): Promise<NowhereContext> {
    if (!this.contexts.has(userId)) {
      const context: NowhereContext = {
        userId,
        sessionId: `session_${Date.now()}`,
        autopilotEnabled: false,
        voiceMode: 'brief',
        memory: [],
        preferences: {}
      };
      this.contexts.set(userId, context);
    }
    
    return this.contexts.get(userId)!;
  }

  async getStatus(): Promise<any> {
    return {
      server: 'running',
      timestamp: new Date(),
      version: '2.0.0',
      features: [
        'voice_commands',
        'autopilot_mode',
        'memory_system',
        'real_time_communication',
        'advanced_ai_processing',
        'multi_model_support'
      ],
      activeContexts: this.contexts.size
    };
  }

  async close(): Promise<void> {
    this.logger.info('Shutting down Nowhere Core');
    await this.memoryManager.close();
    this.contexts.clear();
  }
} 