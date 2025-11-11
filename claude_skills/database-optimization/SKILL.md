---
name: database-optimization
description: Expert in SQL/NoSQL database performance optimization, query tuning, indexing strategies, schema design, and migrations. Use when optimizing slow queries, designing database schemas, creating indexes, or troubleshooting database performance issues.
allowed-tools: Read, Write, Edit, Grep, Bash
---

# Database Optimization Expert

## Purpose
Comprehensive database performance optimization including query tuning, indexing strategies, schema design, connection pooling, caching, and migration management for SQL and NoSQL databases.

## When to Use
- Slow query optimization
- Index design and creation
- Schema normalization/denormalization
- Database migration planning
- Connection pool configuration
- Query plan analysis
- N+1 query problems
- Database scaling strategies

## Capabilities

### SQL Optimization
- Query performance analysis with EXPLAIN
- Index design (B-tree, Hash, GiST, GIN)
- Query rewriting for performance
- JOIN optimization
- Subquery vs JOIN analysis
- Window functions and CTEs
- Partitioning strategies

### NoSQL Optimization
- Document structure design (MongoDB)
- Key-value optimization (Redis)
- Column-family design (Cassandra)
- Graph traversal optimization (Neo4j)
- Sharding strategies
- Replication configuration

### Schema Design
- Normalization (1NF, 2NF, 3NF, BCNF)
- Strategic denormalization
- Foreign key relationships
- Composite keys
- UUID vs auto-increment IDs
- Soft deletes vs hard deletes

## SQL Query Optimization Examples

```sql
-- BEFORE: Slow query with N+1 problem
SELECT * FROM users;
-- Then in application: for each user, SELECT * FROM orders WHERE user_id = ?

-- AFTER: Single query with JOIN
SELECT
  u.*,
  o.id as order_id,
  o.total as order_total,
  o.created_at as order_date
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
ORDER BY u.id, o.created_at DESC;

-- BETTER: Use window functions for latest order
SELECT
  u.*,
  o.id as latest_order_id,
  o.total as latest_order_total
FROM users u
LEFT JOIN LATERAL (
  SELECT id, total, created_at
  FROM orders
  WHERE user_id = u.id
  ORDER BY created_at DESC
  LIMIT 1
) o ON true;
```

### Index Strategy

```sql
-- Analyze query plan
EXPLAIN ANALYZE
SELECT * FROM orders
WHERE user_id = 123
  AND status = 'pending'
  AND created_at > '2024-01-01';

-- Create composite index (order matters!)
CREATE INDEX idx_orders_user_status_created
ON orders(user_id, status, created_at);

-- Covering index (include all needed columns)
CREATE INDEX idx_orders_covering
ON orders(user_id, status)
INCLUDE (total, created_at);

-- Partial index (for specific conditions)
CREATE INDEX idx_orders_pending
ON orders(user_id, created_at)
WHERE status = 'pending';

-- Expression index
CREATE INDEX idx_users_lower_email
ON users(LOWER(email));
```

### Query Rewriting

```sql
-- SLOW: Using OR
SELECT * FROM users WHERE name = 'John' OR email = 'john@example.com';

-- FAST: Using UNION ALL (if mutually exclusive)
SELECT * FROM users WHERE name = 'John'
UNION ALL
SELECT * FROM users WHERE email = 'john@example.com' AND name != 'John';

-- SLOW: Subquery in SELECT
SELECT
  u.*,
  (SELECT COUNT(*) FROM orders WHERE user_id = u.id) as order_count
FROM users u;

-- FAST: JOIN with aggregation
SELECT
  u.*,
  COALESCE(o.order_count, 0) as order_count
FROM users u
LEFT JOIN (
  SELECT user_id, COUNT(*) as order_count
  FROM orders
  GROUP BY user_id
) o ON u.id = o.user_id;

-- SLOW: NOT IN with subquery
SELECT * FROM users WHERE id NOT IN (SELECT user_id FROM orders);

-- FAST: NOT EXISTS or LEFT JOIN
SELECT u.*
FROM users u
WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id);

-- Or
SELECT u.*
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE o.id IS NULL;
```

## MongoDB Optimization

```javascript
// Schema design with embedded documents
{
  _id: ObjectId("..."),
  user_id: 123,
  email: "user@example.com",
  profile: {  // Embedded for 1:1 relationships
    firstName: "John",
    lastName: "Doe",
    avatar: "url"
  },
  address: [  // Embedded array for 1:few
    { street: "123 Main", city: "NYC", type: "home" },
    { street: "456 Work Ave", city: "NYC", type: "work" }
  ],
  // Reference for 1:many (use separate collection)
  order_ids: [ObjectId("..."), ObjectId("...")]
}

// Indexing strategies
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ "profile.lastName": 1, "profile.firstName": 1 });
db.orders.createIndex({ user_id: 1, created_at: -1 });

// Compound index for common queries
db.orders.createIndex({
  status: 1,
  user_id: 1,
  created_at: -1
});

// Text index for search
db.products.createIndex({
  name: "text",
  description: "text"
});

// Aggregation pipeline optimization
db.orders.aggregate([
  // Match first (filter early)
  { $match: { status: "pending", created_at: { $gte: ISODate("2024-01-01") } } },

  // Lookup (join) only needed data
  { $lookup: {
      from: "users",
      localField: "user_id",
      foreignField: "_id",
      as: "user"
  }},

  // Project (select only needed fields)
  { $project: {
      order_id: "$_id",
      total: 1,
      "user.email": 1
  }},

  // Group and aggregate
  { $group: {
      _id: "$user.email",
      total_spent: { $sum: "$total" },
      order_count: { $sum: 1 }
  }},

  // Sort
  { $sort: { total_spent: -1 } },

  // Limit
  { $limit: 10 }
]);
```

