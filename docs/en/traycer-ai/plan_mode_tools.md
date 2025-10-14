## plan_mode_tools.json

## Traycer AI Plan Mode Tools Overview

This document defines the set of tools available to Traycer AI in Plan Mode. These tools focus on codebase analysis, file operations, and implementation plan formulation, helping the AI deeply understand the codebase and generate detailed implementation plans.

### Core Tool Categories

1.  **File Operation Tools**
    - `read_file`: Reads the content of files at specified paths, supporting structured summaries for large files
    - `read_partial_file`: Reads specific line ranges from files, improving efficiency for large files
    - `list_dir`: Lists directory contents, used for discovery and understanding file structure

2.  **Search Tools**
    - `file_search`: Fuzzy search based on file paths
    - `grep_search`: Fast text-based regex search
    - `file_outlines`: Gets a symbol outline for all files in a specified directory

3.  **Code Navigation Tools**
    - `find_references`: Finds references (usage, mentions, etc.) of functions, methods, classes, etc.
    - `go_to_definition`: Jumps to the definition of a symbol
    - `go_to_implementations`: Finds implementations of abstract class or function symbols

4.  **Analysis and Diagnostic Tools**
    - `get_diagnostics`: Retrieves diagnostic information for files, including errors, warnings, and suggestions
    - `web_search`: Performs web searches to obtain external knowledge and documentation
    - `think`: A thinking tool for complex reasoning or brainstorming

5.  **Planning Tools**
    - `agent`: Creates specialized agents for specific tasks
    - `hand_over_to_approach_agent`: Hands over tasks to an approach agent to write high-level approaches
    - `explanation_response`: Provides clear explanations and optional Mermaid diagrams

### Differences from Phase Mode

The Plan Mode toolset is similar to Phase Mode but has the following key differences:
1.  Added `think` tool for complex reasoning
2.  Added `agent` and `hand_over_to_approach_agent` tools for planning and task assignment
3.  Stricter parameter requirements for some tools

These tools help Traycer AI in Plan Mode to deeply analyze the codebase, formulate detailed implementation plans, and create specialized agents to execute specific tasks.

