# Advanced Code Refactoring Reference

## Design Patterns Quick Reference

### Creational Patterns

#### Factory Pattern
**Purpose**: Create objects without specifying exact class
**Use When**: Object creation logic is complex or needs to be centralized
```typescript
interface Product { use(): void; }
class ConcreteProductA implements Product { use() { /* ... */ } }
class ConcreteProductB implements Product { use() { /* ... */ } }

class ProductFactory {
  create(type: string): Product {
    if (type === 'A') return new ConcreteProductA();
    if (type === 'B') return new ConcreteProductB();
    throw new Error('Unknown type');
  }
}
```

#### Builder Pattern
**Purpose**: Construct complex objects step by step
**Use When**: Object has many optional parameters
```typescript
class QueryBuilder {
  private query = { select: [], where: [], orderBy: [] };

  select(fields: string[]) { this.query.select = fields; return this; }
  where(condition: string) { this.query.where.push(condition); return this; }
  orderBy(field: string) { this.query.orderBy.push(field); return this; }
  build() { return this.query; }
}

// Usage
const query = new QueryBuilder()
  .select(['id', 'name'])
  .where('age > 18')
  .orderBy('name')
  .build();
```

#### Singleton Pattern
**Purpose**: Ensure only one instance exists
**Use When**: Need exactly one instance (database connection, config)
```typescript
class Database {
  private static instance: Database;
  private constructor() { /* ... */ }

  static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }
}
```

### Structural Patterns

#### Adapter Pattern
**Purpose**: Convert interface of a class into another interface
**Use When**: Want to use existing class with incompatible interface
```typescript
interface ModernAPI { requestData(): Promise<Data>; }
class LegacyAPI { getData(callback: Function): void { /* ... */ } }

class LegacyAdapter implements ModernAPI {
  constructor(private legacy: LegacyAPI) {}

  requestData(): Promise<Data> {
    return new Promise((resolve) => {
      this.legacy.getData(resolve);
    });
  }
}
```

#### Decorator Pattern
**Purpose**: Add behavior to objects dynamically
**Use When**: Need to add functionality without subclassing
```typescript
interface Coffee { cost(): number; description(): string; }
class SimpleCoffee implements Coffee {
  cost() { return 5; }
  description() { return 'Simple coffee'; }
}

class MilkDecorator implements Coffee {
  constructor(private coffee: Coffee) {}
  cost() { return this.coffee.cost() + 2; }
  description() { return this.coffee.description() + ', milk'; }
}

const coffee = new MilkDecorator(new SimpleCoffee());
```

#### Facade Pattern
**Purpose**: Provide simplified interface to complex subsystem
**Use When**: System is complex and you want simpler interface
```typescript
class ComplexSystemA { operationA(): void { /* ... */ } }
class ComplexSystemB { operationB(): void { /* ... */ } }
class ComplexSystemC { operationC(): void { /* ... */ } }

class Facade {
  constructor(
    private systemA: ComplexSystemA,
    private systemB: ComplexSystemB,
    private systemC: ComplexSystemC
  ) {}

  simpleOperation(): void {
    this.systemA.operationA();
    this.systemB.operationB();
    this.systemC.operationC();
  }
}
```

### Behavioral Patterns

#### Strategy Pattern
**Purpose**: Define family of algorithms, make them interchangeable
**Use When**: Need different variants of an algorithm
```typescript
interface SortStrategy { sort(data: number[]): number[]; }
class QuickSort implements SortStrategy { sort(data) { /* ... */ } }
class MergeSort implements SortStrategy { sort(data) { /* ... */ } }

class Sorter {
  constructor(private strategy: SortStrategy) {}
  sort(data: number[]) { return this.strategy.sort(data); }
}
```

#### Observer Pattern
**Purpose**: Define one-to-many dependency between objects
**Use When**: Need to notify multiple objects of state changes
```typescript
interface Observer { update(data: any): void; }

class Subject {
  private observers: Observer[] = [];

  attach(observer: Observer) { this.observers.push(observer); }
  detach(observer: Observer) { /* remove */ }
  notify(data: any) { this.observers.forEach(o => o.update(data)); }
}
```

#### Command Pattern
**Purpose**: Encapsulate request as an object
**Use When**: Need to parameterize, queue, or log operations
```typescript
interface Command { execute(): void; undo(): void; }

class CopyCommand implements Command {
  execute() { /* copy logic */ }
  undo() { /* undo copy */ }
}

class CommandInvoker {
  private history: Command[] = [];

  execute(command: Command) {
    command.execute();
    this.history.push(command);
  }

  undo() {
    const command = this.history.pop();
    command?.undo();
  }
}
```

## SOLID Principles Detailed

### Single Responsibility Principle (SRP)
**Definition**: A class should have one, and only one, reason to change

**Bad Example**:
```typescript
class User {
  save() { /* database logic */ }
  sendEmail() { /* email logic */ }
  generateReport() { /* reporting logic */ }
}
```

**Good Example**:
```typescript
class User { /* just user data */ }
class UserRepository { save(user: User) { /* database */ } }
class EmailService { send(user: User) { /* email */ } }
class ReportGenerator { generate(user: User) { /* report */ } }
```

### Open/Closed Principle (OCP)
**Definition**: Open for extension, closed for modification

