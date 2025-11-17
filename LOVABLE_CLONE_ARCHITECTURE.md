# Lovable Clone - Kiến trúc Toàn diện

> **Mục tiêu**: Xây dựng AI-powered code generation platform tương tự Lovable với chat interface, live preview, và agent system

---

## 📋 Tổng quan Hệ thống

### Tech Stack Core
```
Frontend:         React 18 + TypeScript + Vite
Styling:          Tailwind CSS + shadcn/ui
State Management: Zustand / Jotai
Backend:          Node.js + Express / Fastify
Database:         PostgreSQL + Prisma / Supabase
AI/LLM:           OpenAI GPT-4 / Anthropic Claude / Custom Model
Real-time:        WebSocket (Socket.io)
Container:        WebContainer (StackBlitz) hoặc Docker
```

---

## 🏗️ I. AI LAYER (Lớp Trí tuệ Nhân tạo)

### 1. **Requirement Parser** (Phân tích Yêu cầu)

**Chức năng:**
- Parse user messages thành structured requirements
- Phân loại intent: code generation, debugging, refactoring, explanation
- Extract entities: components, features, technologies, design preferences

**Tech Stack:**
```typescript
// libraries
- langchain / llamaindex: Orchestration
- zod: Schema validation
- natural: NLP utilities (optional)

// AI Models
- GPT-4-turbo / Claude 3.5 Sonnet (main)
- GPT-3.5-turbo (classification)
```

**Implementation:**
```typescript
interface ParsedRequirement {
  intent: 'generate' | 'modify' | 'debug' | 'explain';
  entities: {
    components: string[];
    features: string[];
    techStack: string[];
    designPreferences?: DesignTokens;
  };
  complexity: 'simple' | 'medium' | 'complex';
  dependencies: string[];
}

class RequirementParser {
  async parse(userMessage: string, context: ConversationContext): Promise<ParsedRequirement> {
    // 1. Use LLM with structured output
    // 2. Extract entities
    // 3. Determine intent and complexity
    // 4. Return parsed structure
  }
}
```

---

### 2. **UI Section Generator** (Tạo UI Sections)

**Chức năng:**
- Generate semantic HTML structure
- Create component hierarchy
- Apply design system tokens
- Ensure responsive layout

**Tech Stack:**
```typescript
// Core
- AI Model với prompt engineering đặc biệt
- Template system (handlebars/nunjucks)
- AST parser (babel/typescript)
```

**Implementation:**
```typescript
interface UISection {
  type: 'hero' | 'feature' | 'testimonial' | 'cta' | 'form' | 'gallery' | 'custom';
  layout: 'grid' | 'flex' | 'stack';
  components: ComponentSpec[];
  designTokens: DesignTokens;
  responsive: ResponsiveConfig;
}

class UISectionGenerator {
  async generate(requirement: ParsedRequirement): Promise<UISection[]> {
    // Use AI với specialized prompt
    const prompt = this.buildSectionPrompt(requirement);
    const sections = await this.llm.generate(prompt);
    return this.validateAndOptimize(sections);
  }

  private buildSectionPrompt(req: ParsedRequirement): string {
    // Reference: Lovable/Agent Prompt.txt lines 219-305
    // Implement design system first approach
  }
}
```

---

### 3. **React Code Generator** (Tạo React Code)

**Chức năng:**
- Generate production-ready React components
- Apply best practices (hooks, typescript, accessibility)
- Implement design system
- Generate tests (optional)

**Tech Stack:**
```typescript
// Code generation
- AI Model (GPT-4 / Claude Sonnet)
- AST manipulation (babel, recast)
- Prettier (formatting)
- ESLint (validation)

// Template
- React 18 + TypeScript
- Vite hoặc Next.js
- TailwindCSS + shadcn/ui
```

