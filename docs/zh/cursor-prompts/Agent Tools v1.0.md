## Agent Tools v1.0.json

```json
[
  {
    "description": "从代码库中查找与搜索查询最相关的代码片段。\n这是一个语义搜索工具，因此查询应该询问语义上匹配所需内容的东西。\n如果只在特定目录中搜索有意义，请在target_directories字段中指定它们。\n除非有明确原因使用自己的搜索查询，否则请重用用户的精确查询及其措辞。\n用户的精确措辞/表达方式通常对语义搜索查询有帮助。保持相同的精确问题格式也很有帮助。",
    "name": "codebase_search",
    "parameters": {
      "properties": {
        "explanation": {
          "description": "一句话解释为什么使用此工具，以及它如何有助于目标。",
          "type": "string"
        },
        "query": {
          "description": "搜索查询以查找相关代码。除非有明确原因，否则你应该重用用户的精确查询/最近消息及其措辞。",
          "type": "string"
        },
        "target_directories": {
          "description": "要搜索的目录的Glob模式",
          "items": {
            "type": "string"
          },
          "type": "array"
        }
      },
      "required": [
        "query"
      ],
      "type": "object"
    }
  },
  {
    "description": "读取文件的内容。此工具调用的输出将是start_line_one_indexed到end_line_one_indexed_inclusive的1索引文件内容，以及start_line_one_indexed和end_line_one_indexed_inclusive之外行的摘要。\n注意此调用一次最多可查看250行，最少200行。\n\n使用此工具收集信息时，你有责任确保你有完整的上下文。具体来说，每次调用此命令时你应该：\n1) 评估你查看的内容是否足以继续执行任务。\n2) 注意哪里有未显示的行。\n3) 如果你查看的文件内容不足，并且你怀疑它们可能在未显示的行中，主动再次调用工具查看那些行。\n4) 有疑问时，再次调用此工具收集更多信息。记住部分文件视图可能错过关键依赖、导入或功能。\n\n在某些情况下，如果读取行范围不够，你可能选择读取整个文件。\n读取整个文件通常是浪费且缓慢的，特别是对于大文件（即几百行以上）。所以你应该谨慎使用此选项。\n在大多数情况下不允许读取整个文件。只有当文件已被编辑或手动附加到对话中时，才允许你读取整个文件。",
    "name": "read_file",
    "parameters": {
      "properties": {
        "end_line_one_indexed_inclusive": {
          "description": "结束读取的一索引行号（包含）。",
          "type": "integer"
        },
        "explanation": {
          "description": "一句话解释为什么使用此工具，以及它如何有助于目标。",
          "type": "string"
        },
        "should_read_entire_file": {
          "description": "是否读取整个文件。默认为false。",
          "type": "boolean"
        },
        "start_line_one_indexed": {
          "description": "开始读取的一索引行号（包含）。",
          "type": "integer"
        },
        "target_file": {
          "description": "要读取的文件路径。你可以使用工作区中的相对路径或绝对路径。如果提供绝对路径，将保持不变。",
          "type": "string"
        }
      },
      "required": [
        "target_file",
        "should_read_entire_file",
        "start_line_one_indexed",
        "end_line_one_indexed_inclusive"
      ],
      "type": "object"
    }
  },
  {
    "description": "代表用户提议运行命令。\n如果你有此工具，请注意你确实有能力直接在用户的系统上运行命令。\n注意用户必须批准命令才能执行。\n用户可能会拒绝如果不符合他们的喜好，或者可能在批准前修改命令。如果他们确实改变了它，请考虑这些变化。\n实际命令不会执行直到用户批准。用户可能不会立即批准。不要假设命令已经开始运行。\n如果步骤正在等待用户批准，它尚未开始运行。\n在使用这些工具时，遵循以下指南：\n1. 基于对话内容，你会被告知你是否在与之前步骤相同的shell中或不同的shell中。\n2. 如果在新shell中，你应该`cd`到适当的目录并进行必要的设置以及运行命令。\n3. 如果在同一shell中，在聊天历史中查找你的当前工作目录。\n4. 对于任何需要用户交互的命令，假设用户不可用进行交互并传递非交互标志（例如npx的--yes）。\n5. 如果命令会使用分页器，在命令后附加` | cat`。\n6. 对于长期运行/预计无限期运行直到中断的命令，请在后台运行。要在后台运行作业，将`is_background`设置为true而不是更改命令的详细信息。\n7. 不要在命令中包含任何换行符。",
    "name": "run_terminal_cmd",
    "parameters": {
      "properties": {
        "command": {
          "description": "要执行的终端命令",
          "type": "string"
        },
        "explanation": {
          "description": "一句话解释为什么需要运行此命令以及它如何有助于目标。",
          "type": "string"
        },
        "is_background": {
          "description": "命令是否应在后台运行",
          "type": "boolean"
        }
      },
      "required": [
        "command",
        "is_background"
      ],
      "type": "object"
    }
  },
  {
    "description": "列出目录的内容。在使用更针对性的工具如语义搜索或文件读取之前，用于发现的快速工具。有助于在深入特定文件之前理解文件结构。可用于探索代码库。",
    "name": "list_dir",
    "parameters": {
      "properties": {
        "explanation": {
          "description": "一句话解释为什么使用此工具，以及它如何有助于目标。",
          "type": "string"
        },
        "relative_workspace_path": {
          "description": "要列出内容的路径，相对于工作区根目录。",
          "type": "string"
        }
      },
      "required": [
        "relative_workspace_path"
      ],
      "type": "object"
    }
  },
  {
    "description": "### 说明：\n这最适合查找精确文本匹配或正则表达式模式。\n当我们知道要在某些目录/文件类型中搜索的确切符号/函数名等时，这优先于语义搜索。\n\n使用此工具在文本文件上运行快速、精确的正则表达式搜索，使用`ripgrep`引擎。\n为避免压倒性的输出，结果限制在50个匹配项。\n使用包含或排除模式按文件类型或特定路径过滤搜索范围。\n\n- 始终转义特殊正则表达式字符：( ) [ ] { } + * ? ^ $ | . \\\n- 使用`\\`转义搜索字符串中出现的这些字符。\n- 不要执行模糊或语义匹配。\n- 仅返回有效的正则表达式模式字符串。\n\n### 示例：\n| 字面量               | 正则表达式模式            |\n|-----------------------|--------------------------|\n| function(             | function\\(              |\n| value[index]          | value\\[index\\]         |\n| file.txt               | file\\.txt                |\n| user|admin            | user\\|admin             |\n| path\\to\\file         | path\\\\to\\\\file        |\n| hello world           | hello world              |\n| foo\\(bar\\)          | foo\\\\(bar\\\\)         |",
    "name": "grep_search",
    "parameters": {
      "properties": {
        "case_sensitive": {
          "description": "搜索是否应区分大小写",
          "type": "boolean"
        },
        "exclude_pattern": {
          "description": "要排除的文件的Glob模式",
          "type": "string"
        },
        "explanation": {
          "description": "一句话解释为什么使用此工具，以及它如何有助于目标。",
          "type": "string"
        },
        "include_pattern": {
          "description": "要包含的文件的Glob模式（例如'*.ts'表示TypeScript文件）",
          "type": "string"
        },
        "query": {
          "description": "要搜索的正则表达式模式",
          "type": "string"
        }
      },
      "required": [
        "query"
      ],
      "type": "object"
    }
  },
  {
    "description": "使用此工具提议编辑现有文件或创建新文件。\n\n这将被一个较不智能的模型读取，该模型将快速应用编辑。你应该清楚编辑是什么，同时也要最小化你写的未更改代码。\n在写编辑时，你应该按顺序指定每个编辑，使用特殊注释`// ... existing code ...`来表示编辑行之间的未更改代码。\n\n例如：\n\n```\n// ... existing code ...\nFIRST_EDIT\n// ... existing code ...\nSECOND_EDIT\n// ... existing code ...\nTHIRD_EDIT\n// ... existing code ...\n```\n\n你仍应偏向于重复尽可能少的原始文件行来传达更改。\n但是，每个编辑应包含足够的未更改行上下文来解决代码编辑周围的歧义。\n不要在没有使用`// ... existing code ...`注释指示省略的情况下省略预先存在的代码（或注释）。如果你省略现有代码注释，模型可能会无意中删除这些行。\n确保清楚编辑应该是什么，以及应该应用在哪里。\n要创建新文件，只需在`code_edit`字段中指定文件内容。\n\n你应该在其他参数之前指定以下参数：[target_file]\n\n始终将对文件的所有编辑组合在单个edit_file中，而不是对同一文件进行多次edit_file调用。应用模型可以一次处理许多不同的编辑。在编辑多个文件时，始终并行进行edit_file调用。",
    "name": "edit_file",
    "parameters": {
      "properties": {
        "code_edit": {
          "description": "仅指定你希望编辑的精确代码行。**永远不要指定或写出未更改的代码**。相反，使用你正在编辑的语言的注释来表示所有未更改的代码 - 例如：`// ... existing code ...`",
          "type": "string"
        },
        "instructions": {
          "description": "描述你将为草图编辑做什么的单句指令。这用于帮助较不智能的模型应用编辑。请使用第一人称描述你将做什么。不要重复你在正常消息中说过的话。并使用它来消除编辑中的不确定性。",
          "type": "string"
        },
        "target_file": {
          "description": "要修改的目标文件。始终将目标文件指定为第一个参数。你可以使用工作区中的相对路径或绝对路径。如果提供绝对路径，将保持不变。",
          "type": "string"
        }
      },
      "required": [
        "target_file",
        "instructions",
        "code_edit"
      ],
      "type": "object"
    }
  },
  {
    "description": "使用此工具提议对现有文件进行搜索和替换操作。\n\n该工具将在指定文件中将old_string的一个实例替换为new_string。\n\n使用此工具的关键要求：\n\n1. 唯一性：old_string必须唯一标识你想要更改的特定实例。这意味着：\n   - 在更改点之前至少包含3-5行上下文\n   - 在更改点之后至少包含3-5行上下文\n   - 包含文件中出现的所有空格、缩进和周围代码\n\n2. 单个实例：此工具一次只能更改一个实例。如果你需要更改多个实例：\n   - 为此工具的每个实例进行单独调用\n   - 每次调用必须使用广泛的上下文唯一标识其特定实例\n\n3. 验证：在使用此工具之前：\n   - 如果存在多个实例，收集足够的上下文以唯一标识每个实例\n   - 为每个实例计划单独的工具调用\n",
    "name": "search_replace",
    "parameters": {
      "properties": {
        "file_path": {
          "description": "要进行搜索和替换的文件路径。你可以使用工作区中的相对路径或绝对路径。如果提供绝对路径，将保持不变。",
          "type": "string"
        },
        "new_string": {
          "description": "要替换old_string的编辑文本（必须与old_string不同）",
          "type": "string"
        },
        "old_string": {
          "description": "要替换的文本（必须在文件中唯一，并且必须与文件内容完全匹配，包括所有空格和缩进）",
          "type": "string"
        }
      },
      "required": [
        "file_path",
        "old_string",
        "new_string"
      ],
      "type": "object"
    }
  },
  {
    "description": "基于文件路径的模糊匹配快速文件搜索。如果你知道部分文件路径但不知道确切位置时使用。响应将限制在10个结果。如果你需要进一步过滤结果，请使查询更具体。",
    "name": "file_search",
    "parameters": {
      "properties": {
        "explanation": {
          "description": "一句话解释为什么使用此工具，以及它如何有助于目标。",
          "type": "string"
        },
        "query": {
          "description": "要搜索的模糊文件名",
          "type": "string"
        }
      },
      "required": [
        "query",
        "explanation"
      ],
      "type": "object"
    }
  },
  {
    "description": "删除指定路径的文件。如果以下情况操作将优雅失败：\n    - 文件不存在\n    - 操作因安全原因被拒绝\n    - 文件无法删除",
    "name": "delete_file",
    "parameters": {
      "properties": {
        "explanation": {
          "description": "一句话解释为什么使用此工具，以及它如何有助于目标。",
          "type": "string"
        },
        "target_file": {
          "description": "要删除的文件路径，相对于工作区根目录。",
          "type": "string"
        }
      },
      "required": [
        "target_file"
      ],
      "type": "object"
    }
  },
  {
    "description": "调用更智能的模型将上次编辑应用到指定文件。\n仅在edit_file工具调用结果之后立即使用此工具，如果差异不是你所期望的，表明应用更改的模型不够智能来遵循你的指令。",
    "name": "reapply",
    "parameters": {
      "properties": {
        "target_file": {
          "description": "要重新应用上次编辑的文件的相对路径。你可以使用工作区中的相对路径或绝对路径。如果提供绝对路径，将保持不变。",
          "type": "string"
        }
      },
      "required": [
        "target_file"
      ],
      "type": "object"
    }
  },
  {
    "description": "在网络上搜索有关任何主题的实时信息。当你需要训练数据中可能不可用的最新信息，或需要验证当前事实时使用此工具。搜索结果将包括来自网页的相关片段和URL。这对于关于当前事件、技术更新或任何需要近期信息的主题的问题特别有用。",
    "name": "web_search",
    "parameters": {
      "properties": {
        "explanation": {
          "description": "一句话解释为什么使用此工具，以及它如何有助于目标。",
          "type": "string"
        },
        "search_term": {
          "description": "要在网络上查找的搜索词。要具体并包含相关关键字以获得更好的结果。对于技术查询，如果相关请包含版本号或日期。",
          "type": "string"
        }
      },
      "required": [
        "search_term"
      ],
      "type": "object"
    }
  },
  {
    "description": "创建将在聊天UI中渲染的Mermaid图表。通过`content`提供原始Mermaid DSL字符串。\n使用<br/>换行，始终将图表文本/标签用双引号括起来，不要使用自定义颜色，不要使用:::，不要使用测试功能。\n图表将被预渲染以验证语法 - 如果有任何Mermaid语法错误，它们将在响应中返回，以便你可以修复它们。",
    "name": "create_diagram",
    "parameters": {
      "properties": {
        "content": {
          "description": "原始Mermaid图表定义（例如'graph TD; A-->B;'）。",
          "type": "string"
        }
      },
      "required": [
        "content"
      ],
      "type": "object"
    }
  },
  {
    "description": "使用此工具编辑jupyter笔记本单元格。仅使用此工具编辑笔记本。\n\n此工具支持编辑现有单元格和创建新单元格：\n\t- 如果你需要编辑现有单元格，将'is_new_cell'设置为false并提供'old_string'和'new_string'。\n\t\t-- 该工具将在指定单元格中将'old_string'的一个实例替换为'new_string'。\n\t- 如果你需要创建新单元格，将'is_new_cell'设置为true并提供'new_string'（并将'old_string'保持为空）。\n\t- 关键是你必须正确设置'is_new_cell'标志！\n\t- 此工具不支持单元格删除，但你可以通过传递空字符串作为'new_string'来删除单元格的内容。\n\n其他要求：\n\t- 单元格索引是基于0的。\n\t- 'old_string'和'new_string'应该是有效的单元格内容，即不包含笔记本文件在底层使用的任何JSON语法。\n\t- old_string必须唯一标识你想要更改的特定实例。这意味着：\n\t\t-- 在更改点之前至少包含3-5行上下文\n\t\t-- 在更改点之后至少包含3-5行上下文\n\t- 此工具一次只能更改一个实例。如果你需要更改多个实例：\n\t\t-- 为此工具的每个实例进行单独调用\n\t\t-- 每次调用必须使用广泛的上下文唯一标识其特定实例\n\t- 此工具可能会将markdown单元格保存为\"raw\"单元格。不要尝试更改它，这很好。我们需要它来正确显示差异。\n\t- 如果你需要创建新笔记本，只需将'is_new_cell'设置为true并将cell_idx设置为0。\n\t- 始终按以下顺序生成参数：target_notebook, cell_idx, is_new_cell, cell_language, old_string, new_string。\n\t- 优先编辑现有单元格而不是创建新单元格！\n",
    "name": "edit_notebook",
    "parameters": {
      "properties": {
        "cell_idx": {
          "description": "要编辑的单元格索引（基于0）",
          "type": "number"
        },
        "cell_language": {
          "description": "要编辑的单元格语言。应严格为以下之一：'python', 'markdown', 'javascript', 'typescript', 'r', 'sql', 'shell', 'raw' 或 'other'。",
          "type": "string"
        },
        "is_new_cell": {
          "description": "如果为true，将在指定单元格索引处创建新单元格。如果为false，将编辑指定单元格索引处的单元格。",
          "type": "boolean"
        },
        "new_string": {
          "description": "要替换old_string的编辑文本或新单元格的内容。",
          "type": "string"
        },
        "old_string": {
          "description": "要替换的文本（必须在单元格中唯一，并且必须与单元格内容完全匹配，包括所有空格和缩进）。",
          "type": "string"
        },
        "target_notebook": {
          "description": "要编辑的笔记本文件路径。你可以使用工作区中的相对路径或绝对路径。如果提供绝对路径，将保持不变。",
          "type": "string"
        }
      },
      "required": [
        "target_notebook",
        "cell_idx",
        "is_new_cell",
        "cell_language",
        "old_string",
        "new_string"
      ],
      "type": "object"
    }
  }
]
```