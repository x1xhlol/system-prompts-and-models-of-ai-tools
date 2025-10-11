# Manus AI 工具总结

Manus AI 提供了以下核心工具来执行各种任务：

1. **message_notify_user** - 向用户发送消息
   - 用于确认收到消息、提供进度更新、报告任务完成或解释方法变更
   - 支持文本消息和附件

2. **message_ask_user** - 向用户提问
   - 用于请求澄清、确认或收集额外信息
   - 支持问题相关文件或参考资料作为附件

3. **file_read** - 读取文件内容
   - 用于检查文件内容、分析日志或读取配置文件
   - 支持指定行范围和sudo权限

4. **file_write** - 写入或追加内容到文件
   - 用于创建新文件、追加内容或修改现有文件
   - 支持追加模式和换行控制

5. **file_str_replace** - 替换文件中的指定字符串
   - 用于更新文件中的特定内容或修复代码错误

6. **file_find_in_content** - 在文件内容中搜索匹配文本
   - 用于查找文件中的特定内容或模式

7. **file_find_by_name** - 按名称模式查找文件
   - 用于定位具有特定命名模式的文件

8. **shell_exec** - 在指定shell会话中执行命令
   - 用于运行代码、安装包或管理文件

9. **shell_view** - 查看指定shell会话的内容
   - 用于检查命令执行结果或监控输出

10. **shell_wait** - 等待指定shell会话中的运行进程返回
    - 用于等待需要较长时间运行的命令

11. **shell_write_to_process** - 向指定shell会话中的运行进程写入输入
    - 用于响应交互式命令提示

12. **shell_kill_process** - 终止指定shell会话中的运行进程
    - 用于停止长时间运行的进程或处理冻结的命令

13. **browser_view** - 查看当前浏览器页面的内容
    - 用于检查之前打开页面的最新状态

14. **browser_navigate** - 导航浏览器到指定URL
    - 用于访问新页面

15. **browser_restart** - 重启浏览器并导航到指定URL
    - 用于重置浏览器状态

16. **browser_click** - 点击当前浏览器页面上的元素
    - 用于点击页面元素

17. **browser_input** - 覆盖当前浏览器页面上可编辑元素中的文本
    - 用于在输入字段中填充内容

18. **browser_move_mouse** - 在当前浏览器页面上移动光标到指定位置
    - 用于模拟用户鼠标移动

19. **browser_press_key** - 在当前浏览器页面上模拟按键
    - 用于特定键盘操作

20. **browser_select_option** - 从当前浏览器页面上的下拉列表元素中选择指定选项
    - 用于选择下拉菜单选项

21. **browser_scroll_up** - 向上滚动当前浏览器页面
    - 用于查看上方内容或返回页面顶部

22. **browser_scroll_down** - 向下滚动当前浏览器页面
    - 用于查看下方内容或跳转到页面底部

23. **browser_console_exec** - 在浏览器控制台中执行JavaScript代码
    - 用于执行自定义脚本

24. **browser_console_view** - 查看浏览器控制台输出
    - 用于检查JavaScript日志或调试页面错误

25. **info_search_web** - 使用搜索引擎搜索网页
    - 用于获取最新信息或查找参考资料

26. **deploy_expose_port** - 暴露指定本地端口以供临时公共访问
    - 用于为服务提供临时公共访问

27. **deploy_apply_deployment** - 部署网站或应用程序到公共生产环境
    - 用于部署或更新静态网站或应用程序

28. **make_manus_page** - 从本地MDX文件制作Manus页面

29. **idle** - 特殊工具，表示已完成所有任务并即将进入空闲状态

## tools.json

