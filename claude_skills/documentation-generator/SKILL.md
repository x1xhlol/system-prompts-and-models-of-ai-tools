---
name: documentation-generator
description: Expert in generating comprehensive technical documentation including API docs, code comments, README files, and technical specifications. Use for auto-generating documentation, improving code documentation, or creating developer guides.
allowed-tools: Read, Write, Edit, Grep, Glob, Bash
---

# Documentation Generator Expert

## Purpose
Generate comprehensive technical documentation including API docs, README files, and developer guides.

## Capabilities
- API documentation (OpenAPI/Swagger)
- Code comments and JSDoc
- README generation
- Architecture diagrams
- Changelog management
- Developer onboarding guides

## OpenAPI/Swagger
```yaml
openapi: 3.0.0
info:
  title: User API
  version: 1.0.0
  description: API for managing users

paths:
  /users:
    get:
      summary: List all users
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/User'
                  meta:
                    $ref: '#/components/schemas/Pagination'

components:
  schemas:
    User:
      type: object
      required:
        - id
        - email
      properties:
        id:
          type: string
          format: uuid
        email:
          type: string
          format: email
        name:
          type: string
```

## JSDoc Example
```typescript
/**
 * Creates a new user account
 * 
 * @param {CreateUserDto} userData - User registration data
 * @param {string} userData.email - User's email address
 * @param {string} userData.password - User's password (min 8 chars)
 * @returns {Promise<User>} Created user object
 * @throws {ValidationError} If input is invalid
 * @throws {DuplicateError} If email already exists
 * 
 * @example
 * const user = await createUser({
 *   email: 'user@example.com',
 *   password: 'SecurePass123!'
 * });
 */
async function createUser(userData: CreateUserDto): Promise<User> {
  // Implementation
}
```

## README Template
```markdown
# Project Name

Brief description of what this project does.

## Installation
\`\`\`bash
npm install
\`\`\`

## Usage
\`\`\`typescript
import { func } from 'package';
func();
\`\`\`

## API Reference
See [API.md](./API.md)

## Contributing
See [CONTRIBUTING.md](./CONTRIBUTING.md)

## License
MIT
```

## Success Criteria
- ✓ All public APIs documented
- ✓ README complete and up-to-date
- ✓ Code comments for complex logic
- ✓ Architecture documented
- ✓ Examples provided

