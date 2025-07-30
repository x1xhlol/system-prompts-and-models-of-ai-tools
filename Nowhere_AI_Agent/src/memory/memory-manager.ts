import Redis from 'redis';
import { Pool } from 'pg';
import { Logger } from '../utils/logger';

export interface MemoryItem {
  id: string;
  userId: string;
  type: string;
  content: string;
  metadata?: any;
  timestamp: Date;
  importance: number;
}

export class MemoryManager {
  private redis: Redis.RedisClientType;
  private postgres: Pool;
  private logger: Logger;

  constructor() {
    this.logger = new Logger('MemoryManager');
    this.initializeConnections();
  }

  private async initializeConnections(): Promise<void> {
    try {
      // Initialize Redis connection
      this.redis = Redis.createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
      });

      this.redis.on('error', (err) => {
        this.logger.error('Redis connection error', { error: err.message });
      });

      await this.redis.connect();
      this.logger.info('Redis connection established');

      // Initialize PostgreSQL connection
      this.postgres = new Pool({
        connectionString: process.env.POSTGRES_URL || 'postgresql://localhost:5432/nowhere_db',
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });

      await this.createTables();
      this.logger.info('PostgreSQL connection established');
    } catch (error) {
      this.logger.error('Failed to initialize connections', { error: error.message });
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    const createMemoryTable = `
      CREATE TABLE IF NOT EXISTS memory_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(255) NOT NULL,
        type VARCHAR(100) NOT NULL,
        content TEXT NOT NULL,
        metadata JSONB,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        importance INTEGER DEFAULT 1,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_memory_user_id ON memory_items(user_id);
      CREATE INDEX IF NOT EXISTS idx_memory_type ON memory_items(type);
      CREATE INDEX IF NOT EXISTS idx_memory_timestamp ON memory_items(timestamp);
    `;

    try {
      await this.postgres.query(createMemoryTable);
      this.logger.info('Database tables created successfully');
    } catch (error) {
      this.logger.error('Failed to create tables', { error: error.message });
      throw error;
    }
  }

  async storeMemory(userId: string, type: string, content: string, metadata?: any, importance: number = 1): Promise<string> {
    try {
      const id = crypto.randomUUID();
      const memoryItem: MemoryItem = {
        id,
        userId,
        type,
        content,
        metadata,
        timestamp: new Date(),
        importance
      };

      // Store in Redis for fast access
      const redisKey = `memory:${userId}:${id}`;
      await this.redis.setEx(redisKey, 3600, JSON.stringify(memoryItem)); // 1 hour cache

      // Store in PostgreSQL for persistence
      const query = `
        INSERT INTO memory_items (id, user_id, type, content, metadata, importance)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `;
      
      await this.postgres.query(query, [
        id, userId, type, content, 
        metadata ? JSON.stringify(metadata) : null, importance
      ]);

      this.logger.memoryOperation('store', userId, { type, contentLength: content.length, importance });
      return id;
    } catch (error) {
      this.logger.error('Failed to store memory', { error: error.message, userId, type });
      throw error;
    }
  }

  async retrieveMemory(userId: string, type?: string, limit: number = 50): Promise<MemoryItem[]> {
    try {
      // Try Redis first
      const redisPattern = type ? `memory:${userId}:*` : `memory:${userId}:*`;
      const keys = await this.redis.keys(redisPattern);
      
      if (keys.length > 0) {
        const memoryItems = await Promise.all(
          keys.map(async (key) => {
            const data = await this.redis.get(key);
            return data ? JSON.parse(data) : null;
          })
        );

        const validItems = memoryItems.filter(item => item !== null);
        if (validItems.length > 0) {
          this.logger.memoryOperation('retrieve_redis', userId, { count: validItems.length });
          return validItems.slice(0, limit);
        }
      }

      // Fallback to PostgreSQL
      let query = `
        SELECT id, user_id as "userId", type, content, metadata, timestamp, importance
        FROM memory_items 
        WHERE user_id = $1
      `;
      const params: any[] = [userId];

      if (type) {
        query += ' AND type = $2';
        params.push(type);
      }

      query += ' ORDER BY timestamp DESC LIMIT $' + (params.length + 1);
      params.push(limit);

      const result = await this.postgres.query(query, params);
      
      const memoryItems = result.rows.map(row => ({
        ...row,
        metadata: row.metadata ? JSON.parse(row.metadata) : null
      }));

      this.logger.memoryOperation('retrieve_postgres', userId, { count: memoryItems.length });
      return memoryItems;
    } catch (error) {
      this.logger.error('Failed to retrieve memory', { error: error.message, userId });
      throw error;
    }
  }

  async updateMemory(id: string, updates: Partial<MemoryItem>): Promise<void> {
    try {
      const setClause = Object.keys(updates)
        .filter(key => key !== 'id' && key !== 'userId')
        .map((key, index) => `${key} = $${index + 2}`)
        .join(', ');

      const query = `
        UPDATE memory_items 
        SET ${setClause}
        WHERE id = $1
      `;

      const values = [id, ...Object.values(updates).filter((_, index) => index !== 0)];
      await this.postgres.query(query, values);

      // Update Redis cache
      const redisKey = `memory:${updates.userId || 'unknown'}:${id}`;
      const existing = await this.redis.get(redisKey);
      if (existing) {
        const item = JSON.parse(existing);
        const updatedItem = { ...item, ...updates };
        await this.redis.setEx(redisKey, 3600, JSON.stringify(updatedItem));
      }

      this.logger.memoryOperation('update', updates.userId || 'unknown', { id, updates });
    } catch (error) {
      this.logger.error('Failed to update memory', { error: error.message, id });
      throw error;
    }
  }

  async deleteMemory(id: string): Promise<void> {
    try {
      // Delete from PostgreSQL
      await this.postgres.query('DELETE FROM memory_items WHERE id = $1', [id]);

      // Delete from Redis
      const keys = await this.redis.keys(`memory:*:${id}`);
      if (keys.length > 0) {
        await this.redis.del(keys);
      }

      this.logger.memoryOperation('delete', 'unknown', { id });
    } catch (error) {
      this.logger.error('Failed to delete memory', { error: error.message, id });
      throw error;
    }
  }

  async clearUserMemory(userId: string): Promise<void> {
    try {
      // Clear from PostgreSQL
      await this.postgres.query('DELETE FROM memory_items WHERE user_id = $1', [userId]);

      // Clear from Redis
      const keys = await this.redis.keys(`memory:${userId}:*`);
      if (keys.length > 0) {
        await this.redis.del(keys);
      }

      this.logger.memoryOperation('clear_user', userId, { count: keys.length });
    } catch (error) {
      this.logger.error('Failed to clear user memory', { error: error.message, userId });
      throw error;
    }
  }

  async getMemorySummary(userId: string): Promise<any> {
    try {
      const query = `
        SELECT 
          type,
          COUNT(*) as count,
          MAX(timestamp) as last_updated,
          AVG(importance) as avg_importance
        FROM memory_items 
        WHERE user_id = $1 
        GROUP BY type
        ORDER BY count DESC
      `;

      const result = await this.postgres.query(query, [userId]);
      
      const summary = {
        totalItems: result.rows.reduce((sum, row) => sum + parseInt(row.count), 0),
        byType: result.rows,
        lastActivity: result.rows.length > 0 ? 
          Math.max(...result.rows.map(row => new Date(row.last_updated).getTime())) : null
      };

      this.logger.memoryOperation('summary', userId, summary);
      return summary;
    } catch (error) {
      this.logger.error('Failed to get memory summary', { error: error.message, userId });
      throw error;
    }
  }

  async close(): Promise<void> {
    try {
      if (this.redis) {
        await this.redis.quit();
      }
      if (this.postgres) {
        await this.postgres.end();
      }
      this.logger.info('Memory manager connections closed');
    } catch (error) {
      this.logger.error('Error closing memory manager', { error: error.message });
    }
  }
} 