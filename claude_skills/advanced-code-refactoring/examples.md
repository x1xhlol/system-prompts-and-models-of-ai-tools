# Advanced Code Refactoring Examples

## Example 1: Applying Strategy Pattern

### Before - Switch Statement Anti-Pattern
```typescript
class PaymentProcessor {
  processPayment(amount: number, method: string) {
    switch(method) {
      case 'credit_card':
        // 50 lines of credit card logic
        break;
      case 'paypal':
        // 40 lines of PayPal logic
        break;
      case 'crypto':
        // 60 lines of crypto logic
        break;
      default:
        throw new Error('Unknown payment method');
    }
  }
}
```

### After - Strategy Pattern
```typescript
// Strategy interface
interface PaymentStrategy {
  process(amount: number): Promise<PaymentResult>;
}

// Concrete strategies
class CreditCardStrategy implements PaymentStrategy {
  async process(amount: number): Promise<PaymentResult> {
    // 50 lines of credit card logic
  }
}

class PayPalStrategy implements PaymentStrategy {
  async process(amount: number): Promise<PaymentResult> {
    // 40 lines of PayPal logic
  }
}

class CryptoStrategy implements PaymentStrategy {
  async process(amount: number): Promise<PaymentResult> {
    // 60 lines of crypto logic
  }
}

// Context
class PaymentProcessor {
  private strategies = new Map<string, PaymentStrategy>([
    ['credit_card', new CreditCardStrategy()],
    ['paypal', new PayPalStrategy()],
    ['crypto', new CryptoStrategy()],
  ]);

  async processPayment(amount: number, method: string) {
    const strategy = this.strategies.get(method);
    if (!strategy) throw new Error('Unknown payment method');
    return strategy.process(amount);
  }
}
```

## Example 2: Dependency Injection for Testability

### Before - Hard Dependencies
```typescript
class UserService {
  async createUser(data: UserData) {
    const db = new DatabaseConnection(); // Hard dependency
    const emailer = new EmailService(); // Hard dependency

    const user = await db.insert('users', data);
    await emailer.sendWelcome(user.email);
    return user;
  }
}

// Testing is difficult - requires real DB and email service
```

### After - Dependency Injection
```typescript
interface Database {
  insert(table: string, data: any): Promise<any>;
}

interface Emailer {
  sendWelcome(email: string): Promise<void>;
}

class UserService {
  constructor(
    private db: Database,
    private emailer: Emailer
  ) {}

  async createUser(data: UserData) {
    const user = await this.db.insert('users', data);
    await this.emailer.sendWelcome(user.email);
    return user;
  }
}

// Testing is easy - inject mocks
const mockDb = { insert: jest.fn() };
const mockEmailer = { sendWelcome: jest.fn() };
const service = new UserService(mockDb, mockEmailer);
```

## Example 3: Repository Pattern

### Before - Data Access Scattered
```typescript
class OrderController {
  async getOrder(id: string) {
    const result = await db.query('SELECT * FROM orders WHERE id = ?', [id]);
    return result[0];
  }

  async createOrder(data: OrderData) {
    return db.query('INSERT INTO orders...', [data]);
  }
}

class ReportController {
  async getOrderStats() {
    const result = await db.query('SELECT COUNT(*) FROM orders...');
    return result;
  }
}
```

### After - Repository Pattern
```typescript
interface OrderRepository {
  findById(id: string): Promise<Order | null>;
  create(data: OrderData): Promise<Order>;
  findByStatus(status: string): Promise<Order[]>;
  count(): Promise<number>;
}

class SQLOrderRepository implements OrderRepository {
  constructor(private db: Database) {}

  async findById(id: string): Promise<Order | null> {
    const result = await this.db.query('SELECT * FROM orders WHERE id = ?', [id]);
    return result[0] || null;
  }

  async create(data: OrderData): Promise<Order> {
    return this.db.query('INSERT INTO orders...', [data]);
  }

  async findByStatus(status: string): Promise<Order[]> {
    return this.db.query('SELECT * FROM orders WHERE status = ?', [status]);
  }

  async count(): Promise<number> {
    const result = await this.db.query('SELECT COUNT(*) as count FROM orders');
    return result[0].count;
  }
}

class OrderController {
  constructor(private orderRepo: OrderRepository) {}

  async getOrder(id: string) {
    return this.orderRepo.findById(id);
  }

  async createOrder(data: OrderData) {
    return this.orderRepo.create(data);
  }
}

class ReportController {
  constructor(private orderRepo: OrderRepository) {}

  async getOrderStats() {
    return this.orderRepo.count();
  }
}
```

