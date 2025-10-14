## Tools.json

本文档定义了以下工具：
- `restart_workflow`: 重启（或启动）工作流
- `search_filesystem`: 搜索并打开代码库中的相关文件
- `packager_tool`: 安装语言（如果需要）并安装或卸载库或项目依赖项
- `programming_language_install_tool`: 安装编程语言
- `create_postgresql_database_tool`: 为项目创建 PostgreSQL 数据库
- `check_database_status`: 检查数据库是否可用和可访问
- `str_replace_editor`: 用于查看、创建和编辑文件的自定义编辑工具
- `bash`: 在 bash shell 中运行命令
- `workflows_set_run_config_tool`: 配置执行 shell 命令的后台任务
- `workflows_remove_run_config_tool`: 移除先前添加的命名命令
- `execute_sql_tool`: 允许您执行 SQL 查询、修复数据库错误和访问数据库架构
- `suggest_deploy`: 建议部署项目
- `report_progress`: 报告用户任务完成情况
- `web_application_feedback_tool`: 捕获屏幕截图并检查日志以验证网络应用程序是否在 Replit 工作流中运行
- `shell_command_application_feedback_tool`: 执行交互式 shell 命令并询问 CLI 应用程序的输出或行为
- `vnc_window_application_feedback`: 执行交互式桌面应用程序，通过 VNC 访问并显示给用户
- `ask_secrets`: 请求项目所需的密钥 API 密钥
- `check_secrets`: 检查环境中是否存在给定密钥

