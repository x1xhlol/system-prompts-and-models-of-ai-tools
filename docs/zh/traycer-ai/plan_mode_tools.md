## Traycer AI 计划模式工具综述

这个文档定义了Traycer AI在Plan Mode（计划模式）下可用的工具集合。这些工具专注于代码库分析、文件操作和实现计划制定，帮助AI深入理解代码库并生成详细的实施计划。

### 核心工具分类

1. **文件操作工具**
   - `read_file`: 读取指定路径文件的内容，支持大文件的结构化摘要
   - `read_partial_file`: 读取文件的特定行范围，提高大文件处理效率
   - `list_dir`: 列出目录内容，用于发现和理解文件结构

2. **搜索工具**
   - `file_search`: 基于文件路径的模糊搜索
   - `grep_search`: 基于正则表达式的快速文本搜索
   - `file_outlines`: 获取指定目录中所有文件的符号大纲

3. **代码导航工具**
   - `find_references`: 查找函数、方法、类等的引用位置
   - `go_to_definition`: 跳转到符号的定义位置
   - `go_to_implementations`: 查找抽象类或函数符号的实现

4. **分析和诊断工具**
   - `get_diagnostics`: 获取文件的诊断信息，包括错误、警告和建议
   - `web_search`: 执行网络搜索获取外部知识和文档
   - `think`: 用于复杂推理或头脑风暴的思考工具

5. **计划制定工具**
   - `agent`: 创建专门用于特定任务的代理
   - `hand_over_to_approach_agent`: 将任务移交给方法代理以编写高层次方法
   - `explanation_response`: 提供清晰的解释和可选的Mermaid图表

### 与Phase Mode的区别

Plan Mode工具集与Phase Mode类似，但有以下关键区别：
1. 增加了`think`工具用于复杂推理
2. 增加了`agent`和`hand_over_to_approach_agent`工具用于计划制定和任务分配
3. 部分工具的参数要求更加严格

这些工具帮助Traycer AI在Plan Mode下深入分析代码库，制定详细的实施计划，并创建专门的代理来执行具体任务。

## plan_mode_tools.json