## Example 4: Extract Method Refactoring

### Before - Long Method
```typescript
function processUserRegistration(userData: any) {
  // Validation - 30 lines
  if (!userData.email) throw new Error('Email required');
  if (!userData.email.includes('@')) throw new Error('Invalid email');
  if (!userData.password) throw new Error('Password required');
  if (userData.password.length < 8) throw new Error('Password too short');
  if (!/[A-Z]/.test(userData.password)) throw new Error('Password needs uppercase');
  // ... 25 more lines of validation

  // Password hashing - 15 lines
  const salt = crypto.randomBytes(16);
  const hash = crypto.pbkdf2Sync(userData.password, salt, 10000, 64, 'sha512');
  // ... more hashing logic

  // Database insertion - 20 lines
  const id = uuid.v4();
  const created = new Date();
  // ... database logic

  // Email sending - 25 lines
  const template = loadTemplate('welcome');
  const rendered = renderTemplate(template, userData);
  // ... email logic
}
```

### After - Extracted Methods
```typescript
function processUserRegistration(userData: UserData) {
  validateUserData(userData);
  const hashedPassword = hashPassword(userData.password);
  const user = createUserInDatabase({ ...userData, password: hashedPassword });
  sendWelcomeEmail(user);
  return user;
}

function validateUserData(userData: UserData): void {
  validateEmail(userData.email);
  validatePassword(userData.password);
  validateUsername(userData.username);
}

function validateEmail(email: string): void {
  if (!email) throw new ValidationError('Email required');
  if (!email.includes('@')) throw new ValidationError('Invalid email');
  // ... more validation
}

function validatePassword(password: string): void {
  if (!password) throw new ValidationError('Password required');
  if (password.length < 8) throw new ValidationError('Password too short');
  if (!/[A-Z]/.test(password)) throw new ValidationError('Needs uppercase');
  // ... more validation
}

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

function createUserInDatabase(userData: UserData): User {
  const id = uuid.v4();
  const created = new Date();
  // ... database logic
  return user;
}

function sendWelcomeEmail(user: User): void {
  const template = loadTemplate('welcome');
  const rendered = renderTemplate(template, user);
  // ... email logic
}
```

## Example 5: Replace Conditional with Polymorphism

### Before - Type Checking
```typescript
class Animal {
  type: 'dog' | 'cat' | 'bird';

  makeSound() {
    if (this.type === 'dog') return 'Woof';
    if (this.type === 'cat') return 'Meow';
    if (this.type === 'bird') return 'Tweet';
  }

  move() {
    if (this.type === 'dog') return 'runs';
    if (this.type === 'cat') return 'walks';
    if (this.type === 'bird') return 'flies';
  }
}
```

### After - Polymorphism
```typescript
abstract class Animal {
  abstract makeSound(): string;
  abstract move(): string;
}

class Dog extends Animal {
  makeSound() { return 'Woof'; }
  move() { return 'runs'; }
}

class Cat extends Animal {
  makeSound() { return 'Meow'; }
  move() { return 'walks'; }
}

class Bird extends Animal {
  makeSound() { return 'Tweet'; }
  move() { return 'flies'; }
}
```

## Metrics Improvement Examples

### Cyclomatic Complexity Reduction
```typescript
// Before: Complexity = 12
function getDiscount(user, amount) {
  if (user.isPremium) {
    if (amount > 1000) {
      if (user.yearsActive > 5) return 0.25;
      else if (user.yearsActive > 2) return 0.20;
      else return 0.15;
    } else if (amount > 500) {
      return 0.10;
    } else {
      return 0.05;
    }
  } else {
    if (amount > 500) return 0.05;
    else return 0;
  }
}

// After: Complexity = 3 (per function)
function getDiscount(user, amount) {
  if (user.isPremium) return getPremiumDiscount(user, amount);
  return getStandardDiscount(amount);
}

function getPremiumDiscount(user, amount) {
  if (amount <= 500) return 0.05;
  if (amount <= 1000) return 0.10;
  return getLargeOrderDiscount(user.yearsActive);
}

function getLargeOrderDiscount(yearsActive) {
  if (yearsActive > 5) return 0.25;
  if (yearsActive > 2) return 0.20;
  return 0.15;
}

function getStandardDiscount(amount) {
  return amount > 500 ? 0.05 : 0;
}
```
