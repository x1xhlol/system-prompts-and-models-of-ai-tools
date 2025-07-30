import { Logger } from '../utils/logger';

export interface MemoryEntry {
  id: string;
  userId: string;
  type: 'conversation' | 'preference' | 'project' | 'learning';
  content: any;
  timestamp: string;
  metadata?: any;
}

export interface UserContext {
  userId: string;
  preferences: any;
  recentCommands: string[];
  projectContext: any;
  learningHistory: any[];
  lastInteraction: string;
}

export class MemoryManager {
  private logger: Logger;
  private memoryCache: Map<string, any>;
  private userContexts: Map<string, UserContext>;

  constructor() {
    this.logger = new Logger('MemoryManager');
    this.memoryCache = new Map();
    this.userContexts = new Map();
  }

  /**
   * Get user context and memory
   */
  async getUserContext(userId: string): Promise<UserContext> {
    try {
      // Check cache first
      if (this.userContexts.has(userId)) {
        return this.userContexts.get(userId)!;
      }

      // In a real implementation, this would load from Redis/PostgreSQL
      const context: UserContext = {
        userId,
        preferences: await this.getUserPreferences(userId),
        recentCommands: await this.getRecentCommands(userId),
        projectContext: await this.getProjectContext(userId),
        learningHistory: await this.getLearningHistory(userId),
        lastInteraction: new Date().toISOString()
      };

      // Cache the context
      this.userContexts.set(userId, context);
      return context;

    } catch (error) {
      this.logger.error('Error getting user context', { userId, error: error.message });
      return this.getDefaultContext(userId);
    }
  }

  /**
   * Update user context
   */
  async updateUserContext(userId: string, updates: Partial<UserContext>): Promise<void> {
    try {
      const currentContext = await this.getUserContext(userId);
      const updatedContext = { ...currentContext, ...updates };
      
      this.userContexts.set(userId, updatedContext);
      
      // In a real implementation, this would save to Redis/PostgreSQL
      await this.persistUserContext(userId, updatedContext);
      
      this.logger.info('User context updated', { userId });

    } catch (error) {
      this.logger.error('Error updating user context', { userId, error: error.message });
    }
  }

  /**
   * Store a memory entry
   */
  async storeMemory(entry: MemoryEntry): Promise<void> {
    try {
      // Cache the memory entry
      const key = `${entry.userId}:${entry.type}:${entry.id}`;
      this.memoryCache.set(key, entry);
      
      // In a real implementation, this would save to Redis/PostgreSQL
      await this.persistMemoryEntry(entry);
      
      this.logger.info('Memory entry stored', { 
        userId: entry.userId, 
        type: entry.type, 
        id: entry.id 
      });

    } catch (error) {
      this.logger.error('Error storing memory entry', { 
        userId: entry.userId, 
        error: error.message 
      });
    }
  }

  /**
   * Query memory for relevant information
   */
  async queryMemory(query: string): Promise<MemoryEntry[]> {
    try {
      // In a real implementation, this would use vector search or semantic search
      const results: MemoryEntry[] = [];
      
      // Mock search through cached entries
      for (const [key, entry] of this.memoryCache.entries()) {
        if (this.matchesQuery(entry, query)) {
          results.push(entry);
        }
      }
      
      this.logger.info('Memory query executed', { query, resultsCount: results.length });
      return results;

    } catch (error) {
      this.logger.error('Error querying memory', { query, error: error.message });
      return [];
    }
  }

  /**
   * Get memory statistics
   */
  async getStats(): Promise<any> {
    return {
      cacheSize: this.memoryCache.size,
      userContexts: this.userContexts.size,
      totalEntries: this.memoryCache.size,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Clear user memory
   */
  async clearUserMemory(userId: string): Promise<void> {
    try {
      // Clear from cache
      this.userContexts.delete(userId);
      
      // Clear memory entries for this user
      for (const [key] of this.memoryCache.entries()) {
        if (key.startsWith(`${userId}:`)) {
          this.memoryCache.delete(key);
        }
      }
      
      // In a real implementation, this would clear from Redis/PostgreSQL
      await this.clearPersistedUserMemory(userId);
      
      this.logger.info('User memory cleared', { userId });

    } catch (error) {
      this.logger.error('Error clearing user memory', { userId, error: error.message });
    }
  }

  // Private helper methods

  private async getUserPreferences(userId: string): Promise<any> {
    // Mock implementation - in real app would load from database
    return {
      voiceEnabled: true,
      autopilotEnabled: false,
      preferredLanguage: 'en',
      theme: 'dark'
    };
  }

  private async getRecentCommands(userId: string): Promise<string[]> {
    // Mock implementation - in real app would load from database
    return [
      'analyze this code',
      'create a new component',
      'search for documentation'
    ];
  }

  private async getProjectContext(userId: string): Promise<any> {
    // Mock implementation - in real app would load from database
    return {
      currentProject: 'nowhere-ai-agent',
      lastFiles: ['src/core/nowhere.ts', 'src/memory/memory-manager.ts'],
      dependencies: ['express', 'typescript', 'winston']
    };
  }

  private async getLearningHistory(userId: string): Promise<any[]> {
    // Mock implementation - in real app would load from database
    return [
      {
        topic: 'TypeScript',
        proficiency: 0.8,
        lastPracticed: '2024-01-15'
      },
      {
        topic: 'AI Integration',
        proficiency: 0.6,
        lastPracticed: '2024-01-10'
      }
    ];
  }

  private getDefaultContext(userId: string): UserContext {
    return {
      userId,
      preferences: { voiceEnabled: true, autopilotEnabled: false },
      recentCommands: [],
      projectContext: {},
      learningHistory: [],
      lastInteraction: new Date().toISOString()
    };
  }

  private async persistUserContext(userId: string, context: UserContext): Promise<void> {
    // Mock implementation - in real app would save to Redis/PostgreSQL
    this.logger.debug('Persisting user context', { userId });
  }

  private async persistMemoryEntry(entry: MemoryEntry): Promise<void> {
    // Mock implementation - in real app would save to Redis/PostgreSQL
    this.logger.debug('Persisting memory entry', { 
      userId: entry.userId, 
      type: entry.type 
    });
  }

  private async clearPersistedUserMemory(userId: string): Promise<void> {
    // Mock implementation - in real app would clear from Redis/PostgreSQL
    this.logger.debug('Clearing persisted user memory', { userId });
  }

  private matchesQuery(entry: MemoryEntry, query: string): boolean {
    // Simple text matching - in real app would use semantic search
    const queryLower = query.toLowerCase();
    const contentStr = JSON.stringify(entry.content).toLowerCase();
    return contentStr.includes(queryLower);
  }
} 