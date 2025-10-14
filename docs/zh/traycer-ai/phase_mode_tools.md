## Traycer AI 阶段模式工具综述

本文档定义了 Traycer AI 在阶段模式（Phase Mode）下可用的工具集合。这些工具主要用于代码库探索、文件分析和任务分解，帮助 AI 理解用户代码库并将其任务分解为可执行的阶段。

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

5. **交互工具**
   - `ask_user_for_clarification`: 向用户询问澄清或关键设计决策
   - `explanation_response`: 提供清晰的解释和可选的 Mermaid 图表
   - `write_phases`: 将编码任务分解为可独立执行的阶段

每个工具都遵循严格的参数规范，确保 AI 能够高效地探索代码库、分析任务并生成合理的阶段分解方案。

## phase_mode_tools.json

```json
{
  "read_file": {
    "description": "读取指定路径文件的内容。当您需要检查任何现有文件的内容时使用此工具，例如分析代码、审查文本文件或从配置文件中提取信息。对于大文件，系统将提供结构化摘要，包含行范围和每个部分的简要描述，而不是完整内容。您可以在审阅摘要后使用 read_partial_file 工具请求特定行范围。自动从 PDF 和 DOCX 文件中提取原始文本。可能不适用于其他类型的二进制文件，因为它将原始内容作为字符串返回。推测性地批量读取多个可能有用的文件总是更好的选择。",
    "parameters": {
      "paths": {
        "description": "要读取的文件路径。使用绝对路径。",
        "items": {
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
          "required": ["path", "includeDiagnostics"],
          "type": "object"
        },
        "type": "array"
      }
    }
  },

  "read_partial_file": {
    "description": "从指定路径的文件中读取特定的行范围。当您只需要检查文件的部分内容而不是全部内容时使用此工具，这对于只需要关注代码、配置文件或文本文档的特定部分非常有用。为每个路径指定startLine和numberOfLines属性，以精确控制要读取的文件部分。当您只需要特定部分时，这比读取整个文件更有效率。",
    "parameters": {
      "paths": {
        "description": "要读取的文件的路径。每个项目都是一个对象，包含路径以及可选的startLine和endLine属性以指定行范围。",
        "items": {
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
          "required": ["path", "numberOfLines", "startLine", "includeDiagnostics"],
          "type": "object"
        },
        "type": "array"
      }
    }
  },

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
    }
  },

  "file_search": {
    "description": "基于文件路径的模糊匹配进行快速文件搜索。如果您知道部分文件路径但不知道其确切位置，请使用此工具。响应将限制为10个结果。如果需要进一步筛选结果，请使您的查询更具体。推测性地批量执行多个可能有用的搜索总是更好的选择。",
    "parameters": {
      "pattern": {
        "description": "要搜索的模糊文件名",
        "type": "string"
      }
    }
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
    }
  },

  "web_search": {
    "description": "执行网络搜索以查找给定查询的相关信息和文档。此工具有助于收集对解决任务有用的外部知识，特别是用于获取最新信息或文档。",
    "parameters": {
      "query": {
        "description": "要在网络上查找的搜索查询。",
        "type": "string"
      }
    }
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
            "description": "如果未提供，则返回所有严重性级别。",
            "type": "null"
          }
        ]
      },
      "severity": {
        "anyOf": [
          {
            "description": "要检索的诊断信息的严重性级别。",
            "enum": ["Error", "Warning", "Information", "Hint"],
            "type": "string"
          },
          {
            "description": "如果未提供，则返回所有严重性级别。",
            "type": "null"
          }
        ]
      }
    }
  },

  "file_outlines": {
    "description": "获取指定目录顶层所有文件的符号大纲。当您需要从高层次了解多个文件中的代码时，这尤其有用。",
    "parameters": {
      "path": {
        "description": "要获取其文件大纲的目录的路径。使用绝对路径。",
        "sanitizePath": true,
        "type": "string"
      }
    }
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
    }
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
    }
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
    }
  },

  "explanation_response": {
    "description": "- 您勤奋而彻底！您在解释中从不留下任何模棱两可的部分。\n- 提供清晰、简洁、易于理解的解释。\n- 使用markdown格式以提高可读性。",
    "parameters": {
      "canProposePhases": {
        "description": "仅当解释包含可以分解为可操作阶段的实现策略时才设置为true。\n\n例如：\n**设置为TRUE时：**\n* 您提供了一个完整的解决方案架构，其中包含实现步骤（例如，JSON序列化重新设计）。\n* 您用具体的技术步骤解释了‘如何实现功能X’。\n* 您提出了一个带有明确指导的重构。\n* 您概述了带有实现细节的架构更改。\n* 当您提出问题的分析以及解决方案时。\n\n**保持为FALSE时，\n• 纯粹是概念性的（‘什么是依赖注入？’）。\n• 您只是在诊断问题而没有给出修复方法（‘这是您的代码运行缓慢的原因’）。\n• 这是一个比较分析（React vs Vue的优缺点）。\n• 您只是在解释错误发生的原因而没有规定更改。",
        "type": "boolean"
      },
      "explanation": {
        "description": "提供对主题或概念的清晰而全面的解释。优化可读性并使用markdown格式。",
        "type": "string"
      },
      "mermaid": {
        "description": "生成一个Mermaid图来可视化概念或流程。该图应简单易懂，专注于关键方面。\n\n您可以使用以下mermaid图类型之一：\n- sequenceDiagram（首选方法）\n- graph TD\n- flowchart TD\n- classDiagram\n- stateDiagram\n\n何时使用哪种图类型：\n1. 大多数场景最适合表示为sequenceDiagram。您应始终优先于其他图类型。\n2. 某些场景可以表示为graph TD，例如，显示组件之间的关系。\n3. 使用flowchart TD表示复杂的流程（条件、循环等）。\n4. 使用classDiagram表示类层次结构。\n5. 使用stateDiagram表示状态机。\n\n当没有意义时，例如概念过于简单或图表不会增加价值时，请勿生成任何mermaid图。",
        "type": "string"
      }
    }
  },

  "ask_user_for_clarification": {
    "description": "使用此工具向用户请求澄清或对关键设计决策的输入。",
    "parameters": {
      "questions": {
        "description": "保持您的问题简短扼要。如果适用，请提供选项。使用markdown格式。",
        "type": "string"
      }
    }
  },

  "write_phases": {
    "description": "使用此工具将任何规模的编码任务（重构或新功能）分解为*可独立执行的阶段*，这些阶段**始终保持代码库可编译且所有测试通过**。专注于代码级工作；跳过属于基础设施配置、部署、监控或其他非开发关注点的阶段。\n\n### 阶段规模指南\n\n* 将每个阶段视为一个范围明确的拉取请求：一个审阅者可以一目了然地掌握的连贯工作块。\n* 如果单个文件重构（或类似的小更改）完成了任务，请将其保持在一个阶段——不要强行增加额外的步骤。\n* 相反，当一个更改变得太大或混合了不相关的关注点时，请拆分阶段。\n\n### 核心原则\n\n1. **影子，不要覆盖**\n  * 引入并行符号（例如，`Thing2`）而不是修改遗留实现。\n  * 保持原始路径活动和功能，直到最终的‘切换’阶段。\n\n2. **逐阶段完整性**\n  * 每个阶段都必须编译、运行现有测试，并在必要时添加新测试。\n  * 在死代码、损坏的接口或失败的检查仍然存在时，不要前进。\n  * 例如，如果API的返回类型发生变化，请在同一阶段更新其所有消费者。\n\n3. **利用遗留参考**\n  * 不断将新代码与旧实现进行比较。\n  * 可以在关键时刻添加明确的阶段或阶段中的指令来执行此操作。\n\n4. **最终阶段**\n  * 此阶段需要验证是否完全再现了所需的行为。\n  * 一旦新代码得到验证，重命名或交换入口点，移除`Thing`与`Thing2`的重复，并删除过时的路径。\n\n注意：在提出阶段分解之前，请退一步确保您遵循了核心原则和指南。",
    "parameters": {
      "howDidIGetHere": {
        "description": "将此部分保持在150字以下，并使用markdown格式。记录形成阶段计划的调查步骤和发现。不要提及确切的工具名称，而是将其作为动词提及。例如，list_files工具调用可以描述为‘我列出了文件’。",
        "type": "string"
      },
      "phases": {
        "description": "实现给定任务的逐阶段方法。",
        "items": {
          "properties": {
            "id": {
              "description": "阶段的唯一标识符。",
              "type": "string"
            },
            "promptForAgent": {
              "description": "AI代理可以用来实现此阶段的简洁明了的提示。请提及代码库中的任何相关组件、模块或文件夹，并确保将它们括在反引号中。使用markdown格式。提示应为3-4个要点，且不超过60个字。",
              "type": "string"
            },
            "referredFiles": {
              "items": {
                "description": "代理应参考以实现此阶段的绝对文件路径。",
                "type": "string"
              },
              "type": "array"
            },
            "title": {
              "description": "阶段的标题。",
              "type": "string"
            }
          },
          "required": ["id", "title", "promptForAgent", "referredFiles"],
          "type": "object"
        },
        "type": "array"
      },
      "reasoning": {
        "description": "解释您为什么这样分解阶段。您是否遵循了阶段分解的核心原则和指南？",
        "type": "string"
      }
    }
  }
}
```