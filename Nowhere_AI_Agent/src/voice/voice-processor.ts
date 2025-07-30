import { Logger } from '../utils/logger';

export interface VoiceCommand {
  command: string;
  confidence: number;
  intent: string;
  entities: any[];
  timestamp: Date;
}

export interface VoiceResponse {
  text: string;
  mode: 'brief' | 'detailed' | 'silent' | 'interactive';
  audioUrl?: string;
  duration?: number;
}

export class VoiceProcessor {
  private logger: Logger;
  private isListening: boolean = false;
  private recognition: any; // Web Speech API recognition
  private synthesis: any; // Web Speech API synthesis
  private currentLanguage: string = 'en-US';
  private voiceMode: 'brief' | 'detailed' | 'silent' | 'interactive' = 'brief';

  constructor() {
    this.logger = new Logger('VoiceProcessor');
    this.initializeSpeechAPIs();
  }

  private initializeSpeechAPIs(): void {
    try {
      // Initialize Web Speech API (for client-side simulation)
      if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
        this.recognition = new (window as any).webkitSpeechRecognition();
        this.synthesis = window.speechSynthesis;
        this.setupRecognition();
        this.logger.info('Web Speech API initialized successfully');
      } else {
        this.logger.warn('Web Speech API not available, using mock implementation');
      }
    } catch (error) {
      this.logger.error('Failed to initialize speech APIs', { error: error.message });
    }
  }

  private setupRecognition(): void {
    if (!this.recognition) return;

    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = this.currentLanguage;

    this.recognition.onstart = () => {
      this.isListening = true;
      this.logger.info('Voice recognition started');
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.logger.info('Voice recognition ended');
    };

    this.recognition.onerror = (event: any) => {
      this.logger.error('Voice recognition error', { error: event.error });
    };
  }

  async processVoiceInput(audioData?: ArrayBuffer): Promise<VoiceCommand> {
    this.logger.info('Processing voice input', { hasAudioData: !!audioData });

    // In a real implementation, this would process actual audio data
    // For now, we'll simulate voice command processing
    const mockCommand = this.generateMockCommand();
    
    this.logger.voiceCommandProcessed(mockCommand.command, 'default', mockCommand.confidence);
    
    return mockCommand;
  }

  private generateMockCommand(): VoiceCommand {
    const commands = [
      'Hello Nowhere, show me the project structure',
      'Nowhere, analyze this code file',
      'Create a new React component',
      'Run the tests and show me the results',
      'Enable autopilot mode',
      'What do you remember from our conversation?',
      'Nowhere, help me debug this issue',
      'Generate documentation for this function'
    ];

    const randomCommand = commands[Math.floor(Math.random() * commands.length)];
    const confidence = 0.85 + Math.random() * 0.1; // 85-95% confidence

    return {
      command: randomCommand,
      confidence,
      intent: this.parseIntent(randomCommand),
      entities: this.extractEntities(randomCommand),
      timestamp: new Date()
    };
  }

  private parseIntent(command: string): string {
    const lowerCommand = command.toLowerCase();
    
    if (lowerCommand.includes('show') || lowerCommand.includes('structure')) {
      return 'show_project_structure';
    }
    if (lowerCommand.includes('analyze') || lowerCommand.includes('code')) {
      return 'analyze_code';
    }
    if (lowerCommand.includes('create') || lowerCommand.includes('component')) {
      return 'create_component';
    }
    if (lowerCommand.includes('test') || lowerCommand.includes('run')) {
      return 'run_tests';
    }
    if (lowerCommand.includes('autopilot')) {
      return 'toggle_autopilot';
    }
    if (lowerCommand.includes('remember') || lowerCommand.includes('memory')) {
      return 'retrieve_memory';
    }
    if (lowerCommand.includes('debug') || lowerCommand.includes('issue')) {
      return 'debug_issue';
    }
    if (lowerCommand.includes('documentation') || lowerCommand.includes('doc')) {
      return 'generate_documentation';
    }
    
    return 'general_query';
  }

  private extractEntities(command: string): any[] {
    const entities: any[] = [];
    const lowerCommand = command.toLowerCase();
    
    // Extract file types
    const fileTypes = ['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'html', 'css'];
    fileTypes.forEach(type => {
      if (lowerCommand.includes(type)) {
        entities.push({ type: 'file_extension', value: type });
      }
    });

    // Extract frameworks
    const frameworks = ['react', 'vue', 'angular', 'node', 'express'];
    frameworks.forEach(framework => {
      if (lowerCommand.includes(framework)) {
        entities.push({ type: 'framework', value: framework });
      }
    });

    // Extract actions
    const actions = ['create', 'analyze', 'show', 'run', 'debug', 'generate'];
    actions.forEach(action => {
      if (lowerCommand.includes(action)) {
        entities.push({ type: 'action', value: action });
      }
    });

    return entities;
  }

  async startListening(): Promise<void> {
    if (this.recognition) {
      this.recognition.start();
    } else {
      this.isListening = true;
      this.logger.info('Mock voice listening started');
    }
  }

  async stopListening(): Promise<void> {
    if (this.recognition) {
      this.recognition.stop();
    } else {
      this.isListening = false;
      this.logger.info('Mock voice listening stopped');
    }
  }

  async speakText(text: string, mode: 'brief' | 'detailed' | 'silent' | 'interactive' = 'brief'): Promise<VoiceResponse> {
    this.logger.info('Speaking text', { textLength: text.length, mode });

    const responseText = this.generateResponseText(text, mode);
    
    if (mode === 'silent') {
      return {
        text: responseText,
        mode: 'silent'
      };
    }

    // In a real implementation, this would use TTS
    if (this.synthesis && mode !== 'silent') {
      const utterance = new SpeechSynthesisUtterance(responseText);
      utterance.lang = this.currentLanguage;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      
      this.synthesis.speak(utterance);
    }

    return {
      text: responseText,
      mode,
      duration: responseText.length * 0.06 // Rough estimate: 60ms per character
    };
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
    const sentences = text.split('.');
    const keySentence = sentences[0] || text;
    return `Brief: ${keySentence.trim()}.`;
  }

  private generateDetailedResponse(text: string): string {
    // Add more context and explanation
    return `Detailed response: ${text}\n\nThis includes comprehensive information and additional context for better understanding.`;
  }

  private generateInteractiveResponse(text: string): string {
    // Add interactive elements
    return `${text}\n\nWould you like me to:\n1. Provide more details?\n2. Show related examples?\n3. Execute this action?`;
  }

  async processVoiceCommand(voiceInput: string): Promise<{
    command: string;
    confidence: number;
    intent: string;
    entities: any[];
  }> {
    this.logger.info('Processing voice command', { voiceInput });

    // Remove "Nowhere" from the beginning if present
    const cleanedInput = voiceInput.replace(/^nowhere\s*,?\s*/i, '').trim();
    
    return {
      command: cleanedInput,
      confidence: 0.9,
      intent: this.parseIntent(cleanedInput),
      entities: this.extractEntities(cleanedInput)
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
      isSpeaking: this.synthesis ? this.synthesis.speaking : false,
      language: this.currentLanguage,
      available: !!(this.recognition && this.synthesis)
    };
  }

  async setLanguage(language: string): Promise<void> {
    this.currentLanguage = language;
    if (this.recognition) {
      this.recognition.lang = language;
    }
    this.logger.info('Voice language changed', { language });
  }

  async setVoiceMode(mode: 'brief' | 'detailed' | 'silent' | 'interactive'): Promise<void> {
    this.voiceMode = mode;
    this.logger.info('Voice mode changed', { mode });
  }

  // Advanced voice features
  async transcribeAudio(audioData: ArrayBuffer): Promise<string> {
    // Mock transcription
    this.logger.info('Transcribing audio', { audioSize: audioData.byteLength });
    return "Hello Nowhere, please help me with this code.";
  }

  async generateSpeech(text: string, options?: {
    voice?: string;
    rate?: number;
    pitch?: number;
  }): Promise<ArrayBuffer> {
    // Mock speech generation
    this.logger.info('Generating speech', { textLength: text.length, options });
    return new ArrayBuffer(1024); // Mock audio data
  }

  async detectEmotion(audioData: ArrayBuffer): Promise<{
    emotion: string;
    confidence: number;
    intensity: number;
  }> {
    // Mock emotion detection
    const emotions = ['neutral', 'happy', 'frustrated', 'excited', 'confused'];
    const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
    
    return {
      emotion: randomEmotion,
      confidence: 0.7 + Math.random() * 0.2,
      intensity: 0.5 + Math.random() * 0.5
    };
  }

  async getAvailableVoices(): Promise<Array<{
    name: string;
    lang: string;
    default: boolean;
  }>> {
    if (this.synthesis) {
      return this.synthesis.getVoices().map((voice: any) => ({
        name: voice.name,
        lang: voice.lang,
        default: voice.default
      }));
    }
    
    // Mock voices
    return [
      { name: 'Default Voice', lang: 'en-US', default: true },
      { name: 'Female Voice', lang: 'en-US', default: false },
      { name: 'Male Voice', lang: 'en-US', default: false }
    ];
  }
} 