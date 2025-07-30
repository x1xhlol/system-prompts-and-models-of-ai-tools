import Redis from 'redis';
import { Pool } from 'pg';
import { Logger } from '../utils/logger';

export interface MemoryEntry {
  id: string;
  userId: string;
  projectId: string;
  type: 'conversation' | 'code_context' | 'user_preferences' | 'project_state';
  content: any;
  metadata: {
    timestamp: Date;
    confidence: number;
    tags: string[];
    context: any;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface MemoryQuery {
  userId: string;
  projectId?: string;
  type?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
}

export class MemoryManager {
  private redis: Redis.RedisClientType;
  private postgres: Pool;
  private logger: Logger;

  constructor() {
    this.logger = new Logger('MemoryManager');
    this.initializeConnections();
  }

  private async initializeConnections() {
    // Initialize Redis connection
    this.redis = Redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });

    this.redis.on('error', (err) => {
      this.logger.error('Redis connection error', { error: err.message });
    });

    await this.redis.connect();

    // Initialize PostgreSQL connection
    this.postgres = new Pool({
      connectionString: process.env.POSTGRES_URL || 'postgresql://localhost:5432/nowhere_db',
    });

    await this.createTables();
  }

  private async createTables() {
    const createMemoryTable = `
      CREATE TABLE IF NOT EXISTS memory_entries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(255) NOT NULL,
        project_id VARCHAR(255),
        type VARCHAR(50) NOT NULL,
        content JSONB NOT NULL,
        metadata JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_memory_user_project ON memory_entries(user_id, project_id);
      CREATE INDEX IF NOT EXISTS idx_memory_type ON memory_entries(type);
      CREATE INDEX IF NOT EXISTS idx_memory_created_at ON memory_entries(created_at);
    `;

    try {
      await this.postgres.query(createMemoryTable);
      this.logger.info('Database tables created successfully');
    } catch (error) {
      this.logger.error('Failed to create database tables', { error });
    }
  }