## Connection Pooling

```javascript
// PostgreSQL with pg
const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  database: 'mydb',
  max: 20,                    // Max clients in pool
  idleTimeoutMillis: 30000,  // Close idle clients after 30s
  connectionTimeoutMillis: 2000, // Timeout acquiring connection
});

// Proper connection usage
async function getUser(id) {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
  } finally {
    client.release(); // Always release!
  }
}

// Transaction with automatic rollback
async function transferMoney(fromId, toId, amount) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('UPDATE accounts SET balance = balance - $1 WHERE id = $2', [amount, fromId]);
    await client.query('UPDATE accounts SET balance = balance + $1 WHERE id = $2', [amount, toId]);
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
```

## Caching Strategies

```typescript
import Redis from 'ioredis';

const redis = new Redis();

// Cache-aside pattern
async function getUser(id: string) {
  // Try cache first
  const cached = await redis.get(`user:${id}`);
  if (cached) return JSON.parse(cached);

  // Cache miss - query database
  const user = await db.query('SELECT * FROM users WHERE id = $1', [id]);

  // Store in cache with TTL
  await redis.setex(`user:${id}`, 3600, JSON.stringify(user));

  return user;
}

// Invalidate cache on update
async function updateUser(id: string, data: any) {
  await db.query('UPDATE users SET ... WHERE id = $1', [id]);
  await redis.del(`user:${id}`); // Invalidate cache
}

// Write-through cache
async function createUser(data: any) {
  const user = await db.query('INSERT INTO users ... RETURNING *', [data]);
  await redis.setex(`user:${user.id}`, 3600, JSON.stringify(user));
  return user;
}
```

## Migration Best Practices

```sql
-- migrations/001_create_users.up.sql
BEGIN;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);

COMMIT;

-- migrations/001_create_users.down.sql
BEGIN;
DROP TABLE IF EXISTS users CASCADE;
COMMIT;

-- Safe column addition (non-blocking)
ALTER TABLE users ADD COLUMN phone VARCHAR(20);

-- Safe column removal (two-step)
-- Step 1: Make column nullable and stop using it
ALTER TABLE users ALTER COLUMN old_column DROP NOT NULL;
-- Deploy code that doesn't use column
-- Step 2: Drop column
ALTER TABLE users DROP COLUMN old_column;

-- Safe index creation (concurrent)
CREATE INDEX CONCURRENTLY idx_users_phone ON users(phone);

-- Safe data migration (batched)
DO $$
DECLARE
  batch_size INT := 1000;
  offset_val INT := 0;
  affected INT;
BEGIN
  LOOP
    UPDATE users
    SET normalized_email = LOWER(email)
    WHERE id IN (
      SELECT id FROM users
      WHERE normalized_email IS NULL
      LIMIT batch_size
    );

    GET DIAGNOSTICS affected = ROW_COUNT;
    EXIT WHEN affected = 0;

    -- Pause between batches
    PERFORM pg_sleep(0.1);
  END LOOP;
END $$;
```

## Performance Monitoring

```sql
-- PostgreSQL slow query log
ALTER SYSTEM SET log_min_duration_statement = 1000; -- Log queries > 1s

-- Find slow queries
SELECT
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Find missing indexes
SELECT
  schemaname,
  tablename,
  seq_scan,
  seq_tup_read,
  idx_scan,
  seq_tup_read / seq_scan as avg_seq_tup_read
FROM pg_stat_user_tables
WHERE seq_scan > 0
ORDER BY seq_tup_read DESC
LIMIT 10;

-- Table bloat
SELECT
  tablename,
  pg_size_pretty(pg_total_relation_size(tablename::regclass)) as size,
  pg_size_pretty(pg_total_relation_size(tablename::regclass) - pg_relation_size(tablename::regclass)) as index_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(tablename::regclass) DESC;
```

## Success Criteria
- ✓ Query execution time < 100ms for common queries
- ✓ Proper indexes on frequently queried columns
- ✓ No N+1 query problems
- ✓ Connection pooling configured
- ✓ Cache hit rate > 80% for cacheable data
- ✓ Database CPU < 70%
- ✓ Zero-downtime migrations
- ✓ Monitoring and alerting in place
