本文档定义了 Claude Code AI 助手可用的工具集。这些工具使其能够执行广泛的软件工程任务，包括：

*   **任务与流程管理**：使用 `Task` 启动专用于复杂任务的自主代理，通过 `TodoWrite` 管理任务列表，并用 `ExitPlanMode` 在规划和编码之间切换。
*   **文件系统操作**：通过 `LS` 浏览目录，`Glob` 进行模式匹配查找文件，`Read` 读取文件内容（支持文本、图片、PDF等），`Write` 创建或覆盖文件，以及 `Edit` 和 `MultiEdit` 对文件进行精确修改。
*   **代码与内容搜索**：利用 `Grep` 在文件内容中执行高效的正则表达式搜索。
*   **命令执行**：通过 `Bash` 工具执行 shell 命令，并能使用 `BashOutput` 和 `KillBash` 管理后台进程。
*   **Web 交互**：使用 `WebFetch` 从 URL 获取和处理内容，以及 `WebSearch` 执行网络搜索以获取最新信息。
*   **特定格式编辑**：提供 `NotebookEdit` 工具专门用于编辑 Jupyter Notebook 的单元格。

这些工具共同构成了一个强大的开发助手，能够以自动化和交互式的方式处理从代码分析、编写到环境交互的各种需求。

## claude-code-tools.json