**Implementation:**
```typescript
interface ComponentSpec {
  name: string;
  type: 'page' | 'component' | 'layout' | 'hook' | 'util';
  props: PropDefinition[];
  state: StateDefinition[];
  imports: string[];
  dependencies: string[];
}

class ReactCodeGenerator {
  async generateComponent(spec: ComponentSpec, designSystem: DesignSystem): Promise<GeneratedCode> {
    // 1. Generate component structure
    const template = this.selectTemplate(spec.type);

    // 2. Use AI to generate code
    const prompt = this.buildCodePrompt(spec, designSystem);
    const code = await this.llm.generate(prompt, {
      temperature: 0.2, // Lower for more consistent code
      max_tokens: 4000
    });

    // 3. Validate and format
    const formatted = await this.formatCode(code);
    const validated = await this.validateCode(formatted);

    return {
      code: validated,
      filePath: this.getFilePath(spec),
      imports: this.extractImports(validated)
    };
  }

  private buildCodePrompt(spec: ComponentSpec, designSystem: DesignSystem): string {
    return `
Generate a React TypeScript component with:
- Name: ${spec.name}
- Type: ${spec.type}
- Props: ${JSON.stringify(spec.props)}
- Design System: ${JSON.stringify(designSystem)}

Requirements:
1. Use semantic HTML and ARIA attributes
2. Follow design system tokens (no hardcoded colors)
3. Implement responsive design
4. Use React hooks best practices
5. Add TypeScript types for all props
6. NO emojis in code comments

Design System:
${this.formatDesignSystem(designSystem)}
`;
  }
}
```

---

### 4. **Code Fixer** (Sửa lỗi Code)

**Chức năng:**
- Detect and fix TypeScript errors
- Fix build errors
- Fix ESLint warnings
- Optimize performance issues

**Tech Stack:**
```typescript
// Error detection
- TypeScript Compiler API
- ESLint programmatic API
- Custom error parsers

// Fixing
- AI Model với error context
- AST transformations
```

**Implementation:**
```typescript
interface CodeError {
  type: 'typescript' | 'eslint' | 'build' | 'runtime';
  file: string;
  line: number;
  message: string;
  code?: string;
  severity: 'error' | 'warning';
}

class CodeFixer {
  async fixErrors(errors: CodeError[], fileTree: FileTree): Promise<FixResult[]> {
    const fixes: FixResult[] = [];

    for (const error of errors) {
      // 1. Read file context
      const fileContent = await this.readFile(error.file);

      // 2. Build fix prompt with error context
      const prompt = this.buildFixPrompt(error, fileContent);

      // 3. Generate fix
      const fix = await this.llm.generate(prompt);

      // 4. Apply and validate
      const applied = await this.applyFix(error.file, fix);
      fixes.push(applied);
    }

    return fixes;
  }

  async detectErrors(fileTree: FileTree): Promise<CodeError[]> {
    // Use TypeScript compiler API
    const tsErrors = await this.detectTypeScriptErrors(fileTree);
    const eslintErrors = await this.detectESLintErrors(fileTree);

    return [...tsErrors, ...eslintErrors];
  }
}
```

---

### 5. **Project Memory Logic** (Bộ nhớ Dự án)

**Chức năng:**
- Store conversation context
- Track file changes history
- Remember user preferences
- Maintain design system state
- Cache common patterns

**Tech Stack:**
```typescript
// Storage
- Redis (session cache)
- PostgreSQL (persistent storage)
- Vector DB (Pinecone/Weaviate) for semantic search

// Context management
- LangChain Memory modules
- Custom context window management
```

