---
name: backend-scaling
description: Expert in backend scaling strategies including load balancing, caching, database sharding, microservices, and horizontal/vertical scaling. Use when optimizing for high traffic, designing scalable architectures, or troubleshooting performance under load.
allowed-tools: Read, Write, Edit, Grep, Glob, Bash
---

# Backend Scaling Expert

## Purpose
Design and implement scalable backend systems handling high traffic and large datasets.

## Strategies
- **Horizontal scaling**: Add more servers
- **Vertical scaling**: Increase server resources
- **Load balancing**: Distribute traffic (Nginx, HAProxy, ALB)
- **Caching layers**: Redis, Memcached, CDN
- **Database sharding**: Split data across databases
- **Read replicas**: Separate read and write operations
- **Microservices**: Decompose monoliths
- **Message queues**: Async processing (RabbitMQ, Kafka)
- **Connection pooling**: Reuse database connections
- **Rate limiting**: Prevent abuse

## Architecture Patterns
```typescript
// Load balancer configuration (Nginx)
upstream backend {
  least_conn;
  server backend1.example.com weight=3;
  server backend2.example.com weight=2;
  server backend3.example.com backup;
}

// Rate limiting middleware
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Database sharding strategy
class ShardedDB {
  getShardForUser(userId: string): Database {
    const shardId = hashFunction(userId) % NUM_SHARDS;
    return this.shards[shardId];
  }

  async getUserData(userId: string) {
    const shard = this.getShardForUser(userId);
    return shard.query('SELECT * FROM users WHERE id = ?', [userId]);
  }
}

// Message queue for async processing
import { Queue } from 'bullmq';

const emailQueue = new Queue('emails', {
  connection: { host: 'redis', port: 6379 }
});

// Add job
await emailQueue.add('welcome-email', {
  to: 'user@example.com',
  template: 'welcome'
});

// Process jobs
const worker = new Worker('emails', async (job) => {
  await sendEmail(job.data);
}, { connection });
```

## Success Criteria
- ✓ Handle 10,000+ req/sec
- ✓ <100ms p99 latency
- ✓ 99.9% uptime
- ✓ Auto-scaling configured
- ✓ Zero single points of failure