```json
{
  "list_dir": {
    "description": "列出目录的内容。这是用于发现的快速工具，在使更有针对性的工具（如代码库搜索或文件读取）之前使用。有助于在深入研究特定文件之前了解文件结构。可用于探索代码库。",
    "parameters": {
      "path": {
        "description": "要列出其内容的目录的路径。使用绝对路径。",
        "sanitizePath": true,
        "type": "string"
      },
      "recursive": {
        "description": "是否递归列出文件。使用'true'进行递归列出，'false'或省略则仅列出顶层。",
        "type": "boolean"
      }
    },
    "required": [
      "path",
      "recursive"
    ]
  },
  "file_search": {
    "description": "基于文件路径的模糊匹配进行快速文件搜索。如果您知道部分文件路径但不知道其确切位置，请使用此工具。响应将限制为10个结果。如果需要进一步筛选结果，请使您的查询更具体。推测性地批量执行多个可能有用的搜索总是更好的选择。",
    "parameters": {
      "pattern": {
        "description": "要搜索的模糊文件名",
        "type": "string"
      }
    },
    "required": [
      "pattern"
    ]
  },
  "web_search": {
    "description": "执行网络搜索以查找给定查询的相关信息和文档。此工具有助于收集对解决任务有用的外部知识，特别是用于获取最新信息或文档。",
    "parameters": {
      "query": {
        "description": "要在网络上查找的搜索查询。",
        "type": "string"
      }
    },
    "required": [
      "query"
    ]
  },
  "grep_search": {
    "description": "快速的基于文本的正则表达式搜索，可在文件或目录中查找精确的模式匹配，利用ripgrep命令进行高效搜索。结果将以ripgrep的样式格式化，并可配置为包含行号和内容。为避免输出过多，结果上限为50个匹配项。使用包含模式按文件类型或特定路径筛选搜索范围。这最适合查找精确的文本匹配或正则表达式模式。在查找特定字符串或模式方面比代码库搜索更精确。当我们需要在某组目录/文件类型中搜索确切的符号/函数名等时，首选此工具而不是代码库搜索。",
    "parameters": {
      "includePattern": {
        "anyOf": [
          {
            "description": "要包含的文件的Glob模式（例如，'*.ts'用于TypeScript文件）。如果未提供，将搜索所有文件(*)。",
            "type": "string"
          },
          {
            "type": "null"
          }
        ]
      },
      "regex": {
        "description": "要搜索的正则表达式模式。",
        "type": "string"
      }
    },
    "required": [
      "regex",
      "includePattern"
    ]
  },
  "think": {
    "description": "使用此工具来思考某事。它不会获取新信息或对存储库进行任何更改，只是记录想法。当需要复杂推理或头脑风暴时使用它。",
    "parameters": {
      "thought": {
        "description": "您的想法。",
        "type": "string"
      }
    },
    "required": [
      "thought"
    ]
  },
  "read_file": {
    "description": "读取指定路径文件的内容。当您需要检查任何现有文件的内容时使用此工具，例如分析代码、审查文本文件或从配置文件中提取信息。对于大文件，系统将提供结构化摘要，包含行范围和每个部分的简要描述，而不是完整内容。您可以在审阅摘要后使用 read_partial_file 工具请求特定行范围。自动从 PDF 和 DOCX 文件中提取原始文本。可能不适用于其他类型的二进制文件，因为它将原始内容作为字符串返回。推测性地批量读取多个可能有用的文件总是更好的选择。",
    "parameters": {
      "paths": {
        "description": "要读取的文件路径。使用绝对路径。",
        "items": {
          "additionalProperties": false,
          "properties": {
            "includeDiagnostics": {
              "default": false,
              "description": "是否通过内置LSP分析代码来收集诊断信息，包括错误、警告和lint建议。仅当需要识别和解决特定问题时返回true。",
              "type": "boolean"
            },
            "path": {
              "sanitizePath": true,
              "type": "string"
            }
          },
          "required": [
            "path",
            "includeDiagnostics"
          ],
          "type": "object"
        },
        "jsonParse": true,
        "type": "array"
      }
    },
    "required": [
      "paths"
    ]
  },
  "read_partial_file": {
    "description": "从指定路径的文件中读取特定的行范围。当您只需要检查文件的部分内容而不是全部内容时使用此工具，这对于只需要关注代码、配置文件或文本文档的特定部分非常有用。为每个路径指定startLine和numberOfLines属性，以精确控制要读取的文件部分。当您只需要特定部分时，这比读取整个文件更有效率。",
    "parameters": {
      "paths": {
        "description": "要读取的文件的路径。每个项目都是一个对象，包含路径以及可选的startLine和endLine属性以指定行范围。",
        "items": {
          "additionalProperties": false,
          "properties": {
            "includeDiagnostics": {
              "default": false,
              "description": "是否通过内置LSP分析代码来收集诊断信息，包括错误、警告和lint建议。仅当需要识别和解决特定问题时返回true。",
              "type": "boolean"
            },
            "numberOfLines": {
              "description": "从起始行开始读取的行数。允许值为300、500、700或900",
              "type": "number"
            },
            "path": {
              "description": "要读取的文件的路径。使用绝对路径。",
              "sanitizePath": true,
              "type": "string"
            },
            "startLine": {
              "description": "开始读取的行号（从1开始）。可选 - 如果省略，则从第1行开始。",
              "type": "number"
            }
          },
          "required": [
            "path",
            "numberOfLines",
            "startLine",
            "includeDiagnostics"
          ],
          "type": "object"
        },
        "jsonParse": true,
        "type": "array"
      }
    },
    "required": [
      "paths"
    ]
  },
  "file_outlines": {
    "description": "获取指定目录顶层所有文件的符号大纲。当您需要从高层次了解多个文件中的代码时，这尤其有用。",
    "parameters": {
      "path": {
        "description": "要获取其文件大纲的目录的路径。使用绝对路径。",
        "sanitizePath": true,
        "type": "string"
      }
    },
    "required": [
      "path"
    ]
  },
  "find_references": {
    "description": "查找函数、方法、类、接口等的引用（用法、提及等）。使用此工具可以跳转到代码库中给定符号被使用的所有位置。软件开发人员广泛使用此功能以精确地探索大型代码库。当您需要查找符号（LSP跟踪的任何内容）的引用时，请优先使用此工具而不是codebase_search。您需要提供符号被提及的任何地方的文件和行号。查找引用工具将自动将您带到相关位置。这适用于项目内部或外部的位置。",
    "parameters": {
      "line": {
        "anyOf": [
          {
            "description": "符号被提及的行号。此字段是可选的。如果省略，它将匹配文件中此符号的第一次出现。",
            "type": "number"
          },
          {
            "type": "null"
          }
        ]
      },
      "path": {
        "anyOf": [
          {
            "description": "符号被提及的文件的路径。如果省略，它将匹配聊天中带有此符号的最后一个文件。使用绝对路径。",
            "sanitizePath": true,
            "type": "string"
          },
          {
            "type": "null"
          }
        ]
      },
      "symbol": {
        "description": "您要为其查找引用的符号的名称。",
        "type": "string"
      }
    },
    "required": [
      "symbol",
      "path",
      "line"
    ]
  },
  "go_to_definition": {
    "description": "转到函数、方法、类、接口等的定义。使用此工具可以跳转到符号的定义。软件开发人员广泛使用此功能以精确地探索大型代码库。当您需要查找符号（LSP跟踪的任何内容）的定义时，请优先使用此工具而不是codebase_search。您可以提供符号被提及的任何地方的文件和行号。此工具也可以仅对符号起作用，尽管提供文件和符号会给出更精确的结果。转到定义工具将自动将您带到相关位置。这适用于项目内部或外部的位置。",
    "parameters": {
      "line": {
        "anyOf": [
          {
            "description": "符号被提及的行号。此字段是可选的。如果省略，它将匹配文件中此符号的第一次出现。",
            "type": "number"
          },
          {
            "type": "null"
          }
        ]
      },
      "path": {
        "anyOf": [
          {
            "description": "符号被提及的文件的路径。如果省略，它将匹配聊天中带有此符号的最后一个文件。使用绝对路径。",
            "sanitizePath": true,
            "type": "string"
          },
          {
            "type": "null"
          }
        ]
      },
      "symbol": {
        "description": "您要为其查找定义的符号的名称。",
        "type": "string"
      }
    },
    "required": [
      "symbol",
      "path",
      "line"
    ]
  },
  "go_to_implementations": {
    "description": "使用内置LSP‘转到实现’给定的抽象类或函数符号。",
    "parameters": {
      "line": {
        "anyOf": [
          {
            "description": "符号被提及的行号。此字段是可选的。如果省略，它将匹配文件中此符号的第一次出现。",
            "type": "number"
          },
          {
            "type": "null"
          }
        ]
      },
      "path": {
        "anyOf": [
          {
            "description": "符号被提及的文件的路径。如果省略，它将匹配聊天中带有此符号的最后一个文件。使用绝对路径。",
            "sanitizePath": true,
            "type": "string"
          },
          {
            "type": "null"
          }
        ]
      },
      "symbol": {
        "description": "您要为其查找实现的符号的名称。",
        "type": "string"
      }
    },
    "required": [
      "symbol",
      "path",
      "line"
    ]
  },
  "get_diagnostics": {
    "description": "通过使用内置LSP分析代码，检索与glob模式匹配的多个文件的诊断信息，包括错误、警告和lint建议。使用此功能可以识别和解决跨多个匹配特定模式的文件的问题。",
    "parameters": {
      "directories": {
        "description": "要从中检索诊断信息的目录。使用绝对路径。如果您想搜索工作区中的所有文件，请提供打开的工作区目录。",
        "items": {
          "description": "要搜索文件的目录。使用绝对路径。",
          "type": "string"
        },
        "type": "array"
      },
      "includePattern": {
        "anyOf": [
          {
            "description": "要包含的文件的Glob模式（例如，'*.ts'用于TypeScript文件）。如果未提供，将搜索所有文件(*)。",
            "type": "string"
          },
          {
            "type": "null"
          }
        ]
      },
      "severity": {
        "anyOf": [
          {
            "description": "要检索的诊断信息的严重性级别。",
            "enum": [
              "Error",
              "Warning",
              "Information",
              "Hint"
            ],
            "type": "string"
          },
          {
            "description": "如果未提供，则返回所有严重性级别。",
            "type": "null"
          }
        ]
      }
    },
    "required": [
      "directories",
      "includePattern",
      "severity"
    ]
  },
  "agent": {
    "description": "为特定任务创建专门的代理",
    "parameters": {
      "description": {
        "description": "任务的简短（3-5个词）描述",
        "type": "string"
      },
      "directoryMaps": {
        "description": "作为任务良好起点的目录的完整路径列表。代理将被给予文件夹中的文件和子目录列表。不要假设路径，只有在以前的对话中遇到过路径时才添加路径。",
        "items": {
          "type": "string"
        },
        "type": "array"
      },
      "name": {
        "description": "代理的名称。将其命名为\"代理 <标识符> - <其角色的3-5个字母描述>\"",
        "type": "string"
      },
      "prompt": {
        "description": "代理要执行的任务",
        "type": "string"
      },
      "relevantFiles": {
        "description": "与任务相关的文件的完整路径列表。代理将被提供文件的内容。不要假设路径，只有在以前的对话中遇到过路径时才添加路径。使用绝对路径。",
        "items": {
          "sanitizePath": true,
          "type": "string"
        },
        "type": "array"
      }
    },
    "required": [
      "description",
      "prompt",
      "name",
      "directoryMaps",
      "relevantFiles"
    ]
  },
  "hand_over_to_approach_agent": {
    "description": "使用此工具表示您已探索了代码库的高级结构，现在准备移交给方法代理以编写高级方法。",
    "parameters": {
      "reason": {
        "description": "所选targetRole的理由，解释为什么这种探索深度是合适的。",
        "type": "string"
      },
      "targetRole": {
        "description": "在起草逐文件计划之前需要多少探索。planner：任务非常小且直接，根本不需要更多探索，现在可以提出完整的文件逐文件计划；architect：在编写文件逐文件计划之前需要方法和更详细的探索；engineering_team：任务非常大，可能需要多方面的分析，涉及各种组件之间的复杂交互，然后才能编写方法并制定文件逐文件计划。",
        "enum": [
          "engineering_team",
          "architect",
          "planner"
        ],
        "type": "string"
      }
    },
    "required": [
      "targetRole",
      "reason"
    ]
  },
  "explanation_response": {
    "description": "- 您勤奋而彻底！您在解释中从不留下任何模棱两可的部分。\n- 提供清晰、简洁、易于理解的解释。\n- 使用markdown格式以提高可读性。",
    "parameters": {
      "containsImplementationPlan": {
        "description": "当解释提供可以作为文件修改直接实施的具体、可操作的指导时，设置为true，无论其是作为分析、建议还是明确的指令呈现。",
        "type": "boolean"
      },
      "explanation": {
        "description": "提供对主题或概念的清晰而全面的解释。优化可读性并使用markdown格式。",
        "type": "string"
      },
      "mermaid": {
        "description": "生成一个Mermaid图来可视化概念或流程。该图应简单易懂，专注于关键方面。",
        "type": "string"
      }
    },
    "required": [
      "explanation",
      "mermaid",
      "containsImplementationPlan"
    ]
  }
}
```