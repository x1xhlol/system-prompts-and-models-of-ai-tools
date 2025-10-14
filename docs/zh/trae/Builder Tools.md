## Trae AI Builder 工具综述

本文档定义了 Trae AI 在 Builder 模式下可用的工具集合。这些工具为 AI 助手提供了完整的软件开发能力，包括任务管理、代码库搜索、文件操作、命令执行等功能。

### 核心工具分类

1. **任务管理工具**
   - `todo_write`: 创建和管理结构化任务列表，帮助跟踪进度和组织复杂任务

2. **代码库搜索工具**
   - `search_codebase`: 使用自然语言描述搜索代码库中的相关代码片段
   - `search_by_regex`: 基于正则表达式的快速文本搜索

3. **文件查看和操作工具**
   - `view_files`: 批量查看最多3个文件以快速收集信息
   - `list_dir`: 查看指定目录中的文件
   - `write_to_file`: 精确控制创建/重写行为来写入文件内容
   - `update_file`: 编辑文件，使用替换块进行精确修改
   - `edit_file_fast_apply`: 快速编辑少于1000行的现有文件
   - `rename_file`: 移动或重命名现有文件
   - `delete_file`: 删除文件（可一次删除多个文件）

4. **命令执行工具**
   - `run_command`: 代表用户提议并运行命令
   - `check_command_status`: 获取先前执行命令的状态
   - `stop_command`: 终止当前运行的命令

5. **开发辅助工具**
   - `open_preview`: 显示可用的预览URL供用户在浏览器中打开
   - `web_search`: 搜索互联网获取外部信息
   - `finish`: 标记会话完成的最终工具

这些工具构成了 Trae AI 强大的开发能力基础，使 AI 助手能够在代码库中进行搜索、编辑文件、运行命令并管理复杂的开发任务。

## Builder Tools.json

## Builder Tools.json