**Implementation:**
```typescript
interface ProjectMemory {
  projectId: string;
  conversationHistory: Message[];
  fileChanges: FileChange[];
  designSystem: DesignSystem;
  dependencies: string[];
  userPreferences: UserPreferences;
  codePatterns: CodePattern[];
}

class ProjectMemoryManager {
  private vectorStore: VectorStore;
  private cache: RedisClient;
  private db: PrismaClient;

  async remember(projectId: string, data: Partial<ProjectMemory>): Promise<void> {
    // 1. Store in cache for quick access
    await this.cache.set(`project:${projectId}`, data, 'EX', 3600);

    // 2. Store in database for persistence
    await this.db.projectMemory.upsert({
      where: { projectId },
      update: data,
      create: { projectId, ...data }
    });

    // 3. Update vector store for semantic search
    if (data.conversationHistory) {
      await this.indexConversations(projectId, data.conversationHistory);
    }
  }

  async recall(projectId: string, query?: string): Promise<ProjectMemory> {
    // Try cache first
    const cached = await this.cache.get(`project:${projectId}`);
    if (cached) return JSON.parse(cached);

    // Fall back to database
    const stored = await this.db.projectMemory.findUnique({
      where: { projectId }
    });

    return stored;
  }

  async searchSimilarCode(query: string, projectId: string): Promise<CodePattern[]> {
    // Semantic search in vector store
    return await this.vectorStore.search(query, {
      filter: { projectId },
      limit: 5
    });
  }
}
```

---

## 🔧 II. DEV LAYER (Lớp Phát triển)

### 1. **Next.js Project Template**

**Structure:**
```
project-template/
├── src/
│   ├── app/                 # Next.js 14 App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/             # shadcn/ui components
│   │   └── custom/         # User components
│   ├── lib/
│   │   ├── utils.ts
│   │   └── hooks/
│   ├── styles/
│   │   └── tokens.ts       # Design system tokens
│   └── types/
├── public/
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── vite.config.ts / next.config.js
```

**package.json template:**
```json
{
  "name": "lovable-generated-app",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "next": "^14.2.0",
    "@radix-ui/react-*": "latest",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "lucide-react": "^0.378.0",
    "zod": "^3.23.0",
    "zustand": "^4.5.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "typescript": "^5",
    "tailwindcss": "^3.4.0",
    "postcss": "^8",
    "autoprefixer": "^10.0.1",
    "eslint": "^8",
    "eslint-config-next": "14.2.0"
  }
}
```

---

### 2. **Code Writer Engine**

**Chức năng:**
- Write/update files in file system
- Handle file conflicts
- Batch operations
- Rollback support

**Implementation:**
```typescript
interface WriteOperation {
  type: 'create' | 'update' | 'delete' | 'rename';
  filePath: string;
  content?: string;
  newPath?: string;
}

class CodeWriterEngine {
  private fs: FileSystemAdapter;
  private history: OperationHistory;

  async executeOperations(operations: WriteOperation[]): Promise<WriteResult> {
    const transaction = this.history.beginTransaction();

    try {
      for (const op of operations) {
        switch (op.type) {
          case 'create':
            await this.createFile(op.filePath, op.content!);
            break;
          case 'update':
            await this.updateFile(op.filePath, op.content!);
            break;
          case 'delete':
            await this.deleteFile(op.filePath);
            break;
          case 'rename':
            await this.renameFile(op.filePath, op.newPath!);
            break;
        }

        transaction.record(op);
      }

      await transaction.commit();
      return { success: true, operations };
    } catch (error) {
      await transaction.rollback();
      return { success: false, error };
    }
  }

  async applyLineReplace(
    filePath: string,
    search: string,
    replace: string,
    startLine: number,
    endLine: number
  ): Promise<void> {
    // Similar to Lovable's lov-line-replace tool
    const content = await this.fs.readFile(filePath);
    const lines = content.split('\n');

    // Validate line range
    const searchContent = lines.slice(startLine - 1, endLine).join('\n');
    if (!searchContent.includes(search)) {
      throw new Error('Search content not found at specified line range');
    }

    // Replace
    const newContent = searchContent.replace(search, replace);
    lines.splice(startLine - 1, endLine - startLine + 1, ...newContent.split('\n'));

    await this.fs.writeFile(filePath, lines.join('\n'));
  }
}
```

---

### 3. **File Tree API**

**Chức năng:**
- Get project structure
- Search files
- Watch file changes
- Manage dependencies

