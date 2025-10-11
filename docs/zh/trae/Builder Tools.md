## Trae AI Builder Tools 综述

这个文档定义了Trae AI在Builder模式下可用的工具集合。这些工具为AI助手提供了完整的软件开发能力，包括任务管理、代码库搜索、文件操作、命令执行等功能。

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

这些工具构成了Trae AI强大的开发能力基础，使AI助手能够在代码库中进行搜索、编辑文件、运行命令并管理复杂的开发任务。

## Builder Tools.json

```json
{
  "todo_write": {
    "description": "Use this tool to create and manage a structured task list for your current coding session. This helps you track progress, organize complex tasks, and demonstrate thoroughness to the user. It also helps the user understand the progress of the task and overall progress of their requests.",
    "params": {
      "type": "object",
      "properties": {
        "todos": {
          "description": "The updated todo list",
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
    "description": "This tool is Trae's context engine. It: 1. Takes in a natural language description of the code you are looking for; 2. Uses a proprietary retrieval/embedding model suite that produces the highest-quality recall of relevant code snippets from across the codebase; 3. Maintains a real-time index of the codebase, so the results are always up-to-date and reflects the current state of the codebase; 4. Can retrieve across different programming languages; 5. Only reflects the current state of the codebase on the disk, and has no information on version control or code history.",
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
    "description": "Fast text-based search that finds exact pattern matches within files or directories, utilizing the ripgrep command for efficient searching.",
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
    "description": "View up to 3 files simultaneously in batch mode for faster information gathering.",
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
    "description": "You can use this tool to view files of the specified directory.",
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
    "description": "You can use this tool to write content to a file with precise control over creation/rewrite behavior.",
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
    "description": "You can use this tool to edit file, if you think that using this tool is more cost-effective than other available editing tools, you should choose this tool, otherwise you should choose other available edit tools.",
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
    "description": "You can use this tool to edit an existing files with less than 1000 lines of code, and you should follow these rules:",
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
    "description": "You can use this tool to move or rename an existing file.",
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
    "description": "You can use this tool to delete files, you can delete multi files in one toolcall, and you MUST make sure the files is exist before deleting.",
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
    "description": "You can use this tool to PROPOSE a command to run on behalf of the user.",
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
    "description": "You can use this tool to get the status of a previously executed command by its Command ID ( non-blocking command ).",
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
    "description": "This tool allows you to terminate a currently running command( the command MUST be previously executed command. ).",
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
    "description": "You can use this tool to show the available preview URL to user if you have started a local server successfully in a previous toolcall, which user can open it in the browser.",
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
    "description": "This tool can be used to search the internet, which should be used with caution, as frequent searches result in a bad user experience and excessive costs.",
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
    "description": "The final tool of this session, when you think you have archived the goal of user requirement, you should use this tool to mark it as finish.",
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