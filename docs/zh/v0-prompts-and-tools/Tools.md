## v0工具系统综述

这个文档定义了v0 AI助手可用的工具集合，这些工具是v0能够执行各种开发任务的核心能力。整个工具系统基于JSON格式定义，包含13个不同的工具，每个工具都有明确的用途、参数和使用场景。

### 核心工具分类

1. **网络和搜索工具**
   - `SearchWeb`: 执行智能网络搜索，优先使用Vercel生态系统的一手文档
   - `FetchFromWeb`: 从指定URL获取完整的网页内容和元数据

2. **代码库探索工具**
   - `GrepRepo`: 在整个代码库中搜索正则表达式模式
   - `LSRepo`: 列出代码库中的文件和目录
   - `ReadFile`: 智能读取文件内容（小文件完整读取，大文件按需读取）
   - `SearchRepo`: 启动新的代理来搜索和探索代码库

3. **开发辅助工具**
   - `InspectSite`: 截取网站截图用于验证视觉bug或参考设计
   - `TodoManager`: 管理复杂的多步骤项目的结构化待办事项列表

4. **设计和集成工具**
   - `GenerateDesignInspiration`: 生成设计灵感以确保生成内容视觉吸引力
   - `GetOrRequestIntegration`: 检查集成状态并获取环境变量和数据库模式

每个工具都遵循严格的参数规范，包含任务状态显示参数(`taskNameActive`和`taskNameComplete`)，这些参数会在UI中显示工具的执行状态。这种设计确保了用户能够清楚地了解AI助手正在进行的任务和完成情况。

## Tools.json