**Implementation:**
```typescript
interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
  size?: number;
  modified?: Date;
}

class FileTreeAPI {
  async getTree(rootPath: string, options?: TreeOptions): Promise<FileNode> {
    return await this.buildTree(rootPath, options);
  }

  async searchFiles(pattern: string, options?: SearchOptions): Promise<FileNode[]> {
    // Implement glob pattern matching
    return await this.glob(pattern, options);
  }

  async watchChanges(callback: (event: FileChangeEvent) => void): Promise<Watcher> {
    // Use chokidar or similar
    return this.watcher.watch('**/*', {
      ignored: ['node_modules/**', '.git/**'],
      persistent: true
    }).on('all', (event, path) => {
      callback({ event, path, timestamp: new Date() });
    });
  }

  async getDependencies(filePath: string): Promise<string[]> {
    // Parse imports/requires
    const content = await this.fs.readFile(filePath);
    return this.parseImports(content);
  }
}
```

---

### 4. **Build & Preview Pipeline**

**Chức năng:**
- Hot Module Replacement (HMR)
- Real-time compilation
- Error reporting
- Performance monitoring

**Architecture:**
```
┌─────────────┐
│   Editor    │
│   Changes   │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  Code Writer    │
│     Engine      │
└────────┬────────┘
         │
         ▼
┌──────────────────┐      ┌────────────────┐
│  WebContainer /  │──────▶│  Build Process │
│  Docker Runtime  │      │  (Vite/Next)   │
└────────┬─────────┘      └────────┬───────┘
         │                         │
         │                         ▼
         │                  ┌──────────────┐
         │                  │ Error Parser │
         │                  └──────┬───────┘
         │                         │
         ▼                         ▼
┌──────────────────────────────────────┐
│         Live Preview (iframe)         │
└──────────────────────────────────────┘
```

**Implementation:**
```typescript
class BuildPreviewPipeline {
  private container: WebContainerInstance;
  private buildProcess: ChildProcess;

  async initialize(projectPath: string): Promise<void> {
    // Initialize WebContainer
    this.container = await WebContainer.boot();

    // Mount file system
    await this.container.mount(projectPath);

    // Install dependencies
    const installProcess = await this.container.spawn('npm', ['install']);
    await installProcess.exit;

    // Start dev server
    this.buildProcess = await this.container.spawn('npm', ['run', 'dev']);

    // Listen for errors
    this.buildProcess.output.pipeTo(new WritableStream({
      write: (data) => {
        this.parseOutput(data);
      }
    }));
  }

  async rebuild(): Promise<BuildResult> {
    // Trigger rebuild (HMR will handle if available)
    const result = await this.waitForBuild();
    return result;
  }

  private parseOutput(output: string): void {
    // Parse build errors/warnings
    const errors = this.extractErrors(output);
    if (errors.length > 0) {
      this.emit('build-error', errors);
    }
  }

  getPreviewUrl(): string {
    return this.container.url;
  }
}
```

---

## 🎨 III. UI TOOL LAYER (Lớp Giao diện)

### 1. **Chat Panel**

**Features:**
- Real-time messaging
- Code syntax highlighting
- Markdown support
- File attachments
- Image previews
- Loading states

**Tech Stack:**
```typescript
// UI Components
- React + TypeScript
- TailwindCSS
- shadcn/ui (Dialog, ScrollArea, Avatar)
- react-markdown
- prismjs / shiki (syntax highlighting)

// Real-time
- WebSocket / Server-Sent Events
```

**Component Structure:**
```typescript
interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  attachments?: Attachment[];
  toolCalls?: ToolCall[];
}

const ChatPanel: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  const sendMessage = async (content: string) => {
    const userMessage: Message = {
      id: nanoid(),
      role: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    // Stream response
    setIsStreaming(true);
    const stream = await api.chat.stream(content);

    let assistantMessage = '';
    for await (const chunk of stream) {
      assistantMessage += chunk;
      setMessages(prev => [
        ...prev.slice(0, -1),
        {
          id: nanoid(),
          role: 'assistant',
          content: assistantMessage,
          timestamp: new Date()
        }
      ]);
    }
    setIsStreaming(false);
  };

  return (
    <div className="flex flex-col h-full">
      <MessageList messages={messages} />
      <ChatInput onSend={sendMessage} disabled={isStreaming} />
    </div>
  );
};
```

