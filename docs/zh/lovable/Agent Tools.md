# Lovable AI 工具总结

Lovable AI 提供了以下核心工具来创建和修改 Web 应用程序：

1. **lov-add-dependency** - 添加项目依赖
   - 用于向项目添加依赖项，依赖项应为有效的 npm 包名

2. **lov-search-files** - 基于正则表达式的代码搜索
   - 使用正则表达式模式在项目中搜索文件
   - 支持文件过滤和上下文搜索

3. **lov-write** - 写入文件
   - 用于写入文件，如果文件已存在则覆盖
   - 主要用于创建新文件或作为备用工具

4. **lov-line-replace** - 基于行的搜索和替换工具
   - 用于查找和替换文件中的特定内容
   - 使用显式行号进行编辑，是修改现有文件的首选工具

5. **lov-download-to-repo** - 下载文件到仓库
   - 从 URL 下载文件并保存到仓库中
   - 适用于下载图像、资产或其他文件

6. **lov-fetch-website** - 获取网站内容
   - 获取网站内容并临时保存为 markdown、HTML 或截图
   - 返回创建文件的路径和内容预览

7. **lov-copy** - 复制文件或目录
   - 用于将文件或目录复制到新位置

8. **lov-view** - 查看文件内容
   - 用于读取文件内容，可选择指定行范围

9. **lov-read-console-logs** - 读取控制台日志
   - 用于读取最新的控制台日志内容

10. **lov-read-network-requests** - 读取网络请求
    - 用于读取最新的网络请求内容

11. **lov-remove-dependency** - 移除依赖
    - 用于从项目中卸载包

12. **lov-rename** - 重命名文件
    - 用于重命名文件而不是创建新文件和删除旧文件

13. **lov-delete** - 删除文件
    - 用于删除文件

14. **secrets--add_secret** - 添加密钥
    - 添加新的密钥如 API 密钥或令牌

15. **secrets--update_secret** - 更新密钥
    - 更新现有的密钥如 API 密钥或令牌

16. **supabase--docs-search** - 搜索 Supabase 文档
    - 通过内容 API 搜索官方 Supabase 文档

17. **supabase--docs-get** - 获取 Supabase 文档
    - 通过内容 API 获取完整的 Supabase 文档页面

18. **document--parse_document** - 解析文档
    - 解析和提取文档内容，处理 PDF、Word 文档等多种格式

19. **imagegen--generate_image** - 生成图像
    - 基于文本提示生成图像并保存到指定路径

20. **imagegen--edit_image** - 编辑图像
    - 编辑或合并现有图像

21. **websearch--web_search** - 网络搜索
    - 执行网络搜索并返回相关结果

22. **analytics--read_project_analytics** - 读取项目分析数据
    - 读取项目生产构建的分析数据

23. **stripe--enable_stripe** - 启用 Stripe 集成
    - 在当前项目上启用 Stripe 集成

24. **security--run_security_scan** - 运行安全扫描
    - 对 Supabase 后端执行全面的安全分析

25. **security--get_security_scan_results** - 获取安全扫描结果
    - 获取用户可访问的项目安全信息

26. **security--get_table_schema** - 获取表结构
    - 获取项目 Supabase 数据库的表结构信息

## Agent Tools.json

