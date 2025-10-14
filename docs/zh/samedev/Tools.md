```json
[
  {
    "description": "从框架模板创建新 Web 项目的快捷方式。每个项目都配置了 TypeScript、Biome 和 Bun。为项目选择最佳框架。如果所需框架未列出，请不要使用此工具。默认使用 nextjs-shadcn。",
    "name": "startup",
    "parameters": {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "additionalProperties": false,
      "properties": {
        "framework": {
          "description": "项目使用的框架。",
          "enum": [
            "html-ts-css",
            "react-vite",
            "react-vite-tailwind",
            "react-vite-shadcn",
            "nextjs-shadcn",
            "vue-vite",
            "vue-vite-tailwind",
            "shipany"
          ],
          "type": "string"
        },
        "project_name": {
          "description": "项目名称。只允许小写字母、数字和连字符。",
          "type": "string"
        },
        "shadcn_theme": {
          "description": "项目使用的主题。除非应用程序要求另有规定，否则选择锌色主题。",
          "enum": [
            "zinc",
            "blue",
            "green",
            "orange",
            "red",
            "rose",
            "violet",
            "yellow"
          ],
          "type": "string"
        }
      },
      "required": [
        "project_name",
        "framework",
        "shadcn_theme"
      ],
      "type": "object"
    }
  },
  {
    "description": "在用户的的工作区中启动一个功能强大的任务代理。使用说明：\n1. 当代理完成时，它将返回其操作的报告。此报告对用户也是可见的，因此您不必重复任何重叠的信息。\n2. 每次代理调用都是无状态的，无法访问您或用户的聊天历史。您将无法向代理发送额外消息，代理也无法在其最终报告之外与您通信。因此，您的提示应包含高度详细的任务描述，供代理自主执行，并且您应确切指定代理应在其最终且唯一的回复中返回给您的信息。\n3. 通常应信任代理的输出。",
    "name": "task_agent",
    "parameters": {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "additionalProperties": false,
      "properties": {
        "integrations": {
          "description": "选择代理应交互的外部服务。",
          "items": {
            "enum": [],
            "type": "string"
          },
          "type": "array"
        },
        "prompt": {
          "description": "代理要执行的任务。",
          "type": "string"
        },
        "relative_file_paths": {
          "description": "与任务相关的文件的相对路径。",
          "items": {
            "type": "string"
          },
          "type": "array"
        }
      },
      "required": [
        "prompt",
        "integrations",
        "relative_file_paths"
      ],
      "type": "object"
    }
  },
  {
    "description": "运行终端命令。每个命令在独立的 shell 中运行。\n重要：不要使用此工具编辑文件。请改用 `edit_file` 工具。",
    "name": "bash",
    "parameters": {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "additionalProperties": false,
      "properties": {
        "command": {
          "description": "要执行的终端命令。",
          "type": "string"
        },
        "require_user_interaction": {
          "description": "如果命令需要用户与终端交互（例如，安装依赖项），请向用户写一个通知。以 \"与终端交互以...\" 开头的简短单句。否则，为空字符串。",
          "type": "string"
        },
        "starting_server": {
          "description": "命令是否启动服务器进程。",
          "type": "boolean"
        }
      },
      "required": [
        "command",
        "starting_server",
        "require_user_interaction"
      ],
      "type": "object"
    }
  },
  {
    "description": "列出目录内容。在使用更有针对性的工具（如语义搜索或文件读取）之前，用于发现的快速工具。在深入了解特定文件之前，有助于理解文件结构。可用于探索代码库。",
    "name": "ls",
    "parameters": {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "additionalProperties": false,
      "properties": {
        "relative_dir_path": {
          "description": "要列出内容的目录的相对路径。",
          "type": "string"
        }
      },
      "required": [
        "relative_dir_path"
      ],
      "type": "object"
    }
  },
  {
    "description": "使用 glob 模式搜索文件。支持如 *.ts、*/*.tsx、src/**/*.{js,ts} 等模式。当您需要查找匹配特定模式的文件而不是模糊匹配时，请使用此工具。",
    "name": "glob",
    "parameters": {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "additionalProperties": false,
      "properties": {
        "exclude_pattern": {
          "description": "可选的 glob 模式以排除文件（例如，'**/node_modules/**'）。",
          "type": "string"
        },
        "pattern": {
          "description": "用于匹配文件的 Glob 模式（例如，'*.ts', '**/*.tsx', 'src/**/*.{js,ts}'）。",
          "type": "string"
        }
      },
      "required": [
        "pattern",
        "exclude_pattern"
      ],
      "type": "object"
    }
  },
  {
    "description": "快速基于文本的正则表达式搜索，在文件或目录中查找精确模式匹配，利用 ripgrep 命令进行高效搜索。结果将以 ripgrep 风格格式化，可配置为包含行号和内容。为避免输出过多，结果限制为最多 50 个匹配项。使用包含或排除模式按文件类型或特定路径过滤搜索范围。最适合查找精确文本匹配或正则表达式模式。比语义搜索更精确地查找特定字符串或模式。当我们知道要在某些目录/文件类型集中搜索的确切符号、函数名等时，此工具优于语义搜索。",
    "name": "grep",
    "parameters": {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "additionalProperties": false,
      "properties": {
        "case_sensitive": {
          "description": "搜索是否应区分大小写。",
          "type": "boolean"
        },
        "exclude_pattern": {
          "description": "用于排除文件的 Glob 模式（例如，'.test.ts' 用于测试文件）。",
          "type": "string"
        },
        "include_pattern": {
          "description": "用于包含文件的 Glob 模式（例如，'.ts' 用于 TypeScript 文件）。",
          "type": "string"
        },
        "query": {
          "description": "要搜索的正则表达式模式。",
          "type": "string"
        }
      },
      "required": [
        "query",
        "case_sensitive",
        "include_pattern",
        "exclude_pattern"
      ],
      "type": "object"
    }
  },
  {
    "description": "读取文件内容。对于文本文件，输出将是 start_line_one_indexed 和 end_line_one_indexed_inclusive 之间的 1 索引文件内容，以及这些范围外行的摘要。注意它一次最多可查看 750 行。对于二进制文件（如图像），它将显示图像。\n\n使用此工具收集信息时，您有责任确保拥有完整的上下文。具体来说，每次调用此命令时您应：\n1) 评估所查看的内容是否足以继续执行任务。\n2) 注意哪些行未显示。\n3) 如果所查看的文件内容不足，且您怀疑可能在未显示的行中，应主动再次调用工具查看这些行。\n4) 有疑问时，再次调用此工具收集更多信息。请记住，部分文件视图可能会遗漏关键依赖项、导入或功能。\n\n在某些情况下，如果读取行范围不够，您可以选择读取整个文件。读取整个文件通常浪费且缓慢，特别是对于大文件（即几百行以上）。因此您应谨慎使用此选项。在大多数情况下不允许读取整个文件。只有在用户编辑或手动附加到对话中的文件才允许读取整个文件。",
    "name": "read_file",
    "parameters": {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "additionalProperties": false,
      "properties": {
        "end_line_one_indexed": {
          "description": "结束读取的一索引行号（包含）。",
          "type": "number"
        },
        "relative_file_path": {
          "description": "要读取的文件的相对路径。",
          "type": "string"
        },
        "should_read_entire_file": {
          "description": "是否读取整个文件。",
          "type": "boolean"
        },
        "start_line_one_indexed": {
          "description": "开始读取的一索引行号（包含）。",
          "type": "number"
        }
      },
      "required": [
        "relative_file_path",
        "should_read_entire_file",
        "start_line_one_indexed",
        "end_line_one_indexed"
      ],
      "type": "object"
    }
  },
  {
    "description": "删除指定路径的文件。如果出现以下情况，操作将优雅地失败：\n    - 文件不存在\n    - 操作因安全原因被拒绝\n    - 文件无法删除",
    "name": "delete_file",
    "parameters": {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "additionalProperties": false,
      "properties": {
        "relative_file_path": {
          "description": "要删除的文件的相对路径。",
          "type": "string"
        }
      },
      "required": [
        "relative_file_path"
      ],
      "type": "object"
    }
  },
  {
    "description": "使用此工具对现有文件进行大编辑或重构，或创建新文件。\n首先指定 `relative_file_path` 参数。\n`code_edit` 将由一个较不智能的模型读取，该模型将快速应用编辑。\n\n明确编辑内容，同时尽量减少您编写的未更改代码。\n编写编辑时，按顺序使用特殊注释 `// ... existing code ... <description of existing code>` 指定每个编辑，以表示编辑行之间的未更改代码。\n\n例如：\n```\n// ... existing code ... <original import statements>\n<first edit here>\n// ... existing code ... <`LoginButton` component>\n<second edit here>\n// ... existing code ... <the rest of the file>\n```\n始终为每个编辑包含 `// ... existing code ... <description of existing code>` 注释，以指示不应更改的代码。\n\n不要在不使用 `// ... existing code ... <description of existing code>` 注释表明其缺失的情况下省略预先存在的代码跨度。\n\n仅在用户明确要求时使用表情符号。除非被要求，否则避免向文件添加表情符号。",
    "name": "edit_file",
    "parameters": {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "additionalProperties": false,
      "properties": {
        "code_edit": {
          "description": "仅指定您希望编辑的确切代码行。*切勿指定或写出未更改的代码*。相反，使用您正在编辑的语言的注释来表示所有未更改的代码 - 例如：`// ...[existing code] <description of existing code> ...`。",
          "type": "string"
        },
        "instructions": {
          "description": "描述您将为草图编辑执行什么操作的单句指令。不要重复您在普通消息中之前说过的话。并用它来消除编辑中的不确定性。",
          "type": "string"
        },
        "relative_file_path": {
          "description": "要修改的文件的相对路径，或要在其中创建文件的目录的相对路径。",
          "type": "string"
        },
        "smart_apply": {
          "description": "使用更智能的模型来应用 code_edit。如果编辑很长，或者上次编辑不正确且您正在重试，则此功能很有用。请确保包含适当的 `// ... existing code ...` 注释以指示不应更改的代码。",
          "type": "boolean"
        }
      },
      "required": [
        "relative_file_path",
        "instructions",
        "code_edit",
        "smart_apply"
      ],
      "type": "object"
    }
  },
  {
    "description": "在文件中执行精确的字符串替换。\n使用此工具对文件进行小的、特定的编辑。例如，编辑一些文本、几行代码等。对于较大的编辑，请使用 edit_file。\n\n确保保留精确的缩进（制表符/空格），即在 read_file 工具添加的行号前缀之后出现的样子。\n仅在您确信 old_string 在文件中是唯一时才使用此工具，否则请使用 edit_file 工具。\n\n如果 `old_string` 在文件中不唯一，编辑将失败。要么提供更大的字符串，包含更多周围上下文以使其唯一，要么使用 `replace_all` 更改 `old_string` 的每个实例。\n\n使用 `replace_all` 在整个文件中替换和重命名字符串。如果您想重命名变量等，此参数很有用。\n\n仅在用户明确要求时使用表情符号。除非被要求，否则避免向文件添加表情符号。",
    "name": "string_replace",
    "parameters": {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "additionalProperties": false,
      "properties": {
        "new_string": {
          "description": "替换 old_string 的新文本。",
          "type": "string"
        },
        "old_string": {
          "description": "要替换的文本。它在文件中必须是唯一的，并且必须与文件内容完全匹配，包括所有空白和缩进。",
          "type": "string"
        },
        "relative_file_path": {
          "description": "要修改的文件的相对路径，或要在其中创建文件的目录的相对路径。",
          "type": "string"
        },
        "replace_all": {
          "description": "替换 old_string 的所有出现次数。",
          "type": "boolean"
        }
      },
      "required": [
        "relative_file_path",
        "old_string",
        "new_string",
        "replace_all"
      ],
      "type": "object"
    }
  },
  {
    "description": "运行此工具之前，请确保项目的 package.json 文件中存在 lint 脚本且所有包均已安装。此工具将返回 linter 结果，以及可用时最后一次刷新预览时的运行时错误和开发服务器日志。",
    "name": "run_linter",
    "parameters": {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "additionalProperties": false,
      "properties": {
        "package_manager": {
          "description": "用于安装依赖项的包管理器。",
          "enum": [
            "bun",
            "pnpm",
            "npm"
          ],
          "type": "string"
        },
        "project_directory": {
          "description": "要运行 linting 的项目目录。",
          "type": "string"
        }
      },
      "required": [
        "project_directory",
        "package_manager"
      ],
      "type": "object"
    }
  },
  {
    "description": "为项目创建新版本。调用此工具将自动将版本增加 1。如果调用工具时有开发服务器正在运行，工具将显示版本实时预览的整页屏幕截图，并返回任何未解决的 linter 和运行时错误。请经常创建版本。",
    "name": "versioning",
    "parameters": {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "additionalProperties": false,
      "properties": {
        "project_directory": {
          "description": "要版本化的项目目录的相对路径。这是包含项目的 package.json 文件的目录。",
          "type": "string"
        },
        "version_changelog": {
          "description": "版本变更日志。写 1-5 个简短要点。",
          "items": {
            "type": "string"
          },
          "type": "array"
        },
        "version_number": {
          "description": "整数。写空字符串以自动递增。",
          "type": "string"
        },
        "version_title": {
          "description": "版本标题。这用于帮助用户导航到该版本。",
          "type": "string"
        }
      },
      "required": [
        "project_directory",
        "version_title",
        "version_changelog",
        "version_number"
      ],
      "type": "object"
    }
  },
  {
    "description": "向用户建议 1-5 个下一步要实施的步骤。",
    "name": "suggestions",
    "parameters": {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "additionalProperties": false,
      "properties": {
        "suggestions": {
          "description": "1-5 个建议的下一步骤列表。无 '-'、项目符号或其他格式。",
          "items": {
            "type": "string"
          },
          "type": "array"
        }
      },
      "required": [
        "suggestions"
      ],
      "type": "object"
    }
  },
  {
    "description": "将项目部署到 Netlify。调用此工具之前请先为项目创建版本。仔细检查实时预览的整页屏幕截图。如果项目即使处于边缘非法或道德不安全状态，您也不应部署它。\n\n静态部署与动态部署：\nNetlify 接受静态或动态站点部署。部署静态站点要快得多。\n但是，如果项目有后端、API 路由或数据库，请将其部署为动态站点。\n\n对于静态站点部署：\n使用 'zip -r9' 作为您的 `build_and_zip_command` 来创建构建输出的 zip 文件。例如：`cd {project_directory} && {build_command} && mkdir -p output && zip -r9 output/output.zip {build_output_directory}`。\n确保 `relative_zip_path` 正确指向由 `build_and_zip_command` 创建的 zip 文件。\n您无需手动运行 `build_and_zip_command`。工具将为您运行它。\n如果静态站点部署失败，请尝试将项目重新部署为动态站点。\n如果您必须部署 nextjs 静态站点，请阅读 `next.config.js` 文件并确保它包含 `output: 'export'` 和 `distDir: 'out'`。\n\n对于动态站点部署：\n编辑 `netlify.toml` 文件以设置正确的构建命令和输出目录。\n默认的 nextjs 项目部署为动态站点。",
    "name": "deploy",
    "parameters": {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "additionalProperties": false,
      "properties": {
        "deploy_as_dynamic_site": {
          "description": "设置为 true 以部署为动态站点。",
          "type": "boolean"
        },
        "deploy_as_static_site": {
          "additionalProperties": false,
          "description": "部署静态站点。写 build_and_zip_command 和 relative_zip_path。否则，将它们写为空字符串。",
          "properties": {
            "build_and_zip_command": {
              "description": "构建项目并创建构建输出的 zip 文件的命令。",
              "type": "string"
            },
            "relative_zip_path": {
              "description": "要部署的 zip 文件的相对路径。",
              "type": "string"
            }
          },
          "required": [
            "build_and_zip_command",
            "relative_zip_path"
          ],
          "type": "object"
        }
      },
      "required": [
        "deploy_as_static_site",
        "deploy_as_dynamic_site"
      ],
      "type": "object"
    }
  },
  {
    "description": "在网络上搜索实时文本和图像响应。例如，您可以获取训练数据中可能没有的最新信息，验证当前事实，或查找可在项目中使用的图像。您将在响应中看到文本和图像。您可以通过使用 <img> 标签中的链接来使用图像。使用此工具查找可在项目中使用的图像。例如，如果您需要徽标，请使用此工具查找徽标。",
    "name": "web_search",
    "parameters": {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "additionalProperties": false,
      "properties": {
        "search_term": {
          "description": "在网络上查找的搜索词。要具体并包含相关关键字以获得更好的结果。对于技术查询，如果相关，请包含版本号或日期。",
          "type": "string"
        },
        "type": {
          "description": "要执行的搜索类型（文本或图像）。",
          "enum": [
            "text",
            "images"
          ],
          "type": "string"
        }
      },
      "required": [
        "search_term",
        "type"
      ],
      "type": "object"
    }
  },
  {
    "description": "抓取网站以查看其设计和内容。使用此工具获取网站的标题、描述、内容和屏幕截图（如果需要）。每次用户给您文档 URL 阅读或要求您克隆网站时，请使用此工具。使用此工具时，请说 \"我将访问 {url}...\" 或 \"我将阅读 {url}...\"，切勿说 \"我将抓取\"。",
    "name": "web_scrape",
    "parameters": {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "additionalProperties": false,
      "properties": {
        "include_screenshot": {
          "description": "是否查看网站的屏幕截图。阅读文档时设置为 false。",
          "type": "boolean"
        },
        "theme": {
          "description": "以浅色或深色模式抓取网站。",
          "enum": [
            "light",
            "dark"
          ],
          "type": "string"
        },
        "url": {
          "description": "要抓取的网站的 URL。必须是以 http:// 或 https:// 开头的有效 URL",
          "type": "string"
        },
        "viewport": {
          "description": "抓取网站时使用的视口。",
          "enum": [
            "mobile",
            "tablet",
            "desktop"
          ],
          "type": "string"
        }
      },
      "required": [
        "url",
        "theme",
        "viewport",
        "include_screenshot"
      ],
      "type": "object"
    }
  }
]
```