import { readFileSync } from 'fs';
import { join } from 'path';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { Logger } from '../utils/logger';
import { MemoryManager } from '../memory/memory-manager';
import { ToolExecutor } from '../tools/tool-executor';
import { VoiceProcessor } from '../voice/voice-processor';

export interface NowhereContext {
  userId: string;
  projectId: string;
  currentFile?: string;
  codebase?: any;
  userPreferences?: any;
  sessionId: string;
}

export interface NowhereResponse {
  response: string;
  actions: any[];
  memory: any;
  confidence: number;
  suggestions?: string[];
}

export interface VoiceCommand {
  type: 'navigation' | 'execution' | 'analysis' | 'creation' | 'debugging';
  command: string;
  confidence: number;
  parameters: any;
}

export class NowhereCore {
  private systemPrompt: string;
  private openai: OpenAI;
  private anthropic: Anthropic;
  private memoryManager: MemoryManager;
  private toolExecutor: ToolExecutor;
  private voiceProcessor: VoiceProcessor;
  private logger: Logger;

  constructor() {
    this.logger = new Logger('NowhereCore');
    this.systemPrompt = this.loadSystemPrompt();
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    this.memoryManager = new MemoryManager();
    this.toolExecutor = new ToolExecutor();
    this.voiceProcessor = new VoiceProcessor();
  }

  private loadSystemPrompt(): string {
    try {
      return readFileSync(
        join(__dirname, '../../../prompts/system_prompt.md'),
        'utf-8'
      );
    } catch (error) {
      this.logger.error('Failed to load system prompt', error);
      return '# Nowhere AI Agent\n\nYou are Nowhere, an advanced AI coding assistant.';
    }
  }

  async processCommand(
    command: string,
    context: NowhereContext,
    isVoiceCommand: boolean = false
  ): Promise<NowhereResponse> {
    try {
      this.logger.info(`Processing command: ${command}`, { context });

      // Process voice command if applicable
      let processedCommand = command;
      let voiceCommand: VoiceCommand | null = null;

      if (isVoiceCommand) {
        voiceCommand = await this.voiceProcessor.processVoiceCommand(command);
        processedCommand = voiceCommand.command;
      }

      // Retrieve relevant memory
      const memory = await this.memoryManager.getRelevantMemory(context);

      // Create AI prompt with context
      const prompt = this.buildPrompt(processedCommand, context, memory);

      // Get AI response
      const aiResponse = await this.getAIResponse(prompt, context);

      // Execute any required actions
      const actions = await this.executeActions(aiResponse.actions, context);

      // Update memory
      await this.memoryManager.updateMemory(context, {
        command: processedCommand,
        response: aiResponse.response,
        actions: actions,
        timestamp: new Date().toISOString(),
      });

      return {
        response: aiResponse.response,
        actions: actions,
        memory: memory,
        confidence: aiResponse.confidence,
        suggestions: aiResponse.suggestions,
      };
    } catch (error) {
      this.logger.error('Error processing command', error);
      return {
        response: 'I encountered an error processing your request. Please try again.',
        actions: [],
        memory: {},
        confidence: 0,
      };
    }
  }

  private buildPrompt(
    command: string,
    context: NowhereContext,
    memory: any
  ): string {
    return `
${this.systemPrompt}

## Current Context
- User ID: ${context.userId}
- Project ID: ${context.projectId}
- Current File: ${context.currentFile || 'None'}
- Session ID: ${context.sessionId}

## Relevant Memory
${JSON.stringify(memory, null, 2)}

## User Command
${command}

## Instructions
Process this command using your advanced capabilities. Consider the context and memory when formulating your response. If this is a voice command, provide clear, actionable responses suitable for voice interaction.
`;
  }

  private async getAIResponse(
    prompt: string,
    context: NowhereContext
  ): Promise<any> {
    try {
      // Try OpenAI first, fallback to Anthropic
      const openaiResponse = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: this.systemPrompt,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const response = openaiResponse.choices[0]?.message?.content || '';
      
      // Parse response for actions and confidence
      const parsedResponse = this.parseAIResponse(response);

      return {
        response: parsedResponse.response,
        actions: parsedResponse.actions,
        confidence: parsedResponse.confidence,
        suggestions: parsedResponse.suggestions,
      };
    } catch (error) {
      this.logger.warn('OpenAI failed, trying Anthropic', error);
      
      // Fallback to Anthropic
      const anthropicResponse = await this.anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const response = anthropicResponse.content[0]?.text || '';
      const parsedResponse = this.parseAIResponse(response);

      return {
        response: parsedResponse.response,
        actions: parsedResponse.actions,
        confidence: parsedResponse.confidence,
        suggestions: parsedResponse.suggestions,
      };
    }
  }

  private parseAIResponse(response: string): any {
    try {
      // Look for JSON blocks in the response
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[1]);
        return {
          response: parsed.response || response,
          actions: parsed.actions || [],
          confidence: parsed.confidence || 0.8,
          suggestions: parsed.suggestions || [],
        };
      }

      // Fallback to simple parsing
      return {
        response: response,
        actions: [],
        confidence: 0.8,
        suggestions: [],
      };
    } catch (error) {
      this.logger.warn('Failed to parse AI response', error);
      return {
        response: response,
        actions: [],
        confidence: 0.8,
        suggestions: [],
      };
    }
  }

  private async executeActions(actions: any[], context: NowhereContext): Promise<any[]> {
    const results = [];
    
    for (const action of actions) {
      try {
        const result = await this.toolExecutor.executeTool(action, context);
        results.push(result);
      } catch (error) {
        this.logger.error(`Failed to execute action: ${action.type}`, error);
        results.push({
          success: false,
          error: error.message,
          action: action,
        });
      }
    }

    return results;
  }

  async processVoiceCommand(
    voiceInput: string,
    context: NowhereContext
  ): Promise<NowhereResponse> {
    return this.processCommand(voiceInput, context, true);
  }

  async enableAutopilotMode(context: NowhereContext): Promise<void> {
    this.logger.info('Enabling autopilot mode', { context });
    // Implementation for autopilot mode
  }

  async disableAutopilotMode(context: NowhereContext): Promise<void> {
    this.logger.info('Disabling autopilot mode', { context });
    // Implementation for disabling autopilot mode
  }

  async getMemory(context: NowhereContext): Promise<any> {
    return this.memoryManager.getRelevantMemory(context);
  }

  async clearMemory(context: NowhereContext): Promise<void> {
    await this.memoryManager.clearMemory(context);
  }
} 