**Bad Example**:
```typescript
class Rectangle { width: number; height: number; }
class Circle { radius: number; }

class AreaCalculator {
  calculate(shapes: any[]) {
    let area = 0;
    shapes.forEach(shape => {
      if (shape instanceof Rectangle) {
        area += shape.width * shape.height;
      } else if (shape instanceof Circle) {
        area += Math.PI * shape.radius ** 2;
      }
      // Need to modify this class for new shapes!
    });
    return area;
  }
}
```

**Good Example**:
```typescript
interface Shape { area(): number; }

class Rectangle implements Shape {
  constructor(private width: number, private height: number) {}
  area() { return this.width * this.height; }
}

class Circle implements Shape {
  constructor(private radius: number) {}
  area() { return Math.PI * this.radius ** 2; }
}

class AreaCalculator {
  calculate(shapes: Shape[]) {
    return shapes.reduce((sum, shape) => sum + shape.area(), 0);
  }
  // No modification needed for new shapes!
}
```

### Liskov Substitution Principle (LSP)
**Definition**: Derived classes must be substitutable for base classes

**Bad Example**:
```typescript
class Bird {
  fly() { /* fly logic */ }
}

class Penguin extends Bird {
  fly() { throw new Error('Cannot fly'); } // Violates LSP!
}
```

**Good Example**:
```typescript
class Bird { eat() { /* ... */ } }
class FlyingBird extends Bird { fly() { /* ... */ } }
class Penguin extends Bird { swim() { /* ... */ } }
```

### Interface Segregation Principle (ISP)
**Definition**: Clients shouldn't depend on interfaces they don't use

**Bad Example**:
```typescript
interface Worker {
  work(): void;
  eat(): void;
  sleep(): void;
}

class Robot implements Worker {
  work() { /* ... */ }
  eat() { throw new Error('Robots dont eat'); } // Forced to implement!
  sleep() { throw new Error('Robots dont sleep'); }
}
```

**Good Example**:
```typescript
interface Workable { work(): void; }
interface Eatable { eat(): void; }
interface Sleepable { sleep(): void; }

class Human implements Workable, Eatable, Sleepable {
  work() { /* ... */ }
  eat() { /* ... */ }
  sleep() { /* ... */ }
}

class Robot implements Workable {
  work() { /* ... */ }
}
```

### Dependency Inversion Principle (DIP)
**Definition**: Depend on abstractions, not concretions

**Bad Example**:
```typescript
class MySQLDatabase {
  save(data: any) { /* MySQL specific */ }
}

class UserService {
  private db = new MySQLDatabase(); // Concrete dependency!

  createUser(data: any) {
    this.db.save(data);
  }
}
```

**Good Example**:
```typescript
interface Database {
  save(data: any): Promise<void>;
}

class MySQLDatabase implements Database {
  save(data: any) { /* MySQL specific */ }
}

class PostgresDatabase implements Database {
  save(data: any) { /* Postgres specific */ }
}

class UserService {
  constructor(private db: Database) {} // Abstraction!

  createUser(data: any) {
    this.db.save(data);
  }
}
```

## Code Smells & Refactorings

### Long Method
**Smell**: Method has too many lines (>20-30)
**Refactoring**: Extract Method
- Break into smaller, well-named methods
- Each method should do one thing

### Large Class
**Smell**: Class has too many responsibilities
**Refactoring**: Extract Class, Extract Subclass
- Identify separate responsibilities
- Create new classes for each

### Long Parameter List
**Smell**: Method takes many parameters (>3-4)
**Refactoring**: Introduce Parameter Object
- Group related parameters into object
- Pass object instead of individual parameters

### Duplicated Code
**Smell**: Same code structure in multiple places
**Refactoring**: Extract Method, Pull Up Method
- Extract duplicated code into shared method
- Place in common location

### Feature Envy
**Smell**: Method uses more features of another class
**Refactoring**: Move Method
- Move method to the class it's envious of

### Primitive Obsession
**Smell**: Using primitives instead of small objects
**Refactoring**: Replace Data Value with Object
```typescript
// Before
function distance(x1: number, y1: number, x2: number, y2: number) { /* ... */ }

// After
class Point { constructor(public x: number, public y: number) {} }
function distance(p1: Point, p2: Point) { /* ... */ }
```

### Switch Statements
**Smell**: Complex switch/if-else chains
**Refactoring**: Replace Conditional with Polymorphism
- Create subclass for each case
- Use polymorphic behavior instead

## Refactoring Checklist

Before refactoring:
- [ ] Ensure comprehensive test coverage exists
- [ ] All tests are passing
- [ ] Understand the code's current behavior
- [ ] Identify specific code smells or issues
- [ ] Plan the refactoring approach
- [ ] Commit current working state

During refactoring:
- [ ] Make small, incremental changes
- [ ] Run tests after each change
- [ ] Commit frequently with clear messages
- [ ] Don't add features while refactoring
- [ ] Keep system fully functional at all times

After refactoring:
- [ ] All tests still pass
- [ ] Code is more readable
- [ ] Complexity reduced (measured)
- [ ] No duplication
- [ ] Documentation updated
- [ ] Performance maintained or improved
- [ ] Peer review conducted
