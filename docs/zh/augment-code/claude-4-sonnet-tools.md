## Claude Sonnet 4 工具文档总结

本文档包含了Claude Sonnet 4模型可用的工具集合，这些工具为AI助手提供了丰富的代码操作和系统交互能力。工具涵盖了从文件编辑、进程管理、网络浏览到代码检索等多个方面，使AI能够在复杂的开发环境中执行精确的编程任务。特别强调了安全的文件编辑机制和与版本控制系统的集成。

## claude-4-sonnet-tools.json

```json
{
  "tools": [
    {
      "name": "str-replace-editor",
      "description": "用于编辑文件的工具。\n* `path` 是相对于工作区根目录的文件路径\n* `insert` 和 `str_replace` 命令为每个条目输出编辑部分的片段。此片段反映了应用所有编辑和IDE自动格式化后的文件最终状态。\n* 首先生成 `instruction_reminder` 以提醒自己将编辑限制在最多150行。\n\n使用 `str_replace` 命令的注意事项：\n* 为第一次替换指定 `old_str_1`、`new_str_1`、`old_str_start_line_number_1` 和 `old_str_end_line_number_1` 属性，为第二次替换指定 `old_str_2`、`new_str_2`、`old_str_start_line_number_2` 和 `old_str_end_line_number_2` 属性，以此类推\n* `old_str_start_line_number_1` 和 `old_str_end_line_number_1` 参数是基于1的行号\n* `old_str_start_line_number_1` 和 `old_str_end_line_number_1` 都是包含性的\n* `old_str_1` 参数应与原始文件中的一个或多个连续行完全匹配。注意空格！\n* 仅当文件为空或仅包含空格时才允许空的 `old_str_1`\n* 指定 `old_str_start_line_number_1` 和 `old_str_end_line_number_1` 以消除文件中 `old_str_1` 多次出现的歧义是很重要的\n* 确保 `old_str_start_line_number_1` 和 `old_str_end_line_number_1` 不与其他 `old_str_start_line_number_2` 和 `old_str_end_line_number_2` 条目重叠\n* `new_str_1` 参数应包含应替换 `old_str_1` 的编辑行。可以是空字符串以删除内容\n* 要在一次工具调用中进行多次替换，请添加多组替换参数。例如，第一次替换的 `old_str_1`、`new_str_1`、`old_str_start_line_number_1` 和 `old_str_end_line_number_1` 属性，第二次替换的 `old_str_2`、`new_str_2`、`old_str_start_line_number_2`、`old_str_end_line_number_2` 属性等。\n\n使用 `insert` 命令的注意事项：\n* 指定 `insert_line_1`、`new_str_1` 属性进行第一次插入，`insert_line_2`、`new_str_2` 属性进行第二次插入，以此类推\n* `insert_line_1` 参数是基于1的行号，在该行之后插入新字符串。此行号相对于应用当前工具调用中任何插入之前文件的状态\n* `new_str_1` 参数包含要插入的字符串\n* 要在一次工具调用中进行多次插入，请添加多组插入参数。例如，第一次插入的 `insert_line_1`、`new_str_1` 属性，第二次插入的 `insert_line_2`、`new_str_2` 属性等。",
      "parameters": {
        "type": "object",
        "properties": {
          "command": {
            "type": "string",
            "enum": [
              "str_replace",
              "insert"
            ],
            "description": "要运行的命令。允许的选项是：'str_replace'、'insert'。"
          },
          "path": {
            "type": "string",
            "description": "相对于工作区根目录的完整文件路径，例如 'services/api_proxy/file.py' 或 'services/api_proxy'。"
          },
          "instruction_reminder": {
            "type": "string",
            "description": "提醒将编辑限制在最多150行。应 exactly 是此字符串：'ALWAYS BREAK DOWN EDITS INTO SMALLER CHUNKS OF AT MOST 150 LINES EACH.'"
          },
          "old_str_1": {
            "type": "string",
            "description": "`str_replace` 命令的必需参数，包含 `path` 中要替换的字符串。"
          },
          "new_str_1": {
            "type": "string",
            "description": "`str_replace` 命令的必需参数，包含新字符串。可以是空字符串以删除内容。`insert` 命令的必需参数，包含要插入的字符串。"
          },
          "old_str_start_line_number_1": {
            "type": "integer",
            "description": "文件中 `old_str_1` 第一行的行号。这用于消除文件中 `old_str_1` 多次出现的歧义。"
          },
          "old_str_end_line_number_1": {
            "type": "integer",
            "description": "文件中 `old_str_1` 最后一行的行号。这用于消除文件中 `old_str_1` 多次出现的歧义。"
          },
          "insert_line_1": {
            "type": "integer",
            "description": "`insert` 命令的必需参数。在其后插入新字符串的行号。此行号相对于应用当前工具调用中任何插入之前文件的状态。"
          }
        },
        "required": [
          "command",
          "path",
          "instruction_reminder"
        ]
      }
    },
    {
      "name": "open-browser",
      "description": "在默认浏览器中打开URL。\n\n1. 该工具接收一个URL并在默认浏览器中打开它。\n2. 该工具不返回任何内容。它旨在供用户视觉检查和与页面交互。您将无法访问它。\n3. 您不应在对话历史中已调用过该工具的URL上使用 `open-browser`，因为页面已打开在用户的浏览器中，用户可以看到它并自行刷新。每次调用 `open-browser` 时，它都会将用户跳转到浏览器窗口，这对用户来说非常烦人。",
      "parameters": {
        "type": "object",
        "properties": {
          "url": {
            "type": "string",
            "description": "要在浏览器中打开的URL。"
          }
        },
        "required": [
          "url"
        ]
      }
    },
    {
      "name": "diagnostics",
      "description": "从IDE获取问题（错误、警告等）。您必须提供要获取问题的文件路径。",
      "parameters": {
        "type": "object",
        "properties": {
          "paths": {
            "type": "array",
            "items": {
              "type": "string"
            },
            "description": "从IDE获取问题的必需文件路径列表。"
          }
        },
        "required": [
          "paths"
        ]
      }
    },
    {
      "name": "read-terminal",
      "description": "从活动或最近使用的VSCode终端读取输出。\n\n默认情况下，它读取终端中可见的所有文本，而不仅仅是最近命令的输出。\n\n如果要仅读取终端中的选定文本，请在工具输入中设置 `only_selected=true`。\n仅在您知道用户已选择您想要读取的文本时才执行此操作。\n\n注意，这与list-processes和read-process工具无关，这些工具与使用\"launch-process\"工具启动的进程交互。",
      "parameters": {
        "type": "object",
        "properties": {
          "only_selected": {
            "type": "boolean",
            "description": "是否仅读取终端中的选定文本。"
          }
        },
        "required": []
      }
    },
    {
      "name": "git-commit-retrieval",
      "description": "此工具是Augment的具有git提交历史意识的上下文引擎。它：\n1. 接收您正在查找的代码的自然语言描述；\n2. 使用git提交历史作为检索的唯一上下文；\n3. 否则功能类似于标准的codebase-retrieval工具。",
      "parameters": {
        "type": "object",
        "properties": {
          "information_request": {
            "type": "string",
            "description": "您需要的信息的描述。"
          }
        },
        "required": [
          "information_request"
        ]
      }
    },
    {
      "name": "launch-process",
      "description": "使用shell命令启动新进程。进程可以是等待的（`wait=true`）或非等待的（`wait=false`）。\n\n如果 `wait=true`，在交互式终端中启动进程，并等待进程在 `max_wait_seconds` 秒内完成。如果进程在此期间结束，工具调用返回。如果超时到期，进程将在后台继续运行，但工具调用将返回。然后您可以使用其他进程工具与进程交互。\n\n注意：一次只能运行一个等待进程。如果您尝试在另一个进程运行时启动 `wait=true` 的进程，工具将返回错误。\n\n如果 `wait=false`，在单独的终端中启动后台进程。这会立即返回，而进程在后台继续运行。\n\n注意事项：\n- 当命令预期较短时，或在完成任务之前无法继续时，使用 `wait=true` 进程。对于预期在后台运行的进程，使用 `wait=false`，例如启动您需要交互的服务器，或在完成任务之前不需要完成的长时间运行的进程。\n- 如果此工具在进程仍在运行时返回，您可以继续使用其他可用工具与进程交互。您可以等待进程，从中读取，向其写入，杀死它等。\n- 您可以使用此工具与用户的本地版本控制系统交互。不要使用检索工具进行此目的。\n- 如果有更具体的工具可以执行该功能，请使用该工具而不是此工具。\n\n操作系统是win32。shell是'bash'。",
      "parameters": {
        "type": "object",
        "properties": {
          "command": {
            "type": "string",
            "description": "要执行的shell命令。"
          },
          "wait": {
            "type": "boolean",
            "description": "是否等待命令完成。"
          },
          "max_wait_seconds": {
            "type": "number",
            "description": "等待命令完成的秒数。仅在wait=true时相关。10分钟可能是一个好的默认值：根据需要增加。"
          },
          "cwd": {
            "type": "string",
            "description": "必需参数。命令的工作目录的绝对路径。"
          }
        },
        "required": [
          "command",
          "wait",
          "max_wait_seconds",
          "cwd"
        ]
      }
    },
    {
      "name": "kill-process",
      "description": "通过其终端ID杀死进程。",
      "parameters": {
        "type": "object",
        "properties": {
          "terminal_id": {
            "type": "integer",
            "description": "要杀死的终端ID。"
          }
        },
        "required": [
          "terminal_id"
        ]
      }
    },
    {
      "name": "read-process",
      "description": "从终端读取输出。\n\n如果 `wait=true` 且进程尚未完成，等待终端在返回其输出之前完成最多 `max_wait_seconds` 秒。\n\n如果 `wait=false` 或进程已完成后，立即返回当前输出。",
      "parameters": {
        "type": "object",
        "properties": {
          "terminal_id": {
            "type": "integer",
            "description": "要从中读取的终端ID。"
          },
          "wait": {
            "type": "boolean",
            "description": "是否等待命令完成。"
          },
          "max_wait_seconds": {
            "type": "number",
            "description": "等待命令完成的秒数。仅在wait=true时相关。1分钟可能是一个好的默认值：根据需要增加。"
          }
        },
        "required": [
          "terminal_id",
          "wait",
          "max_wait_seconds"
        ]
      }
    },
    {
      "name": "write-process",
      "description": "向终端写入输入。",
      "parameters": {
        "type": "object",
        "properties": {
          "terminal_id": {
            "type": "integer",
            "description": "要写入的终端ID。"
          },
          "input_text": {
            "type": "string",
            "description": "要写入进程stdin的文本。"
          }
        },
        "required": [
          "terminal_id",
          "input_text"
        ]
      }
    },
    {
      "name": "list-processes",
      "description": "列出使用launch-process工具创建的所有已知终端及其状态。",
      "parameters": {
        "type": "object",
        "properties": {},
        "required": []
      }
    },
    {
      "name": "web-search",
      "description": "在网络上搜索信息。以markdown格式返回结果。\n每个结果包括URL、标题和页面的片段（如果可用）。\n\n此工具使用Google的自定义搜索API查找相关网页。",
      "parameters": {
        "type": "object",
        "title": "WebSearchInput",
        "description": "网络搜索工具的输入模式。",
        "properties": {
          "query": {
            "title": "Query",
            "description": "要发送的搜索查询。",
            "type": "string"
          },
          "num_results": {
            "title": "Num Results",
            "description": "要返回的结果数量",
            "default": 5,
            "minimum": 1,
            "maximum": 10,
            "type": "integer"
          }
        },
        "required": [
          "query"
        ]
      }
    },
    {
      "name": "web-fetch",
      "description": "从网页获取数据并将其转换为Markdown。\n\n1. 该工具接收一个URL并返回页面内容的Markdown格式；\n2. 如果返回的不是有效的Markdown，这意味着工具无法成功解析此页面。",
      "parameters": {
        "type": "object",
        "properties": {
          "url": {
            "type": "string",
            "description": "要获取的URL。"
          }
        },
        "required": [
          "url"
        ]
      }
    },
    {
      "name": "codebase-retrieval",
      "description": "此工具是Augment的上下文引擎，世界上最好的代码库上下文引擎。它：\n1. 接收您正在查找的代码的自然语言描述；\n2. 使用专有的检索/嵌入模型套件，从整个代码库中产生最高质量的相关代码片段召回；\n3. 维护代码库的实时索引，因此结果始终是最新的并反映代码库的当前状态；\n4. 可以跨不同编程语言检索；\n5. 仅反映磁盘上代码库的当前状态，对版本控制或代码历史没有信息。",
      "parameters": {
        "type": "object",
        "properties": {
          "information_request": {
            "type": "string",
            "description": "您需要的信息的描述。"
          }
        },
        "required": [
          "information_request"
        ]
      }
    },
    {
      "name": "remove-files",
      "description": "删除文件。仅使用此工具删除用户工作区中的文件。这是以用户可以撤销更改的方式删除文件的唯一安全工具。不要使用shell或launch-process工具删除文件。",
      "parameters": {
        "type": "object",
        "properties": {
          "file_paths": {
            "type": "array",
            "items": {
              "type": "string"
            },
            "description": "要删除的文件路径。"
          }
        },
        "required": [
          "file_paths"
        ]
      }
    },
    {
      "name": "save-file",
      "description": "保存新文件。使用此工具编写具有附加内容的新文件。首先生成 `instructions_reminder` 以提醒自己将文件内容限制在最多300行。它不能修改现有文件。不要使用此工具通过完全覆盖来编辑现有文件。使用str-replace-editor工具来编辑现有文件。",
      "parameters": {
        "type": "object",
        "properties": {
          "instructions_reminder": {
            "type": "string",
            "description": "应 exactly 是此字符串：'LIMIT THE FILE CONTENT TO AT MOST 300 LINES. IF MORE CONTENT NEEDS TO BE ADDED USE THE str-replace-editor TOOL TO EDIT THE FILE AFTER IT HAS BEEN CREATED.'"
          },
          "path": {
            "type": "string",
            "description": "要保存的文件路径。"
          },
          "file_content": {
            "type": "string",
            "description": "文件的内容。"
          },
          "add_last_line_newline": {
            "type": "boolean",
            "description": "是否在文件末尾添加换行符（默认：true）。"
          }
        },
        "required": [
          "instructions_reminder",
          "path",
          "file_content"
        ]
      }
    },
    {
      "name": "view_tasklist",
      "description": "查看当前对话的任务列表。",
      "parameters": {
        "type": "object",
        "properties": {},
        "required": []
      }
    },
    {
      "name": "reorganize_tasklist",
      "description": "重新组织当前对话的任务列表结构。仅用于重大重组，如重新排序任务、更改层次结构。对于单个任务更新，使用update_tasks工具。",
      "parameters": {
        "type": "object",
        "properties": {
          "markdown": {
            "type": "string",
            "description": "任务列表更新的markdown表示。应采用view_tasklist工具指定的格式。新任务应具有'NEW_UUID'的UUID。必须包含一个具有正确层次结构的根任务，使用破折号缩进。"
          }
        },
        "required": [
          "markdown"
        ]
      }
    },
    {
      "name": "update_tasks",
      "description": "更新一个或多个任务的属性（状态、名称、描述）。可以更新单个任务或在一次调用中更新多个任务。在复杂的工作序列上使用此工具进行计划、跟踪进度和管理工作。",
      "parameters": {
        "type": "object",
        "properties": {
          "tasks": {
            "type": "array",
            "description": "要更新的任务数组。每个任务应具有task_id和要更新的属性。",
            "items": {
              "type": "object",
              "properties": {
                "task_id": {
                  "type": "string",
                  "description": "要更新的任务的UUID。"
                },
                "state": {
                  "type": "string",
                  "enum": [
                    "NOT_STARTED",
                    "IN_PROGRESS",
                    "CANCELLED",
                    "COMPLETE"
                  ],
                  "description": "新任务状态。对[ ]使用NOT_STARTED，对[/]使用IN_PROGRESS，对[-]使用CANCELLED，对[x]使用COMPLETE。"
                },
                "name": {
                  "type": "string",
                  "description": "新任务名称。"
                },
                "description": {
                  "type": "string",
                  "description": "新任务描述。"
                }
              },
              "required": [
                "task_id"
              ]
            }
          }
        },
        "required": [
          "tasks"
        ]
      }
    },
    {
      "name": "add_tasks",
      "description": "向任务列表添加一个或多个新任务。可以添加单个任务或在一次调用中添加多个任务。任务可以作为子任务添加或在特定任务之后添加。在计划复杂的工作序列时使用此工具。",
      "parameters": {
        "type": "object",
        "properties": {
          "tasks": {
            "type": "array",
            "description": "要创建的任务数组。每个任务应具有名称和描述。",
            "items": {
              "type": "object",
              "properties": {
                "name": {
                  "type": "string",
                  "description": "新任务的名称。"
                },
                "description": {
                  "type": "string",
                  "description": "新任务的描述。"
                },
                "state": {
                  "type": "string",
                  "enum": [
                    "NOT_STARTED",
                    "IN_PROGRESS",
                    "CANCELLED",
                    "COMPLETE"
                  ],
                  "description": "任务的初始状态。默认为NOT_STARTED。"
                },
                "parent_task_id": {
                  "type": "string",
                  "description": "如果这应该是子任务，则为父任务的UUID。"
                },
                "after_task_id": {
                  "type": "string",
                  "description": "此任务应插入其后的任务的UUID。"
                }
              },
              "required": [
                "name",
                "description"
              ]
            }
          }
        },
        "required": [
          "tasks"
        ]
      }
    },
    {
      "name": "remember",
      "description": "当用户要求您时调用此工具：\n- 记住某事\n- 创建记忆/记忆们\n\n仅在可以长期有用的信息上使用此工具。\n不要在临时信息上使用此工具。",
      "parameters": {
        "type": "object",
        "properties": {
          "memory": {
            "type": "string",
            "description": "要记住的简洁（1句话）记忆。"
          }
        },
        "required": [
          "memory"
        ]
      }
    },
    {
      "name": "render-mermaid",
      "description": "从提供的定义渲染Mermaid图表。此工具接收Mermaid图表代码并将其渲染为具有平移/缩放控件和复制功能的交互式图表。",
      "parameters": {
        "type": "object",
        "properties": {
          "diagram_definition": {
            "type": "string",
            "description": "要渲染的Mermaid图表定义代码"
          },
          "title": {
            "type": "string",
            "default": "Mermaid Diagram",
            "description": "图表的可选标题"
          }
        },
        "required": [
          "diagram_definition"
        ]
      }
    },
    {
      "name": "view-range-untruncated",
      "description": "查看未截断内容的特定行范围",
      "parameters": {
        "type": "object",
        "properties": {
          "reference_id": {
            "type": "string",
            "description": "截断内容的引用ID（在截断页脚中找到）"
          },
          "start_line": {
            "type": "integer",
            "description": "起始行号（基于1，包含性）"
          },
          "end_line": {
            "type": "integer",
            "description": "结束行号（基于1，包含性）"
          }
        },
        "required": [
          "reference_id",
          "start_line",
          "end_line"
        ]
      }
    },
    {
      "name": "search-untruncated",
      "description": "在未截断内容中搜索术语",
      "parameters": {
        "type": "object",
        "properties": {
          "reference_id": {
            "type": "string",
            "description": "截断内容的引用ID（在截断页脚中找到）"
          },
          "search_term": {
            "type": "string",
            "description": "要在内容中搜索的术语"
          },
          "context_lines": {
            "type": "integer",
            "description": "在匹配项前后包含的上下文行数（默认：2）"
          }
        },
        "required": [
          "reference_id",
          "search_term"
        ]
      }
    },
    {
      "name": "view",
      "description": "用于查看文件和目录以及使用正则表达式查询在文件中搜索的自定义工具\n* `path` 是相对于工作区根目录的文件或目录路径\n* 对于文件：显示应用 `cat -n` 到文件的结果\n* 对于目录：列出文件和子目录，深度达2层\n* 如果输出很长，它将被截断并标记为 `<response clipped>`\n\n正则表达式搜索（仅适用于文件）：\n* 使用 `search_query_regex` 使用正则表达式在文件中搜索模式\n* 使用 `case_sensitive` 参数控制大小写敏感性（默认：false）\n* 使用正则表达式搜索时，仅显示匹配行及其上下文\n* 使用 `context_lines_before` 和 `context_lines_after` 控制显示多少行上下文（默认：5）\n* 匹配之间的非匹配部分被替换为 `...`\n* 如果还指定了 `view_range`，搜索将限于该范围\n\n对 `search_query_regex` 使用以下正则表达式语法：\n\n# 正则表达式语法参考\n\n仅支持JavaScript和Rust中常见的核心正则表达式功能。\n\n## 支持的正则表达式语法\n\n* **转义** - 使用反斜杠转义元字符：`\\.` `\\+` `\\?` `\\*` `\\|` `\\(` `\\)` `\\[`。\n* **点** `.` - 匹配除换行符（`\\n`、`\\r`、`\\u2028`、`\\u2029`）之外的任何字符。\n* **字符类** - `[abc]`、范围如 `[a-z]` 和否定 `[^…]`。使用显式ASCII范围；避免使用简写如 `\\d`。\n* **选择** - `foo|bar` 选择最左边的成功分支。\n* **量词** - `*`、`+`、`?`、`{n}`、`{n,}`、`{n,m}`（贪婪）。在这些之后添加 `?` 以获得懒惰版本。\n* **锚点** - `^`（行首）、`$`（行尾）。\n* **特殊字符** - 使用 `\\t` 表示制表符\n\n---\n\n## 不要使用（不支持）\n\n* 换行符 `\\n`。仅支持单行模式。\n* 前瞻/后顾 `(?= … )`、`(?<= … )`。\n* 反向引用 `\\1`、`\\k<name>`。\n* 组 `(?<name> … )`... [截断]",
      "parameters": {
        "type": "object",
        "properties": {
          "path": {
            "type": "string",
            "description": "相对于工作区根目录的完整文件或目录路径，例如 'services/api_proxy/file.py' 或 'services/api_proxy'。"
          },
          "type": {
            "type": "string",
            "enum": [
              "file",
              "directory"
            ],
            "description": "要查看的路径类型。允许的选项是：'file'、'directory'。"
          },
          "view_range": {
            "type": "array",
            "items": {
              "type": "integer"
            },
            "description": "当 `path` 指向文件时的可选参数。如果未提供，则显示完整文件。如果提供，则文件将在指定的行号范围内显示，例如 [501, 1000] 将显示第501到1000行。索引是基于1的且包含性的。设置 `[start_line, -1]` 显示从 `start_line` 到文件末尾的所有行。"
          },
          "search_query_regex": {
            "type": "string",
            "description": "仅适用于文件的可选参数。要搜索的正则表达式模式。仅使用JavaScript和Rust中常见的核心正则表达式语法。请参阅工具描述中的正则表达式语法指南。指定时，仅显示匹配模式的行（加上上下文行）。非匹配部分被替换为'...'。"
          },
          "case_sensitive": {
            "type": "boolean",
            "default": false,
            "description": "正则表达式搜索是否区分大小写。仅在指定search_query_regex时使用。默认：false（不区分大小写）。"
          },
          "context_lines_before": {
            "type": "integer",
            "default": 5,
            "description": "在每个正则表达式匹配之前显示的行数。仅在指定search_query_regex时使用。默认：5。"
          },
          "context_lines_after": {
            "type": "integer",
            "default": 5,
            "description": "在每个正则表达式匹配之后显示的行数。仅在指定search_query_regex时使用。默认：5。"
          }
        },
        "required": [
          "path",
          "type"
        ]
      }
    }
  ]
}
```