```json
{
  "tools": [
    {
      "name": "FetchFromWeb",
      "description": "当您有特定URL需要阅读时，从此网页获取全文内容。返回干净、解析后的文本及元数据。\n\n**何时使用：**\n• **已知URL** - 您有需要完整阅读的特定页面/文章\n• **深度内容分析** - 需要全文，而不仅仅是搜索结果摘要\n• **阅读文档** - 外部文档、教程或参考资料\n• **后续研究** - 在网络搜索后，获取特定的有希望的结果\n\n**您将获得：**\n• 完整的页面文本内容（已清理和解析）\n• 元数据：标题、作者、发布日期、网站图标、图像\n• 单次请求可处理多个URL\n\n**与SearchWeb对比：** 当您确切知道要阅读哪些URL时使用此工具；先使用SearchWeb查找URL。",
      "parameters": {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "type": "object",
        "properties": {
          "urls": {
            "type": "array",
            "items": {
              "type": "string"
            },
            "description": "要获取全文内容的URL。适用于任何可公开访问的网页。\n\n**何时需要：**\n• 完整的文章或文档文本（不仅仅是搜索摘要）\n• 来自已知URL的特定内容\n• 完整的文档页面或教程\n• 需要阅读整个页面的详细信息\n\n**示例：**\n• [\"https://nextjs.org/docs/app/building-your-application/routing\"]\n• [\"https://blog.example.com/article-title\", \"https://docs.example.com/api-reference\"]"
          },
          "taskNameActive": {
            "type": "string",
            "description": "任务运行时描述任务的2-5个词。将显示在UI中。例如，\"正在检查旧金山天气\"。"
          },
          "taskNameComplete": {
            "type": "string",
            "description": "任务完成时描述任务的2-5个词。将显示在UI中。它不应表示成功或失败，只表示任务已完成。例如，\"已查找旧金山天气\"。"
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
      "description": "在存储库中搜索文件内容中的正则表达式模式。返回匹配的行以及文件路径和行号，非常适合代码探索和分析。\n\n主要用例：\n• 查找函数定义：'function\\s+myFunction' 或 'const\\s+\\w+\\s*='\n• 定位导入/导出：'import.*from' 或 'export\\s+(default|\\{)'\n• 搜索特定类：'class\\s+ComponentName' 或 'interface\\s+\\w+'\n• 查找API调用：'fetch\(' 或 'api\\.(get|post)'\n• 发现配置：'process\\.env' 或特定的配置键\n• 跟踪使用模式：组件名称、变量或方法调用\n• 查找特定文本：'User Admin' 或 'TODO'\n\n搜索策略：\n• 使用glob模式专注于相关文件类型 (*.ts, *.jsx, src/**)\n• 与路径过滤结合以针对特定目录\n• 从宽泛开始，然后用更具体的模式缩小范围\n• 记住：不区分大小写匹配，最多返回200个结果\n",
      "parameters": {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "type": "object",
        "properties": {
          "pattern": {
            "type": "string",
            "description": "要在文件内容中搜索的正则表达式（regex）模式（例如，'function\\s+myFunction'，'import\\s+\\{.*\\}\\s+from\\s+.*'）。"
          },
          "path": {
            "type": "string",
            "description": "可选：要搜索的目录的绝对路径。如果省略，则搜索所有文件。"
          },
          "globPattern": {
            "type": "string",
            "description": "\n可选：用于筛选要搜索的文件的glob模式（例如，'*.js'，'*.{ts,tsx}'，'src/**'）。如果省略，则搜索所有文件（遵循潜在的全局忽略）。\n"
          },
          "taskNameActive": {
            "type": "string",
            "description": "任务运行时描述任务的2-5个词。将显示在UI中。例如，\"正在检查旧金山天气\"。"
          },
          "taskNameComplete": {
            "type": "string",
            "description": "任务完成时描述任务的2-5个词。将显示在UI中。它不应表示成功或失败，只表示任务已完成。例如，\"已查找旧金山天气\"。"
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
      "description": "列出存储库中的文件和目录。返回按字母顺序排序的文件路径，并可选择基于模式的过滤。\n\n常见用例：\n• 探索存储库结构并了解项目布局\n• 在特定目录中查找文件（例如，'src/'，'components/'）\n• 定位配置文件、文档或特定文件类型\n• 在深入特定区域之前获取可用文件的概述\n\n提示：\n• 使用特定路径缩小结果范围（最多返回200个条目）\n• 与忽略模式结合以排除不相关的文件\n• 从根目录开始以获取项目概述，然后深入\n",
      "parameters": {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "type": "object",
        "properties": {
          "path": {
            "type": "string",
            "description": "要列出的目录的绝对路径（必须是绝对路径，而不是相对路径）"
          },
          "globPattern": {
            "type": "string",
            "description": "\n可选：用于筛选要列出的文件的glob模式（例如，'*.js'，'*.{ts,tsx}'，'src/**'）。如果省略，则列出所有文件。\n"
          },
          "ignore": {
            "type": "array",
            "items": {
              "type": "string"
            },
            "description": "要忽略的glob模式列表"
          },
          "taskNameActive": {
            "type": "string",
            "description": "任务运行时描述任务的2-5个词。将显示在UI中。例如，\"正在检查旧金山天气\"。"
          },
          "taskNameComplete": {
            "type": "string",
            "description": "任务完成时描述任务的2-5个词。将显示在UI中。它不应表示成功或失败，只表示任务已完成。例如，\"已查找旧金山天气\"。"
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
      "description": "智能地读取文件内容 - 当文件较小时返回完整文件，较大时返回分页块或根据您的查询返回目标块。\n\n**工作原理：**\n• **小文件** (≤2000行) - 返回完整内容\n• **大文件** (>2000行) - 使用AI根据查询查找并返回相关块\n• **二进制文件** - 返回图像，适当地处理blob内容\n• 任何超过2000个字符的行都会被截断以提高可读性\n• 可以提供起始行和结束行以读取文件的特定部分\n\n**何时使用：**\n• **编辑前** - 在进行更改前务必读取文件\n• **理解实现** - 特定功能或函数的工作方式\n• **查找特定代码** - 在大文件中定位模式、函数或配置\n• **代码分析** - 理解结构、依赖关系或模式\n\n**查询策略：**\n默认情况下，您应避免查询或分页，以便收集完整的上下文。\n如果收到文件过大的警告，则应具体说明您要查找的内容 - 查询越有针对性，返回的相关块就越好。",
      "parameters": {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "type": "object",
        "properties": {
          "filePath": {
            "type": "string",
            "description": "要读取的文件的绝对路径（例如，'app/about/page.tsx'）。不支持相对路径。您必须提供绝对路径。"
          },
          "query": {
            "type": "string",
            "description": "您在文件中查找的内容。对于大文件（>2000行）是必需的，对于较小的文件是可选的。\n\n**查询类型：**\n• **函数/钩子用法** - \"如何使用useAuth？\"或\"查找所有API调用\"\n• **实现细节** - \"身份验证逻辑\"或\"错误处理模式\"\n• **特定功能** - \"表单验证\"或\"数据库查询\"\n• **代码模式** - \"React组件\"或\"TypeScript接口\"\n• **配置** - \"环境变量\"或\"路由设置\"\n\n**示例：**\n• \"向我展示错误处理实现\"\n• \"定位表单验证逻辑\""
          },
          "startLine": {
            "type": "number",
            "description": "起始行号（从1开始）。使用grep结果或估计位置来定位特定代码部分。"
          },
          "endLine": {
            "type": "number",
            "description": "结束行号（从1开始）。包括足够的行以捕获完整的函数、类或逻辑代码块。"
          },
          "taskNameActive": {
            "type": "string",
            "description": "任务运行时描述任务的2-5个词。将显示在UI中。例如，\"正在检查旧金山天气\"。"
          },
          "taskNameComplete": {
            "type": "string",
            "description": "任务完成时描述任务的2-5个词。将显示在UI中。它不应表示成功或失败，只表示任务已完成。例如，\"已查找旧金山天气\"。"
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
      "description": "截取屏幕截图以验证用户报告的视觉错误或从实时网站捕获参考设计以供重新创建。\n\n**用于：**\n• **视觉错误验证** - 当用户报告布局问题、元素未对齐或样式问题时\n• **网站重新创建** - 捕获参考设计（例如，\"重新创建耐克主页\"，\"复制Stripe的定价页面\"）\n\n**技术细节：** 将localhost URL转换为预览URL，优化屏幕截图大小，支持多个URL。",
      "parameters": {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "type": "object",
        "properties": {
          "urls": {
            "type": "array",
            "items": {
              "type": "string"
            },
            "description": "要截取屏幕截图的URL。支持实时网站和本地开发服务器。\n\n**支持的URL类型：**\n• **实时网站**：\"https://example.com\"，\"https://app.vercel.com/dashboard\"\n• **本地开发**：\"http://localhost:3000\"（自动转换为CodeProject预览URL）\n• **特定页面**：包括完整路径，如\"https://myapp.com/dashboard\"或\"localhost:3000/products\"\n\n**最佳实践：**\n• 使用特定页面路由而不是仅主页进行有针对性的检查\n• 包括localhost URL以验证您的CodeProject预览是否正常工作\n• 单次请求可捕获多个URL以进行比较"
          },
          "taskNameActive": {
            "type": "string",
            "description": "任务运行时描述任务的2-5个词。将显示在UI中。例如，\"正在检查旧金山天气\"。"
          },
          "taskNameComplete": {
            "type": "string",
            "description": "任务完成时描述任务的2-5个词。将显示在UI中。它不应表示成功或失败，只表示任务已完成。例如，\"已查找旧金山天气\"。"
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
      "description": "使用高质量来源执行智能网络搜索，并返回全面、引用的答案。优先考虑Vercel生态系统产品的第一方文档。\n\n主要用例：\n- 技术文档 - 最新功能、API参考、配置指南\n- 当前最佳实践 - 最新的开发模式和建议\n- 特定产品信息 - Vercel、Next.js、AI SDK和生态系统工具\n- 特定版本细节 - 新版本、重大更改、迁移指南\n- 外部集成 - 第三方服务设置、身份验证流程\n- 当前事件 - Web开发、框架更新的最新发展\n\n何时使用：\n- 用户明确请求网络搜索或外部信息\n- 关于Vercel产品的问题（为确保准确性，必需）\n- 训练数据中可能过时的信息\n- 当前代码库中不可用的技术细节\n- 比较工具、框架或方法\n- 查找错误消息、调试指南或故障排除\n\n搜索策略：\n- 进行多次有针对性的搜索以实现全面覆盖\n- 使用特定的版本号和产品名称以确保精确性\n- 对Vercel生态系统查询利用第一方来源（isFirstParty: true）",
      "parameters": {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "type": "object",
        "properties": {
          "query": {
            "type": "string",
            "description": "要在网络上执行的搜索查询。为获得最佳结果，请具体并有针对性。\n\n示例：\n- \"Next.js 15应用路由器功能\" - 针对特定技术版本/功能\n- \"Vercel部署环境变量\" - 针对特定产品文档\n- \"React服务器组件2025年最佳实践\" - 针对当前最佳实践\n- \"Tailwind CSS网格布局\" - 针对特定实现指南\n- \"TypeScript严格模式配置\" - 针对详细的技术设置"
          },
          "isFirstParty": {
            "type": "boolean",
            "description": "启用高质量的第一方文档搜索 - 在查询Vercel生态系统产品时设置为true，以从精选的知识库中获取更快、更准确、最新的信息。\n\n始终对以下情况使用isFirstParty: true：\n- 核心Vercel产品：Next.js、Vercel平台、部署功能、环境变量\n- 开发工具：Turborepo、Turbopack、Vercel CLI、Vercel工具栏\n- AI/ML产品：AI SDK、v0、AI网关、工作流、流体计算\n- 框架支持：Nuxt、Svelte、SvelteKit集成\n- 平台功能：Vercel市场、Vercel队列、分析、监控\n\n支持的域：[nextjs.org, turbo.build, vercel.com, sdk.vercel.ai, svelte.dev, react.dev, tailwindcss.com, typescriptlang.org, ui.shadcn.com, radix-ui.com, authjs.dev, date-fns.org, orm.drizzle.team, playwright.dev, remix.run, vitejs.dev, www.framer.com, www.prisma.io, vuejs.org, community.vercel.com, supabase.com, upstash.com, neon.tech, v0.app, docs.edg.io, docs.stripe.com, effect.website, flags-sdk.dev]\n\n为何使用第一方搜索：\n- 对Vercel生态系统而言，准确性高于通用网络搜索\n- 最新的功能更新和API更改\n- 官方示例和最佳实践\n- 全面的故障排除指南\n\n要求：在提及任何Vercel产品时，您必须使用带有isFirstParty: true的SearchWeb，以确保信息准确、最新。"
          },
          "taskNameActive": {
            "type": "string",
            "description": "任务运行时描述任务的2-5个词。将显示在UI中。例如，\"正在检查旧金山天气\"。"
          },
          "taskNameComplete": {
            "type": "string",
            "description": "任务完成时描述任务的2-5个词。将显示在UI中。它不应表示成功或失败，只表示任务已完成。例如，\"已查找旧金山天气\"。"
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
      "description": "管理复杂、多步骤项目的结构化待办事项列表。通过里程碑级任务跟踪进度，并生成技术实施计划。\n\n**核心工作流程：**\n1. **set_tasks** - 将项目分解为3-7个里程碑任务（不同的系统、主要功能、集成）\n2. **move_to_task** - 完成当前工作，专注于下一个任务\n\n**任务指南：**\n• **里程碑级任务** - \"构建主页\"、\"设置身份验证\"、\"添加数据库\"（不是微观步骤）\n• **一页=一任务** - 不要将单个页面分解为多个任务\n• **先UI后后端** - 先搭建页面，然后添加数据/身份验证/集成\n• **总任务数≤10** - 保持专注和可管理\n• **无模糊任务** - 切勿使用\"润色\"、\"测试\"、\"最终确定\"或其他无意义的空话\n\n**何时使用：**\n• 具有多个需要协同工作的不同系统的项目\n• 需要独立的用户界面和管理组件的应用程序\n• 具有多个独立功能的复杂集成\n\n**何时不使用：**\n• 单一的内聚构建（即使复杂） - 登录页面、表单、组件\n• 琐碎或单步任务\n• 对话/信息请求\n\n**示例：**\n\n• **多个系统**：\"构建一个带有受身份验证保护的管理仪表板的候补名单表单\"\n  → \"获取数据库集成，创建候补名单表单，构建管理仪表板，设置身份验证保护\"\n\n• **具有不同功能的应用**：\"创建一个带有用户帐户和收藏夹的食谱应用\"\n  → \"设置身份验证，构建食谱浏览器，创建用户个人资料，添加收藏夹系统\"\n\n• **复杂集成**：\"向我的网站添加带有审核功能的用户生成内容\"\n  → \"获取数据库集成，创建内容提交，构建审核仪表板，设置用户管理\"\n\n• **跳过TodoManager**：\"构建一个电子邮件SaaS登录页面\"或\"添加一个联系表单\"或\"创建一个定价部分\"\n  → 跳过待办事项 - 单一的内聚组件，直接构建",
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
            "description": "用于复杂、多步骤任务的待办事项管理操作：\n\n**核心操作：**\n• **set_tasks** - 创建初始任务分解（最多7个里程碑级任务）\n• **move_to_task** - 完成当前工作并专注于下一个特定任务\n• **add_task** - 向现有列表添加单个任务\n\n**实用程序操作：**\n• **read_list** - 查看当前待办事项列表而不做更改\n• **mark_all_done** - 完成所有任务（项目完成）\n\n**何时使用：** 多步骤项目、复杂实现、需要3个以上步骤的任务。跳过琐碎或单步任务。"
          },
          "tasks": {
            "type": "array",
            "items": {
              "type": "string"
            },
            "description": "用于set_tasks的完整任务列表。第一个变为进行中，其余为待办。"
          },
          "task": {
            "type": "string",
            "description": "用于add_task的任务描述。使用里程碑级任务，而不是微观步骤。"
          },
          "moveToTask": {
            "type": "string",
            "description": "用于move_to_task的确切任务名称。将所有先前的任务标记为已完成。"
          },
          "taskNameActive": {
            "type": "string",
            "description": "任务运行时描述任务的2-5个词。将显示在UI中。例如，\"正在检查旧金山天气\"。"
          },
          "taskNameComplete": {
            "type": "string",
            "description": "任务完成时描述任务的2-5个词。将显示在UI中。它不应表示成功或失败，只表示任务已完成。例如，\"已查找旧金山天气\"。"
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
      "description": "启动一个新代理，使用多种搜索策略（grep、文件列表、内容读取）搜索和探索代码库。\n\n返回相关文件和上下文信息，以回答有关代码结构、功能和内容的问题。\n\n**核心功能：**\n- 整个存储库的文件发现和内容分析\n- 使用正则表达式搜索特定代码结构的模式匹配\n- 目录探索和项目结构理解\n- 智能文件选择和内容提取，对大文件进行分块\n- 将搜索结果与代码分析相结合的上下文答案\n\n**何时使用：**\n- **架构探索** - 理解项目结构、依赖关系和模式\n- **重构准备** - 查找函数、组件或模式的所有实例\n- 当任务明确受益于具有新上下文窗口的独立代理时，委托给子代理\n",
      "parameters": {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "type": "object",
        "properties": {
          "query": {
            "type": "string",
            "description": "描述您在代码库中查找的内容。可以是逗号分隔的文件、代码模式、功能或常规探索任务。\n\n查询类型：\n- **读取多个文件**：\"components/ui/button.tsx, utils/api.ts\"\n- **功能搜索**：\"身份验证逻辑\"、\"数据库连接设置\"、\"用户管理的API端点\"\n- **代码模式**：\"使用useState的React组件\"、\"错误处理模式\"\n- **重构任务**：\"查找getCurrentUser函数的所有用法\"、\"定位按钮的样式\"、\"配置文件和环境设置\"\n- **架构探索**：\"路由配置\"、\"状态管理模式\"\n- **了解代码库结构**：\"给我一个代码库的概述\"（确切短语） - **当您不了解代码库或不知从何处开始时，从这里开始**"
          },
          "goal": {
            "type": "string",
            "description": "关于您为何搜索以及您计划如何处理结果的简要上下文（1-3句话）。\n\n示例：\n- \"我需要了解身份验证流程以添加OAuth支持。\"\n- \"我正在查找所有数据库交互以优化查询。\"\n"
          },
          "taskNameActive": {
            "type": "string",
            "description": "任务运行时描述任务的2-5个词。将显示在UI中。例如，\"正在检查旧金山天气\"。"
          },
          "taskNameComplete": {
            "type": "string",
            "description": "任务完成时描述任务的2-5个词。将显示在UI中。它不应表示成功或失败，只表示任务已完成。例如，\"已查找旧金山天气\"。"
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
      "description": "生成设计灵感，以确保您的生成内容具有视觉吸引力。\n\n何时使用：\n- 模糊的设计请求 - 用户要求\"一个漂亮的登录页面\"或\"现代仪表板\"\n- 需要创意增强 - 基本要求需要视觉灵感和具体性\n- 需要设计方向 - 没有明确的美学、配色方案或视觉风格\n- 复杂的UI/UX项目 - 多部分布局、品牌或用户体验流程\n\n何时跳过：\n- 后端/API工作 - 不涉及视觉设计组件\n- 微小的样式调整 - 简单的CSS更改或小调整\n- 设计已详细 - 用户有具体的模型、线框或详细要求\n\n重要提示：如果您生成了设计简报，则必须遵循它。",
      "parameters": {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "type": "object",
        "properties": {
          "goal": {
            "type": "string",
            "description": "高层次的产品/功能或UX目标。"
          },
          "context": {
            "type": "string",
            "description": "可选的设计提示、品牌形容词、约束。"
          },
          "taskNameActive": {
            "type": "string",
            "description": "任务运行时描述任务的2-5个词。将显示在UI中。例如，\"正在检查旧金山天气\"。"
          },
          "taskNameComplete": {
            "type": "string",
            "description": "任务完成时描述任务的2-5个词。将显示在UI中。它不应表示成功或失败，只表示任务已完成。例如，\"已查找旧金山天气\"。"
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
      "description": "检查集成状态，检索环境变量，并获取实时数据库模式。在继续之前自动向用户请求缺少的集成。\n\n**提供的内容：**\n• **集成状态** - 连接的服务和配置状态\n• **环境变量** - 可用的项目环境变量和缺少的要求\n• **实时数据库模式** - SQL集成（Supabase、Neon等）的实时表/列信息\n• **集成示例** - 可用时提供示例代码模板的链接\n\n**何时使用：**\n• **构建集成功能之前** - 身份验证、支付、数据库操作、API调用\n• **调试集成问题** - 缺少环境变量、连接问题、模式不匹配\n• **项目发现** - 了解可用的服务\n• **需要数据库模式** - 在编写SQL查询或ORM操作之前\n\n**关键行为：**\n停止执行并向用户请求设置缺少的集成，确保在生成代码之前连接所有必需的服务。",
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
            "description": "要检查或请求的特定集成名称。省略以获取所有连接的集成和环境变量的概述。\n\n**何时指定集成：**\n• 用户希望构建需要特定服务（身份验证、数据库、支付）的东西\n• 需要SQL集成（Supabase、Neon、PlanetScale）的数据库模式\n• 检查所需的集成是否已正确配置\n• 在实现依赖于集成的功能之前\n\n**可用集成：** Supabase、Neon、Upstash for Redis、Upstash Search、Blob、Groq、Grok、fal、Deep Infra、Stripe\n\n**示例：**\n• [\"Supabase\"] - 获取数据库模式并检查身份验证设置\n• []或省略 - 获取所有连接的集成和环境变量的概述"
          },
          "taskNameActive": {
            "type": "string",
            "description": "任务运行时描述任务的2-5个词。将显示在UI中。例如，\"正在检查旧金山天气\"。"
          },
          "taskNameComplete": {
            "type": "string",
            "description": "任务完成时描述任务的2-5个词。将显示在UI中。它不应表示成功或失败，只表示任务已完成。例如，\"已查找旧金山天气\"。"
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