```json
{
  "todo_write": {
    "description": "使用此工具为当前编码会话创建和管理结构化任务列表。这有助于您跟踪进度、组织复杂任务，并向用户展示细致程度。它还有助于用户了解任务进度和其请求的整体进度。",
    "params": {
      "type": "object",
      "properties": {
        "todos": {
          "description": "更新后的待办事项列表",
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "content": {
                "type": "string"
              },
              "status": {
                "type": "string",
                "enum": [
                  "pending",
                  "in_progress",
                  "completed"
                ]
              },
              "id": {
                "type": "string"
              },
              "priority": {
                "type": "string",
                "enum": [
                  "high",
                  "medium",
                  "low"
                ]
              }
            },
            "required": [
              "content",
              "status",
              "id",
              "priority"
            ],
            "minItems": 3,
            "maxItems": 10
          }
        }
      },
      "required": [
        "todos"
      ]
    }
  },
  "search_codebase": {
    "description": "此工具是 Trae 的上下文引擎。它：1. 接受您正在查找的代码的自然语言描述；2. 使用专有的检索/嵌入模型套件，从整个代码库中产生最高质量的相关代码片段召回；3. 维护代码库的实时索引，因此结果始终是最新的，并反映代码库的当前状态；4. 可以跨不同编程语言检索；5. 仅反映磁盘上代码库的当前状态，不包含版本控制或代码历史信息。",
    "params": {
      "type": "object",
      "properties": {
        "information_request": {
          "type": "string"
        },
        "target_directories": {
          "type": "array",
          "items": {
            "type": "string"
          }
        }
      },
      "required": [
        "information_request"
      ]
    }
  },
  "search_by_regex": {
    "description": "基于文本的快速搜索，在文件或目录中查找精确模式匹配，利用 ripgrep 命令进行高效搜索。",
    "params": {
      "type": "object",
      "properties": {
        "query": {
          "type": "string"
        },
        "search_directory": {
          "type": "string"
        }
      },
      "required": [
        "query"
      ]
    }
  },
  "view_files": {
    "description": "在批处理模式下同时查看最多 3 个文件以快速收集信息。",
    "params": {
      "type": "object",
      "properties": {
        "files": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "file_path": {
                "type": "string"
              },
              "start_line_one_indexed": {
                "type": "integer"
              },
              "end_line_one_indexed_inclusive": {
                "type": "integer"
              },
              "read_entire_file": {
                "type": "boolean"
              }
            },
            "required": [
              "file_path",
              "start_line_one_indexed",
              "end_line_one_indexed_inclusive"
            ]
          }
        }
      },
      "required": [
        "files"
      ]
    }
  },
  "list_dir": {
    "description": "您可以使用此工具查看指定目录中的文件。",
    "params": {
      "type": "object",
      "properties": {
        "dir_path": {
          "type": "string"
        },
        "max_depth": {
          "type": "integer",
          "default": 3
        }
      },
      "required": [
        "dir_path"
      ]
    }
  },
  "write_to_file": {
    "description": "您可以使用此工具将内容写入文件，并精确控制创建/重写行为。",
    "params": {
      "type": "object",
      "properties": {
        "rewrite": {
          "type": "boolean"
        },
        "file_path": {
          "type": "string"
        },
        "content": {
          "type": "string"
        }
      },
      "required": [
        "rewrite",
        "file_path",
        "content"
      ]
    }
  },
  "update_file": {
    "description": "您可以使用此工具编辑文件，如果您认为使用此工具比其他可用编辑工具更具成本效益，您应选择此工具，否则您应选择其他可用编辑工具。",
    "params": {
      "type": "object",
      "properties": {
        "file_path": {
          "type": "string"
        },
        "replace_blocks": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "old_str": {
                "type": "string"
              },
              "new_str": {
                "type": "string"
              }
            },
            "required": [
              "old_str",
              "new_str"
            ]
          }
        }
      },
      "required": [
        "file_path",
        "replace_blocks"
      ]
    }
  },
  "edit_file_fast_apply": {
    "description": "您可以使用此工具编辑少于 1000 行代码的现有文件，并且您应遵循以下规则：",
    "params": {
      "type": "object",
      "properties": {
        "file_path": {
          "type": "string"
        },
        "content": {
          "type": "string"
        },
        "instruction": {
          "type": "string",
          "default": ""
        },
        "code_language": {
          "type": "string"
        }
      },
      "required": [
        "file_path",
        "content"
      ]
    }
  },
  "rename_file": {
    "description": "您可以使用此工具移动或重命名现有文件。",
    "params": {
      "type": "object",
      "properties": {
        "file_path": {
          "type": "string"
        },
        "rename_file_path": {
          "type": "string"
        }
      },
      "required": [
        "file_path",
        "rename_file_path"
      ]
    }
  },
  "delete_file": {
    "description": "您可以使用此工具删除文件，您可以在一次工具调用中删除多个文件，并且您必须确保文件在删除前存在。",
    "params": {
      "type": "object",
      "properties": {
        "file_paths": {
          "type": "array",
          "items": {
            "type": "string"
          }
        }
      },
      "required": [
        "file_paths"
      ]
    }
  },
  "run_command": {
    "description": "您可以使用此工具代表用户提议运行命令。",
    "params": {
      "type": "object",
      "properties": {
        "command": {
          "type": "string"
        },
        "target_terminal": {
          "type": "string"
        },
        "command_type": {
          "type": "string"
        },
        "cwd": {
          "type": "string"
        },
        "blocking": {
          "type": "boolean"
        },
        "wait_ms_before_async": {
          "type": "integer",
          "minimum": 0
        },
        "requires_approval": {
          "type": "boolean"
        }
      },
      "required": [
        "command",
        "blocking",
        "requires_approval"
      ]
    }
  },
  "check_command_status": {
    "description": "您可以使用此工具通过命令 ID 获取先前执行命令的状态（非阻塞命令）。",
    "params": {
      "type": "object",
      "properties": {
        "command_id": {
          "type": "string"
        },
        "wait_ms_before_check": {
          "type": "integer"
        },
        "output_character_count": {
          "type": "integer",
          "minimum": 0,
          "default": 1000
        },
        "skip_character_count": {
          "type": "integer",
          "minimum": 0,
          "default": 0
        },
        "output_priority": {
          "type": "string",
          "default": "bottom"
        }
      }
    }
  },
  "stop_command": {
    "description": "此工具允许您终止当前正在运行的命令（该命令必须是先前执行的命令）。",
    "params": {
      "type": "object",
      "properties": {
        "command_id": {
          "type": "string"
        }
      },
      "required": [
        "command_id"
      ]
    }
  },
  "open_preview": {
    "description": "如果您在先前的工具调用中成功启动了本地服务器，您可以使用此工具向用户显示可用的预览 URL，用户可以在浏览器中打开它。",
    "params": {
      "type": "object",
      "properties": {
        "preview_url": {
          "type": "string"
        },
        "command_id": {
          "type": "string"
        }
      },
      "required": [
        "preview_url",
        "command_id"
      ]
    }
  },
  "web_search": {
    "description": "此工具可用于搜索互联网，但应谨慎使用，因为频繁搜索会导致糟糕的用户体验和过高成本。",
    "params": {
      "type": "object",
      "properties": {
        "query": {
          "type": "string"
        },
        "num": {
          "type": "int32",
          "default": 5
        },
        "lr": {
          "type": "string"
        }
      },
      "required": [
        "query"
      ]
    }
  },
  "finish": {
    "description": "此会话的最终工具，当您认为已达成用户需求的目标时，您应使用此工具将其标记为完成。",
    "params": {
      "type": "object",
      "properties": {
        "summary": {
          "type": "string"
        }
      },
      "required": [
        "summary"
      ]
    }
  }
}
```