```json
{
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
    },
    "required": [
      "path",
      "recursive"
    ]
  },
  "file_search": {
    "description": "Fast file search based on fuzzy matching against file path. Use if you know part of the file path but don't know where it's located exactly. Response will be capped to 10 results. Make your query more specific if need to filter results further. It is always better to speculatively perform multiple searches as a batch that are potentially useful.",
    "parameters": {
      "pattern": {
        "description": "Fuzzy filename to search for",
        "type": "string"
      }
    },
    "required": [
      "pattern"
    ]
  },
  "web_search": {
    "description": "Performs web searches to find relevant information and documentation for the given query. This tool helps gather external knowledge useful for solving tasks, especially for obtaining the latest information or documentation.",
    "parameters": {
      "query": {
        "description": "The search query to look up on the web.",
        "type": "string"
      }
    },
    "required": [
      "query"
    ]
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
    },
    "required": [
      "regex",
      "includePattern"
    ]
  },
  "think": {
    "description": "Use the tool to think about something. It will not obtain new information or make any changes to the repository, but just log the thought. Use it when complex reasoning or brainstorming is needed.",
    "parameters": {
      "thought": {
        "description": "Your thoughts.",
        "type": "string"
      }
    },
    "required": [
      "thought"
    ]
  },
  "read_file": {
    "description": "Read the contents of files at the specified paths. Use this when you need to examine the contents of any existing files, for example to analyze code, review text files, or extract information from configuration files. For large files, the system will provide a structured summary with line ranges and brief descriptions of each section instead of the full content. You can then request specific line ranges after reviewing the summary using the read_partial_file tool. Automatically extracts raw text from PDF and DOCX files. May not be suitable for other types of binary files, as it returns the raw content as a string. It is always better to speculatively read multiple files as a batch that are potentially useful.",
    "parameters": {
      "paths": {
        "description": "The paths of the files to read. Use absolute paths.",
        "items": {
          "additionalProperties": false,
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
    "description": "Read specific line ranges from files at the specified paths. Use this when you need to examine only portions of files rather than their entire contents, which is useful for when you only need to focus on specific sections of code, configuration files, or text documents. Specify the startLine and numberOfLines properties for each path to control exactly which portion of the file you want to read. This is more efficient than reading entire files when you only need specific sections.",
    "parameters": {
      "paths": {
        "description": "The paths of the files to read. Each item is an object with path and optional startLine and endLine properties to specify line ranges.",
        "items": {
          "additionalProperties": false,
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
    "description": "Get a symbol outline for all files at the top level of a specified directory. This can be particularly useful when you need to understand the code present in multiple files at a high-level.",
    "parameters": {
      "path": {
        "description": "The path of the directory to get file outlines for. Use absolute path.",
        "sanitizePath": true,
        "type": "string"
      }
    },
    "required": [
      "path"
    ]
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
    },
    "required": [
      "symbol",
      "path",
      "line"
    ]
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
    },
    "required": [
      "symbol",
      "path",
      "line"
    ]
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
    },
    "required": [
      "symbol",
      "path",
      "line"
    ]
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
            "type": "null"
          }
        ]
      },
      "severity": {
        "anyOf": [
          {
            "description": "Severity level of diagnostics to retrieve.",
            "enum": [
              "Error",
              "Warning",
              "Information",
              "Hint"
            ],
            "type": "string"
          },
          {
            "description": "If not provided, returns all severity levels.",
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
    "description": "Create a specialized agent for specific tasks",
    "parameters": {
      "description": {
        "description": "A short (3-5 word) description of the task",
        "type": "string"
      },
      "directoryMaps": {
        "description": "List of full paths of directories that are a good starting point for the task. Agents will be given the list of files and sub-directories in the folder. Do not assume paths, only add paths if you have come across them in previous conversations.",
        "items": {
          "type": "string"
        },
        "type": "array"
      },
      "name": {
        "description": "Name of the agent. Name them like \"Agent <identifier> - <3-5 letter description of their role>\"",
        "type": "string"
      },
      "prompt": {
        "description": "The task for the agent to perform",
        "type": "string"
      },
      "relevantFiles": {
        "description": "List of full paths of files that are relevant for the task. Agents will be provided with the content of the files. Do not assume paths, only add paths if you have come across them in previous conversations. Use absolute paths.",
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
    "description": "Use the tool to indicate that you have explored the high-level structure of the codebase and now ready to hand over to the approach agent to write the high-level approach.",
    "parameters": {
      "reason": {
        "description": "The rationale for the chosen targetRole, explaining why this depth of exploration is appropriate.",
        "type": "string"
      },
      "targetRole": {
        "description": "How much exploration is needed before drafting a file by file plan. planner: The task is very small and direct, no more exploration is needed at all and a full file by file plan can be proposed now; architect: approach and more detailed exploration is needed before writing the file by file plan; engineering_team: the task is very large and may require a multi-faceted analysis, involving a complex interaction between various components, before the approach can be written and a file by file plan can be made.",
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
    "description": "- You are diligent and thorough! You NEVER leave any parts ambiguous in the explanation.\n- Provide clear, concise explanations that are easy to understand.\n- Use markdown format for better readability.",
    "parameters": {
      "containsImplementationPlan": {
        "description": "Set to true when the explanation provides specific, actionable guidance that can be directly implemented as file modifications, regardless of whether it's presented as analysis, recommendations, or explicit instructions.",
        "type": "boolean"
      },
      "explanation": {
        "description": "Provide a clear and comprehensive explanation of the topic or concept. Optimize for readability and use markdown formatting.",
        "type": "string"
      },
      "mermaid": {
        "description": "Generate a Mermaid diagram to visualize the concept or flow. The diagram should be simple and easy to understand, focusing on the key aspects.",
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