  async storeMemory(entry: Omit<MemoryEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      // Store in PostgreSQL for persistence
      const query = `
        INSERT INTO memory_entries (user_id, project_id, type, content, metadata)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
      `;
      
      const result = await this.postgres.query(query, [
        entry.userId,
        entry.projectId,
        entry.type,
        JSON.stringify(entry.content),
        JSON.stringify(entry.metadata)
      ]);

      const id = result.rows[0].id;

      // Cache in Redis for fast access
      const cacheKey = `memory:${entry.userId}:${entry.projectId}:${id}`;
      await this.redis.setEx(cacheKey, 3600, JSON.stringify(entry)); // Cache for 1 hour

      this.logger.memoryOperation('store', { userId: entry.userId, projectId: entry.projectId, type: entry.type });
      return id;
    } catch (error) {
      this.logger.error('Failed to store memory', { error, entry });
      throw error;
    }
  }

  async retrieveMemory(query: MemoryQuery): Promise<MemoryEntry[]> {
    try {
      let sqlQuery = `
        SELECT * FROM memory_entries 
        WHERE user_id = $1
      `;
      const params: any[] = [query.userId];
      let paramIndex = 2;

      if (query.projectId) {
        sqlQuery += ` AND project_id = $${paramIndex}`;
        params.push(query.projectId);
        paramIndex++;
      }

      if (query.type) {
        sqlQuery += ` AND type = $${paramIndex}`;
        params.push(query.type);
        paramIndex++;
      }

      if (query.tags && query.tags.length > 0) {
        sqlQuery += ` AND metadata->>'tags' ?| $${paramIndex}`;
        params.push(query.tags);
        paramIndex++;
      }

      sqlQuery += ` ORDER BY created_at DESC`;

      if (query.limit) {
        sqlQuery += ` LIMIT $${paramIndex}`;
        params.push(query.limit);
        paramIndex++;
      }

      if (query.offset) {
        sqlQuery += ` OFFSET $${paramIndex}`;
        params.push(query.offset);
      }

      const result = await this.postgres.query(sqlQuery, params);
      
      const memories = result.rows.map(row => ({
        id: row.id,
        userId: row.user_id,
        projectId: row.project_id,
        type: row.type,
        content: row.content,
        metadata: row.metadata,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));

      this.logger.memoryOperation('retrieve', { query, count: memories.length });
      return memories;
    } catch (error) {
      this.logger.error('Failed to retrieve memory', { error, query });
      throw error;
    }
  }

  async updateMemory(id: string, updates: Partial<MemoryEntry>): Promise<void> {
    try {
      const updateFields: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      if (updates.content) {
        updateFields.push(`content = $${paramIndex}`);
        params.push(JSON.stringify(updates.content));
        paramIndex++;
      }

      if (updates.metadata) {
        updateFields.push(`metadata = $${paramIndex}`);
        params.push(JSON.stringify(updates.metadata));
        paramIndex++;
      }

      if (updateFields.length === 0) {
        return;
      }

      updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
      params.push(id);

      const query = `
        UPDATE memory_entries 
        SET ${updateFields.join(', ')}
        WHERE id = $${paramIndex}
      `;

      await this.postgres.query(query, params);

      // Update cache
      const cacheKey = `memory:${updates.userId}:${updates.projectId}:${id}`;
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        const entry = JSON.parse(cached);
        const updatedEntry = { ...entry, ...updates, updatedAt: new Date() };
        await this.redis.setEx(cacheKey, 3600, JSON.stringify(updatedEntry));
      }

      this.logger.memoryOperation('update', { id, updates });
    } catch (error) {
      this.logger.error('Failed to update memory', { error, id, updates });
      throw error;
    }
  }

  async deleteMemory(id: string): Promise<void> {
    try {
      await this.postgres.query('DELETE FROM memory_entries WHERE id = $1', [id]);
      
      // Remove from cache
      const keys = await this.redis.keys(`memory:*:${id}`);
      if (keys.length > 0) {
        await this.redis.del(keys);
      }

      this.logger.memoryOperation('delete', { id });
    } catch (error) {
      this.logger.error('Failed to delete memory', { error, id });
      throw error;
    }
  }

  async clearUserMemory(userId: string, projectId?: string): Promise<void> {
    try {
      let query = 'DELETE FROM memory_entries WHERE user_id = $1';
      const params: any[] = [userId];

      if (projectId) {
        query += ' AND project_id = $2';
        params.push(projectId);
      }

      await this.postgres.query(query, params);

      // Clear cache
      const pattern = projectId ? `memory:${userId}:${projectId}:*` : `memory:${userId}:*`;
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(keys);
      }

      this.logger.memoryOperation('clear', { userId, projectId });
    } catch (error) {
      this.logger.error('Failed to clear user memory', { error, userId, projectId });
      throw error;
    }
  }

  async getMemorySummary(userId: string, projectId?: string): Promise<any> {
    try {
      let query = `
        SELECT 
          type,
          COUNT(*) as count,
          MAX(created_at) as last_updated
        FROM memory_entries 
        WHERE user_id = $1
      `;
      const params: any[] = [userId];

      if (projectId) {
        query += ' AND project_id = $2';
        params.push(projectId);
      }

      query += ' GROUP BY type';

      const result = await this.postgres.query(query, params);
      
      const summary = {
        totalEntries: 0,
        byType: {},
        lastActivity: null
      };

      result.rows.forEach(row => {
        summary.byType[row.type] = {
          count: parseInt(row.count),
          lastUpdated: row.last_updated
        };
        summary.totalEntries += parseInt(row.count);
        
        if (!summary.lastActivity || row.last_updated > summary.lastActivity) {
          summary.lastActivity = row.last_updated;
        }
      });

      return summary;
    } catch (error) {
      this.logger.error('Failed to get memory summary', { error, userId, projectId });
      throw error;
    }
  }

  async close(): Promise<void> {
    try {
      await this.redis.quit();
      await this.postgres.end();
      this.logger.info('MemoryManager connections closed');
    } catch (error) {
      this.logger.error('Error closing MemoryManager connections', { error });
    }
  }
} 