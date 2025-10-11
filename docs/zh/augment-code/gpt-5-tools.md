## GPT-5 工具文档总结

本文档包含了GPT-5模型可用的工具集合，这些工具为AI助手提供了与代码库、文件系统、进程管理和网络资源交互的能力。工具涵盖了从文件查看、代码编辑、进程控制到网络搜索等多种功能，使AI能够在开发环境中执行复杂的编程任务。

## gpt-5-tools.json

```json
{
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "view",
        "description": "查看文件或目录。对于文件，可选择使用正则表达式在文件内搜索或限制到行范围。默认排除 'electron' 文件夹，除非明确请求。",
        "parameters": {
          "type": "object",
          "properties": {
            "type": {
              "type": "string",
              "enum": [
                "file",
                "directory"
              ],
              "description": "是查看单个文件还是目录列表（最多2层）。"
            },
            "path": {
              "type": "string",
              "description": "相对于仓库根目录的路径。"
            },
            "view_range": {
              "type": "array",
              "items": {
                "type": "integer"
              },
              "minItems": 2,
              "maxItems": 2,
              "description": "可选的 [起始行, 结束行] 基于1的包含范围用于文件。"
            },
            "search_query_regex": {
              "type": "string",
              "description": "可选的正则表达式用于在文件内容中搜索（单行正则表达式）。"
            },
            "case_sensitive": {
              "type": "boolean",
              "default": false,
              "description": "正则表达式搜索是否区分大小写。"
            },
            "context_lines_before": {
              "type": "integer",
              "default": 5,
              "description": "在每个正则匹配前包含的上下文行数。"
            },
            "context_lines_after": {
              "type": "integer",
              "default": 5,
              "description": "在每个正则匹配后包含的上下文行数。"
            }
          },
          "required": [
            "type",
            "path"
          ],
          "additionalProperties": false
        }
      }
    },
    {
      "type": "function",
      "function": {
        "name": "grep-search",
        "description": "跨多个文件/目录或整个代码库搜索。用于在许多文件中查找文本/符号。默认排除 'electron/**'，除非明确覆盖。",
        "parameters": {
          "type": "object",
          "properties": {
            "query": {
              "type": "string",
              "description": "要搜索的文本或正则表达式。"
            },
            "paths": {
              "type": "array",
              "items": {
                "type": "string"
              },
              "description": "可选的目录或文件列表以限制搜索范围。"
            },
            "include_globs": {
              "type": "array",
              "items": {
                "type": "string"
              },
              "description": "可选的包含 glob 模式（例如，'src/**/*.ts'）。"
            },
            "exclude_globs": {
              "type": "array",
              "items": {
                "type": "string"
              },
              "default": [
                "electron/**"
              ],
              "description": "可选的排除 glob 模式。默认排除 'electron' 文件夹。"
            },
            "case_sensitive": {
              "type": "boolean",
              "default": false,
              "description": "搜索的大小写敏感性。"
            },
            "context_lines_before": {
              "type": "integer",
              "default": 5,
              "description": "每个匹配前的上下文行数。"
            },
            "context_lines_after": {
              "type": "integer",
              "default": 5,
              "description": "每个匹配后的上下文行数。"
            },
            "max_results": {
              "type": "integer",
              "default": 5000,
              "description": "限制返回的匹配数量。"
            }
          },
          "required": [
            "query"
          ],
          "additionalProperties": false
        }
      }
    },
    {
      "type": "function",
      "function": {
        "name": "codebase-retrieval",
        "description": "跨当前代码库进行高级检索，以在不知道在哪里查找时定位相关文件、类、函数或模式。",
        "parameters": {
          "type": "object",
          "properties": {
            "information_request": {
              "type": "string",
              "description": "你需要查找的内容的自然语言描述。"
            }
          },
          "required": [
            "information_request"
          ],
          "additionalProperties": false
        }
      }
    },
    {
      "type": "function",
      "function": {
        "name": "git-commit-retrieval",
        "description": "使用仓库的提交历史查找过去是如何进行类似更改的或为什么发生更改。",
        "parameters": {
          "type": "object",
          "properties": {
            "information_request": {
              "type": "string",
              "description": "关于过去更改的问题（例如，如何/为什么实现了一个功能）。"
            }
          },
          "required": [
            "information_request"
          ],
          "additionalProperties": false
        }
      }
    },
    {
      "type": "function",
      "function": {
        "name": "str-replace-editor",
        "description": "安全地编辑现有文件。使用 'str_replace' 进行带明确行范围的就地替换，或使用 'insert' 在特定行插入新内容。",
        "parameters": {
          "type": "object",
          "properties": {
            "command": {
              "type": "string",
              "enum": [
                "str_replace",
                "insert"
              ],
              "description": "编辑模式：'str_replace' 或 'insert'。"
            },
            "path": {
              "type": "string",
              "description": "要编辑的文件路径，相对于仓库根目录。"
            },
            "instruction_reminder": {
              "type": "string",
              "description": "必须 exactly 是：'ALWAYS BREAK DOWN EDITS INTO SMALLER CHUNKS OF AT MOST 150 LINES EACH.'"
            },
            "insert_line_1": {
              "type": "integer",
              "description": "对于 'insert'：基于1的行号，在该行之后插入。使用 0 在最开始插入。"
            },
            "new_str_1": {
              "type": "string",
              "description": "对于 'str_replace' 和 'insert'：新内容。"
            },
            "old_str_1": {
              "type": "string",
              "description": "对于 'str_replace'：要替换的确切原始文本（必须完全匹配，包括空格）。"
            },
            "old_str_start_line_number_1": {
              "type": "integer",
              "description": "对于 'str_replace'：old_str_1 的基于1的起始行。"
            },
            "old_str_end_line_number_1": {
              "type": "integer",
              "description": "对于 'str_replace'：old_str_1 的基于1的结束行（包含）。"
            }
          },
          "required": [
            "command",
            "path",
            "instruction_reminder"
          ],
          "additionalProperties": false
        }
      }
    },
    {
      "type": "function",
      "function": {
        "name": "save-file",
        "description": "创建新文件。不修改现有文件。",
        "parameters": {
          "type": "object",
          "properties": {
            "instructions_reminder": {
              "type": "string",
              "description": "必须 exactly 是：'LIMIT THE FILE CONTENT TO AT MOST 300 LINES. IF MORE CONTENT NEEDS TO BE ADDED USE THE str-replace-editor TOOL TO EDIT THE FILE AFTER IT HAS BEEN CREATED.'"
            },
            "path": {
              "type": "string",
              "description": "新文件的路径，相对于仓库根目录。"
            },
            "file_content": {
              "type": "string",
              "description": "要写入新文件的内容。"
            },
            "add_last_line_newline": {
              "type": "boolean",
              "default": true,
              "description": "是否确保尾随换行符。"
            }
          },
          "required": [
            "instructions_reminder",
            "path",
            "file_content"
          ],
          "additionalProperties": false
        }
      }
    },
    {
      "type": "function",
      "function": {
        "name": "remove-files",
        "description": "以可逆方式从工作区删除文件。",
        "parameters": {
          "type": "object",
          "properties": {
            "file_paths": {
              "type": "array",
              "items": {
                "type": "string"
              },
              "description": "要删除的文件路径列表，相对于仓库根目录。"
            }
          },
          "required": [
            "file_paths"
          ],
          "additionalProperties": false
        }
      }
    },
    {
      "type": "function",
      "function": {
        "name": "launch-process",
        "description": "运行 shell 命令。对短命令使用 wait=true。操作系统是 win32；shell 是 'bash'。",
        "parameters": {
          "type": "object",
          "properties": {
            "command": {
              "type": "string",
              "description": "要执行的 shell 命令。"
            },
            "wait": {
              "type": "boolean",
              "description": "是否等待进程完成。"
            },
            "max_wait_seconds": {
              "type": "integer",
              "description": "wait=true 时的超时秒数。"
            },
            "cwd": {
              "type": "string",
              "description": "命令的绝对工作目录。"
            }
          },
          "required": [
            "command",
            "wait",
            "max_wait_seconds",
            "cwd"
          ],
          "additionalProperties": false
        }
      }
    },
    {
      "type": "function",
      "function": {
        "name": "read-process",
        "description": "从先前启动的进程中读取输出。",
        "parameters": {
          "type": "object",
          "properties": {
            "terminal_id": {
              "type": "integer",
              "description": "目标终端 ID。"
            },
            "wait": {
              "type": "boolean",
              "description": "是否等待完成。"
            },
            "max_wait_seconds": {
              "type": "integer",
              "description": "wait=true 时的超时。"
            }
          },
          "required": [
            "terminal_id",
            "wait",
            "max_wait_seconds"
          ],
          "additionalProperties": false
        }
      }
    },
    {
      "type": "function",
      "function": {
        "name": "write-process",
        "description": "向运行进程的 stdin 写入输入。",
        "parameters": {
          "type": "object",
          "properties": {
            "terminal_id": {
              "type": "integer",
              "description": "目标终端 ID。"
            },
            "input_text": {
              "type": "string",
              "description": "要写入 stdin 的文本。"
            }
          },
          "required": [
            "terminal_id",
            "input_text"
          ],
          "additionalProperties": false
        }
      }
    },
    {
      "type": "function",
      "function": {
        "name": "kill-process",
        "description": "通过终端 ID 杀死运行进程。",
        "parameters": {
          "type": "object",
          "properties": {
            "terminal_id": {
              "type": "integer",
              "description": "目标终端 ID。"
            }
          },
          "required": [
            "terminal_id"
          ],
          "additionalProperties": false
        }
      }
    },
    {
      "type": "function",
      "function": {
        "name": "list-processes",
        "description": "列出使用 launch-process 工具创建的所有已知终端。",
        "parameters": {
          "type": "object",
          "properties": {},
          "additionalProperties": false
        }
      }
    },
    {
      "type": "function",
      "function": {
        "name": "diagnostics",
        "description": "返回指定文件的 IDE 问题（错误、警告等）。",
        "parameters": {
          "type": "object",
          "properties": {
            "paths": {
              "type": "array",
              "items": {
                "type": "string"
              },
              "description": "要获取问题的文件路径列表。"
            }
          },
          "required": [
            "paths"
          ],
          "additionalProperties": false
        }
      }
    },
    {
      "type": "function",
      "function": {
        "name": "read-terminal",
        "description": "读取活动或最近使用的 VSCode 终端的可见输出。",
        "parameters": {
          "type": "object",
          "properties": {
            "only_selected": {
              "type": "boolean",
              "description": "是否只读取选定的文本。"
            }
          },
          "additionalProperties": false
        }
      }
    },
    {
      "type": "function",
      "function": {
        "name": "open-browser",
        "description": "在默认浏览器中打开 URL。",
        "parameters": {
          "type": "object",
          "properties": {
            "url": {
              "type": "string",
              "description": "要打开的 URL。"
            }
          },
          "required": [
            "url"
          ],
          "additionalProperties": false
        }
      }
    },
    {
      "type": "function",
      "function": {
        "name": "web-search",
        "description": "使用 Google 自定义搜索 API 搜索网络。",
        "parameters": {
          "type": "object",
          "properties": {
            "query": {
              "type": "string",
              "description": "搜索查询。"
            },
            "num_results": {
              "type": "integer",
              "minimum": 1,
              "maximum": 10,
              "default": 5,
              "description": "要返回的结果数量（1-10）。"
            }
          },
          "required": [
            "query"
          ],
          "additionalProperties": false
        }
      }
    },
    {
      "type": "function",
      "function": {
        "name": "web-fetch",
        "description": "获取网页并以 Markdown 格式返回其内容。",
        "parameters": {
          "type": "object",
          "properties": {
            "url": {
              "type": "string",
              "description": "要获取的 URL。"
            }
          },
          "required": [
            "url"
          ],
          "additionalProperties": false
        }
      }
    },
    {
      "type": "function",
      "function": {
        "name": "view-range-untruncated",
        "description": "通过引用 ID 查看先前截断内容的特定行范围。",
        "parameters": {
          "type": "object",
          "properties": {
            "reference_id": {
              "type": "string",
              "description": "截断页脚中的引用 ID。"
            },
            "start_line": {
              "type": "integer",
              "description": "基于1的包含起始行。"
            },
            "end_line": {
              "type": "integer",
              "description": "基于1的包含结束行。"
            }
          },
          "required": [
            "reference_id",
            "start_line",
            "end_line"
          ],
          "additionalProperties": false
        }
      }
    },
    {
      "type": "function",
      "function": {
        "name": "search-untruncated",
        "description": "通过引用 ID 在先前未截断的内容中搜索。",
        "parameters": {
          "type": "object",
          "properties": {
            "reference_id": {
              "type": "string",
              "description": "截断页脚中的引用 ID。"
            },
            "search_term": {
              "type": "string",
              "description": "要搜索的文本。"
            },
            "context_lines": {
              "type": "integer",
              "default": 2,
              "description": "匹配周围的上下文行。"
            }
          },
          "required": [
            "reference_id",
            "search_term"
          ],
          "additionalProperties": false
        }
      }
    },
    {
      "type": "function",
      "function": {
        "name": "view_tasklist",
        "description": "查看对话的当前任务列表。",
        "parameters": {
          "type": "object",
          "properties": {},
          "additionalProperties": false
        }
      }
    },
    {
      "type": "function",
      "function": {
        "name": "add_tasks",
        "description": "向任务列表添加一个或多个新任务（和可选的子任务）。",
        "parameters": {
          "type": "object",
          "properties": {
            "tasks": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "name": {
                    "type": "string"
                  },
                  "description": {
                    "type": "string"
                  },
                  "parent_task_id": {
                    "type": "string"
                  },
                  "after_task_id": {
                    "type": "string"
                  },
                  "state": {
                    "type": "string",
                    "enum": [
                      "NOT_STARTED",
                      "IN_PROGRESS",
                      "CANCELLED",
                      "COMPLETE"
                    ]
                  }
                },
                "required": [
                  "name",
                  "description"
                ],
                "additionalProperties": false
              }
            }
          },
          "required": [
            "tasks"
          ],
          "additionalProperties": false
        }
      }
    },
    {
      "type": "function",
      "function": {
        "name": "update_tasks",
        "description": "更新一个或多个任务的属性（状态、名称、描述）。优先使用批量更新。",
        "parameters": {
          "type": "object",
          "properties": {
            "tasks": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "task_id": {
                    "type": "string"
                  },
                  "state": {
                    "type": "string",
                    "enum": [
                      "NOT_STARTED",
                      "IN_PROGRESS",
                      "CANCELLED",
                      "COMPLETE"
                    ]
                  },
                  "name": {
                    "type": "string"
                  },
                  "description": {
                    "type": "string"
                  }
                },
                "required": [
                  "task_id"
                ],
                "additionalProperties": false
              }
            }
          },
          "required": [
            "tasks"
          ],
          "additionalProperties": false
        }
      }
    },
    {
      "type": "function",
      "function": {
        "name": "reorganize_tasklist",
        "description": "使用完整的 markdown 表示对任务列表进行重大重组。",
        "parameters": {
          "type": "object",
          "properties": {
            "markdown": {
              "type": "string",
              "description": "完整的 markdown 任务列表，具有 exactly 一个根任务。"
            }
          },
          "required": [
            "markdown"
          ],
          "additionalProperties": false
        }
      }
    },
    {
      "type": "function",
      "function": {
        "name": "remember",
        "description": "存储在将来交互中可能有用的长期记忆。",
        "parameters": {
          "type": "object",
          "properties": {
            "memory": {
              "type": "string",
              "description": "要记住的一句简洁的话。"
            }
          },
          "required": [
            "memory"
          ],
          "additionalProperties": false
        }
      }
    },
    {
      "type": "function",
      "function": {
        "name": "render-mermaid",
        "description": "从提供的定义渲染 Mermaid 图表。",
        "parameters": {
          "type": "object",
          "properties": {
            "diagram_definition": {
              "type": "string",
              "description": "Mermaid 定义代码。"
            },
            "title": {
              "type": "string",
              "description": "图表的可选标题。"
            }
          },
          "required": [
            "diagram_definition"
          ],
          "additionalProperties": false
        }
      }
    }
  ]
}
```