```json
{
  "lov-add-dependency": {
    "description": "使用此工具向项目添加依赖项。依赖项应为有效的 npm 包名。",
    "parameters": {
      "properties": {
        "package": {
          "example": "lodash@latest",
          "type": "string"
        }
      },
      "required": ["package"],
      "type": "object"
    }
  },
  "lov-search-files": {
    "description": "基于正则表达式的代码搜索，支持文件过滤和上下文。\n\n使用正则表达式模式在项目中搜索。\n\n参数：\n- query: 要查找的正则表达式模式（例如，\"useState\"）\n- include_pattern: 使用 glob 语法包含的文件（例如，\"src/**\"）\n- exclude_pattern: 使用 glob 语法排除的文件（例如，\"**/*.test.tsx\"）\n- case_sensitive: 是否匹配大小写（默认：false）\n\n提示：使用 \\\\ 转义正则表达式中的特殊字符。",
    "parameters": {
      "properties": {
        "case_sensitive": {
          "example": "false",
          "type": "boolean"
        },
        "exclude_pattern": {
          "example": "src/components/ui/**",
          "type": "string"
        },
        "include_pattern": {
          "example": "src/**",
          "type": "string"
        },
        "query": {
          "example": "useEffect\\(",
          "type": "string"
        }
      },
      "required": ["query", "include_pattern"],
      "type": "object"
    }
  },
  "lov-write": {
    "description": "\n使用此工具写入文件。如果文件已存在则覆盖。文件路径应相对于项目根目录。\n\n  ### 重要：最小化代码写入\n  - 更倾向于使用 lov-line-replace 进行大多数更改，而不是重写整个文件\n  - 此工具主要用于创建新文件或作为 lov-line-replace 失败时的备用方案\n  - 当必须写入时，最大化使用 \"// ... keep existing code\" 来维护未修改的部分\n  - 仅写入需要更改的特定部分 - 尽可能懒惰地写入\n  \n  ### 使用 \"keep existing code\"（对于大的未更改部分是必需的）：\n  - 任何超过 5 行的未更改代码块必须使用 \"// ... keep existing code\" 注释\n  - 注释必须包含确切的字符串 \"... keep existing code\" \n  - 示例：\"// ... keep existing code (用户界面组件)\"\n  - 从不重写不需要更改的大量代码部分\n  \n  使用 keep existing code 的正确示例：\n  ```\n  import React from 'react';\n  import './App.css';\n  \n  function App() {\n    // ... keep existing code (所有 UI 组件)\n    \n    // 只添加新的页脚\n    const Footer = () => (\n      新页脚组件\n    );\n    \n    return (\n      \n        // ... keep existing code (主要内容)\n        \n      \n    );\n  }\n  \n  export default App;\n  ```\n\n  ### 并行工具使用\n  - 如果需要创建多个文件，非常重要的是要一次性创建所有文件而不是一个一个创建，因为这样更快\n",
    "parameters": {
      "properties": {
        "content": {
          "example": "console.log('Hello, World!')",
          "type": "string"
        },
        "file_path": {
          "example": "src/main.ts",
          "type": "string"
        }
      },
      "required": ["file_path", "content"],
      "type": "object"
    }
  },
  "lov-line-replace": {
    "description": "基于行的搜索和替换工具\n\n使用此工具在您有权访问的文件中查找和替换特定内容，使用显式行号。这是修改现有文件的首选和主要工具。修改现有代码时总是使用此工具而不是重写整个文件。\n\n提供以下详细信息来进行编辑：\n\t1.\tfile_path - 要修改的文件路径\n\t2.\tsearch - 要搜索的内容（对于大段落使用省略号 ... 而不是完整写出）\n\t3.\tfirst_replaced_line - 搜索中第一行的行号（从1开始）\n\t4.\tlast_replaced_line - 搜索中最后一行的行号（从1开始）\n\t5.\treplace - 要替换找到内容的新内容\n\n工具将验证搜索是否与指定行范围的内容匹配，然后用 replace 替换它。\n\n重要：当并行调用此工具多次（对同一文件进行多次编辑）时，总是使用最初查看文件时的原始行号。不要根据之前的编辑调整行号。\n\n省略号的使用：\n当替换超过约6行的代码段时，您应该在搜索中使用省略号（...）以减少需要指定的行数（写入更少的行更快）。\n- 包含要替换部分的前几行（通常2-3行）\n- 添加 \"...\" 在单独的行上表示省略的内容\n- 包含要替换部分的最后几行（通常2-3行）\n- 关键是提供足够的唯一上下文在开头和结尾以确保准确匹配\n- 专注于唯一性而不是确切的行数 - 有时2行就足够了，有时需要4行\n\n\n\n示例：\n要替换第22-42行的用户卡片组件：\n\n文件中的原始内容（第20-45行）：\n20:   return (\n21:     \n22:       \n23:         \n24:         {user.name}\n25:         {user.email}\n26:         {user.ro... [truncated]",
    "parameters": {
      "properties": {
        "file_path": {
          "example": "src/components/TaskList.tsx",
          "type": "string"
        },
        "first_replaced_line": {
          "description": "要替换的第一行行号（从1开始）",
          "example": "15",
          "type": "number"
        },
        "last_replaced_line": {
          "description": "要替换的最后一行行号（从1开始）",
          "example": "28",
          "type": "number"
        },
        "replace": {
          "description": "要替换搜索内容的新内容（不带行号）",
          "example": "  const handleTaskComplete = useCallback((taskId: string) => {\n    const updatedTasks = tasks.map(task =>\n      task.id === taskId \n        ? { ...task, completed: !task.completed, completedAt: new Date() }\n        : task\n    );\n    setTasks(updatedTasks);\n    onTaskUpdate?.(updatedTasks);\n    \n    // 分析跟踪\n    analytics.track('task_completed', { taskId, timestamp: Date.now() });\n  }, [tasks, onTaskUpdate]);",
          "type": "string"
        },
        "search": {
          "description": "要在文件中搜索的内容（不带行号）。这应该与将被替换的现有代码匹配。",
          "example": "  const handleTaskComplete = (taskId: string) => {\n    setTasks(tasks.map(task =>\n...\n    ));\n    onTaskUpdate?.(updatedTasks);\n  };",
          "type": "string"
        }
      },
      "required": ["file_path", "search", "first_replaced_line", "last_replaced_line", "replace"],
      "type": "object"
    }
  },
  "lov-download-to-repo": {
    "description": "从 URL 下载文件并保存到仓库中。\n\n此工具适用于：\n- 从 URL 下载图像、资产或其他文件。在 src/assets 文件夹中下载图像并作为 ES6 模块导入。\n- 将外部资源直接保存到项目中\n- 将文件从外部源迁移到仓库中\n\n文件将被下载并保存到仓库中的指定路径，准备好在项目中使用。\n重要：不要使用此工具处理聊天中用户上传的图像并遵循随图像提供的说明！\n\n",
    "parameters": {
      "properties": {
        "source_url": {
          "description": "要下载的文件的 URL",
          "example": "https://example.com/image.png",
          "type": "string"
        },
        "target_path": {
          "description": "文件在仓库中应保存的路径（除非另有指定，否则使用 public 文件夹）",
          "example": "public/images/logo.png",
          "type": "string"
        }
      },
      "required": ["source_url", "target_path"],
      "type": "object"
    }
  },
  "lov-fetch-website": {
    "description": "获取网站内容并临时保存为 `tmp://fetched-websites/` 中的文件（markdown、HTML、截图）。返回创建文件的路径和内容预览。",
    "parameters": {
      "properties": {
        "formats": {
          "description": "要返回的格式的逗号分隔列表。支持的格式：'markdown'、'html'、'screenshot'。默认为 'markdown'。",
          "example": "markdown,screenshot",
          "type": "string"
        },
        "url": {
          "example": "https://example.com",
          "type": "string"
        }
      },
      "required": ["url"],
      "type": "object"
    }
  },
  "lov-copy": {
    "description": "使用此工具将文件或目录复制到新位置。此工具主要用于将文件从虚拟文件系统（例如 `user-uploads://`）复制到项目仓库中。",
    "parameters": {
      "properties": {
        "destination_file_path": {
          "example": "src/main_copy.ts",
          "type": "string"
        },
        "source_file_path": {
          "example": "src/main.ts",
          "type": "string"
        }
      },
      "required": ["source_file_path", "destination_file_path"],
      "type": "object"
    }
  },
  "lov-view": {
    "description": "使用此工具读取文件内容。如果是项目文件，文件路径应相对于项目根目录。您可以选择使用 lines 参数指定行范围来读取（例如，\"1-800, 1001-1500\"）。默认情况下，如果未指定 lines，则读取前 500 行。\n\n重要指南：\n- 如果文件内容已提供在 \n- 除非文件非常大（>500 行），否则不要指定行范围 - 依赖默认行为显示前 500 行\n- 仅当需要查看在默认视图中未显示的大型文件的特定部分时才使用行范围\n- 如果需要读取多个文件，并行调用此工具（而不是顺序调用）以提高效率",
    "parameters": {
      "properties": {
        "file_path": {
          "example": "src/App.tsx",
          "type": "string"
        },
        "lines": {
          "example": "1-800, 1001-1500",
          "type": "string"
        }
      },
      "required": ["file_path"],
      "type": "object"
    }
  },
  "lov-read-console-logs": {
    "description": "使用此工具读取用户发送请求时的最新控制台日志内容。\n您可以选择提供搜索查询来过滤日志。如果为空，您将获得所有最新日志。\n您可能无法看到最近未发生的日志。\n在您构建和编写代码时日志不会更新。因此，不要期望通过再次读取日志来验证是否修复了问题。它们将与您开始编写代码时相同。\n不要使用此工具超过一次，因为每次都会获得相同的日志。",
    "parameters": {
      "properties": {
        "search": {
          "example": "error",
          "type": "string"
        }
      },
      "required": ["search"],
      "type": "object"
    }
  },
  "lov-read-network-requests": {
    "description": "使用此工具读取最新的网络请求内容。您可以选择提供搜索查询来过滤请求。如果为空，您将获得所有最新请求。您可能无法看到最近未发生的请求。",
    "parameters": {
      "properties": {
        "search": {
          "example": "error",
          "type": "string"
        }
      },
      "required": ["search"],
      "type": "object"
    }
  },
  "lov-remove-dependency": {
    "description": "使用此工具从项目中卸载包。",
    "parameters": {
      "properties": {
        "package": {
          "example": "lodash",
          "type": "string"
        }
      },
      "required": ["package"],
      "type": "object"
    }
  },
  "lov-rename": {
    "description": "您必须使用此工具重命名文件，而不是创建新文件和删除旧文件。原始文件路径和新文件路径应相对于项目根目录。",
    "parameters": {
      "properties": {
        "new_file_path": {
          "example": "src/main_new2.ts",
          "type": "string"
        },
        "original_file_path": {
          "example": "src/main.ts",
          "type": "string"
        }
      },
      "required": ["original_file_path", "new_file_path"],
      "type": "object"
    }
  },
  "lov-delete": {
    "description": "使用此工具删除文件。文件路径应相对于项目根目录。",
    "parameters": {
      "properties": {
        "file_path": {
          "example": "src/App.tsx",
          "type": "string"
        }
      },
      "required": ["file_path"],
      "type": "object"
    }
  },
  "secrets--add_secret": {
    "description": "添加新的密钥如 API 密钥或令牌。如果任何集成需要此密钥或用户希望您使用密钥，您可以使用此工具添加它。此工具确保密钥被正确加密和存储。从不直接要求用户提供密钥值，而是调用此工具获取密钥。您添加的任何密钥都将在您编写的所有后端代码中作为环境变量可用。重要：这是收集密钥的唯一方式，不要以任何其他方式添加。",
    "parameters": {
      "properties": {
        "secret_name": {
          "example": "STRIPE_API_KEY",
          "type": "string"
        }
      },
      "required": ["secret_name"],
      "type": "object"
    }
  },
  "secrets--update_secret": {
    "description": "更新现有的密钥如 API 密钥或令牌。如果任何集成需要此密钥或用户希望您使用密钥，您可以使用此工具更新它。此工具确保密钥被正确加密和存储。",
    "parameters": {
      "properties": {
        "secret_name": {
          "example": "STRIPE_API_KEY",
          "type": "string"
        }
      },
      "required": ["secret_name"],
      "type": "object"
    }
  },
  "supabase--docs-search": {
    "description": "通过内容 API 搜索官方 Supabase 文档。返回包含标题、slug、URL 和内容片段的排名结果。\n\n何时使用：\n- 查找关于认证、数据库、存储或边缘函数的文档\n- 搜索代码示例或实现指南\n\n搜索提示：\n- 使用具体术语如 \"row level security\"、\"auth policies\"、\"storage buckets\"\n- 如果初始搜索没有结果，尝试不同的关键词组合\n\n下一步：\n- 使用 'docs-get' 工具和返回的 slug 获取完整结构化内容\n\n示例：\n- \"RLS policies\" - 返回行级安全文档  \n- \"storage file upload\" - 显示文件存储实现文档",
    "parameters": {
      "properties": {
        "max_results": {
          "description": "最大结果数（默认 5，上限为 10）",
          "type": "number"
        },
        "query": {
          "description": "在 Supabase 文档中搜索的查询",
          "type": "string"
        }
      },
      "required": ["query"],
      "type": "object"
    }
  },
  "supabase--docs-get": {
    "description": "通过内容 API 按 slug 获取完整的 Supabase 文档页面。返回包含完整 markdown、标题大纲和元数据的结构化内容。\n\n何时使用：\n- 通过 'docs-search' 找到相关文档后\n- 当您有特定的文档 slug/路径时\n- 需要完整的实现细节和代码示例时\n\n输入格式：\n- 使用搜索结果中的 slug（例如，\"auth/row-level-security\"）\n- 格式：\"category/subcategory/page-name\"\n\n输出包括：\n- 包含代码片段的完整 markdown 内容\n- 结构化标题大纲\n\n示例：\n- \"auth/row-level-security\" - 完整的 RLS 实现指南\n- \"storage/uploads\" - 全面的文件上传实现",
    "parameters": {
      "properties": {
        "slug": {
          "description": "要获取的规范文档 slug（例如 auth/row-level-security）",
          "type": "string"
        }
      },
      "required": ["slug"],
      "type": "object"
    }
  },
  "document--parse_document": {
    "description": "解析和提取文档内容（前 50 页）。处理 PDF、Word 文档、PowerPoint、Excel、MP3 和许多其他格式。保留文档结构、表格，提取图像，并对嵌入的图像执行 OCR。",
    "parameters": {
      "properties": {
        "file_path": {
          "description": "要解析的文档文件的路径",
          "type": "string"
        }
      },
      "required": ["file_path"],
      "type": "object"
    }
  },
  "imagegen--generate_image": {
    "description": "根据文本提示生成图像并保存到指定文件路径。对于真正重要的大图像使用最佳模型。在选择尺寸时考虑页面上图像位置的纵横比。\n\n对于小图像（小于 1000px），使用 flux.schnell，它更快且真的很好！这应该是您的默认模型。\n当您生成大图像如全屏图像时，使用 flux.dev。最大分辨率为 1920x1920。\n生成后，您必须在代码中作为 ES6 导入导入图像。\n\n提示技巧：\n- 在提示中提及纵横比将帮助模型生成具有正确尺寸的图像。例如：\"16:9 纵横比的平静海洋上的日落图像。\"\n- 在提示后加上 \"Ultra high resolution\" 后缀以最大化图像质量。\n- 例如，如果您生成英雄图像，在提示中提及它。示例：\"日落平静海洋的英雄图像。\"\n\n示例：\nimport heroImage from \"@/assets/hero-image.jpg\";\n\n重要：\n- 尺寸必须在 512 到 1920 像素之间且为 32 的倍数。\n- 确保不要用生成的图像替换用户上传的图像，除非他们明确要求。",
    "parameters": {
      "properties": {
        "height": {
          "description": "图像高度（最小 512，最大 1920）",
          "type": "number"
        },
        "model": {
          "description": "用于生成的模型。选项：flux.schnell（默认），flux.dev。flux.dev 生成更高质量的图像但较慢。总是使用 flux.schnell，除非您生成大图像如英雄图像或全屏横幅，或者用户要求高质量。",
          "type": "string"
        },
        "prompt": {
          "description": "所需图像的文本描述",
          "type": "string"
        },
        "target_path": {
          "description": "生成的图像应保存的文件路径。更喜欢将它们放在 'src/assets' 文件夹中。",
          "type": "string"
        },
        "width": {
          "description": "图像宽度（最小 512，最大 1920）",
          "type": "number"
        }
      },
      "required": ["prompt", "target_path"],
      "type": "object"
    }
  },
  "imagegen--edit_image": {
    "description": "根据文本提示编辑或合并现有图像。\n\n此工具可以处理单个或多个图像：\n- 单个图像：根据您的提示应用 AI 驱动的编辑\n- 多个图像：根据您的提示合并/组合图像\n\n单个图像的示例提示：\n- \"使其下雨\"\n- \"更改为日落照明\"\n- \"添加雪\"\n- \"使其更加多彩\"\n\n多个图像的示例提示：\n- \"无缝融合这两个景观\"\n- \"将第一张图像的前景与第二张图像的背景结合\"\n- \"将这些肖像合并成一张集体照\"\n- \"从这些图像创建拼贴\"\n\n\n此工具非常适合对象或角色一致性。您可以重用相同的图像并将其放置在不同的场景中。如果用户要求调整现有图像，使用此工具而不是生成新图像。",
    "parameters": {
      "properties": {
        "image_paths": {
          "description": "现有图像文件路径的数组。对于单个图像编辑，提供一个路径。对于合并/组合多个图像，提供多个路径。",
          "items": {
            "type": "string"
          },
          "type": "array"
        },
        "prompt": {
          "description": "描述如何编辑/合并图像的文本。对于多个图像，描述它们应该如何组合。",
          "type": "string"
        },
        "target_path": {
          "description": "编辑/合并的图像应保存的文件路径。",
          "type": "string"
        }
      },
      "required": ["image_paths", "prompt", "target_path"],
      "type": "object"
    }
  },
  "websearch--web_search": {
    "description": "执行网络搜索并返回包含文本内容的相关结果。\n使用此工具查找当前信息、文档或任何基于网络的内容。\n您可以选择要求返回链接或图像链接。\n您也可以选择指定要返回的搜索结果类别。\n有效类别为（您必须使用确切的字符串）：\n- \"news\"\n- \"linkedin profile\"\n- \"pdf\"\n- \"github\"\n- \"personal site\"\n- \"financial report\"\n\n没有其他类别。如果您不指定类别，搜索将是通用的。\n\n何时使用？\n- 当您对用户询问的内容没有任何信息时。\n- 当您需要查找当前信息、文档或任何基于网络的内容时。\n- 当您需要查找特定技术信息等时。\n- 当您需要查找有关特定人员、公司或组织的信息时。\n- 当您需要查找有关特定事件、产品或服务的信息时。\n- 当您需要查找有关特定人员、公司或组织的真实（非 AI 生成）图像时。\n\n** 搜索指南 **\n\n您可以使用查询中的 \"site:domain.com\" 过滤结果到特定域。\n您可以指定多个域：\"site:docs.anthropic.com site:github.com API documentation\" 将在两个域上搜索。\n您可以通过将短语放在双引号中来搜索确切短语：'\"gpt5\" model name OAI' 将在搜索中包含 \"gpt5\"。\n您可以通过在单词前加上减号来排除特定单词：jaguar speed -car 将从搜索中排除 \"car\"。\n对于技术信息，以下来源特别有用：stackoverflow、github、产品、框架或服务的官方文档。\n在您的响应中考虑 \"当前日期\"。例如，如果您的指令说 \"当前日期：2025-07-01\"，而用户想要最新文档，不要在搜索查询中使用 2024。使用 2025！",
    "parameters": {
      "properties": {
        "category": {
          "description": "要返回的搜索结果类别",
          "type": "string"
        },
        "imageLinks": {
          "description": "为每个结果返回的图像链接数",
          "type": "number"
        },
        "links": {
          "description": "为每个结果返回的链接数",
          "type": "number"
        },
        "numResults": {
          "description": "要返回的搜索结果数（默认：5）",
          "type": "number"
        },
        "query": {
          "description": "搜索查询",
          "type": "string"
        }
      },
      "required": ["query"],
      "type": "object"
    }
  },
  "analytics--read_project_analytics": {
    "description": "读取项目生产构建在两个日期之间的分析数据，具有给定的粒度。粒度可以是 'hourly' 或 'daily'。开始和结束日期必须采用 YYYY-MM-DD 格式。\n开始和结束日期应采用 RFC3339 格式或仅日期格式（YYYY-MM-DD）。\n\n何时使用此工具：\n- 当用户询问其应用程序的使用情况时\n- 当用户想要改进其生产应用程序时",
    "parameters": {
      "properties": {
        "enddate": {
          "type": "string"
        },
        "granularity": {
          "type": "string"
        },
        "startdate": {
          "type": "string"
        }
      },
      "required": ["startdate", "enddate", "granularity"],
      "type": "object"
    }
  },
  "stripe--enable_stripe": {
    "description": "在当前项目上启用 Stripe 集成。调用此工具将提示用户输入其 Stripe 密钥。",
    "parameters": {
      "properties": {},
      "required": [],
      "type": "object"
    }
  },
  "security--run_security_scan": {
    "description": "对 Supabase 后端执行全面的安全分析，以检测暴露的数据、缺失的 RLS 策略和安全配置错误",
    "parameters": {
      "properties": {},
      "required": [],
      "type": "object"
    }
  },
  "security--get_security_scan_results": {
    "description": "获取用户可访问的项目安全信息。设置 force=true 以获取结果，即使扫描正在进行。",
    "parameters": {
      "properties": {
        "force": {
          "type": "boolean"
        }
      },
      "required": ["force"],
      "type": "object"
    }
  },
  "security--get_table_schema": {
    "description": "获取项目 Supabase 数据库的数据库表结构信息和安全分析提示",
    "parameters": {
      "properties": {},
      "required": [],
      "type": "object"
    }
  }
}
```