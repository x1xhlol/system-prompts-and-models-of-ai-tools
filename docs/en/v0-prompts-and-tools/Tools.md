## Tools.json

```json
{
  "tools": [
    {
      "name": "FetchFromWeb",
      "description": "Fetches full text content from web pages when you have specific URLs to read. Returns clean, parsed text with metadata.\n\n**When to use:**\n• **Known URLs** - You have specific pages/articles you need to read completely\n• **Deep content analysis** - Need full text, not just search result snippets  \n• **Documentation reading** - External docs, tutorials, or reference materials\n• **Follow-up research** - After web search, fetch specific promising results\n\n**What you get:**\n• Complete page text content (cleaned and parsed)\n• Metadata: title, author, published date, favicon, images\n• Multiple URLs processed in single request\n\n**vs SearchWeb:** Use this when you know exactly which URLs to read; use SearchWeb to find URLs first.",
      "parameters": {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "type": "object",
        "properties": {
          "urls": {
            "type": "array",
            "items": {
              "type": "string"
            },
            "description": "URLs to fetch full text content from. Works with any publicly accessible web page.\n\n**Use when you need:**\n• Full article or document text (not just search snippets)\n• Specific content from known URLs\n• Complete documentation pages or tutorials\n• Detailed information that requires reading the entire page\n\n**Examples:**\n• [\"https://nextjs.org/docs/app/building-your-application/routing\"]\n• [\"https://blog.example.com/article-title\", \"https://docs.example.com/api-reference\"]"
          },
          "taskNameActive": {
            "type": "string",
            "description": "2-5 words describing the task when it is running. Will be shown in the UI. For example, \"Checking SF Weather\"."
          },
          "taskNameComplete": {
            "type": "string",
            "description": "2-5 words describing the task when it is complete. Will be shown in the UI. It should not signal success or failure, just that the task is done. For example, \"Looked up SF Weather\"."
          }
        },
        "required": [
          "urls",
          "taskNameActive",
          "taskNameComplete"
        ],
        "additionalProperties": false
      }
    },
    {
      "name": "GrepRepo",
      "description": "Searches for regex patterns within file contents across the repository. Returns matching lines with file paths and line numbers, perfect for code exploration and analysis.\n\nPrimary use cases:\n• Find function definitions: 'function\\s+myFunction' or 'const\\s+\\w+\\s*='\n• Locate imports/exports: 'import.*from' or 'export\\s+(default|\\{)'\n• Search for specific classes: 'class\\s+ComponentName' or 'interface\\s+\\w+'\n• Find API calls: 'fetch\\(' or 'api\\.(get|post)'\n• Discover configuration: 'process\\.env' or specific config keys\n• Track usage patterns: component names, variables, or method calls\n• Find specific text: 'User Admin' or 'TODO'\n\nSearch strategies:\n• Use glob patterns to focus on relevant file types (*.ts, *.jsx, src/**)\n• Combine with path filtering for specific directories\n• Start broad, then narrow down with more specific patterns\n• Remember: case-insensitive matching, max 200 results returned\n",
      "parameters": {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "type": "object",
        "properties": {
          "pattern": {
            "type": "string",
            "description": "The regular expression (regex) pattern to search for within file contents (e.g., 'function\\s+myFunction', 'import\\s+\\{.*\\}\\s+from\\s+.*')."
          },
          "path": {
            "type": "string",
            "description": "Optional: The absolute path to the directory to search within. If omitted, searches all the files."
          },
          "globPattern": {
            "type": "string",
            "description": "\nOptional: A glob pattern to filter which files are searched (e.g., '*.js', '*.{ts,tsx}', 'src/**'). If omitted, searches all files (respecting potential global ignores).\n"
          },
          "taskNameActive": {
            "type": "string",
            "description": "2-5 words describing the task when it is running. Will be shown in the UI. For example, \"Checking SF Weather\"."
          },
          "taskNameComplete": {
            "type": "string",
            "description": "2-5 words describing the task when it is complete. Will be shown in the UI. It should not signal success or failure, just that the task is done. For example, \"Looked up SF Weather\"."
          }
        },
        "required": [
          "pattern",
          "taskNameActive",
          "taskNameComplete"
        ],
        "additionalProperties": false
      }
    },
    {
      "name": "LSRepo",
      "description": "Lists files and directories in the repository. Returns file paths sorted alphabetically with optional pattern-based filtering.\n\nCommon use cases:\n• Explore repository structure and understand project layout\n• Find files in specific directories (e.g., 'src/', 'components/')\n• Locate configuration files, documentation, or specific file types\n• Get overview of available files before diving into specific areas\n\nTips:\n• Use specific paths to narrow down results (max 200 entries returned)\n• Combine with ignore patterns to exclude irrelevant files\n• Start with root directory to get project overview, then drill down\n",
      "parameters": {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "type": "object",
        "properties": {
          "path": {
            "type": "string",
            "description": "The absolute path to the directory to list (must be absolute, not relative)"
          },
          "globPattern": {
            "type": "string",
            "description": "\nOptional: A glob pattern to filter which files are listed (e.g., '*.js', '*.{ts,tsx}', 'src/**'). If omitted, lists all files.\n"
          },
          "ignore": {
            "type": "array",
            "items": {
              "type": "string"
            },
            "description": "List of glob patterns to ignore"
          },
          "taskNameActive": {
            "type": "string",
            "description": "2-5 words describing the task when it is running. Will be shown in the UI. For example, \"Checking SF Weather\"."
          },
          "taskNameComplete": {
            "type": "string",
            "description": "2-5 words describing the task when it is complete. Will be shown in the UI. It should not signal success or failure, just that the task is done. For example, \"Looked up SF Weather\"."
          }
        },
        "required": [
          "taskNameActive",
          "taskNameComplete"
        ],
        "additionalProperties": false
      }
    },
    {
      "name": "ReadFile",
      "description": "Reads file contents intelligently - returns complete files when small, paginated chunks, or targeted chunks when large based on your query.\n\n**How it works:**\n• **Small files** (≤2000 lines) - Returns complete content\n• **Large files** (>2000 lines) - Uses AI to find and return relevant chunks based on query\n• **Binary files** - Returns images, handles blob content appropriately\n• Any lines longer than 2000 characters are truncated for readability\n• Start line and end line can be provided to read specific sections of a file\n\n**When to use:**\n• **Before editing** - Always read files before making changes\n• **Understanding implementation** - How specific features or functions work\n• **Finding specific code** - Locate patterns, functions, or configurations in large files  \n• **Code analysis** - Understand structure, dependencies, or patterns\n\n**Query strategy:**\nBy default, you should avoid queries or pagination so you can collect the full context.\nIf you get a warning saying the file is too big, then you should be specific about what you're looking for - the more targeted your query, the better the relevant chunks returned.",
      "parameters": {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "type": "object",
        "properties": {
          "filePath": {
            "type": "string",
            "description": "The absolute path to the file to read (e.g., 'app/about/page.tsx'). Relative paths are not supported. You must provide an absolute path."
          },
          "query": {
            "type": "string",
            "description": "What you're looking for in the file. Required for large files (>2000 lines), optional for smaller files.\n\n**Query types:**\n• **Function/hook usage** - \"How is useAuth used?\" or \"Find all API calls\"\n• **Implementation details** - \"Authentication logic\" or \"error handling patterns\"\n• **Specific features** - \"Form validation\" or \"database queries\"\n• **Code patterns** - \"React components\" or \"TypeScript interfaces\"\n• **Configuration** - \"Environment variables\" or \"routing setup\"\n\n**Examples:**\n• \"Show me the error handling implementation\"\n• \"Locate form validation logic\""
          },
          "startLine": {
            "type": "number",
            "description": "Starting line number (1-based). Use grep results or estimated locations to target specific code sections."
          },
          "endLine": {
            "type": "number",
            "description": "Ending line number (1-based). Include enough lines to capture complete functions, classes, or logical code blocks."
          },
          "taskNameActive": {
            "type": "string",
            "description": "2-5 words describing the task when it is running. Will be shown in the UI. For example, \"Checking SF Weather\"."
          },
          "taskNameComplete": {
            "type": "string",
            "description": "2-5 words describing the task when it is complete. Will be shown in the UI. It should not signal success or failure, just that the task is done. For example, \"Looked up SF Weather\"."
          }
        },
        "required": [
          "filePath",
          "taskNameActive",
          "taskNameComplete"
        ],
        "additionalProperties": false
      }
    },
    {
      "name": "InspectSite",
      "description": "Takes screenshots to verify user-reported visual bugs or capture reference designs from live websites for recreation.\n\n**Use for:**\n• **Visual bug verification** - When users report layout issues, misaligned elements, or styling problems\n• **Website recreation** - Capturing reference designs (e.g., \"recreate Nike homepage\", \"copy Stripe's pricing page\")\n\n**Technical:** Converts localhost URLs to preview URLs, optimizes screenshot sizes, supports multiple URLs.",
      "parameters": {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "type": "object",
        "properties": {
          "urls": {
            "type": "array",
            "items": {
              "type": "string"
            },
            "description": "URLs to capture screenshots of. Supports both live websites and local development servers.\n\n**Supported URL types:**\n• **Live websites**: \"https://example.com\", \"https://app.vercel.com/dashboard\"\n• **Local development**: \"http://localhost:3000\" (auto-converted to CodeProject preview URLs)\n• **Specific pages**: Include full paths like \"https://myapp.com/dashboard\" or \"localhost:3000/products\"\n\n**Best practices:**\n• Use specific page routes rather than just homepage for targeted inspection\n• Include localhost URLs to verify your CodeProject preview is working\n• Multiple URLs can be captured in a single request for comparison"
          },
          "taskNameActive": {
            "type": "string",
            "description": "2-5 words describing the task when it is running. Will be shown in the UI. For example, \"Checking SF Weather\"."
          },
          "taskNameComplete": {
            "type": "string",
            "description": "2-5 words describing the task when it is complete. Will be shown in the UI. It should not signal success or failure, just that the task is done. For example, \"Looked up SF Weather\"."
          }
        },
        "required": [
          "urls",
          "taskNameActive",
          "taskNameComplete"
        ],
        "additionalProperties": false
      }
    },
    {
      "name": "SearchWeb",
      "description": "Performs intelligent web search using high-quality sources and returns comprehensive, cited answers. Prioritizes first-party documentation for Vercel ecosystem products.\n\nPrimary use cases:\n- Technology documentation - Latest features, API references, configuration guides\n- Current best practices - Up-to-date development patterns and recommendations  \n- Product-specific information - Vercel, Next.js, AI SDK, and ecosystem tools\n- Version-specific details - New releases, breaking changes, migration guides\n- External integrations - Third-party service setup, authentication flows\n- Current events - Recent developments in web development, framework updates\n\nWhen to use:\n- User explicitly requests web search or external information\n- Questions about Vercel products (REQUIRED for accuracy)\n- Information likely to be outdated in training data\n- Technical details not available in current codebase\n- Comparison of tools, frameworks, or approaches\n- Looking up error messages, debugging guidance, or troubleshooting\n\nSearch strategy:\n- Make multiple targeted searches for comprehensive coverage\n- Use specific version numbers and product names for precision\n- Leverage first-party sources (isFirstParty: true) for Vercel ecosystem queries",
      "parameters": {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "type": "object",
        "properties": {
          "query": {
            "type": "string",
            "description": "The search query to perform on the web. Be specific and targeted for best results.\n\nExamples:\n- \"Next.js 15 app router features\" - for specific technology versions/features\n- \"Vercel deployment environment variables\" - for product-specific documentation\n- \"React server components best practices 2025\" - for current best practices\n- \"Tailwind CSS grid layouts\" - for specific implementation guidance\n- \"TypeScript strict mode configuration\" - for detailed technical setup"
          },
          "isFirstParty": {
            "type": "boolean",
            "description": "Enable high-quality first-party documentation search - Set to true when querying Vercel ecosystem products for faster, more accurate, and up-to-date information from curated knowledge bases.\n\nAlways use isFirstParty: true for:\n- Core Vercel Products: Next.js, Vercel platform, deployment features, environment variables\n- Development Tools: Turborepo, Turbopack, Vercel CLI, Vercel Toolbar\n- AI/ML Products: AI SDK, v0, AI Gateway, Workflows, Fluid Compute\n- Framework Support: Nuxt, Svelte, SvelteKit integrations\n- Platform Features: Vercel Marketplace, Vercel Queues, analytics, monitoring\n\nSupported domains: [nextjs.org, turbo.build, vercel.com, sdk.vercel.ai, svelte.dev, react.dev, tailwindcss.com, typescriptlang.org, ui.shadcn.com, radix-ui.com, authjs.dev, date-fns.org, orm.drizzle.team, playwright.dev, remix.run, vitejs.dev, www.framer.com, www.prisma.io, vuejs.org, community.vercel.com, supabase.com, upstash.com, neon.tech, v0.app, docs.edg.io, docs.stripe.com, effect.website, flags-sdk.dev]\n\nWhy use first-party search:\n- Higher accuracy than general web search for Vercel ecosystem\n- Latest feature updates and API changes\n- Official examples and best practices\n- Comprehensive troubleshooting guides\n\nREQUIREMENT: You MUST use SearchWeb with isFirstParty: true when any Vercel product is mentioned to ensure accurate, current information."
          },
          "taskNameActive": {
            "type": "string",
            "description": "2-5 words describing the task when it is running. Will be shown in the UI. For example, \"Checking SF Weather\"."
          },
          "taskNameComplete": {
            "type": "string",
            "description": "2-5 words describing the task when it is complete. Will be shown in the UI. It should not signal success or failure, just that the task is done. For example, \"Looked up SF Weather\"."
          }
        },
        "required": [
          "query",
          "taskNameActive",
          "taskNameComplete"
        ],
        "additionalProperties": false
      }
    },
    {
      "name": "TodoManager",
      "description": "Manages structured todo lists for complex, multi-step projects. Tracks progress through milestone-level tasks and generates technical implementation plans.\n\n**Core workflow:**\n1. **set_tasks** - Break project into 3-7 milestone tasks (distinct systems, major features, integrations)\n2. **move_to_task** - Complete current work, focus on next task\n\n**Task guidelines:**\n• **Milestone-level tasks** - \"Build Homepage\", \"Setup Auth\", \"Add Database\" (not micro-steps)\n• **One page = one task** - Don't break single pages into multiple tasks\n• **UI before backend** - Scaffold pages first, then add data/auth/integrations\n• **≤10 tasks total** - Keep focused and manageable\n• **NO vague tasks** - Never use \"Polish\", \"Test\", \"Finalize\", or other meaningless fluff\n\n**When to use:**\n• Projects with multiple distinct systems that need to work together\n• Apps requiring separate user-facing and admin components  \n• Complex integrations with multiple independent features\n\n**When NOT to use:**\n• Single cohesive builds (even if complex) - landing pages, forms, components\n• Trivial or single-step tasks\n• Conversational/informational requests\n\n**Examples:**\n\n• **Multiple Systems**: \"Build a waitlist form with auth-protected admin dashboard\"\n  → \"Get Database Integration, Create Waitlist Form, Build Admin Dashboard, Setup Auth Protection\"\n\n• **App with Distinct Features**: \"Create a recipe app with user accounts and favorites\"\n  → \"Setup Authentication, Build Recipe Browser, Create User Profiles, Add Favorites System\"\n\n• **Complex Integration**: \"Add user-generated content with moderation to my site\"\n  → \"Get Database Integration, Create Content Submission, Build Moderation Dashboard, Setup User Management\"\n\n• **Skip TodoManager**: \"Build an email SaaS landing page\" or \"Add a contact form\" or \"Create a pricing section\"\n  → Skip todos - single cohesive components, just build directly",
      "parameters": {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "type": "object",
        "properties": {
          "action": {
            "type": "string",
            "enum": [
              "add_task",
              "set_tasks",
              "mark_all_done",
              "move_to_task",
              "read_list"
            ],
            "description": "Todo management action for complex, multi-step tasks:\n\n**Core actions:**\n• **set_tasks** - Create initial task breakdown (max 7 milestone-level tasks)\n• **move_to_task** - Complete current work and focus on next specific task\n• **add_task** - Add single task to existing list\n\n**Utility actions:**\n• **read_list** - View current todo list without changes\n• **mark_all_done** - Complete all tasks (project finished)\n\n**When to use:** Multi-step projects, complex implementations, tasks requiring 3+ steps. Skip for trivial or single-step tasks."
          },
          "tasks": {
            "type": "array",
            "items": {
              "type": "string"
            },
            "description": "Complete task list for set_tasks. First becomes in-progress, rest todo."
          },
          "task": {
            "type": "string",
            "description": "Task description for add_task. Use milestone-level tasks, not micro-steps."
          },
          "moveToTask": {
            "type": "string",
            "description": "Exact task name to focus on for move_to_task. Marks all prior tasks as done."
          },
          "taskNameActive": {
            "type": "string",
            "description": "2-5 words describing the task when it is running. Will be shown in the UI. For example, \"Checking SF Weather\"."
          },
          "taskNameComplete": {
            "type": "string",
            "description": "2-5 words describing the task when it is complete. Will be shown in the UI. It should not signal success or failure, just that the task is done. For example, \"Looked up SF Weather\"."
          }
        },
        "required": [
          "action",
          "taskNameActive",
          "taskNameComplete"
        ],
        "additionalProperties": false
      }
    },
    {
      "name": "SearchRepo",
      "description": "Launches a new agent that searches and explores the codebase using multiple search strategies (grep, file listing, content reading). \n\nReturns relevant files and contextual information to answer queries about code structure, functionality, and content.\n\n**Core capabilities:**\n- File discovery and content analysis across the entire repository\n- Pattern matching with regex search for specific code constructs\n- Directory exploration and project structure understanding\n- Intelligent file selection and content extraction with chunking for large files\n- Contextual answers combining search results with code analysis\n\n**When to use:**\n- **Architecture exploration** - Understanding project structure, dependencies, and patterns\n- **Refactoring preparation** - Finding all instances of functions, components, or patterns\n- Delegate to subagents when the task clearly benefits from a separate agent with a new context window\n",
      "parameters": {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "type": "object",
        "properties": {
          "query": {
            "type": "string",
            "description": "Describe what you're looking for in the codebase. Can be comma separated files, code patterns, functionality, or general exploration tasks.\n\nQuery types:\n- **Read Multiple Files**: \"components/ui/button.tsx, utils/api.ts\"\n- **Functionality search**: \"authentication logic\", \"database connection setup\", \"API endpoints for user management\"\n- **Code patterns**: \"React components using useState\", \"error handling patterns\"\n- **Refactoring tasks**: \"find all usages of getCurrentUser function\", \"locate styling for buttons\", \"config files and environment setup\"\n- **Architecture exploration**: \"routing configuration\", \"state management patterns\"\n- **Getting to know the codebase structure**: \"Give me an overview of the codebase\" (EXACT PHRASE) - **START HERE when you don't know the codebase or where to begin**"
          },
          "goal": {
            "type": "string",
            "description": "Brief context (1-3 sentences) about why you're searching and what you plan to do with the results.\n\nExamples:\n- \"I need to understand the authentication flow to add OAuth support.\"\n- \"I'm looking for all database interactions to optimize queries.\"\n"
          },
          "taskNameActive": {
            "type": "string",
            "description": "2-5 words describing the task when it is running. Will be shown in the UI. For example, \"Checking SF Weather\"."
          },
          "taskNameComplete": {
            "type": "string",
            "description": "2-5 words describing the task when it is complete. Will be shown in the UI. It should not signal success or failure, just that the task is done. For example, \"Looked up SF Weather\"."
          }
        },
        "required": [
          "query",
          "taskNameActive",
          "taskNameComplete"
        ],
        "additionalProperties": false
      }
    },
    {
      "name": "GenerateDesignInspiration",
      "description": "Generate design inspiration to ensure your generations are visually appealing. \n\nWhen to use:\n- Vague design requests - User asks for \"a nice landing page\" or \"modern dashboard\"\n- Creative enhancement needed - Basic requirements need visual inspiration and specificity\n- Design direction required - No clear aesthetic, color scheme, or visual style provided\n- Complex UI/UX projects - Multi-section layouts, branding, or user experience flows\n\nSkip when:\n- Backend/API work - No visual design components involved\n- Minor styling tweaks - Simple CSS changes or small adjustments\n- Design already detailed - User has specific mockups, wireframes, or detailed requirements\n\nImportant: If you generate a design brief, you MUST follow it.",
      "parameters": {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "type": "object",
        "properties": {
          "goal": {
            "type": "string",
            "description": "High-level product / feature or UX goal."
          },
          "context": {
            "type": "string",
            "description": "Optional design cues, brand adjectives, constraints."
          },
          "taskNameActive": {
            "type": "string",
            "description": "2-5 words describing the task when it is running. Will be shown in the UI. For example, \"Checking SF Weather\"."
          },
          "taskNameComplete": {
            "type": "string",
            "description": "2-5 words describing the task when it is complete. Will be shown in the UI. It should not signal success or failure, just that the task is done. For example, \"Looked up SF Weather\"."
          }
        },
        "required": [
          "goal",
          "taskNameActive",
          "taskNameComplete"
        ],
        "additionalProperties": false
      }
    },
    {
      "name": "GetOrRequestIntegration",
      "description": "Checks integration status, retrieves environment variables, and gets live database schemas. Automatically requests missing integrations from users before proceeding.\n\n**What it provides:**\n• **Integration status** - Connected services and configuration state\n• **Environment variables** - Available project env vars and missing requirements\n• **Live database schemas** - Real-time table/column info for SQL integrations (Supabase, Neon, etc.)\n• **Integration examples** - Links to example code templates when available\n\n**When to use:**\n• **Before building integration features** - Auth, payments, database operations, API calls\n• **Debugging integration issues** - Missing env vars, connection problems, schema mismatches\n• **Project discovery** - Understanding what services are available to work with\n• **Database schema needed** - Before writing SQL queries or ORM operations\n\n**Key behavior:**\nStops execution and requests user setup for missing integrations, ensuring all required services are connected before code generation.",
      "parameters": {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "type": "object",
        "properties": {
          "names": {
            "type": "array",
            "items": {
              "type": "string",
              "enum": [
                "Supabase",
                "Neon",
                "Upstash for Redis",
                "Upstash Search",
                "Blob",
                "Groq",
                "Grok",
                "fal",
                "Deep Infra",
                "Stripe"
              ]
            },
            "description": "Specific integration names to check or request. Omit to get overview of all connected integrations and environment variables.\n\n**When to specify integrations:**\n• User wants to build something requiring specific services (auth, database, payments)\n• Need database schema for SQL integrations (Supabase, Neon, PlanetScale)\n• Checking if required integrations are properly configured\n• Before implementing integration-dependent features\n\n**Available integrations:** Supabase, Neon, Upstash for Redis, Upstash Search, Blob, Groq, Grok, fal, Deep Infra, Stripe\n\n**Examples:**\n• [\"Supabase\"] - Get database schema and check auth setup\n• [] or omit - Get overview of all connected integrations and env vars"
          },
          "taskNameActive": {
            "type": "string",
            "description": "2-5 words describing the task when it is running. Will be shown in the UI. For example, \"Checking SF Weather\"."
          },
          "taskNameComplete": {
            "type": "string",
            "description": "2-5 words describing the task when it is complete. Will be shown in the UI. It should not signal success or failure, just that the task is done. For example, \"Looked up SF Weather\"."
          }
        },
        "required": [
          "taskNameActive",
          "taskNameComplete"
        ],
        "additionalProperties": false
      }
    }
  ]
}
```