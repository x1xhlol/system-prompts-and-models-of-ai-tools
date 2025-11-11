---
name: advanced-code-refactoring
description: Expert-level code refactoring applying SOLID principles, design patterns, and architectural improvements. Use when refactoring legacy code, improving code structure, applying design patterns, or modernizing codebases.
allowed-tools: Read, Write, Edit, Grep, Glob, Bash
---

# Advanced Code Refactoring Expert

## Purpose
This skill enables deep, architectural-level code refactoring with a focus on maintainability, scalability, and best practices. It applies proven design patterns, SOLID principles, and modern architectural approaches.

## When to Use
- Refactoring legacy or monolithic code
- Applying design patterns (Factory, Strategy, Observer, etc.)
- Improving code modularity and separation of concerns
- Extracting duplicated code into reusable utilities
- Converting imperative code to declarative patterns
- Modernizing codebases (callbacks → promises → async/await)
- Improving testability through dependency injection

## Capabilities

### 1. **Design Pattern Application**
- **Creational**: Factory, Builder, Singleton, Prototype
- **Structural**: Adapter, Decorator, Facade, Proxy
- **Behavioral**: Strategy, Observer, Command, Template Method

### 2. **SOLID Principles**
- **S**ingle Responsibility: One class, one reason to change
- **O**pen/Closed: Open for extension, closed for modification
- **L**iskov Substitution: Subtypes must be substitutable
- **I**nterface Segregation: Many specific interfaces over one general
- **D**ependency Inversion: Depend on abstractions, not concretions

### 3. **Architectural Improvements**
- Extract Service Layer from Controllers
- Implement Repository Pattern for data access
- Create Domain-Driven Design (DDD) boundaries
- Separate Business Logic from Infrastructure
- Apply Clean Architecture / Hexagonal Architecture

### 4. **Code Smell Detection & Resolution**
- Long methods → Extract method/class
- Large classes → Split responsibilities
- Duplicated code → Extract common utilities
- Feature envy → Move method to appropriate class
- Primitive obsession → Create value objects
- Switch statements → Replace with polymorphism

## Workflow

1. **Analyze Current Code**
   - Identify code smells and anti-patterns
   - Map dependencies and coupling
   - Find duplicated logic
   - Assess testability

2. **Design Refactoring Plan**
   - Choose appropriate patterns
   - Define new abstractions
   - Plan incremental changes
   - Identify breaking changes

3. **Execute Refactoring**
   - Preserve existing tests (or create them first)
   - Make small, incremental changes
   - Run tests after each change
   - Update documentation

4. **Verify Improvements**
   - All tests pass
   - Code coverage maintained or improved
   - Complexity metrics improved
   - No regression in functionality

## Best Practices

- **Test First**: Ensure comprehensive tests exist before refactoring
- **Small Steps**: Make incremental changes, not massive rewrites
- **Preserve Behavior**: Refactoring should not change functionality
- **Measure Impact**: Use metrics (cyclomatic complexity, coupling, cohesion)
- **Document Decisions**: Explain why patterns were chosen
- **Review Thoroughly**: Refactoring requires careful code review

## Tools & Techniques

### Static Analysis
- ESLint, TSLint, Prettier (JavaScript/TypeScript)
- Pylint, Black, mypy (Python)
- RuboCop (Ruby)
- SonarQube (Multi-language)

### Complexity Metrics
- Cyclomatic Complexity (McCabe)
- Cognitive Complexity
- Lines of Code (LOC)
- Coupling Between Objects (CBO)
- Lack of Cohesion in Methods (LCOM)

### Refactoring Patterns
```typescript
// Before: Long method with multiple responsibilities
function processOrder(order) {
  // Validation (20 lines)
  // Price calculation (30 lines)
  // Inventory update (25 lines)
  // Email notification (15 lines)
}

// After: Single Responsibility
function processOrder(order) {
  const validator = new OrderValidator();
  const calculator = new PriceCalculator();
  const inventory = new InventoryService();
  const notifier = new EmailNotifier();

  validator.validate(order);
  const total = calculator.calculate(order);
  inventory.update(order);
  notifier.sendConfirmation(order);
}
```

## Configuration

Refactoring follows these priorities:
1. **Safety**: Never break existing functionality
2. **Clarity**: Code should be more readable after refactoring
3. **Testability**: Improve test coverage and ease of testing
4. **Performance**: Maintain or improve performance
5. **Maintainability**: Reduce future maintenance burden

## Dependencies
- Testing framework (Jest, pytest, RSpec, etc.)
- Linter configured for project
- Type checker (TypeScript, mypy, etc.) if applicable

## Success Criteria
- ✓ All existing tests pass
- ✓ Code complexity reduced (measured)
- ✓ Duplication eliminated or minimized
- ✓ Design patterns appropriately applied
- ✓ SOLID principles followed
- ✓ Documentation updated
- ✓ No performance regressions