```json
{
  "tools": [
    {
      "name": "Task",
      "description": "启动一个新代理以自主处理复杂的多步骤任务。\n\n可用代理类型及其可访问的工具：\n- general-purpose: 通用代理，用于研究复杂问题、搜索代码和执行多步骤任务。当您搜索关键字或文件且不确定前几次尝试就能找到正确匹配时，请使用此代理为您执行搜索。（工具：*）\n- statusline-setup: 使用此代理配置用户的 Claude Code 状态行设置。（工具：Read, Edit）\n- output-style-setup: 使用此代理创建 Claude Code 输出样式。（工具：Read, Write, Edit, Glob, LS, Grep）\n\n使用 Task 工具时，您必须指定 subagent_type 参数以选择要使用的代理类型。\n\n\n\n何时不使用代理工具：\n- 如果要读取特定文件路径，请使用 Read 或 Glob 工具而不是代理工具，以更快地找到匹配项\n- 如果要搜索特定的类定义（如 \"class Foo\"），请改用 Glob 工具，以更快地找到匹配项\n- 如果要在特定文件或2-3个文件组中搜索代码，请使用 Read 工具而不是代理工具，以更快地找到匹配项\n- 与上述代理描述无关的其他任务\n\n\n使用说明：\n1. 尽可能同时启动多个代理，以最大限度地提高性能；为此，请使用包含多个工具用途的单个消息\n2. 代理完成后，它将向您返回一条消息。代理返回的结果对用户不可见。要向用户显示结果，您应该向用户发回一条文本消息，其中包含结果的简明摘要。\n3. 每个代理调用都是无状态的。您将无法向代理发送其他消息，代理也无法在其最终报告之外与您通信。因此，您的提示应包含一个非常详细的任务描述... [截断]",
      "input_schema": {
        "type": "object",
        "properties": {
          "description": {
            "type": "string",
            "description": "任务的简短（3-5个词）描述"
          },
          "prompt": {
            "type": "string",
            "description": "要代理执行的任务"
          },
          "subagent_type": {
            "type": "string",
            "description": "用于此任务的专门代理的类型"
          }
        },
        "required": [
          "description",
          "prompt",
          "subagent_type"
        ],
        "additionalProperties": false,
        "$schema": "http://json-schema.org/draft-07/schema#"
      }
    },
    {
      "name": "Bash",
      "description": "在持久的 shell 会话中执行给定的 bash 命令，并带有可选的超时，确保正确的处理和安全措施。\n\n在执行命令之前，请按照以下步骤操作：\n\n1. 目录验证：\n   - 如果命令将创建新目录或文件，请首先使用 LS 工具验证父目录是否存在并且是正确的位置\n   - 例如，在运行 \"mkdir foo/bar\" 之前，首先使用 LS 检查 \"foo\" 是否存在并且是预期的父目录\n\n2. 命令执行：\n   - 始终用双引号将包含空格的文件路径引起来（例如，cd \"path with spaces/file.txt\"）\n   - 正确引用的示例：\n     - cd \"/Users/name/My Documents\" (正确)\n     - cd /Users/name/My Documents (不正确 - 将失败)\n     - python \"/path/with spaces/script.py\" (正确)\n     - python /path/with spaces/script.py (不正确 - 将失败)\n   - 确保正确引用后，执行命令。\n   - 捕获命令的输出。\n\n使用说明：\n  - command 参数是必需的。\n  - 您可以指定一个可选的超时时间（以毫秒为单位，最长为 600000 毫秒/10 分钟）。如果未指定，命令将在 120000 毫秒（2 分钟）后超时。\n  - 如果您能用 5-10 个词写出此命令作用的清晰、简洁的描述，那将非常有帮助。\n  - 如果输出超过 30000 个字符，输出将在返回给您之前被截断。\n  - 您可以使用 `run_in_background` 参数在后台运行命令，这使您可以在命令运行时继续工作。您可以使用 Bash 工具在输出可用时监视输出。切勿使用 `run_in_background` 运行 'sleep'，因为它会立即返回。使用此参数时，您无需在命令末尾使用“&”。\n  - 非常重要：您必须避免使用 `find` 和 `grep` 等搜索命令。请改用 Grep、Glob 或 Task 进行搜索。您必须避免使用 `cat`、`head`、`tail` 等读取工具... [截断]",
      "input_schema": {
        "type": "object",
        "properties": {
          "command": {
            "type": "string",
            "description": "要执行的命令"
          },
          "timeout": {
            "type": "number",
            "description": "可选的超时时间（毫秒，最大 600000）"
          },
          "description": {
            "type": "string",
            "description": "用 5-10 个词清晰、简洁地描述此命令的作用。示例：\n输入：ls\n输出：列出当前目录中的文件\n\n输入：git status\n输出：显示工作树状态\n\n输入：npm install\n输出：安装包依赖项\n\n输入：mkdir foo\n输出：创建目录 'foo'"
          },
          "run_in_background": {
            "type": "boolean",
            "description": "设置为 true 可在后台运行此命令。稍后使用 BashOutput 读取输出。"
          }
        },
        "required": [
          "command"
        ],
        "additionalProperties": false,
        "$schema": "http://json-schema.org/draft-07/schema#"
      }
    },
    {
      "name": "Glob",
      "description": "- 适用于任何代码库大小的快速文件模式匹配工具\n- 支持 \"**/*.js\" 或 \"src/**/*.ts\" 等 glob 模式\n- 返回按修改时间排序的匹配文件路径\n- 当您需要按名称模式查找文件时，请使用此工具\n- 当您进行可能需要多轮 glob 和 grep 的开放式搜索时，请改用 Agent 工具\n- 您有能力在单个响应中调用多个工具。最好是批量推测性地执行多个可能有用的搜索。",
      "input_schema": {
        "type": "object",
        "properties": {
          "pattern": {
            "type": "string",
            "description": "用于匹配文件的 glob 模式"
          },
          "path": {
            "type": "string",
            "description": "要搜索的目录。如果未指定，将使用当前工作目录。重要提示：省略此字段以使用默认目录。请勿输入 \"undefined\" 或 \"null\" - 只需省略即可获得默认行为。如果提供，则必须是有效的目录路径。"
          }
        },
        "required": [
          "pattern"
        ],
        "additionalProperties": false,
        "$schema": "http://json-schema.org/draft-07/schema#"
      }
    },
    {
      "name": "Grep",
      "description": "一个基于 ripgrep 构建的强大搜索工具\n\n  用法：\n  - 始终使用 Grep 进行搜索任务。切勿作为 Bash 命令调用 `grep` 或 `rg`。Grep 工具已针对正确的权限和访问进行了优化。\n  - 支持完整的正则表达式语法（例如，\"log.*Error\"，\"function\\s+\\w+\"）\n  - 使用 glob 参数（例如，\"*.js\"，\"**/*.tsx\"）或 type 参数（例如，\"js\"，\"py\"，\"rust\"）过滤文件\n  - 输出模式：\"content\" 显示匹配行，\"files_with_matches\" 仅显示文件路径（默认），\"count\" 显示匹配计数\n  - 对于需要多轮的开放式搜索，请使用 Task 工具\n  - 模式语法：使用 ripgrep（而非 grep）- 文字大括号需要转义（使用 `interface\\{\\}来查找 Go 代码中的 `interface{}`）\n  - 多行匹配：默认情况下，模式仅在单行内匹配。对于跨行模式，如 `struct \\{[\\s\\S]*?field`，请使用 `multiline: true`\n",
      "input_schema": {
        "type": "object",
        "properties": {
          "pattern": {
            "type": "string",
            "description": "要在文件内容中搜索的正则表达式模式"
          },
          "path": {
            "type": "string",
            "description": "要搜索的文件或目录 (rg PATH)。默认为当前工作目录。"
          },
          "glob": {
            "type": "string",
            "description": "用于过滤文件的 Glob 模式（例如 \"*.js\"，\"*.{ts,tsx}\"）- 映射到 rg --glob"
          },
          "output_mode": {
            "type": "string",
            "enum": [
              "content",
              "files_with_matches",
              "count"
            ],
            "description": "输出模式：\"content\" 显示匹配行（支持 -A/-B/-C 上下文、-n 行号、head_limit），\"files_with_matches\" 显示文件路径（支持 head_limit），\"count\" 显示匹配计数（支持 head_limit）。默认为 \"files_with_matches\"。"
          },
          "-B": {
            "type": "number",
            "description": "在每次匹配前显示的行数 (rg -B)。需要 output_mode: \"content\"，否则将被忽略。"
          },
          "-A": {
            "type": "number",
            "description": "在每次匹配后显示的行数 (rg -A)。需要 output_mode: \"content\"，否则将被忽略。"
          },
          "-C": {
            "type": "number",
            "description": "在每次匹配前后显示的行数 (rg -C)。需要 output_mode: \"content\"，否则将被忽略。"
          },
          "-n": {
            "type": "boolean",
            "description": "在输出中显示行号 (rg -n)。需要 output_mode: \"content\"，否则将被忽略。"
          },
          "-i": {
            "type": "boolean",
            "description": "不区分大小写搜索 (rg -i)"
          },
          "type": {
            "type": "string",
            "description": "要搜索的文件类型 (rg --type)。常用类型：js、py、rust、go、java 等。对于标准文件类型，比 include 更有效。"
          },
          "head_limit": {
            "type": "number",
            "description": "将输出限制为前 N 行/条目，相当于 \"| head -N\"。适用于所有输出模式：content（限制输出行数）、files_with_matches（限制文件路径）、count（限制计数条目）。未指定时，显示 ripgrep 的所有结果。"
          },
          "multiline": {
            "type": "boolean",
            "description": "启用多行模式，其中 . 匹配换行符，模式可以跨行 (rg -U --multiline-dotall)。默认值：false。"
          }
        },
        "required": [
          "pattern"
        ],
        "additionalProperties": false,
        "$schema": "http://json-schema.org/draft-07/schema#"
      }
    },
    {
      "name": "LS",
      "description": "列出给定路径中的文件和目录。path 参数必须是绝对路径，而不是相对路径。您可以选择性地提供一个 glob 模式数组以使用 ignore 参数忽略。如果您知道要搜索哪些目录，通常应首选 Glob 和 Grep 工具。",
      "input_schema": {
        "type": "object",
        "properties": {
          "path": {
            "type": "string",
            "description": "要列出的目录的绝对路径（必须是绝对路径，而不是相对路径）"
          },
          "ignore": {
            "type": "array",
            "items": {
              "type": "string"
            },
            "description": "要忽略的 glob 模式列表"
          }
        },
        "required": [
          "path"
        ],
        "additionalProperties": false,
        "$schema": "http://json-schema.org/draft-07/schema#"
      }
    },
    {
      "name": "ExitPlanMode",
      "description": "当您处于计划模式并已完成计划演示并准备好编码时，请使用此工具。这将提示用户退出计划模式。\n重要提示：仅当任务需要规划需要编写代码的任务的实施步骤时才使用此工具。对于您正在收集信息、搜索文件、阅读文件或通常试图理解代码库的研究任务 - 请勿使用此工具。\n\n例如\n1. 初始任务：\"搜索并理解代码库中 vim 模式的实现\" - 不要使用退出计划模式工具，因为您没有在规划任务的实施步骤。\n2. 初始任务：\"帮我实现 vim 的 yank 模式\" - 在您完成任务的实施步骤规划后，使用退出计划模式工具。\n",
      "input_schema": {
        "type": "object",
        "properties": {
          "plan": {
            "type": "string",
            "description": "您提出的计划，您希望用户批准。支持 markdown。该计划应该非常简洁。"
          }
        },
        "required": [
          "plan"
        ],
        "additionalProperties": false,
        "$schema": "http://json-schema.org/draft-07/schema#"
      }
    },
    {
      "name": "Read",
      "description": "从本地文件系统读取文件。您可以使用此工具直接访问任何文件。\n假设此工具能够读取计算机上的所有文件。如果用户提供文件路径，则假定该路径有效。读取不存在的文件是可以的；将返回错误。\n\n用法：\n- file_path 参数必须是绝对路径，而不是相对路径\n- 默认情况下，它从文件开头读取最多 2000 行\n- 您可以选择指定行偏移量和限制（对于长文件尤其方便），但建议通过不提供这些参数来读取整个文件\n- 任何超过 2000 个字符的行都将被截断\n- 结果使用 cat -n 格式返回，行号从 1 开始\n- 此工具允许 Claude Code 读取图像（例如 PNG、JPG 等）。读取图像文件时，内容会以视觉方式呈现，因为 Claude Code 是一个多模态 LLM。\n- 此工具可以读取 PDF 文件 (.pdf)。PDF 会逐页处理，提取文本和视觉内容进行分析。\n- 此工具可以读取 Jupyter 笔记本 (.ipynb 文件) 并返回所有单元格及其输出，结合了代码、文本和可视化。\n- 您有能力在单个响应中调用多个工具。最好是批量推测性地读取多个可能有用的文件。\n- 您会经常被要求阅读屏幕截图。如果用户提供了屏幕截图的路径，请始终使用此工具查看该路径下的文件。此工具适用于所有临时文件路径，如 /var/folders/123/abc/T/TemporaryItems/NSIRD_screencaptureui_ZfB1tD/Screenshot.png\n- 如果您读取一个存在但内容为空的文件，您将收到一个系统提醒警告来代替文件内容。",
      "input_schema": {
        "type": "object",
        "properties": {
          "file_path": {
            "type": "string",
            "description": "要读取的文件的绝对路径"
          },
          "offset": {
            "type": "number",
            "description": "开始读取的行号。仅在文件太大而无法一次性读取时提供"
          },
          "limit": {
            "type": "number",
            "description": "要读取的行数。仅在文件太大而无法一次性读取时提供。"
          }
        },
        "required": [
          "file_path"
        ],
        "additionalProperties": false,
        "$schema": "http://json-schema.org/draft-07/schema#"
      }
    },
    {
      "name": "Edit",
      "description": "在文件中执行精确的字符串替换。\n\n用法：\n- 在编辑之前，您必须在对话中至少使用一次 `Read` 工具。如果您在未读取文件的情况下尝试编辑，此工具将出错。\n- 从 Read 工具输出编辑文本时，请确保保留行号前缀之后出现的确切缩进（制表符/空格）。行号前缀格式为：空格 + 行号 + 制表符。该制表符之后的所有内容都是要匹配的实际文件内容。切勿在 old_string 或 new_string 中包含行号前缀的任何部分。\n- 始终优先编辑代码库中的现有文件。除非明确要求，否则切勿写入新文件。\n- 只有在用户明确要求时才使用表情符号。除非被要求，否则避免向文件添加表情符号。\n- 如果 `old_string` 在文件中不是唯一的，则编辑将失败。要么提供一个包含更多周围上下文的更长字符串以使其唯一，要么使用 `replace_all` 更改 `old_string` 的每个实例。\n- 使用 `replace_all` 在整个文件中替换和重命名字符串。例如，如果要重命名变量，此参数很有用。",
      "input_schema": {
        "type": "object",
        "properties": {
          "file_path": {
            "type": "string",
            "description": "要修改的文件的绝对路径"
          },
          "old_string": {
            "type": "string",
            "description": "要替换的文本"
          },
          "new_string": {
            "type": "string",
            "description": "要替换它的文本（必须与 old_string 不同）"
          },
          "replace_all": {
            "type": "boolean",
            "default": false,
            "description": "替换 old_string 的所有出现（默认为 false）"
          }
        },
        "required": [
          "file_path",
          "old_string",
          "new_string"
        ],
        "additionalProperties": false,
        "$schema": "http://json-schema.org/draft-07/schema#"
      }
    },
    {
      "name": "MultiEdit",
      "description": "这是一个用于在一次操作中对单个文件进行多次编辑的工具。它建立在 Edit 工具之上，允许您高效地执行多个查找和替换操作。当您需要对同一文件进行多次编辑时，请优先使用此工具。\n\n在使用此工具之前：\n\n1. 使用 Read 工具了解文件的内容和上下文\n2. 验证目录路径是否正确\n\n要进行多次文件编辑，请提供以下内容：\n1. file_path：要修改的文件的绝对路径（必须是绝对路径，而不是相对路径）\n2. edits：要执行的编辑操作数组，其中每个编辑包含：\n   - old_string：要替换的文本（必须与文件内容完全匹配，包括所有空格和缩进）\n   - new_string：用于替换 old_string 的编辑后文本\n   - replace_all：替换 old_string 的所有出现。此参数是可选的，默认为 false。\n\n重要提示：\n- 所有编辑都按提供的顺序依次应用\n- 每个编辑都在上一个编辑的结果上操作\n- 所有编辑都必须有效才能使操作成功 - 如果任何编辑失败，则不会应用任何编辑\n- 当您需要对同一文件的不同部分进行多次更改时，此工具是理想的选择\n- 对于 Jupyter 笔记本 (.ipynb 文件)，请改用 NotebookEdit\n\n关键要求：\n1. 所有编辑都遵循与单个 Edit 工具相同的要求\n2. 编辑是原子性的 - 要么全部成功，要么全部不应用\n3. 仔细计划您的编辑，以避免顺序操作之间的冲突\n\n警告：\n- 如果 edits.old_string 与文件内容不完全匹配（包括空格），则该工具将失败\n- 如果 edits.old_string 和 edits.new_string 相同，则该工具将失败\n- 由于编辑是按顺序应用的，因此请确保较早的编辑不会影响以后编辑要查找的文本\n\n进行编辑时：\n- 确保所有编辑都会产生惯用的、正确的代码\n- 不要离开... [截断]",
      "input_schema": {
        "type": "object",
        "properties": {
          "file_path": {
            "type": "string",
            "description": "要修改的文件的绝对路径"
          },
          "edits": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "old_string": {
                  "type": "string",
                  "description": "要替换的文本"
                },
                "new_string": {
                  "type": "string",
                  "description": "要替换它的文本"
                },
                "replace_all": {
                  "type": "boolean",
                  "default": false,
                  "description": "替换 old_string 的所有出现（默认为 false）。"
                }
              },
              "required": [
                "old_string",
                "new_string"
              ],
              "additionalProperties": false
            },
            "minItems": 1,
            "description": "要对文件顺序执行的编辑操作数组"
          }
        },
        "required": [
          "file_path",
          "edits"
        ],
        "additionalProperties": false,
        "$schema": "http://json-schema.org/draft-07/schema#"
      }
    },
    {
      "name": "Write",
      "description": "将文件写入本地文件系统。\n\n用法：\n- 如果在提供的路径上存在现有文件，此工具将覆盖该文件。\n- 如果这是一个现有文件，您必须首先使用 Read 工具读取文件的内容。如果您没有先读取文件，此工具将失败。\n- 始终优先编辑代码库中的现有文件。除非明确要求，否则切勿写入新文件。\n- 切勿主动创建文档文件 (*.md) 或 README 文件。只有在用户明确请求时才创建文档文件。\n- 只有在用户明确要求时才使用表情符号。除非被要求，否则避免向文件写入表情符号。",
      "input_schema": {
        "type": "object",
        "properties": {
          "file_path": {
            "type": "string",
            "description": "要写入的文件的绝对路径（必须是绝对路径，而不是相对路径）"
          },
          "content": {
            "type": "string",
            "description": "要写入文件的内容"
          }
        },
        "required": [
          "file_path",
          "content"
        ],
        "additionalProperties": false,
        "$schema": "http://json-schema.org/draft-07/schema#"
      }
    },
    {
      "name": "NotebookEdit",
      "description": "用新源完全替换 Jupyter 笔记本 (.ipynb 文件) 中特定单元格的内容。Jupyter 笔记本是交互式文档，结合了代码、文本和可视化，通常用于数据分析和科学计算。notebook_path 参数必须是绝对路径，而不是相对路径。cell_number 是从 0 开始索引的。使用 edit_mode=insert 在 cell_number 指定的索引处添加一个新单元格。使用 edit_mode=delete 删除 cell_number 指定的索引处的单元格。",
      "input_schema": {
        "type": "object",
        "properties": {
          "notebook_path": {
            "type": "string",
            "description": "要编辑的 Jupyter 笔记本文件的绝对路径（必须是绝对路径，而不是相对路径）"
          },
          "cell_id": {
            "type": "string",
            "description": "要编辑的单元格的 ID。插入新单元格时，新单元格将插入到具有此 ID 的单元格之后，如果未指定，则插入到开头。"
          },
          "new_source": {
            "type": "string",
            "description": "单元格的新源"
          },
          "cell_type": {
            "type": "string",
            "enum": [
              "code",
              "markdown"
            ],
            "description": "单元格的类型（代码或 markdown）。如果未指定，则默认为当前单元格类型。如果使用 edit_mode=insert，则此项为必需。"
          },
          "edit_mode": {
            "type": "string",
            "enum": [
              "replace",
              "insert",
              "delete"
            ],
            "description": "要进行的编辑类型（替换、插入、删除）。默认为替换。"
          }
        },
        "required": [
          "notebook_path",
          "new_source"
        ],
        "additionalProperties": false,
        "$schema": "http://json-schema.org/draft-07/schema#"
      }
    },
    {
      "name": "WebFetch",
      "description": "\n- 从指定 URL 获取内容并使用 AI 模型进行处理\n- 将 URL 和提示作为输入\n- 获取 URL 内容，将 HTML 转换为 markdown\n- 使用小型、快速的模型处理带有提示的内容\n- 返回模型关于内容的回应\n- 当您需要检索和分析 Web 内容时，请使用此工具\n\n使用说明：\n  - 重要提示：如果提供了 MCP 提供的 Web 获取工具，请优先使用该工具，因为它可能具有较少的限制。所有 MCP 提供的工具都以 \"mcp__\" 开头。\n  - URL 必须是格式正确的有效 URL\n  - HTTP URL 将自动升级为 HTTPS\n  - 提示应描述您要从页面中提取的信息\n  - 此工具是只读的，不会修改任何文件\n  - 如果内容非常大，结果可能会被摘要\n  - 包括一个自清理的 15 分钟缓存，以便在重复访问同一 URL 时更快地响应\n  - 当 URL 重定向到其他主机时，该工具会通知您并以特殊格式提供重定向 URL。然后，您应该使用重定向 URL 发出新的 WebFetch 请求以获取内容。\n",
      "input_schema": {
        "type": "object",
        "properties": {
          "url": {
            "type": "string",
            "format": "uri",
            "description": "要从中获取内容的 URL"
          },
          "prompt": {
            "type": "string",
            "description": "要在获取的内容上运行的提示"
          }
        },
        "required": [
          "url",
          "prompt"
        ],
        "additionalProperties": false,
        "$schema": "http://json-schema.org/draft-07/schema#"
      }
    },
    {
      "name": "TodoWrite",
      "description": "使用此工具为您当前的编码会话创建和管理结构化的任务列表。这可以帮助您跟踪进度、组织复杂的任务并向用户展示彻底性。\n它还可以帮助用户了解任务的进度以及他们请求的总体进度。\n\n## 何时使用此工具\n在以下情况下主动使用此工具：\n\n1. 复杂的多步骤任务 - 当任务需要 3 个或更多不同的步骤或操作时\n2. 非平凡和复杂的任务 - 需要仔细规划或多个操作的任务\n3. 用户明确要求待办事项列表 - 当用户直接要求您使用待办事项列表时\n4. 用户提供多个任务 - 当用户提供要完成的事情列表（编号或逗号分隔）时\n5. 收到新指令后 - 立即将用户要求捕获为待办事项\n6. 当您开始处理任务时 - 在开始工作之前将其标记为 in_progress。理想情况下，您一次只应有一个待办事项处于 in_progress 状态\n7. 完成任务后 - 将其标记为已完成，并添加在实施过程中发现的任何新的后续任务\n\n## 何时不使用此工具\n\n在以下情况下跳过使用此工具：\n1. 只有一个简单的任务\n2. 任务是微不足道的，跟踪它没有任何组织上的好处\n3. 任务可以在不到 3 个微不足道的步骤中完成\n4. 任务纯粹是对话式或信息性的\n\n请注意，如果只有一个微不足道的任务要做，则不应使用此工具。在这种情况下，最好直接执行任务。\n\n## 何时使用待办事项列表的示例\n\n<example>\n用户：我想在应用程序设置中添加一个暗模式切换。完成后请确保运行测试和构建！\n助手：我会帮助您在应用程序设置中添加一个暗模式切换。让我创建一个待办事项列表来跟踪此实现。\n*创建包含以下项目的待办事项列表：*\n1. 在“设置”页面中创建暗模式切换组件\n2. 添加暗模式... [截断]",
      "input_schema": {
        "type": "object",
        "properties": {
          "todos": {
            "type": "array",
            "items": {
              "type": 'object',
              "properties": {
                "content": {
                  "type": "string",
                  "minLength": 1
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
                }
              },
              "required": [
                "content",
                "status",
                "id"
              ],
              "additionalProperties": false
            },
            "description": "更新后的待办事项列表"
          }
        },
        "required": [
          "todos"
        ],
        "additionalProperties": false,
        "$schema": "http://json-schema.org/draft-07/schema#"
      }
    },
    {
      "name": "WebSearch",
      "description": "\n- 允许 Claude 搜索网络并使用结果来为响应提供信息\n- 提供有关当前事件和最新数据的最新信息\n- 以搜索结果块的形式返回搜索结果信息\n- 使用此工具访问超出 Claude 知识截止日期的信息\n- 搜索在单个 API 调用中自动执行\n\n使用说明：\n  - 支持域过滤以包含或阻止特定网站\n  - 网络搜索仅在美国可用\n  - 考虑 <env> 中的 \"今天的日期\"。例如，如果 <env> 显示 \"今天的日期：2025-07-01\"，并且用户想要最新的文档，请不要在搜索查询中使用 2024。请使用 2025。\n",
      "input_schema": {
        "type": "object",
        "properties": {
          "query": {
            "type": "string",
            "minLength": 2,
            "description": "要使用的搜索查询"
          },
          "allowed_domains": {
            "type": "array",
            "items": {
              "type": "string"
            },
            "description": "仅包括来自这些域的搜索结果"
          },
          "blocked_domains": {
            "type": "array",
            "items": {
              "type": "string"
            },
            "description": "从不包括来自这些域的搜索结果"
          }
        },
        "required": [
          "query"
        ],
        "additionalProperties": false,
        "$schema": "http://json-schema.org/draft-07/schema#"
      }
    },
    {
      "name": "BashOutput",
      "description": "\n- 从正在运行或已完成的后台 bash shell 中检索输出\n- 接受一个标识 shell 的 shell_id 参数\n- 始终只返回自上次检查以来的新输出\n- 返回 stdout 和 stderr 输出以及 shell 状态\n- 支持可选的正则表达式过滤以仅显示与模式匹配的行\n- 当您需要监视或检查长时间运行的 shell 的输出时，请使用此工具\n- 可以使用 /bashes 命令找到 Shell ID\n",
      "input_schema": {
        "type": "object",
        "properties": {
          "bash_id": {
            "type": "string",
            "description": "要从中检索输出的后台 shell 的 ID"
          },
          "filter": {
            "type": "string",
            "description": "用于过滤输出行的可选正则表达式。只有与此正则表达式匹配的行才会包含在结果中。任何不匹配的行将不再可读。"
          }
        },
        "required": [
          "bash_id"
        ],
        "additionalProperties": false,
        "$schema": "http://json-schema.org/draft-07/schema#"
      }
    },
    {
      "name": "KillBash",
      "description": "\n- 通过其 ID 终止正在运行的后台 bash shell\n- 接受一个标识要终止的 shell 的 shell_id 参数\n- 返回成功或失败状态\n- 当您需要终止长时间运行的 shell 时，请使用此工具\n- 可以使用 /bashes 命令找到 Shell ID\n",
      "input_schema": {
        "type": "object",
        "properties": {
          "shell_id": {
            "type": "string",
            "description": "要终止的后台 shell 的 ID"
          }
        },
        "required": [
          "shell_id"
        ],
        "additionalProperties": false,
        "$schema": "http://json-schema.org/draft-07/schema#"
      }
    }
  ]
}
```