---

### 2. **Sidebar Controls**

**Features:**
- Add Section (hero, features, etc.)
- Layout selector
- Theme customization
- Component library
- File explorer

**Implementation:**
```typescript
interface SidebarTab {
  id: string;
  label: string;
  icon: React.ReactNode;
  panel: React.ComponentType;
}

const Sidebar: React.FC = () => {
  const tabs: SidebarTab[] = [
    {
      id: 'sections',
      label: 'Sections',
      icon: <LayoutGrid />,
      panel: SectionPanel
    },
    {
      id: 'components',
      label: 'Components',
      icon: <Package />,
      panel: ComponentLibrary
    },
    {
      id: 'theme',
      label: 'Theme',
      icon: <Palette />,
      panel: ThemeCustomizer
    },
    {
      id: 'files',
      label: 'Files',
      icon: <Folder />,
      panel: FileExplorer
    }
  ];

  return (
    <aside className="w-80 border-r">
      <Tabs tabs={tabs} />
    </aside>
  );
};

// Section Panel
const SectionPanel: React.FC = () => {
  const sections = [
    { id: 'hero', name: 'Hero Section', preview: HeroPreview },
    { id: 'features', name: 'Features Grid', preview: FeaturesPreview },
    { id: 'testimonials', name: 'Testimonials', preview: TestimonialsPreview },
    { id: 'cta', name: 'Call to Action', preview: CTAPreview },
    { id: 'pricing', name: 'Pricing Table', preview: PricingPreview }
  ];

  const addSection = async (sectionId: string) => {
    await api.sections.add({
      type: sectionId,
      position: 'end'
    });
  };

  return (
    <div className="p-4 space-y-4">
      {sections.map(section => (
        <SectionCard
          key={section.id}
          name={section.name}
          preview={section.preview}
          onAdd={() => addSection(section.id)}
        />
      ))}
    </div>
  );
};
```

---

### 3. **Live Preview**

**Features:**
- iframe isolation
- Responsive viewport controls
- Device presets (mobile, tablet, desktop)
- Interaction recording
- Console log capture
- Network request monitoring

**Implementation:**
```typescript
const LivePreview: React.FC = () => {
  const [viewport, setViewport] = useState<Viewport>('desktop');
  const [url, setUrl] = useState<string>('');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const viewportSizes = {
    mobile: { width: 375, height: 667 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1440, height: 900 }
  };

  useEffect(() => {
    // Listen for build completion
    const unsubscribe = buildPipeline.on('build-complete', (newUrl) => {
      setUrl(newUrl);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    // Capture console logs from iframe
    if (iframeRef.current?.contentWindow) {
      const originalConsole = iframeRef.current.contentWindow.console;

      ['log', 'warn', 'error'].forEach(method => {
        iframeRef.current!.contentWindow!.console[method] = (...args) => {
          // Send to parent
          window.postMessage({
            type: 'console',
            method,
            args
          }, '*');

          // Call original
          originalConsole[method](...args);
        };
      });
    }
  }, [url]);

  return (
    <div className="flex flex-col h-full">
      <PreviewToolbar
        viewport={viewport}
        onViewportChange={setViewport}
      />

      <div
        className="flex-1 flex items-center justify-center bg-gray-100"
        style={{
          width: viewportSizes[viewport].width,
          height: viewportSizes[viewport].height
        }}
      >
        <iframe
          ref={iframeRef}
          src={url}
          className="w-full h-full bg-white"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </div>
  );
};
```

---

### 4. **Project Settings**

**Features:**
- Project metadata
- Environment variables
- Build configuration
- Deployment settings
- Team collaboration

