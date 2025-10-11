## tools.json

```json
[
  {
    "type": "function",
    "function": {
      "name": "message_notify_user",
      "description": "Send a message to user without requiring a response. Use for acknowledging receipt of messages, providing progress updates, reporting task completion, or explaining changes in approach.",
      "parameters": {
        "type": "object",
        "properties": {
          "text": {
            "type": "string",
            "description": "Message text to display to user"
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
            "description": "(Optional) List of attachments to show to user, can be file paths or URLs"
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
      "description": "Ask user a question and wait for response. Use for requesting clarification, asking for confirmation, or gathering additional information.",
      "parameters": {
        "type": "object",
        "properties": {
          "text": {
            "type": "string",
            "description": "Question text to present to user"
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
            "description": "(Optional) List of question-related files or reference materials"
          },
          "suggest_user_takeover": {
            "type": "string",
            "enum": [
              "none",
              "browser"
            ],
            "description": "(Optional) Suggested operation for user takeover"
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
      "description": "Read file content. Use for checking file contents, analyzing logs, or reading configuration files.",
      "parameters": {
        "type": "object",
        "properties": {
          "file": {
            "type": "string",
            "description": "Absolute path of the file to read"
          },
          "start_line": {
            "type": "integer",
            "description": "(Optional) Starting line to read from, 0-based"
          },
          "end_line": {
            "type": "integer",
            "description": "(Optional) Ending line number (exclusive)"
          },
          "sudo": {
            "type": "boolean",
            "description": "(Optional) Whether to use sudo privileges"
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
      "description": "Overwrite or append content to a file. Use for creating new files, appending content, or modifying existing files.",
      "parameters": {
        "type": "object",
        "properties": {
          "file": {
            "type": "string",
            "description": "Absolute path of the file to write to"
          },
          "content": {
            "type": "string",
            "description": "Text content to write"
          },
          "append": {
            "type": "boolean",
            "description": "(Optional) Whether to use append mode"
          },
          "leading_newline": {
            "type": "boolean",
            "description": "(Optional) Whether to add a leading newline"
          },
          "trailing_newline": {
            "type": "boolean",
            "description": "(Optional) Whether to add a trailing newline"
          },
          "sudo": {
            "type": "boolean",
            "description": "(Optional) Whether to use sudo privileges"
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
      "description": "Replace specified string in a file. Use for updating specific content in files or fixing errors in code.",
      "parameters": {
        "type": "object",
        "properties": {
          "file": {
            "type": "string",
            "description": "Absolute path of the file to perform replacement on"
          },
          "old_str": {
            "type": "string",
            "description": "Original string to be replaced"
          },
          "new_str": {
            "type": "string",
            "description": "New string to replace with"
          },
          "sudo": {
            "type": "boolean",
            "description": "(Optional) Whether to use sudo privileges"
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
      "description": "Search for matching text within file content. Use for finding specific content or patterns in files.",
      "parameters": {
        "type": "object",
        "properties": {
          "file": {
            "type": "string",
            "description": "Absolute path of the file to search within"
          },
          "regex": {
            "type": "string",
            "description": "Regular expression pattern to match"
          },
          "sudo": {
            "type": "boolean",
            "description": "(Optional) Whether to use sudo privileges"
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
      "description": "Find files by name pattern in specified directory. Use for locating files with specific naming patterns.",
      "parameters": {
        "type": "object",
        "properties": {
          "path": {
            "type": "string",
            "description": "Absolute path of directory to search"
          },
          "glob": {
            "type": "string",
            "description": "Filename pattern using glob syntax wildcards"
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
      "description": "Execute commands in a specified shell session. Use for running code, installing packages, or managing files.",
      "parameters": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "description": "Unique identifier of the target shell session"
          },
          "exec_dir": {
            "type": "string",
            "description": "Working directory for command execution (must use absolute path)"
          },
          "command": {
            "type": "string",
            "description": "Shell command to execute"
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
      "description": "View the content of a specified shell session. Use for checking command execution results or monitoring output.",
      "parameters": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "description": "Unique identifier of the target shell session"
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
      "description": "Wait for the running process in a specified shell session to return. Use after running commands that require longer runtime.",
      "parameters": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "description": "Unique identifier of the target shell session"
          },
          "seconds": {
            "type": "integer",
            "description": "Wait duration in seconds"
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
      "description": "Write input to a running process in a specified shell session. Use for responding to interactive command prompts.",
      "parameters": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "description": "Unique identifier of the target shell session"
          },
          "input": {
            "type": "string",
            "description": "Input content to write to the process"
          },
          "press_enter": {
            "type": "boolean",
            "description": "Whether to press Enter key after input"
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
      "description": "Terminate a running process in a specified shell session. Use for stopping long-running processes or handling frozen commands.",
      "parameters": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "description": "Unique identifier of the target shell session"
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
      "description": "View content of the current browser page. Use for checking the latest state of previously opened pages.",
      "parameters": {
        "type": "object"
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "browser_navigate",
      "description": "Navigate browser to specified URL. Use when accessing new pages is needed.",
      "parameters": {
        "type": "object",
        "properties": {
          "url": {
            "type": "string",
            "description": "Complete URL to visit. Must include protocol prefix."
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
      "description": "Restart browser and navigate to specified URL. Use when browser state needs to be reset.",
      "parameters": {
        "type": "object",
        "properties": {
          "url": {
            "type": "string",
            "description": "Complete URL to visit after restart. Must include protocol prefix."
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
      "description": "Click on elements in the current browser page. Use when clicking page elements is needed.",
      "parameters": {
        "type": "object",
        "properties": {
          "index": {
            "type": "integer",
            "description": "(Optional) Index number of the element to click"
          },
          "coordinate_x": {
            "type": "number",
            "description": "(Optional) X coordinate of click position"
          },
          "coordinate_y": {
            "type": "number",
            "description": "(Optional) Y coordinate of click position"
          }
        }
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "browser_input",
      "description": "Overwrite text in editable elements on the current browser page. Use when filling content in input fields.",
      "parameters": {
        "type": "object",
        "properties": {
          "index": {
            "type": "integer",
            "description": "(Optional) Index number of the element to overwrite text"
          },
          "coordinate_x": {
            "type": "number",
            "description": "(Optional) X coordinate of the element to overwrite text"
          },
          "coordinate_y": {
            "type": "number",
            "description": "(Optional) Y coordinate of the element to overwrite text"
          },
          "text": {
            "type": "string",
            "description": "Complete text content to overwrite"
          },
          "press_enter": {
            "type": "boolean",
            "description": "Whether to press Enter key after input"
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
      "description": "Move cursor to specified position on the current browser page. Use when simulating user mouse movement.",
      "parameters": {
        "type": "object",
        "properties": {
          "coordinate_x": {
            "type": "number",
            "description": "X coordinate of target cursor position"
          },
          "coordinate_y": {
            "type": "number",
            "description": "Y coordinate of target cursor position"
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
      "description": "Simulate key press in the current browser page. Use when specific keyboard operations are needed.",
      "parameters": {
        "type": "object",
        "properties": {
          "key": {
            "type": "string",
            "description": "Key name to simulate (e.g., Enter, Tab, ArrowUp), supports key combinations (e.g., Control+Enter)."
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
      "description": "Select specified option from dropdown list element in the current browser page. Use when selecting dropdown menu options.",
      "parameters": {
        "type": "object",
        "properties": {
          "index": {
            "type": "integer",
            "description": "Index number of the dropdown list element"
          },
          "option": {
            "type": "integer",
            "description": "Option number to select, starting from 0."
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
      "description": "Scroll up the current browser page. Use when viewing content above or returning to page top.",
      "parameters": {
        "type": "object",
        "properties": {
          "to_top": {
            "type": "boolean",
            "description": "(Optional) Whether to scroll directly to page top instead of one viewport up."
          }
        }
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "browser_scroll_down",
      "description": "Scroll down the current browser page. Use when viewing content below or jumping to page bottom.",
      "parameters": {
        "type": "object",
        "properties": {
          "to_bottom": {
            "type": "boolean",
            "description": "(Optional) Whether to scroll directly to page bottom instead of one viewport down."
          }
        }
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "browser_console_exec",
      "description": "Execute JavaScript code in browser console. Use when custom scripts need to be executed.",
      "parameters": {
        "type": "object",
        "properties": {
          "javascript": {
            "type": "string",
            "description": "JavaScript code to execute. Note that the runtime environment is browser console."
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
      "description": "View browser console output. Use when checking JavaScript logs or debugging page errors.",
      "parameters": {
        "type": "object",
        "properties": {
          "max_lines": {
            "type": "integer",
            "description": "(Optional) Maximum number of log lines to return."
          }
        }
      }
    }
  },
  {
    "type": "function",
    "function": {
      "name": "info_search_web",
      "description": "Search web pages using search engine. Use for obtaining latest information or finding references.",
      "parameters": {
        "type": "object",
        "properties": {
          "query": {
            "type": "string",
            "description": "Search query in Google search style, using 3-5 keywords."
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
            "description": "(Optional) Time range filter for search results."
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
      "description": "Expose specified local port for temporary public access. Use when providing temporary public access for services.",
      "parameters": {
        "type": "object",
        "properties": {
          "port": {
            "type": "integer",
            "description": "Local port number to expose"
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
      "description": "Deploy website or application to public production environment. Use when deploying or updating static websites or applications.",
      "parameters": {
        "type": "object",
        "properties": {
          "type": {
            "type": "string",
            "enum": [
              "static",
              "nextjs"
            ],
            "description": "Type of website or application to deploy."
          },
          "local_dir": {
            "type": "string",
            "description": "Absolute path of local directory to deploy."
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
      "description": "Make a Manus Page from a local MDX file.",
      "parameters": {
        "type": "object",
        "properties": {
          "mdx_file_path": {
            "type": "string",
            "description": "Absolute path of the source MDX file"
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
      "description": "A special tool to indicate you have completed all tasks and are about to enter idle state.",
      "parameters": {
        "type": "object"
      }
    }
  }
]
```