```json
{
  "tools": [
    {
      "name": "restart_workflow",
      "description": "重启（或启动）一个工作流。",
      "parameters": {
        "properties": {
          "name": {
            "description": "工作流的名称。",
            "type": "string"
          }
        },
        "required": [
          "name"
        ],
        "type": "object"
      }
    },
    {
      "name": "search_filesystem",
      "description": "此工具搜索并打开代码库的相关文件",
      "parameters": {
        "properties": {
          "class_names": {
            "default": [],
            "description": "在代码库中搜索的特定类名列表。区分大小写且仅支持精确匹配。使用此功能查找特定类定义或其用法。",
            "items": {
              "type": "string"
            },
            "type": "array"
          },
          "code": {
            "default": [],
            "description": "在代码库中搜索的精确代码片段列表。有助于查找特定实现或模式。每个片段应该是完整的代码片段，而不仅仅是关键字。",
            "items": {
              "type": "string"
            },
            "type": "array"
          },
          "function_names": {
            "default": [],
            "description": "要搜索的特定函数或方法名列表。区分大小写且仅支持精确匹配。使用此功能在整个代码中定位函数定义或其调用。",
            "items": {
              "type": "string"
            },
            "type": "array"
          },
          "query_description": {
            "anyOf": [
              {
                "type": "string"
              },
              {
                "type": "null"
              }
            ],
            "default": null,
            "description": "执行语义相似性搜索的自然语言查询。使用简单英语描述您要查找的内容，例如 'find error handling in database connections' 或 'locate authentication middleware implementations'。"
          }
        },
        "type": "object"
      }
    },
    {
      "name": "packager_tool",
      "description": "安装语言（如果需要）并安装或卸载库或项目依赖项列表。使用此工具安装依赖项，而不是执行 shell 命令或手动编辑文件。使用 language_or_system=`system` 运行此工具以添加系统依赖项，而不是使用 `apt install`。首次安装库时也会自动创建必要的项目文件（如 'package.json'、'cargo.toml' 等）。这将自动重启所有工作流。",
      "parameters": {
        "properties": {
          "dependency_list": {
            "default": [],
            "description": "要安装的系统依赖项或库列表。系统依赖项是 Nixpkgs 包集合中的包（属性路径）。示例系统依赖项：['jq', 'ffmpeg', 'imagemagick']。库是特定编程语言的包。示例库：['express']，['lodash']。",
            "items": {
              "type": "string"
            },
            "type": "array"
          },
          "install_or_uninstall": {
            "description": "是安装还是卸载。",
            "enum": [
              "install",
              "uninstall"
            ],
            "type": "string"
          },
          "language_or_system": {
            "description": "要安装/卸载库的语言，例如 'nodejs'、'bun'、'python' 等。使用 `system` 来安装/卸载系统依赖项。",
            "type": "string"
          }
        },
        "required": [
          "install_or_uninstall",
          "language_or_system"
        ],
        "type": "object"
      }
    },
    {
      "name": "programming_language_install_tool",
      "description": "如果程序无法运行，您可能没有安装编程语言。使用 programming_language_install_tool 来安装它。如果您需要使用 python，请在 programming_languages 中包含 'python-3.11'。对于 Python 3.10，请使用 'python-3.10'。如果您需要使用 Node.js，请在 programming_languages 中包含 'nodejs-20'。对于 Node.js 18，请使用 'nodejs-18'。注意，这还将安装语言的包管理器，因此无需单独安装。",
      "parameters": {
        "properties": {
          "programming_languages": {
            "description": "要安装的编程语言的 ID",
            "items": {
              "type": "string"
            },
            "type": "array"
          }
        },
        "required": [
          "programming_languages"
        ],
        "type": "object"
      }
    },
    {
      "name": "create_postgresql_database_tool",
      "description": "当项目需要 PostgreSQL 数据库时，您可以使用此工具为其创建数据库。成功创建数据库后，您将可以访问以下环境变量：DATABASE_URL, PGPORT, PGUSER, PGPASSWORD, PGDATABASE, PGHOST\n您可以使用这些环境变量在项目中连接到数据库。",
      "parameters": {
        "properties": {},
        "type": "object"
      }
    },
    {
      "name": "check_database_status",
      "description": "检查给定数据库是否可用和可访问。\n此工具用于验证指定数据库的连接和状态。",
      "parameters": {
        "properties": {},
        "type": "object"
      }
    },
    {
      "name": "str_replace_editor",
      "description": "用于查看、创建和编辑文件的自定义编辑工具\n* 状态在命令调用和与用户的讨论中保持持久\n* 如果 `path` 是一个文件，`view` 显示应用 `cat -n` 的结果。如果 `path` 是一个目录，`view` 列出最多 2 级深度的非隐藏文件和目录\n* 如果指定的 `path` 已经作为文件存在，则不能使用 `create` 命令\n* 如果 `command` 生成长输出，它将被截断并标记为 `<response clipped>` \n* `undo_edit` 命令将撤消对 `path` 处文件的最后一次编辑\n\n使用 `str_replace` 命令的注意事项：\n* `old_str` 参数应完全匹配原始文件中一个或多个连续行。请注意空格！\n* 如果 `old_str` 参数在文件中不唯一，则不会执行替换。请确保在 `old_str` 中包含足够的上下文以使其唯一\n* `new_str` 参数应包含要替换 `old_str` 的编辑行",
      "parameters": {
        "properties": {
          "command": {
            "description": "要运行的命令。允许的选项是：`view`、`create`、`str_replace`、`insert`、`undo_edit`。",
            "enum": [
              "view",
              "create",
              "str_replace",
              "insert",
              "undo_edit"
            ],
            "type": "string"
          },
          "file_text": {
            "description": "`create` 命令的必需参数，包含要创建的文件内容。",
            "type": "string"
          },
          "insert_line": {
            "description": "`insert` 命令的必需参数。`new_str` 将插入到 `path` 的 `insert_line` 行之后。",
            "type": "integer"
          },
          "new_str": {
            "description": "`str_replace` 命令的可选参数，包含新字符串（如果不提供，则不会添加字符串）。`insert` 命令的必需参数，包含要插入的字符串。",
            "type": "string"
          },
          "old_str": {
            "description": "`str_replace` 命令的必需参数，包含 `path` 中要替换的字符串。",
            "type": "string"
          },
          "path": {
            "description": "文件或目录的绝对路径，例如 `/repo/file.py` 或 `/repo`。",
            "type": "string"
          },
          "view_range": {
            "description": "当 `path` 指向文件时，`view` 命令的可选参数。如果没有提供，则显示完整文件。如果提供，则文件将以指定的行号范围显示，例如 [11, 12] 将显示第 11 和 12 行。索引从 1 开始。设置 `[start_line, -1]` 将显示从 `start_line` 到文件末尾的所有行。",
            "items": {
              "type": "integer"
            },
            "type": "array"
          }
        },
        "required": [
          "command",
          "path"
        ],
        "type": "object"
      }
    },
    {
      "name": "bash",
      "description": "在 bash shell 中运行命令\n* 调用此工具时，\"command\" 参数的内容不需要 XML 转义。\n* 您可以通过 apt 和 pip 访问常见 linux 和 python 包的镜像。\n* 状态在命令调用和与用户的讨论中保持持久。\n* 要检查文件的特定行范围，例如第 10-25 行，请尝试 'sed -n 10,25p /path/to/the/file'。\n* 请避免可能产生大量输出的命令。\n* 请在后台运行长期运行的命令，例如 'sleep 10 &' 或在后台启动服务器。",
      "parameters": {
        "properties": {
          "command": {
            "description": "要运行的 bash 命令。除非工具正在重启，否则必需。",
            "type": "string"
          },
          "restart": {
            "description": "指定 true 将重启此工具。否则，请保持未指定。",
            "type": "boolean"
          }
        },
        "type": "object"
      }
    },
    {
      "name": "workflows_set_run_config_tool",
      "description": "配置执行 shell 命令的后台任务。\n这对于启动开发服务器、构建进程或项目所需的任何其他\n长期运行的任务很有用。\n如果是服务器，请确保在 `wait_for_port` 字段中指定它侦听的端口号，\n以便在服务器准备好接受连接之前不认为工作流已启动。\n\n示例：\n- 对于 Node.js 服务器：将 `name` 设置为 'Server'，`command` 设置为 'npm run dev'，`wait_for_port` 设置为 5000\n- 对于 Python 脚本：将 name 设置为 'Data Processing'，command 设置为 'python process_data.py'\n\n可以配置多个任务，项目启动时它们将全部并行执行。\n配置任务后，它将自动在后台开始执行。\n\n始终在端口 5000 上提供应用程序，即使该端口存在问题：这是唯一没有防火墙的端口。\n",
      "parameters": {
        "properties": {
          "command": {
            "description": "要执行的 shell 命令。项目启动时将在后台运行。",
            "type": "string"
          },
          "name": {
            "description": "标识命令的唯一名称。这将用于跟踪命令。",
            "type": "string"
          },
          "wait_for_port": {
            "anyOf": [
              {
                "type": "integer"
              },
              {
                "type": "null"
              }
            ],
            "default": null,
            "description": "如果命令启动侦听端口的进程，请在此处指定端口号。\n这允许系统在认为命令完全启动之前等待端口准备就绪。"
          }
        },
        "required": [
          "name",
          "command"
        ],
        "type": "object"
      }
    },
    {
      "name": "workflows_remove_run_config_tool",
      "description": "移除之前添加的命名命令",
      "parameters": {
        "properties": {
          "name": {
            "description": "要移除的命令名称。",
            "type": "string"
          }
        },
        "required": [
          "name"
        ],
        "type": "object"
      }
    },
    {
      "name": "execute_sql_tool",
      "description": "此工具允许您执行 SQL 查询、修复数据库错误和访问数据库架构。\n\n## 使用规则：\n1. 始终优先使用此工具修复数据库错误，而不是编写像 db.drop_table(table_name) 这样的代码来修复\n2. 提供语法正确的清晰、格式良好的 SQL 查询\n3. 专注于数据库交互、数据操作和查询优化\n\n## 何时使用：\n1. 修复和排查与数据库相关的问题\n2. 探索数据库架构和关系\n3. 更新或修改数据库中的数据\n4. 运行一次性使用的 SQL 代码\n\n## 何时不使用：\n1. 用于非 SQL 数据库操作（NoSQL、基于文件的数据库）\n2. 用于数据库迁移。请改用 Drizzle 或 flask-migrate 等迁移工具\n\n## 使用示例：\n\n### 示例 1：查看数据库信息\nsql_query: SELECT * FROM customers WHERE region = 'North';\n\n### 示例 2：运行一次性 SQL 查询\nsql_query:  EXPLAIN ANALYZE SELECT orders.*, customers.name\n            FROM orders\n            JOIN customers ON orders.customer_id = customers.id;\n\n### 示例 3：向数据库插入数据\nsql_query:  INSERT INTO products (name, price, category)\n            VALUES ('New Product', 29.99, 'Electronics');",
      "parameters": {
        "properties": {
          "sql_query": {
            "description": "要执行的 SQL 查询",
            "type": "string"
          }
        },
        "required": [
          "sql_query"
        ],
        "type": "object"
      }
    },
    {
      "name": "suggest_deploy",
      "description": "当您认为项目处于可部署状态时调用此函数。\n这将建议用户他们可以部署他们的项目。\n这是一个终端操作 - 一旦调用，您的任务就完成了，并且\n您不应采取任何进一步操作来验证部署。\n部署过程将由 Replit Deployments 自动处理。\n\n## 使用规则：\n1. 验证项目按预期工作后使用此工具。\n2. 部署过程将由 Replit Deployments 自动处理。\n\n## 何时使用：\n1. 当项目准备部署时。\n2. 当用户要求部署项目时。\n\n## 更多信息：\n- 用户需要手动启动部署。\n- Replit Deployments 将处理应用程序构建、托管、TLS、健康检查。\n- 调用此工具后，无需执行任何后续步骤或验证。\n- 部署后，应用程序将在 `.replit.app` 域下可用，\n  或者如果配置了自定义域，则在自定义域下可用。",
      "parameters": {
        "description": "空参数类，因为建议部署不需要任何参数。",
        "properties": {},
        "type": "object"
      }
    },
    {
      "name": "report_progress",
      "description": "用户明确确认主要功能或任务完成时调用此函数。\n不要在没有用户确认的情况下调用它。\n在 'summary' 字段中提供已完成内容的简明摘要。\n此工具将询问用户下一步要做什么。此工具之后不要执行任何操作。",
      "parameters": {
        "properties": {
          "summary": {
            "description": "最多用 5 个项目总结您的最近更改。要非常简洁，不超过 30 个词。将内容分成多行。\n在您最近完成的每个项目前加上 ✓，在进行中的项目前加上 →，要非常简短和简洁，不超过 50 个词。不要使用表情符号。\n使用与用户语言匹配的简单日常语言。避免技术术语，因为用户不是技术人员。\n最后询问用户下一步要做什么。",
            "type": "string"
          }
        },
        "required": [
          "summary"
        ],
        "type": "object"
      }
    },
    {
      "name": "web_application_feedback_tool",
      "description": "此工具捕获屏幕截图并检查日志以验证网络应用程序是否在 Replit 工作流中运行。\n\n如果应用程序正在运行，该工具将显示应用程序，向用户提问，并等待用户的响应。\n当应用程序状态良好且请求的任务完成时使用此工具，以避免不必要的延迟。",
      "parameters": {
        "properties": {
          "query": {
            "description": "您将向用户提出的问题。\n\n使用与用户语言匹配的简单日常语言。避免技术术语，因为用户不是技术人员。\n最多用 5 个项目总结您的最近更改。要非常简洁，不超过 30 个词。将内容分成多行。\n在您最近完成的每个项目前加上 ✓，在进行中的项目前加上 →，要非常简短和简洁，不超过 50 个词。不要使用表情符号。\n一次只问一个问题。\n您可以访问工作流状态、控制台日志和屏幕截图——请自己检索它们，而不是询问用户。\n询问用户下一步的输入或确认。不要请求详细信息。",
            "type": "string"
          },
          "website_route": {
            "anyOf": [
              {
                "type": "string"
              },
              {
                "type": "null"
              }
            ],
            "default": null,
            "description": "您询问的网站的特定路由或路径（如果与根 URL ('/') 不同）。包含前导斜杠。示例：'/dashboard' 或 '/products/list'"
          },
          "workflow_name": {
            "description": "运行服务器的工作流名称。用于确定网站的端口。",
            "type": "string"
          }
        },
        "required": [
          "query",
          "workflow_name"
        ],
        "type": "object"
      }
    },
    {
      "name": "shell_command_application_feedback_tool",
      "description": "此工具允许您执行交互式 shell 命令并询问有关 CLI 应用程序或交互式 Python 程序的输出或行为的问题。\n\n## 使用规则：\n1. 提供清晰、简洁的交互式命令来执行，并提出有关结果或交互的具体问题。\n2. 一次只问一个关于交互行为或输出的问题。\n3. 专注于交互功能、用户输入/输出和实时行为。\n4. 指定要运行的确切命令，包括启动交互式会话所需的任何必要参数或标志。\n5. 当询问有关 Python 程序的问题时，包括文件名和启动交互模式所需的任何命令行参数。\n\n## 何时使用：\n1. 测试和验证需要用户输入和实时交互的交互式 CLI 应用程序或 Python 程序的功能。\n2. 检查程序是否在交互式 shell 环境中正确响应用户输入。\n\n## 何时不使用：\n1. 对于不需要用户输入的非交互式命令或脚本。\n2. 用于 API 测试或基于 Web 的交互。\n3. 用于打开本机桌面 VNC 窗口的 shell 命令。\n\n## 使用示例：\n命令：python interactive_script.py\n问题：当提示时，您能输入您的姓名并收到个性化的问候吗？\n\n命令：./text_adventure_game\n问题：您能做出影响故事进展的选择吗？\n\n命令：python -i data_analysis.py\n问题：您能以交互方式查询和操作加载的数据集吗？",
      "parameters": {
        "properties": {
          "query": {
            "description": "关于 shell 应用程序的问题或反馈请求",
            "type": "string"
          },
          "shell_command": {
            "description": "请求反馈之前要执行的 shell 命令",
            "type": "string"
          },
          "workflow_name": {
            "description": "此命令的工作流名称，必须是现有工作流。",
            "type": "string"
          }
        },
        "required": [
          "query",
          "shell_command",
          "workflow_name"
        ],
        "type": "object"
      }
    },
    {
      "name": "vnc_window_application_feedback",
      "description": "此工具允许您执行交互式桌面应用程序，该应用程序将通过 VNC 访问并显示给用户。\n您可以询问有关此应用程序的输出或行为的问题。\n\n## 使用规则：\n1. 提供清晰、简洁的命令来执行应用程序，并提出有关结果或交互的具体问题。\n2. 一次只问一个关于交互行为或输出的问题。\n3. 专注于交互功能、用户输入/输出和实时行为。\n4. 指定要运行的确切命令，包括任何必要的参数或标志。\n\n## 何时使用：\n1. 测试和验证需要用户输入和实时交互的交互式桌面程序的功能。\n2. 检查程序是否在附加的 VNC 窗口中正确响应用户输入。\n\n## 何时不使用：\n1. 对于不需要用户输入的非交互式命令或脚本。\n2. 用于 API 测试或基于 Web 的交互。\n3. 对于不打开本机桌面 VNC 窗口的 shell 命令。\n\n## 使用示例：\n命令：python pygame_snake.py\n问题：键盘事件是否会改变屏幕上蛇的方向？\n\n命令：./opencv_face_detection\n问题：您是否看到一张带有检测到的人脸周围有绿色矩形的照片？",
      "parameters": {
        "properties": {
          "query": {
            "description": "关于通过 VNC 可见的本机窗口应用程序的问题或反馈请求",
            "type": "string"
          },
          "vnc_execution_command": {
            "description": "请求反馈之前要执行的 VNC shell 命令；此 shell 命令应生成桌面窗口",
            "type": "string"
          },
          "workflow_name": {
            "description": "此 VNC shell 命令的工作流名称，必须是现有工作流。",
            "type": "string"
          }
        },
        "required": [
          "query",
          "vnc_execution_command",
          "workflow_name"
        ],
        "type": "object"
      }
    },
    {
      "name": "ask_secrets",
      "description": "请求用户提供项目所需的密钥 API 密钥。\n如果缺少密钥，请尽快使用此工具。\n密钥将添加到环境变量中。\n运行此工具的成本非常高。\n\n好的示例：\n- 要使用 Stripe 设置安全支付，我们需要一个 STRIPE_SECRET_KEY。\n  此密钥将用于在您的应用程序中安全地处理支付和\n  管理订阅。\n- 要启用短信价格提醒，我们需要 Twilio API 凭据 TWILIO_ACCOUNT_SID、\n  TWILIO_AUTH_TOKEN 和 TWILIO_PHONE_NUMBER。这些将用于在达到价格目标时发送短信\n  通知。\n- 要使用 OpenAI 模型构建应用程序，我们需要一个 OPENAI_API_KEY。\n\n不好的示例（请勿使用）：\n- PHONE_NUMBER、EMAIL_ADDRESS 或 PASSWORD\n    对于此类变量，您应该直接通过 user_response 工具询问用户。\n- REPLIT_DOMAINS 或 REPL_ID\n    这些密钥始终存在，因此您永远不需要请求它们。\n",
      "parameters": {
        "properties": {
          "secret_keys": {
            "description": "项目所需的密钥标识符数组（例如，[\"OPENAI_API_KEY\", \"GITHUB_TOKEN\"]）",
            "items": {
              "type": "string"
            },
            "type": "array"
          },
          "user_message": {
            "description": "发送回给用户的消息，解释需要这些密钥的原因。如果您还没有，请简要介绍密钥的一般概念，假设用户从未注册过 API 密钥。请礼貌地表述您的问题。",
            "type": "string"
          }
        },
        "required": [
          "secret_keys",
          "user_message"
        ],
        "type": "object"
      }
    },
    {
      "name": "check_secrets",
      "description": "检查环境中是否存在给定密钥。\n此工具用于验证密钥的存在而不暴露其实际值。\n",
      "parameters": {
        "properties": {
          "secret_keys": {
            "description": "要在环境中检查的密钥。",
            "items": {
              "type": "string"
            },
            "type": "array"
          }
        },
        "required": [
          "secret_keys"
        ],
        "type": "object"
      }
    }
  ],
  "internal_tags": [
    {
      "name": "View",
      "description": "包含文件系统信息和仓库详细信息"
    },
    {
      "name": "policy_spec",
      "description": "包含通信、主动性和数据完整性策略"
    },
    {
      "name": "file_system",
      "description": "显示目录结构"
    },
    {
      "name": "repo_overview",
      "description": "包含代码摘要"
    },
    {
      "name": "important",
      "description": "包含关键策略提醒"
    },
    {
      "name": "workflow_console_logs",
      "description": "包含运行工作流的日志"
    },
    {
      "name": "automatic_updates",
      "description": "包含系统生成的更新"
    },
    {
      "name": "webview_console_logs",
      "description": "包含来自用户浏览器的日志"
    },
    {
      "name": 'function_results',
      "description": "包含函数/工具调用的结果"
    }
  ]
}
```