**Implementation:**
```typescript
interface ProjectSettings {
  name: string;
  description: string;
  framework: 'next' | 'vite' | 'remix';
  envVars: Record<string, string>;
  buildConfig: BuildConfig;
  deployment: DeploymentConfig;
}

const ProjectSettingsPanel: React.FC = () => {
  const [settings, setSettings] = useState<ProjectSettings>();

  return (
    <Dialog>
      <DialogContent className="max-w-2xl">
        <Tabs defaultValue="general">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="env">Environment</TabsTrigger>
            <TabsTrigger value="build">Build</TabsTrigger>
            <TabsTrigger value="deploy">Deployment</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <GeneralSettings settings={settings} onChange={setSettings} />
          </TabsContent>

          <TabsContent value="env">
            <EnvironmentVariables envVars={settings?.envVars} />
          </TabsContent>

          {/* Other tabs */}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
```

---

## 📦 IV. OUTPUT & DEPLOYMENT LAYER

### 1. **Export ZIP**

```typescript
class ZipExporter {
  async exportProject(projectId: string): Promise<Blob> {
    const zip = new JSZip();
    const fileTree = await fileTreeAPI.getTree(projectId);

    // Add all files
    await this.addFilesToZip(zip, fileTree);

    // Add README
    zip.file('README.md', this.generateReadme(projectId));

    // Generate zip
    const blob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 9 }
    });

    return blob;
  }

  private async addFilesToZip(zip: JSZip, node: FileNode, basePath = ''): Promise<void> {
    if (node.type === 'file') {
      const content = await fs.readFile(node.path);
      zip.file(path.join(basePath, node.name), content);
    } else {
      const folder = zip.folder(path.join(basePath, node.name));
      for (const child of node.children || []) {
        await this.addFilesToZip(zip, child, path.join(basePath, node.name));
      }
    }
  }
}
```

---

### 2. **API Deploy** (Vercel/Netlify)

```typescript
interface DeploymentProvider {
  name: 'vercel' | 'netlify' | 'cloudflare';
  deploy(project: ProjectFiles): Promise<DeploymentResult>;
  getStatus(deploymentId: string): Promise<DeploymentStatus>;
}

class VercelDeployer implements DeploymentProvider {
  name = 'vercel' as const;
  private client: VercelClient;

  async deploy(project: ProjectFiles): Promise<DeploymentResult> {
    // 1. Create deployment
    const deployment = await this.client.deployments.create({
      name: project.name,
      files: project.files,
      projectSettings: {
        framework: 'nextjs',
        buildCommand: 'npm run build',
        outputDirectory: '.next'
      }
    });

    // 2. Wait for build
    const status = await this.waitForDeployment(deployment.id);

    return {
      id: deployment.id,
      url: deployment.url,
      status: status.state,
      logs: status.logs
    };
  }

  async getStatus(deploymentId: string): Promise<DeploymentStatus> {
    return await this.client.deployments.get(deploymentId);
  }
}
```

---

### 3. **GitHub Integration**

```typescript
class GitHubIntegration {
  private octokit: Octokit;

  async createRepository(
    name: string,
    isPrivate: boolean = false
  ): Promise<Repository> {
    const { data: repo } = await this.octokit.repos.createForAuthenticatedUser({
      name,
      private: isPrivate,
      auto_init: true
    });

    return repo;
  }

  async pushCode(
    owner: string,
    repo: string,
    files: FileTree,
    message: string = 'Initial commit from Lovable'
  ): Promise<void> {
    // 1. Get the default branch
    const { data: repoData } = await this.octokit.repos.get({ owner, repo });
    const branch = repoData.default_branch;

    // 2. Get the latest commit SHA
    const { data: refData } = await this.octokit.git.getRef({
      owner,
      repo,
      ref: `heads/${branch}`
    });
    const latestCommitSha = refData.object.sha;

    // 3. Create blobs for all files
    const blobs = await this.createBlobs(owner, repo, files);

    // 4. Create tree
    const { data: tree } = await this.octokit.git.createTree({
      owner,
      repo,
      base_tree: latestCommitSha,
      tree: blobs
    });

    // 5. Create commit
    const { data: commit } = await this.octokit.git.createCommit({
      owner,
      repo,
      message,
      tree: tree.sha,
      parents: [latestCommitSha]
    });

    // 6. Update reference
    await this.octokit.git.updateRef({
      owner,
      repo,
      ref: `heads/${branch}`,
      sha: commit.sha
    });
  }

  async createPullRequest(
    owner: string,
    repo: string,
    head: string,
    base: string,
    title: string,
    body: string
  ): Promise<PullRequest> {
    const { data: pr } = await this.octokit.pulls.create({
      owner,
      repo,
      head,
      base,
      title,
      body
    });

    return pr;
  }
}
```

