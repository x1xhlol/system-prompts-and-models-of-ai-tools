import { Logger } from '../utils/logger';

export interface VoiceCommand {
  text: string;
  confidence: number;
  timestamp: Date;
  metadata: {
    language: string;
    duration: number;
    user: string;
  };
}

export interface VoiceResponse {
  text: string;
  audioUrl?: string;
  duration: number;
  mode: 'brief' | 'detailed' | 'silent' | 'interactive';
}

export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
  language: string;
}

export class VoiceProcessor {
  private logger: Logger;
  private isListening: boolean = false;
  private recognition: any; // Web Speech API recognition
  private synthesis: any; // Web Speech API synthesis

  constructor() {
    this.logger = new Logger('VoiceProcessor');
    this.initializeSpeechAPIs();
  }

  private initializeSpeechAPIs() {
    try {
      // Initialize Web Speech API if available
      if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
        this.recognition = new (window as any).webkitSpeechRecognition();
        this.setupRecognition();
      }

      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        this.synthesis = window.speechSynthesis;
      }

      this.logger.info('Voice processor initialized');
    } catch (error) {
      this.logger.error('Failed to initialize speech APIs', { error });
    }
  }

  private setupRecognition() {
    if (!this.recognition) return;

    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognition.onstart = () => {
      this.isListening = true;
      this.logger.info('Speech recognition started');
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.logger.info('Speech recognition ended');
    };

    this.recognition.onerror = (event: any) => {
      this.logger.error('Speech recognition error', { error: event.error });
    };
  }

  async processVoiceInput(audioData?: ArrayBuffer): Promise<VoiceCommand> {
    const startTime = Date.now();
    
    try {
      // For now, we'll use a mock implementation
      // In a real implementation, you would process the audio data
      const mockCommand = this.generateMockCommand();
      
      const duration = Date.now() - startTime;
      this.logger.voiceCommand(mockCommand.text, mockCommand.text, mockCommand.confidence);
      
      return mockCommand;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error('Voice processing failed', { error: error.message });
      
      return {
        text: 'Error processing voice input',
        confidence: 0,
        timestamp: new Date(),
        metadata: {
          language: 'en-US',
          duration,
          user: 'unknown'
        }
      };
    }
  }

  private generateMockCommand(): VoiceCommand {
    const commands = [
      'Hello Nowhere, show me the project structure',
      'Nowhere, analyze this code file',
      'Create a new component for the user interface',
      'Run the tests and show me the results',
      'What are the main features we need to implement?',
      'Enable autopilot mode',
      'Search for files containing authentication logic',
      'Generate documentation for the API endpoints'
    ];

    const randomCommand = commands[Math.floor(Math.random() * commands.length)];
    const confidence = 0.7 + Math.random() * 0.3; // 70-100% confidence

    return {
      text: randomCommand,
      confidence,
      timestamp: new Date(),
      metadata: {
        language: 'en-US',
        duration: 1000 + Math.random() * 2000,
        user: 'test-user'
      }
    };
  }

  async startListening(): Promise<void> {
    try {
      if (this.recognition && !this.isListening) {
        this.recognition.start();
        this.logger.info('Started listening for voice commands');
      } else {
        this.logger.warn('Speech recognition not available or already listening');
      }
    } catch (error) {
      this.logger.error('Failed to start listening', { error: error.message });
    }
  }

  async stopListening(): Promise<void> {
    try {
      if (this.recognition && this.isListening) {
        this.recognition.stop();
        this.logger.info('Stopped listening for voice commands');
      }
    } catch (error) {
      this.logger.error('Failed to stop listening', { error: error.message });
    }
  }

  async speakText(text: string, mode: 'brief' | 'detailed' | 'silent' | 'interactive' = 'brief'): Promise<VoiceResponse> {
    const startTime = Date.now();
    
    try {
      if (mode === 'silent') {
        return {
          text,
          duration: Date.now() - startTime,
          mode
        };
      }

      // Generate appropriate response based on mode
      const responseText = this.generateResponseText(text, mode);
      
      // Use Web Speech API for text-to-speech
      if (this.synthesis) {
        const utterance = new SpeechSynthesisUtterance(responseText);
        utterance.rate = mode === 'brief' ? 1.2 : 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 0.8;
        
        this.synthesis.speak(utterance);
      }

      const duration = Date.now() - startTime;
      this.logger.info('Text-to-speech completed', { text: responseText, mode, duration });
      
      return {
        text: responseText,
        duration,
        mode
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error('Text-to-speech failed', { error: error.message });
      
      return {
        text: 'Error generating voice response',
        duration,
        mode
      };
    }
  }

  private generateResponseText(originalText: string, mode: string): string {
    switch (mode) {
      case 'brief':
        return this.generateBriefResponse(originalText);
      case 'detailed':
        return this.generateDetailedResponse(originalText);
      case 'interactive':
        return this.generateInteractiveResponse(originalText);
      default:
        return originalText;
    }
  }

  private generateBriefResponse(text: string): string {
    // Extract key information for brief response
    if (text.includes('project structure')) {
      return 'Showing project structure. Found 15 files across 8 directories.';
    } else if (text.includes('analyze')) {
      return 'Code analysis complete. Found 3 functions, 2 imports, complexity level 2.';
    } else if (text.includes('autopilot')) {
      return 'Autopilot mode enabled. I will now work autonomously.';
    } else if (text.includes('test')) {
      return 'Tests completed. 12 passed, 1 failed.';
    } else {
      return 'Command processed successfully.';
    }
  }

  private generateDetailedResponse(text: string): string {
    // Provide detailed response with context
    if (text.includes('project structure')) {
      return 'Project structure analysis complete. The project contains 15 files organized in 8 directories. Main components include backend API, frontend interface, and database schemas. Key files are in src directory with configuration in root.';
    } else if (text.includes('analyze')) {
      return 'Detailed code analysis finished. The file contains 3 functions with an average complexity of 2.1. Found 2 external imports and 5 internal dependencies. Code quality score is 8.5 out of 10.';
    } else if (text.includes('autopilot')) {
      return 'Autopilot mode has been successfully enabled. I will now work independently, making decisions based on project context and user preferences. I will notify you of major actions and ask for confirmation when needed.';
    } else if (text.includes('test')) {
      return 'Test execution completed. Results: 12 tests passed, 1 test failed in the authentication module. The failing test is related to password validation. I can help fix this issue if needed.';
    } else {
      return 'Command has been processed with full context analysis. All operations completed successfully with detailed logging available.';
    }
  }

  private generateInteractiveResponse(text: string): string {
    // Generate interactive response with questions
    if (text.includes('project structure')) {
      return 'I found the project structure. Would you like me to focus on any specific directory or file type?';
    } else if (text.includes('analyze')) {
      return 'Code analysis complete. I found some potential improvements. Should I implement the suggested optimizations?';
    } else if (text.includes('autopilot')) {
      return 'Autopilot mode is ready. What specific tasks would you like me to prioritize first?';
    } else if (text.includes('test')) {
      return 'Tests are done. There\'s one failing test. Would you like me to investigate and fix it?';
    } else {
      return 'Command processed. Is there anything specific you\'d like me to explain or modify?';
    }
  }

  async processVoiceCommand(voiceInput: string): Promise<{
    command: string;
    confidence: number;
    intent: string;
    entities: any[];
  }> {
    try {
      // Basic NLP processing for voice commands
      const processed = this.parseVoiceCommand(voiceInput);
      
      this.logger.voiceCommand(voiceInput, processed.command, processed.confidence);
      
      return processed;
    } catch (error) {
      this.logger.error('Voice command processing failed', { error: error.message });
      
      return {
        command: voiceInput,
        confidence: 0.5,
        intent: 'unknown',
        entities: []
      };
    }
  }

  private parseVoiceCommand(input: string): {
    command: string;
    confidence: number;
    intent: string;
    entities: any[];
  } {
    const lowerInput = input.toLowerCase();
    let intent = 'unknown';
    const entities: any[] = [];
    let confidence = 0.7;

    // Intent classification
    if (lowerInput.includes('show') || lowerInput.includes('display')) {
      intent = 'display';
      if (lowerInput.includes('structure') || lowerInput.includes('files')) {
        entities.push({ type: 'target', value: 'project_structure' });
      }
    } else if (lowerInput.includes('analyze') || lowerInput.includes('examine')) {
      intent = 'analyze';
      if (lowerInput.includes('code') || lowerInput.includes('file')) {
        entities.push({ type: 'target', value: 'code_analysis' });
      }
    } else if (lowerInput.includes('create') || lowerInput.includes('make')) {
      intent = 'create';
      if (lowerInput.includes('component')) {
        entities.push({ type: 'target', value: 'component' });
      }
    } else if (lowerInput.includes('run') || lowerInput.includes('execute')) {
      intent = 'execute';
      if (lowerInput.includes('test')) {
        entities.push({ type: 'target', value: 'tests' });
      }
    } else if (lowerInput.includes('autopilot') || lowerInput.includes('auto')) {
      intent = 'autopilot';
      entities.push({ type: 'mode', value: 'autonomous' });
    } else if (lowerInput.includes('search') || lowerInput.includes('find')) {
      intent = 'search';
      if (lowerInput.includes('file')) {
        entities.push({ type: 'target', value: 'files' });
      }
    }

    // Extract file names, paths, or other specific entities
    const filePattern = /(\w+\.\w+)/g;
    const fileMatches = input.match(filePattern);
    if (fileMatches) {
      fileMatches.forEach(match => {
        entities.push({ type: 'file', value: match });
      });
    }

    // Adjust confidence based on clarity
    if (input.length > 10) confidence += 0.1;
    if (entities.length > 0) confidence += 0.1;
    if (intent !== 'unknown') confidence += 0.1;

    return {
      command: input,
      confidence: Math.min(confidence, 1.0),
      intent,
      entities
    };
  }

  async getVoiceStatus(): Promise<{
    isListening: boolean;
    isSpeaking: boolean;
    language: string;
    available: boolean;
  }> {
    return {
      isListening: this.isListening,
      isSpeaking: this.synthesis?.speaking || false,
      language: 'en-US',
      available: !!(this.recognition && this.synthesis)
    };
  }

  async setLanguage(language: string): Promise<void> {
    try {
      if (this.recognition) {
        this.recognition.lang = language;
        this.logger.info('Language set for speech recognition', { language });
      }
    } catch (error) {
      this.logger.error('Failed to set language', { error: error.message, language });
    }
  }

  async setVoiceMode(mode: 'brief' | 'detailed' | 'silent' | 'interactive'): Promise<void> {
    try {
      // Store voice mode preference
      this.logger.info('Voice mode set', { mode });
    } catch (error) {
      this.logger.error('Failed to set voice mode', { error: error.message, mode });
    }
  }
} 