```json
[
  {
    "type": "function",
    "function": {
      "name": "message_notify_user",
      "description": "向用户发送消息而无需回复。用于确认收到消息、提供进度更新、报告任务完成或解释方法变更。",
      "parameters": {
        "type": "object",
        "properties": {
          "text": {
            "type": "string",
            "description": "要显示给用户的消息文本"
          },
          "attachments": {
            "anyOf": [
              {
                "type": "string"
              },
              {
                "items": {
                  "type": "string"
                },
                "type": "array"
              }
            ],
            "description": "（可选）要显示给用户的附件列表，可以是文件路径或URL"
          }
        },
        "required": [
          "text"
        ]
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "message_ask_user",
      "description": "向用户提问并等待回复。用于请求澄清、确认或收集额外信息。",
      "parameters": {
        "type": "object",
        "properties": {
          "text": {
            "type": "string",
            "description": "要呈现给用户的问题文本"
          },
          "attachments": {
            "anyOf": [
              {
                "type": "string"
              },
              {
                "items": {
                  "type": "string"
                },
                "type": "array"
              }
            ],
            "description": "（可选）与问题相关的文件或参考资料列表"
          },
          "suggest_user_takeover": {
            "type": "string",
            "enum": [
              "none",
              "browser"
            ],
            "description": "（可选）建议用户接管的操作"
          }
        },
        "required": [
          "text"
        ]
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "file_read",
      "description": "读取文件内容。用于检查文件内容、分析日志或读取配置文件。",
      "parameters": {
        "type": "object",
        "properties": {
          "file": {
            "type": "string",
            "description": "要读取的文件的绝对路径"
          },
          "start_line": {
            "type": "integer",
            "description": "（可选）开始读取的行号，从0开始"
          },
          "end_line": {
            "type": "integer",
            "description": "（可选）结束行号（不包括）"
          },
          "sudo": {
            "type": "boolean",
            "description": "（可选）是否使用sudo权限"
          }
        },
        "required": [
          "file"
        ]
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "file_write",
      "description": "覆盖或追加内容到文件。用于创建新文件、追加内容或修改现有文件。",
      "parameters": {
        "type": "object",
        "properties": {
          "file": {
            "type": "string",
            "description": "要写入的文件的绝对路径"
          },
          "content": {
            "type": "string",
            "description": "要写入的文本内容"
          },
          "append": {
            "type": "boolean",
            "description": "（可选）是否使用追加模式"
          },
          "leading_newline": {
            "type": "boolean",
            "description": "（可选）是否添加前导换行符"
          },
          "trailing_newline": {
            "type": "boolean",
            "description": "（可选）是否添加尾随换行符"
          },
          "sudo": {
            "type": "boolean",
            "description": "（可选）是否使用sudo权限"
          }
        },
        "required": [
          "file",
          "content"
        ]
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "file_str_replace",
      "description": "替换文件中的指定字符串。用于更新文件中的特定内容或修复代码中的错误。",
      "parameters": {
        "type": "object",
        "properties": {
          "file": {
            "type": "string",
            "description": "要执行替换的文件的绝对路径"
          },
          "old_str": {
            "type": "string",
            "description": "要被替换的原始字符串"
          },
          "new_str": {
            "type": "string",
            "description": "要替换的新字符串"
          },
          "sudo": {
            "type": "boolean",
            "description": "（可选）是否使用sudo权限"
          }
        },
        "required": [
          "file",
          "old_str",
          "new_str"
        ]
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "file_find_in_content",
      "description": "在文件内容中搜索匹配文本。用于查找文件中的特定内容或模式。",
      "parameters": {
        "type": "object",
        "properties": {
          "file": {
            "type": "string",
            "description": "要在其中搜索的文件的绝对路径"
          },
          "regex": {
            "type": "string",
            "description": "要匹配的正则表达式模式"
          },
          "sudo": {
            "type": "boolean",
            "description": "（可选）是否使用sudo权限"
          }
        },
        "required": [
          "file",
          "regex"
        ]
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "file_find_by_name",
      "description": "在指定目录中按名称模式查找文件。用于定位具有特定命名模式的文件。",
      "parameters": {
        "type": "object",
        "properties": {
          "path": {
            "type": "string",
            "description": "要搜索的目录的绝对路径"
          },
          "glob": {
            "type": "string",
            "description": "使用glob语法通配符的文件名模式"
          }
        },
        "required": [
          "path",
          "glob"
        ]
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "shell_exec",
      "description": "在指定的shell会话中执行命令。用于运行代码、安装包或管理文件。",
      "parameters": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "description": "目标shell会话的唯一标识符"
          },
          "exec_dir": {
            "type": "string",
            "description": "命令执行的工作目录（必须使用绝对路径）"
          },
          "command": {
            "type": "string",
            "description": "要执行的shell命令"
          }
        },
        "required": [
          "id",
          "exec_dir",
          "command"
        ]
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "shell_view",
      "description": "查看指定shell会话的内容。用于检查命令执行结果或监控输出。",
      "parameters": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "description": "目标shell会话的唯一标识符"
          }
        },
        "required": [
          "id"
        ]
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "shell_wait",
      "description": "等待指定shell会话中的运行进程返回。用于运行需要较长时间的命令后。",
      "parameters": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "description": "目标shell会话的唯一标识符"
          },
          "seconds": {
            "type": "integer",
            "description": "等待时间（秒）"
          }
        },
        "required": [
          "id"
        ]
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "shell_write_to_process",
      "description": "向指定shell会话中的运行进程写入输入。用于响应交互式命令提示。",
      "parameters": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "description": "目标shell会话的唯一标识符"
          },
          "input": {
            "type": "string",
            "description": "要写入进程的输入内容"
          },
          "press_enter": {
            "type": "boolean",
            "description": "输入后是否按回车键"
          }
        },
        "required": [
          "id",
          "input",
          "press_enter"
        ]
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "shell_kill_process",
      "description": "终止指定shell会话中的运行进程。用于停止长时间运行的进程或处理冻结的命令。",
      "parameters": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "description": "目标shell会话的唯一标识符"
          }
        },
        "required": [
          "id"
        ]
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "browser_view",
      "description": "查看当前浏览器页面的内容。用于检查之前打开页面的最新状态。",
      "parameters": {
        "type": "object"
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "browser_navigate",
      "description": "导航浏览器到指定URL。用于需要访问新页面时。",
      "parameters": {
        "type": "object",
        "properties": {
          "url": {
            "type": "string",
            "description": "要访问的完整URL。必须包含协议前缀。"
          }
        },
        "required": [
          "url"
        ]
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "browser_restart",
      "description": "重启浏览器并导航到指定URL。用于需要重置浏览器状态时。",
      "parameters": {
        "type": "object",
        "properties": {
          "url": {
            "type": "string",
            "description": "重启后要访问的完整URL。必须包含协议前缀。"
          }
        },
        "required": [
          "url"
        ]
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "browser_click",
      "description": "点击当前浏览器页面上的元素。用于需要点击页面元素时。",
      "parameters": {
        "type": "object",
        "properties": {
          "index": {
            "type": "integer",
            "description": "（可选）要点击的元素的索引号"
          },
          "coordinate_x": {
            "type": "number",
            "description": "（可选）点击位置的X坐标"
          },
          "coordinate_y": {
            "type": "number",
            "description": "（可选）点击位置的Y坐标"
          }
        }
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "browser_input",
      "description": "覆盖当前浏览器页面上可编辑元素中的文本。用于在输入字段中填充内容。",
      "parameters": {
        "type": "object",
        "properties": {
          "index": {
            "type": "integer",
            "description": "（可选）要覆盖文本的元素的索引号"
          },
          "coordinate_x": {
            "type": "number",
            "description": "（可选）要覆盖文本的元素的X坐标"
          },
          "coordinate_y": {
            "type": "number",
            "description": "（可选）要覆盖文本的元素的Y坐标"
          },
          "text": {
            "type": "string",
            "description": "要覆盖的完整文本内容"
          },
          "press_enter": {
            "type": "boolean",
            "description": "输入后是否按回车键"
          }
        },
        "required": [
          "text",
          "press_enter"
        ]
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "browser_move_mouse",
      "description": "在当前浏览器页面上移动光标到指定位置。用于模拟用户鼠标移动。",
      "parameters": {
        "type": "object",
        "properties": {
          "coordinate_x": {
            "type": "number",
            "description": "目标光标位置的X坐标"
          },
          "coordinate_y": {
            "type": "number",
            "description": "目标光标位置的Y坐标"
          }
        },
        "required": [
          "coordinate_x",
          "coordinate_y"
        ]
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "browser_press_key",
      "description": "在当前浏览器页面上模拟按键。用于需要特定键盘操作时。",
      "parameters": {
        "type": "object",
        "properties": {
          "key": {
            "type": "string",
            "description": "要模拟的键名（例如，Enter, Tab, ArrowUp），支持组合键（例如，Control+Enter）。"
          }
        },
        "required": [
          "key"
        ]
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "browser_select_option",
      "description": "从当前浏览器页面上的下拉列表元素中选择指定选项。用于选择下拉菜单选项。",
      "parameters": {
        "type": "object",
        "properties": {
          "index": {
            "type": "integer",
            "description": "下拉列表元素的索引号"
          },
          "option": {
            "type": "integer",
            "description": "要选择的选项号，从0开始。"
          }
        },
        "required": [
          "index",
          "option"
        ]
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "browser_scroll_up",
      "description": "向上滚动当前浏览器页面。用于查看上方内容或返回页面顶部。",
      "parameters": {
        "type": "object",
        "properties": {
          "to_top": {
            "type": "boolean",
            "description": "（可选）是否直接滚动到页面顶部而不是向上滚动一个视口。"
          }
        }
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "browser_scroll_down",
      "description": "向下滚动当前浏览器页面。用于查看下方内容或跳转到页面底部。",
      "parameters": {
        "type": "object",
        "properties": {
          "to_bottom": {
            "type": "boolean",
            "description": "（可选）是否直接滚动到页面底部而不是向下滚动一个视口。"
          }
        }
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "browser_console_exec",
      "description": "在浏览器控制台中执行JavaScript代码。用于需要执行自定义脚本时。",
      "parameters": {
        "type": "object",
        "properties": {
          "javascript": {
            "type": "string",
            "description": "要执行的JavaScript代码。注意运行环境是浏览器控制台。"
          }
        },
        "required": [
          "javascript"
        ]
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "browser_console_view",
      "description": "查看浏览器控制台输出。用于检查JavaScript日志或调试页面错误。",
      "parameters": {
        "type": "object",
        "properties": {
          "max_lines": {
            "type": "integer",
            "description": "（可选）要返回的最大日志行数。"
          }
        }
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "info_search_web",
      "description": "使用搜索引擎搜索网页。用于获取最新信息或查找参考资料。",
      "parameters": {
        "type": "object",
        "properties": {
          "query": {
            "type": "string",
            "description": "Google搜索风格的搜索查询，使用3-5个关键词。"
          },
          "date_range": {
            "type": "string",
            "enum": [
              "all",
              "past_hour",
              "past_day",
              "past_week",
              "past_month",
              "past_year"
            ],
            "description": "（可选）搜索结果的时间范围过滤器。"
          }
        },
        "required": [
          "query"
        ]
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "deploy_expose_port",
      "description": "暴露指定本地端口以供临时公共访问。用于为服务提供临时公共访问。",
      "parameters": {
        "type": "object",
        "properties": {
          "port": {
            "type": "integer",
            "description": "要暴露的本地端口号"
          }
        },
        "required": [
          "port"
        ]
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "deploy_apply_deployment",
      "description": "将网站或应用程序部署到公共生产环境。用于部署或更新静态网站或应用程序。",
      "parameters": {
        "type": "object",
        "properties": {
          "type": {
            "type": "string",
            "enum": [
              "static",
              "nextjs"
            ],
            "description": "要部署的网站或应用程序的类型。"
          },
          "local_dir": {
            "type": "string",
            "description": "要部署的本地目录的绝对路径。"
          }
        },
        "required": [
          "type",
          "local_dir"
        ]
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "make_manus_page",
      "description": "从本地MDX文件制作Manus页面。",
      "parameters": {
        "type": "object",
        "properties": {
          "mdx_file_path": {
            "type": "string",
            "description": "源MDX文件的绝对路径"
          }
        },
        "required": [
          "mdx_file_path"
        ]
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "idle",
      "description": "一个特殊工具，表示您已完成所有任务并即将进入空闲状态。",
      "parameters": {
        "type": "object"
      }
    }
  }
]
```