---

## 🔐 V. AUTHENTICATION & AUTHORIZATION

```typescript
// Use Supabase Auth or Custom JWT

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  subscription: 'free' | 'pro' | 'enterprise';
}

class AuthService {
  async signUp(email: string, password: string): Promise<User> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) throw error;
    return data.user;
  }

  async signIn(email: string, password: string): Promise<Session> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data.session;
  }

  async getUser(): Promise<User | null> {
    const { data } = await supabase.auth.getUser();
    return data.user;
  }
}
```

---

## 📊 VI. ANALYTICS & MONITORING

```typescript
interface Analytics {
  trackEvent(event: string, properties?: Record<string, any>): void;
  trackPageView(page: string): void;
  trackError(error: Error, context?: Record<string, any>): void;
}

class AnalyticsService implements Analytics {
  trackEvent(event: string, properties?: Record<string, any>): void {
    // Send to PostHog / Mixpanel / Google Analytics
    posthog.capture(event, properties);
  }

  trackPageView(page: string): void {
    this.trackEvent('page_view', { page });
  }

  trackError(error: Error, context?: Record<string, any>): void {
    // Send to Sentry
    Sentry.captureException(error, { extra: context });
  }
}

// Usage tracking
class UsageTracker {
  async trackGeneration(userId: string, tokens: number): Promise<void> {
    await db.usage.create({
      data: {
        userId,
        tokens,
        type: 'generation',
        timestamp: new Date()
      }
    });
  }

  async getRemainingCredits(userId: string): Promise<number> {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: { subscription: true }
    });

    const used = await db.usage.aggregate({
      where: {
        userId,
        timestamp: {
          gte: startOfMonth(new Date())
        }
      },
      _sum: { tokens: true }
    });

    return user.subscription.monthlyTokens - (used._sum.tokens || 0);
  }
}
```

---

## 🗄️ VII. DATABASE SCHEMA

```prisma
// schema.prisma

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  avatar        String?
  subscription  Subscription?
  projects      Project[]
  usage         Usage[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Subscription {
  id            String    @id @default(cuid())
  userId        String    @unique
  user          User      @relation(fields: [userId], references: [id])
  plan          String    // 'free' | 'pro' | 'enterprise'
  monthlyTokens Int       @default(50000)
  status        String    @default("active")
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Project {
  id              String    @id @default(cuid())
  name            String
  description     String?
  userId          String
  user            User      @relation(fields: [userId], references: [id])
  framework       String    @default("next") // 'next' | 'vite' | 'remix'
  fileTree        Json
  designSystem    Json
  dependencies    Json
  conversationId  String?
  conversation    Conversation? @relation(fields: [conversationId], references: [id])
  deployments     Deployment[]
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

model Conversation {
  id        String    @id @default(cuid())
  messages  Message[]
  projects  Project[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}

model Message {
  id              String       @id @default(cuid())
  conversationId  String
  conversation    Conversation @relation(fields: [conversationId], references: [id])
  role            String       // 'user' | 'assistant' | 'system'
  content         String       @db.Text
  toolCalls       Json?
  createdAt       DateTime     @default(now())
}

model Deployment {
  id          String    @id @default(cuid())
  projectId   String
  project     Project   @relation(fields: [projectId], references: [id])
  provider    String    // 'vercel' | 'netlify' | 'cloudflare'
  url         String
  status      String    // 'pending' | 'building' | 'ready' | 'error'
  logs        String?   @db.Text
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Usage {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  tokens    Int
  type      String   // 'generation' | 'chat'
  timestamp DateTime @default(now())
}
```

---

## 🚀 VIII. IMPLEMENTATION ROADMAP

