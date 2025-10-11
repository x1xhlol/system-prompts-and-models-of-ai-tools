## Traycer AI Phase Mode Tools 综述

这个文档定义了Traycer AI在Phase Mode（阶段模式）下可用的工具集合。这些工具主要用于代码库探索、文件分析和任务分解，帮助AI理解用户代码库并将其任务分解为可执行的阶段。

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
   - `explanation_response`: 提供清晰的解释和可选的Mermaid图表
   - `write_phases`: 将编码任务分解为可独立执行的阶段

每个工具都遵循严格的参数规范，确保AI能够高效地探索代码库、分析任务并生成合理的阶段分解方案。

## phase_mode_tools.json

```json
{
  "read_file": {
    "description": "Read the contents of files at the specified paths. Use this when you need to examine the contents of any existing files, for example to analyze code, review text files, or extract information from configuration files. For large files, the system will provide a structured summary with line ranges and brief descriptions of each section instead of the full content. You can then request specific line ranges after reviewing the summary using the read_partial_file tool. Automatically extracts raw text from PDF and DOCX files. May not be suitable for other types of binary files, as it returns the raw content as a string. It is always better to speculatively read multiple files as a batch that are potentially useful.",
    "parameters": {
      "paths": {
        "description": "The paths of the files to read. Use absolute paths.",
        "items": {
          "properties": {
            "includeDiagnostics": {
              "default": false,
              "description": "Whether to collect diagnostics including errors, warnings, and lint suggestions, by analyzing its code using the built-in LSP. Return true only when you need to identify and resolve specific issues.",
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
    "description": "Read specific line ranges from files at the specified paths. Use this when you need to examine only portions of files rather than their entire contents, which is useful for when you only need to focus on specific sections of code, configuration files, or text documents. Specify the startLine and numberOfLines properties for each path to control exactly which portion of the file you want to read. This is more efficient than reading entire files when you only need specific sections.",
    "parameters": {
      "paths": {
        "description": "The paths of the files to read. Each item is an object with path and optional startLine and endLine properties to specify line ranges.",
        "items": {
          "properties": {
            "includeDiagnostics": {
              "default": false,
              "description": "Whether to collect diagnostics including errors, warnings, and lint suggestions, by analyzing its code using the built-in LSP. Return true only when you need to identify and resolve specific issues.",
              "type": "boolean"
            },
            "numberOfLines": {
              "description": "The number of lines to read from the start line. Allowed values are 300, 500, 700, or 900",
              "type": "number"
            },
            "path": {
              "description": "Path of the file to read. Use absolute path.",
              "sanitizePath": true,
              "type": "string"
            },
            "startLine": {
              "description": "The starting line number to read from (1-indexed). Optional - if omitted, starts from line 1.",
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
    "description": "List the contents of a directory. The quick tool to use for discovery, before using more targeted tools like codebase search or file reading. Useful to try to understand the file structure before diving deeper into specific files. Can be used to explore the codebase.",
    "parameters": {
      "path": {
        "description": "The path of the directory to list contents for. Use absolute path.",
        "sanitizePath": true,
        "type": "string"
      },
      "recursive": {
        "description": "Whether to list files recursively. Use 'true' for recursive listing, 'false' or omit for top-level only.",
        "type": "boolean"
      }
    }
  },

  "file_search": {
    "description": "Fast file search based on fuzzy matching against file path. Use if you know part of the file path but don't know where it's located exactly. Response will be capped to 10 results. Make your query more specific if need to filter results further. It is always better to speculatively perform multiple searches as a batch that are potentially useful.",
    "parameters": {
      "pattern": {
        "description": "Fuzzy filename to search for",
        "type": "string"
      }
    }
  },

  "grep_search": {
    "description": "Fast text-based regex search that finds exact pattern matches within files or directories, utilizing the ripgrep command for efficient searching. Results will be formatted in the style of ripgrep and can be configured to include line numbers and content. To avoid overwhelming output, the results are capped at 50 matches. Use the include patterns to filter the search scope by file type or specific paths. This is best for finding exact text matches or regex patterns. More precise than codebase search for finding specific strings or patterns. This is preferred over codebase search when we know the exact symbol/function name/etc. to search in some set of directories/file types.",
    "parameters": {
      "includePattern": {
        "anyOf": [
          {
            "description": "Glob pattern for files to include (e.g., '*.ts' for TypeScript files). If not provided, it will search all files (*).",
            "type": "string"
          },
          {
            "type": "null"
          }
        ]
      },
      "regex": {
        "description": "The regex pattern to search for.",
        "type": "string"
      }
    }
  },

  "web_search": {
    "description": "Performs web searches to find relevant information and documentation for the given query. This tool helps gather external knowledge useful for solving tasks, especially for obtaining the latest information or documentation.",
    "parameters": {
      "query": {
        "description": "The search query to look up on the web.",
        "type": "string"
      }
    }
  },

  "get_diagnostics": {
    "description": "Retrieve diagnostics for multiple files matching a glob pattern, including errors, warnings, and lint suggestions, by analyzing its code using the built-in LSP. Use this functionality to identify and resolve specific issues across multiple files that match a specific pattern.",
    "parameters": {
      "directories": {
        "description": "Directories from which to retrieve diagnostics. Use absolute path. Provide open workspace directories if you want to search all files in the workspace.",
        "items": {
          "description": "Directory to search for files. Use absolute path.",
          "type": "string"
        },
        "type": "array"
      },
      "includePattern": {
        "anyOf": [
          {
            "description": "Glob pattern for files to include (e.g., '*.ts' for TypeScript files). If not provided, it will search all files (*).",
            "type": "string"
          },
          {
            "description": "If not provided, returns all severity levels.",
            "type": "null"
          }
        ]
      },
      "severity": {
        "anyOf": [
          {
            "description": "Severity level of diagnostics to retrieve.",
            "enum": ["Error", "Warning", "Information", "Hint"],
            "type": "string"
          },
          {
            "description": "If not provided, returns all severity levels.",
            "type": "null"
          }
        ]
      }
    }
  },

  "file_outlines": {
    "description": "Get a symbol outline for all files at the top level of a specified directory. This can be particularly useful when you need to understand the code present in multiple files at a high-level.",
    "parameters": {
      "path": {
        "description": "The path of the directory to get file outlines for. Use absolute path.",
        "sanitizePath": true,
        "type": "string"
      }
    }
  },

  "find_references": {
    "description": "Find references (usage, mentions etc.) of a function, method, class, interface etc. Use this tool to jump to the all the locations where the given symbol is being used in the codebase. Software developers use this capability extensively to explore large codebases with precision. Prefer this over codebase_search when you need to lookup references of a symbol (anything tracked by LSP). You need to provide the file and line number wherever the symbol is MENTIONED. Find references tool will automatically take you to the relavant location. This works for locations both internal or external to the project.",
    "parameters": {
      "line": {
        "anyOf": [
          {
            "description": "The line number where the symbol is mentioned. This field is optional. If omitted, it will match the first occurence of this symbol in the file.",
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
            "description": "The path of the file where the symbol is mentioned. If omitted, it will match the last file with this symbol in the chat. Use absolute path.",
            "sanitizePath": true,
            "type": "string"
          },
          {
            "type": "null"
          }
        ]
      },
      "symbol": {
        "description": "The name of the symbol for which you want to find references.",
        "type": "string"
      }
    }
  },

  "go_to_definition": {
    "description": "Go to Definition of a function, method, class, interface etc. Use this tool to jump to the defintion of a symbol. Software developers use this capability extensively to explore large codebases with precision. Prefer this over codebase_search when you need to lookup definitions of a symbol (anything tracked by LSP). You may provide the file and line number wherever the symbol is MENTIONED. This tool can also work just on the symbol alone although providing file and symbols will give more precise results. Go to Definition tool will automatically take you to the relavant location. This works for locations both internal or external to the project.",
    "parameters": {
      "line": {
        "anyOf": [
          {
            "description": "The line number where the symbol is mentioned. This field is optional. If omitted, it will match the first occurence of this symbol in the file.",
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
            "description": "The path of the file where the symbol is mentioned. If omitted, it will match the last file with this symbol in the chat. Use absolute path.",
            "sanitizePath": true,
            "type": "string"
          },
          {
            "type": "null"
          }
        ]
      },
      "symbol": {
        "description": "The name of the symbol for which you want to find the definition.",
        "type": "string"
      }
    }
  },

  "go_to_implementations": {
    "description": "Use the built-in LSP to \"Go to Implementations\" of a given abstract class or function symbol.",
    "parameters": {
      "line": {
        "anyOf": [
          {
            "description": "The line number where the symbol is mentioned. This field is optional. If omitted, it will match the first occurence of this symbol in the file.",
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
            "description": "The path of the file where the symbol is mentioned. If omitted, it will match the last file with this symbol in the chat. Use absolute path.",
            "sanitizePath": true,
            "type": "string"
          },
          {
            "type": "null"
          }
        ]
      },
      "symbol": {
        "description": "The name of the symbol for which you want to find the implementations.",
        "type": "string"
      }
    }
  },

  "explanation_response": {
    "description": "- You are diligent and thorough! You NEVER leave any parts ambiguous in the explanation.\n- Provide clear, concise explanations that are easy to understand.\n- Use markdown format for better readability.",
    "parameters": {
      "canProposePhases": {
        "description": "Set to true only when the explanation includes an implementation strategy that could be broken into actionable phases.\n\nFor example:\n**Set to TRUE when:**\n* You provide a complete solution architecture with implementation steps (e.g., JSON serialization redesign).\n* You explain \"how to implement feature X\" with specific technical steps.\n* You propose a refactor with clear guidance.\n* You outline architectural changes with implementation details.\n* When you present an analysis to a problem along with a solution.\n\n**Leave FALSE when,\n• It's purely conceptual (\"What is dependency injection?\").\n• You're only diagnosing a problem without giving a fix (\"Here's why your code is slow\").\n• It's a comparative analysis (React vs Vue pros/cons).\n• You're just explaining why an error occurs without prescribing changes.",
        "type": "boolean"
      },
      "explanation": {
        "description": "Provide a clear and comprehensive explanation of the topic or concept. Optimize for readability and use markdown formatting.",
        "type": "string"
      },
      "mermaid": {
        "description": "Generate a Mermaid diagram to visualize the concept or flow. The diagram should be simple and easy to understand, focusing on the key aspects.\n\nYou are allowed one of the following mermaid diagram types:\n- sequenceDiagram (preferred approach)\n- graph TD\n- flowchart TD\n- classDiagram\n- stateDiagram\n\nWhere to use which diagram type:\n1. Most scenarios are best representable as a sequenceDiagram. You should always prefer it over other diagram types.\n2. Certain scenarios can be represented as graph TD, e.g., showing relationships between components.\n3. Use flowchart TD to represent complex flows (conditionals, loops, etc).\n4. Use classDiagram to represent class hierarchies.\n5. Use stateDiagram to represent state machines.\n\nDO NOT generate any mermaid diagram when it does not make sense, e.g., when the concept is too simple or when a diagram wouldn't add value.",
        "type": "string"
      }
    }
  },

  "ask_user_for_clarification": {
    "description": "Use this tool to ask the user for clarification or input on key design decisions.",
    "parameters": {
      "questions": {
        "description": "Keep your questions brief and to the point. Provide options if applicable. Use markdown formatting.",
        "type": "string"
      }
    }
  },

  "write_phases": {
    "description": "Use this tool to break any sizeable coding task—refactor or new feature—into *independently executable phases* that **always leave the codebase compiling and all tests green**. Stay laser-focused on code-level work; skip phases that belong to infra provision, deployment, monitoring, or other non-development concerns.\n\n### Phase-sizing guidelines\n\n* Treat each phase like a well-scoped pull request: one coherent chunk of work that reviewers can grasp at a glance.\n* If a single file refactor (or similarly small change) completes the task, keep it to one phase—don't force extra steps.\n* Conversely, split phases when a change grows too large or mixes unrelated concerns.\n\n### Core principles\n\n1. **Shadow, don't overwrite**\n  * Introduce parallel symbols (e.g., `Thing2`) instead of modifying the legacy implementation.\n  * Keep the original path alive and functional until the final "cut-over" phase.\n\n2. **Phase-by-phase integrity**\n  * Every phase must compile, run existing tests, and, where necessary, add new ones.\n  * Do not advance while dead code, broken interfaces, or failing checks remain.\n  * For example, if an API's return type changes, update all its consumers in the same phase.\n\n3. **Leverage the legacy reference**\n  * Continuously compare new code to the old implementation.\n  * Can add explicit phases or instructions in phases to do this at critical junctures.\n\n4. **Final phase**\n  * This phase needs to verify that the required behavior is fully reproduced.\n  * Rename or swap entry points, remove `Thing` vs `Thing2` duplication, and delete obsolete paths once the new code is proven.\n\nNote: Before coming up with phase breakdown, step back to make sure you are following the core principles and guidelines.",
    "parameters": {
      "howDidIGetHere": {
        "description": "Keep this section under 150 words, and use markdown format. Document the investigative steps and discoveries that shaped the phase plan. Do not mention exact tool names, instead mention that as a verb. E.g. list_files tool call can be described as 'I listed the files'.",
        "type": "string"
      },
      "phases": {
        "description": "A phase by phase approach to implement the given task.",
        "items": {
          "properties": {
            "id": {
              "description": "A unique identifier for the phase.",
              "type": "string"
            },
            "promptForAgent": {
              "description": "A crisp and to the point prompt that AI agents can use to implement this phase. Do mention any relevant components, modules or folders in the codebase and make sure to enclose them backticks. Use markdown formatting. The prompt should be in 3-4 points and under 60 words.",
              "type": "string"
            },
            "referredFiles": {
              "items": {
                "description": "Absolute file paths that should be referred by the agent to implement this phase.",
                "type": "string"
              },
              "type": "array"
            },
            "title": {
              "description": "A title for the phase.",
              "type": "string"
            }
          },
          "required": ["id", "title", "promptForAgent", "referredFiles"],
          "type": "object"
        },
        "type": "array"
      },
      "reasoning": {
        "description": "Explain why you are breaking the phases this way. Are you following the guidelines and core principles for phase breakdown?",
        "type": "string"
      }
    }
  }
}
```