### **Phase 1: Foundation (Tuần 1-2)**
- [ ] Setup monorepo (Turborepo)
- [ ] Initialize Next.js app
- [ ] Setup database (Supabase)
- [ ] Implement authentication
- [ ] Basic UI layout (chat + preview)

### **Phase 2: AI Core (Tuần 3-4)**
- [ ] Requirement parser
- [ ] React code generator với prompt engineering
- [ ] Basic agent system
- [ ] Tool integration (file operations)
- [ ] Error detection & fixing

### **Phase 3: Dev Environment (Tuần 5-6)**
- [ ] WebContainer integration
- [ ] File system API
- [ ] Build pipeline
- [ ] Live preview với HMR
- [ ] Console log capture

### **Phase 4: Advanced Features (Tuần 7-8)**
- [ ] UI section generator
- [ ] Design system customization
- [ ] Component library
- [ ] Image generation integration
- [ ] Web search integration

### **Phase 5: Collaboration & Export (Tuần 9-10)**
- [ ] Real-time collaboration
- [ ] Version control integration
- [ ] Export to ZIP
- [ ] Deploy to Vercel/Netlify
- [ ] GitHub push

### **Phase 6: Polish & Launch (Tuần 11-12)**
- [ ] Performance optimization
- [ ] Error handling
- [ ] Analytics integration
- [ ] Documentation
- [ ] Beta testing
- [ ] Public launch

---

## 📚 IX. TECH STACK SUMMARY

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Vite, TailwindCSS, shadcn/ui |
| **Backend** | Node.js, Express/Fastify, tRPC |
| **Database** | PostgreSQL, Prisma ORM, Redis |
| **AI/LLM** | OpenAI GPT-4, Anthropic Claude, LangChain |
| **Real-time** | WebSocket (Socket.io), Server-Sent Events |
| **Container** | WebContainer (StackBlitz) |
| **Auth** | Supabase Auth hoặc NextAuth.js |
| **Deployment** | Vercel, Netlify, Cloudflare Pages |
| **Monitoring** | Sentry, PostHog, LogRocket |
| **Vector DB** | Pinecone, Weaviate (cho semantic search) |
| **File Storage** | S3, Cloudflare R2 |

---

## 🎯 X. KEY DIFFERENTIATORS

So với Lovable, có thể thêm:

1. **Multi-framework support**: Next.js, Remix, Astro (không chỉ Vite)
2. **Advanced AI models**: Support nhiều models (GPT-4, Claude, Gemini)
3. **Collaboration**: Real-time collaborative editing
4. **Version control**: Built-in git integration
5. **Component marketplace**: Share/reuse components
6. **Custom design systems**: Import Figma tokens
7. **A/B testing**: Built-in experimentation
8. **Performance insights**: Lighthouse integration
9. **SEO analyzer**: Real-time SEO suggestions
10. **Accessibility checker**: WCAG compliance

---

## 📖 XI. LEARNING RESOURCES

- **Lovable Prompt**: `/Lovable/Agent Prompt.txt`
- **Bolt Prompt**: `/Open Source prompts/Bolt/Prompt.txt`
- **Cursor Tools**: `/Cursor Prompts/Agent Tools v1.0.json`
- **v0 Approach**: `/v0 Prompts and Tools/`
- **WebContainer**: https://webcontainers.io
- **LangChain**: https://js.langchain.com
- **shadcn/ui**: https://ui.shadcn.com

---

## 🤝 XII. CONTRIBUTION GUIDELINES

```markdown
# Contribution Guidelines

## Code Style
- TypeScript strict mode
- ESLint + Prettier
- Conventional Commits

## Pull Request Process
1. Fork the repo
2. Create feature branch
3. Write tests
4. Submit PR with description

## Testing Requirements
- Unit tests (Vitest)
- Integration tests (Playwright)
- E2E tests (Cypress)
```

---

**Tổng kết**: Document này cung cấp blueprint hoàn chỉnh để build một Lovable clone với đầy đủ tính năng. Mỗi section đều có implementation details và code examples. Bắt đầu với Phase 1 và iterate từng bước!
