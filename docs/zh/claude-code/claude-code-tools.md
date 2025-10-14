## Claude Code 工具定义

本文档定义了以下工具：
- `Task`: 启动一个新的代理来自主处理复杂的多步骤任务
- `Bash`: 执行给定的 bash 命令
- `Glob`: 快速文件模式匹配工具
- `Grep`: 基于 ripgrep 的强大搜索工具
- `LS`: 列出给定路径中的文件和目录
- `ExitPlanMode`: 在计划模式结束时使用
- `Read`: 从本地文件系统读取文件
- `Edit`: 在文件中执行精确的字符串替换
- `MultiEdit`: 一次对单个文件进行多次编辑
- `Write`: 将文件写入本地文件系统
- `NotebookEdit`: 替换 Jupyter 笔记本中特定单元格的内容
- `WebFetch`: 从指定 URL 获取内容
- `TodoWrite`: 创建和管理结构化任务列表
- `WebSearch`: 允许 Claude 搜索网络
- `BashOutput`: 检索后台 bash shell 的输出
- `KillBash`: 终止正在运行的后台 bash shell

```json
{
  "tools": [
    {
      "name": "Task",
      "description": "启动一个新的代理来自主处理复杂的多步骤任务。\\n\\n可用的代理类型和它们可访问的工具有：\\n- general-purpose: 用于研究复杂问题、搜索代码和执行多步骤任务的通用代理。当您搜索关键字或文件且不确定前几次尝试能否找到正确匹配时，使用此代理为您执行搜索。(工具: *)\\n- statusline-setup: 使用此代理配置用户的 Claude Code 状态栏设置。(工具: Read, Edit)\\n- output-style-setup: 使用此代理创建 Claude Code 输出样式。(工具: Read, Write, Edit, Glob, LS, Grep)\\n\\n使用 Task 工具时，您必须指定 subagent_type 参数来选择要使用的代理类型。\\n\\n\\n\\n何时不使用代理工具：\\n- 如果您想读取特定文件路径，请使用 Read 或 Glob 工具而不是 Agent 工具，以便更快地找到匹配项\\n- 如果您正在搜索特定类定义如 \\\"class Foo\\\"，请使用 Glob 工具而不是 Agent 工具，以便更快地找到匹配项\\n- 如果您在特定文件或 2-3 个文件中搜索代码，请使用 Read 工具而不是 Agent 工具，以便更快地找到匹配项\\n- 与上述代理描述无关的其他任务\\n\\n使用说明：\\n1. 尽可能同时启动多个代理以最大化性能；为此，使用包含多个工具调用的单条消息\\n2. 代理完成后，将向您返回一条消息。代理返回的结果用户不可见。要向用户显示结果，您应向用户发送包含结果简要摘要的消息。\\n3. 每个代理调用都是无状态的。您将无法向代理发送额外的消息，代理也无法在最终报告之外与您通信。因此，您的提示应包含详细的代理执行任务的描述，并应确切指定代理应在最终且唯一的回复中向您返回什么信息。\\n4. 代理的输出通常应被信任\\n5. 明确告诉代理您期望它是编写代码还是仅做研究（搜索、文件读取、网页获取等），因为它不知道用户的意图\\n6. 如果代理描述中提到应主动使用，则应尽量在用户未要求时使用。使用您的判断。\\n\\n示例用法：\\n\\n<example_agent_descriptions>\\n\\\"code-reviewer\\\": 在编写大量代码后使用此代理\\n\\\"greeting-responder\\\": 用友好笑话回复用户问候时使用此代理\\n</example_agent_description>\\n\\n<example>\\nuser: \\\"请编写一个检查数字是否为质数的函数\\\"\\nassistant: 当然，让我编写一个检查数字是否为质数的函数\\nassistant: 首先让我使用 Write 工具编写一个检查数字是否为质数的函数\\nassistant: 我将使用 Write 工具编写以下代码：\\n<code>\\nfunction isPrime(n) {\\n  if (n <= 1) return false\\n  for (let i = 2; i * i <= n; i++) {\\n    if (n % i === 0) return false\\n  }\\n  return true\\n}\\n</code>\\n<commentary>\\n由于编写了大量代码并且任务已完成，现在使用 code-reviewer 代理审查代码\\n</commentary>\\nassistant: 现在让我使用 code-reviewer 代理审查代码\\nassistant: 使用 Task 工具启动 code-reviewer 代理 \\n</example>\\n\\n<example>\\nuser: \\\"你好\\\"\\n<commentary>\\n由于用户在问候，使用 greeting-responder 代理用友好笑话回复\\n</commentary>\\nassistant: \\\"我将使用 Task 工具启动 greeting-responder 代理\\\"\\n</example>\\n",
      "input_schema": {
        "type": "object",
        "properties": {
          "description": {
            "type": "string",
            "description": "任务的简短（3-5 字）描述"
          },
          "prompt": {
            "type": "string",
            "description": "代理要执行的任务"
          },
          "subagent_type": {
            "type": "string",
            "description": "用于此任务的专用代理类型"
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
      "description": "在具有可选超时的持久 shell 会话中执行给定的 bash 命令，确保适当的处理和安全措施。\\n\\n执行命令之前，请遵循以下步骤：\\n\\n1. 目录验证：\\n   - 如果命令将创建新目录或文件，首先使用 LS 工具验证父目录存在且是正确位置\\n   - 例如，在运行 \\\"mkdir foo/bar\\\" 之前，首先使用 LS 检查 \\\"foo\\\" 是否存在且是预期的父目录\\n\\n2. 命令执行：\\n   - 始终用双引号引用包含空格的文件路径（例如，cd \\\"path with spaces/file.txt\\\"）\\n   - 正确引用的示例：\\n     - cd \\\"/Users/name/My Documents\\\"（正确）\\n     - cd /Users/name/My Documents（错误 - 将失败）\\n     - python \\\"/path/with spaces/script.py\\\"（正确）\\n     - python /path/with spaces/script.py（错误 - 将失败）\\n   - 确保正确引用后，执行命令。\\n   - 捕获命令的输出。\\n\\n使用说明：\\n  - command 参数是必需的。\\n  - 您可以指定毫秒的可选超时（最多 600000ms / 10 分钟）。如果未指定，命令将在 120000ms（2 分钟）后超时。\\n  - 如果能用 5-10 个词清晰、简洁地描述此命令的作用，这将非常有帮助。\\n  - 如果输出超过 30000 个字符，输出将在返回给您之前被截断。\\n  - 您可以使用 `run_in_background` 参数在后台运行命令，这允许您在命令运行时继续工作。您可以使用 Bash 工具监视输出。永远不要使用 `run_in_background` 运行 'sleep'，因为它会立即返回。使用此参数时不需要在命令末尾使用 '&'。\\n  - 非常重要：您必须避免使用 `find` 和 `grep` 等搜索命令。而是使用 Grep、Glob 或 Task 进行搜索。您必须避免使用 `cat`、`head`、`tail` 等读取工具...",
      "input_schema": {
        "type": "object",
        "properties": {
          "command": {
            "type": "string",
            "description": "要执行的命令"
          },
          "timeout": {
            "type": "number",
            "description": "可选超时（毫秒）（最大 600000）"
          },
          "description": {
            "type": "string",
            "description": " 用 5-10 个词清晰、简洁地描述此命令的作用。示例：\\n输入: ls\\n输出: 列出当前目录中的文件\\n\\n输入: git status\\n输出: 显示工作树状态\\n\\n输入: npm install\\n输出: 安装包依赖项\\n\\n输入: mkdir foo\\n输出: 创建目录 'foo'"
          },
          "run_in_background": {
            "type": "boolean",
            "description": "设置为 true 在后台运行此命令。使用 BashOutput 读取稍后的输出。"
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
      "description": "- 适用于任何代码库大小的快速文件模式匹配工具\\n- 支持 \\\"**/*.js\\\" 或 \\\"src/**/*.ts\\\" 等 glob 模式\\n- 按修改时间返回匹配的文件路径\\n- 在需要按名称模式查找文件时使用此工具\\n- 当您进行可能需要多轮 globbing 和 grepping 的开放式搜索时，请改用 Agent 工具\\n- 您可以在单个响应中调用多个工具。最好推测性地执行多个可能有用的搜索。",
      "input_schema": {
        "type": "object",
        "properties": {
          "pattern": {
            "type": "string",
            "description": "要匹配文件的 glob 模式"
          },
          "path": {
            "type": "string",
            "description": "要搜索的目录。如果未指定，将使用当前工作目录。重要：使用默认目录时省略此字段。不要输入 \\\"undefined\\\" 或 \\\"null\\\" - 为默认行为简单省略它。如果提供，必须是有效的目录路径。"
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
      "description": "一个基于 ripgrep 的强大搜索工具\\n\\n  用法：\\n  - 始终将 Grep 用于搜索任务。永远不要将 `grep` 或 `rg` 作为 Bash 命令调用。Grep 工具已针对正确权限和访问进行了优化。\\n  - 支持完整正则表达式语法（例如，\\\"log.*Error\\\", \\\"function\\\\s+\\\\w+\\\"）\\n  - 使用 glob 参数（例如 \\\"*.js\\\", \\\"**/*.tsx\\\"）或 type 参数（例如 \\\"js\\\", \\\"py\\\", \\\"rust\\\"）过滤文件\\n  - 输出模式：\\\"content\\\" 显示匹配行，\\\"files_with_matches\\\" 仅显示文件路径（默认），\\\"count\\\" 显示匹配计数\\n  - 对于需要多轮的开放式搜索，使用 Task 工具\\n  - 模式语法：使用 ripgrep（非 grep） - 字面大括号需要转义（使用 `interface\\\\{\\\\}` 在 Go 代码中查找 `interface{}`）\\n  - 多行匹配：默认情况下，模式仅在单行内匹配。对于跨行模式如 `struct \\\\{[\\\\s\\\\S]*?field`，使用 `multiline: true`\\n",
      "input_schema": {
        "type": "object",
        "properties": {
          "pattern": {
            "type": "string",
            "description": "要在文件内容中搜索的正则表达式模式"
          },
          "path": {
            "type": "string",
            "description": "要搜索的文件或目录（rg PATH）。默认为当前工作目录。"
          },
          "glob": {
            "type": "string",
            "description": "过滤文件的 glob 模式（例如 \\\"*.js\\\", \\\"*.{ts,tsx}\\\"） - 映射到 rg --glob"
          },
          "output_mode": {
            "type": "string",
            "enum": [
              "content",
              "files_with_matches",
              "count"
            ],
            "description": "输出模式：\\\"content\\\" 显示匹配行（支持 -A/-B/-C 上下文，-n 行号，head_limit），\\\"files_with_matches\\\" 显示文件路径（支持 head_limit），\\\"count\\\" 显示匹配计数（支持 head_limit）。默认为 \\\"files_with_matches\\\"。"
          },
          "-B": {
            "type": "number",
            "description": "在每个匹配项之前显示的行数（rg -B）。需要 output_mode: \\\"content\\\"，否则忽略。"
          },
          "-A": {
            "type": "number",
            "description": "在每个匹配项之后显示的行数（rg -A）。需要 output_mode: \\\"content\\\"，否则忽略。"
          },
          "-C": {
            "type": "number",
            "description": "在每个匹配项之前和之后显示的行数（rg -C）。需要 output_mode: \\\"content\\\"，否则忽略。"
          },
          "-n": {
            "type": "boolean",
            "description": "在输出中显示行号（rg -n）。需要 output_mode: \\\"content\\\"，否则忽略。"
          },
          "-i": {
            "type": "boolean",
            "description": "不区分大小写搜索（rg -i）"
          },
          "type": {
            "type": "string",
            "description": "要搜索的文件类型（rg --type）。常见类型：js, py, rust, go, java, 等。对于标准文件类型，这比 include 更高效。"
          },
          "head_limit": {
            "type": "number",
            "description": "将输出限制为前 N 行/条目，相当于 \\\"| head -N\\\"。适用于所有输出模式：content（限制输出行），files_with_matches（限制文件路径），count（限制计数条目）。未指定时，显示 ripgrep 的所有结果。"
          },
          "multiline": {
            "type": "boolean",
            "description": "启用多行模式，其中 . 匹配换行符且模式可以跨行（rg -U --multiline-dotall）。默认值：false。"
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
      "description": "列出给定路径中的文件和目录。path 参数必须是绝对路径，而不是相对路径。您可以选择性地提供要忽略的 glob 模式数组。如果您知道要搜索的目录，通常应优先使用 Glob 和 Grep 工具。",
      "input_schema": {
        "type": "object",
        "properties": {
          "path": {
            "type": "string",
            "description": "要列出的目录的绝对路径（必须是绝对路径，不是相对路径）"
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
      "description": "当您处于计划模式且已完成展示您的计划并准备编码时使用此工具。这将提示用户退出计划模式。 \\n重要：仅当任务需要规划写代码任务的实施步骤时才使用此工具。对于研究任务，在其中您正在收集信息、搜索文件、读取文件或一般尝试理解代码库 - 请勿使用此工具。\\n\\n例如。 \\n1. 初始任务：\\\"搜索并了解代码库中 vim 模式 的实现\\\" - 不要使用退出计划模式工具，因为您没有规划任务的实施步骤。\\n2. 初始任务：\\\"帮我为 vim 实现 yank 模式\\\" - 在完成任务实施步骤的规划后使用退出计划模式工具。\\n",
      "input_schema": {
        "type": "object",
        "properties": {
          "plan": {
            "type": "string",
            "description": "您提出的计划，您想让用户批准。支持 markdown。计划应该相当简洁。"
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
      "description": "从本地文件系统读取文件。您可以直接使用此工具访问任何文件。\\n假设此工具能够读取机器上的所有文件。如果用户提供了文件路径，则假设该路径有效。读取不存在的文件是可以的；将返回错误。\\n\\n用法：\\n- file_path 参数必须是绝对路径，而不是相对路径\\n- 默认情况下，从文件开头读取最多 2000 行\\n- 您可以选择性地指定行偏移量和限制（对于长文件特别有用），但建议不提供这些参数以读取整个文件\\n- 任何超过 2000 个字符的行将被截断\\n- 结果以 cat -n 格式返回，行号从 1 开始\\n- 此工具允许 Claude Code 读取图像（例如 PNG、JPG 等）。读取图像文件时，内容以视觉方式呈现，因为 Claude Code 是多模态 LLM。\\n- 此工具可以读取 PDF 文件（.pdf）。PDF 逐页处理，提取文本和视觉内容进行分析。\\n- 此工具可以读取 Jupyter 笔记本（.ipynb 文件）并返回所有单元格及其输出，结合代码、文本和可视化。\\n- 您可以在单个响应中调用多个工具。最好推测性地读取多个可能有用的文件。 \\n- 您将定期被要求读取屏幕截图。如果用户提供了屏幕截图路径，始终使用此工具查看路径处的文件。此工具适用于 /var/folders/123/abc/T/TemporaryItems/NSIRD_screencaptureui_ZfB1tD/Screenshot.png 等所有临时文件路径\\n- 如果您读取存在但内容为空的文件，将收到系统提醒警告以代替文件内容。",
      "input_schema": {
        "type": "object",
        "properties": {
          "file_path": {
            "type": "string",
            "description": "要读取的文件的绝对路径"
          },
          "offset": {
            "type": "number",
            "description": "开始读取的行号。仅在文件太大而无法一次读取时提供"
          },
          "limit": {
            "type": "number",
            "description": "要读取的行数。仅在文件太大而无法一次读取时提供。"
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
      "description": "在文件中执行精确字符串替换。 \\n\\n用法：\\n- 在编辑之前，您必须在对话中至少使用一次 `Read` 工具。如果没有读取文件就尝试编辑，此工具将出错。 \\n- 编辑 Read 工具输出的文本时，确保保留与行号前缀后出现的完全相同的缩进（制表符/空格）。行号前缀格式为：空格 + 行号 + 制表符。该制表符后的所有内容是要匹配的实际文件内容。切勿在 old_string 或 new_string 中包含行号前缀的任何部分。\\n- 始终优先编辑代码库中的现有文件。除非明确要求，否则永远不要编写新文件。\\n- 除非用户明确要求，否则仅使用表情符号。除非被要求，否则避免在文件中添加表情符号。\\n- 如果 `old_string` 在文件中不唯一，编辑将失败。要么提供具有更多上下文的较大字符串以使其唯一，要么使用 `replace_all` 更改 `old_string` 的每个实例。 \\n- 使用 `replace_all` 替换和重命名文件中的字符串。如果要重命名变量，则此参数很有用。",
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
            "description": "替换它的文本（必须与 old_string 不同）"
          },
          "replace_all": {
            "type": "boolean",
            "default": false,
            "description": "替换 old_string 的所有出现（默认值为 false）"
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
      "description": "这是一个用于在单个操作中对单个文件进行多次编辑的工具。它建立在 Edit 工具之上，允许您高效地执行多次查找和替换操作。当您需要对同一文件进行多次编辑时，优先使用此工具而不是 Edit 工具。\\n\\n使用此工具之前：\\n\\n1. 使用 Read 工具了解文件内容和上下文\\n2. 验证目录路径是否正确\\n\\n要进行多次文件编辑，请提供以下内容：\\n1. file_path: 要修改的文件的绝对路径（必须是绝对路径，不是相对路径）\\n2. edits: 要执行的编辑操作数组，其中每个编辑包含：\\n   - old_string: 要替换的文本（必须与文件内容完全匹配，包括所有空格和缩进）\\n   - new_string: 要替换 old_string 的编辑文本\\n   - replace_all: 替换 old_string 的所有出现。此参数是可选的，默认为 false。\\n\\n重要：\\n- 所有编辑按顺序应用，按它们提供的顺序\\n- 每个编辑在前一个编辑的结果上操作\\n- 所有编辑必须有效才能操作成功 - 如果任何编辑失败，则不会应用任何编辑\\n- 当您需要对同一文件的不同部分进行多次更改时，此工具很理想\\n- 对于 Jupyter 笔记本（.ipynb 文件），使用 NotebookEdit\\n\\n关键要求：\\n1. 所有编辑遵循单个 Edit 工具的相同要求\\n2. 编辑是原子的 - 要么全部成功，要么都不应用\\n3. 仔细计划您的编辑，以避免连续操作之间的冲突\\n\\n警告：\\n- 如果 edits.old_string 与文件内容不完全匹配（包括空格），工具将失败\\n- 如果 edits.old_string 和 edits.new_string 相同，工具将失败\\n- 由于编辑按顺序应用，确保较早的编辑不影响稍后编辑试图查找的文本\\n\\n进行编辑时：\\n- 确保所有编辑结果为惯用的、正确的代码\\n- 不要将文件置于损坏状态...",
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
                  "description": "替换它的文本"
                },
                "replace_all": {
                  "type": "boolean",
                  "default": false,
                  "description": "替换 old_string 的所有出现（默认值为 false）。"
                }
              },
              "required": [
                "old_string",
                "new_string"
              ],
              "additionalProperties": false
            },
            "minItems": 1,
            "description": "在文件上依次执行的编辑操作数组"
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
      "description": "将文件写入本地文件系统。\\n\\n用法：\\n- 如果提供的路径存在现有文件，此工具将覆盖该文件。\\n- 如果这是现有文件，您必须先使用 Read 工具读取文件内容。如果您未先读取文件，此工具将失败。\\n- 始终优先编辑代码库中的现有文件。除非明确要求，否则永远不要编写新文件。\\n- 永远不要主动创建文档文件（*.md）或自述文件。仅在用户明确要求时创建文档文件。\\n- 除非用户明确要求，否则仅使用表情符号。除非被要求，否则避免在文件中写入表情符号。",
      "input_schema": {
        "type": "object",
        "properties": {
          "file_path": {
            "type": "string",
            "description": "要写入的文件的绝对路径（必须是绝对路径，不是相对路径）"
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
      "description": "完全用新源替换 Jupyter 笔记本（.ipynb 文件）中特定单元格的内容。Jupyter 笔记本是结合代码、文本和可视化的交互式文档，通常用于数据分析和科学计算。notebook_path 参数必须是绝对路径，而不是相对路径。cell_number 是从 0 开始索引的。使用 edit_mode=insert 在 cell_number 指定的索引处添加新单元格。使用 edit_mode=delete 删除 cell_number 指定的索引处的单元格。",
      "input_schema": {
        "type": "object",
        "properties": {
          "notebook_path": {
            "type": "string",
            "description": "要编辑的 Jupyter 笔记本文件的绝对路径（必须是绝对路径，不是相对路径）"
          },
          "cell_id": {
            "type": "string",
            "description": "要编辑的单元格的 ID。插入新单元格时，新单元格将插入到具有此 ID 的单元格之后，或者如果没有指定 ID 则插入到开头。"
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
            "description": "单元格的类型（代码或 markdown）。如果没有指定，它将默认为当前单元格类型。如果使用 edit_mode=insert，则需要此参数。"
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
      "description": "\\n- 从指定 URL 获取内容并使用 AI 模型处理\\n- 以 URL 和提示作为输入\\n- 获取 URL 内容，将 HTML 转换为 markdown\\n- 使用小型快速模型处理提示内容\\n- 返回模型对内容的响应\\n- 在需要检索和分析网页内容时使用此工具\\n\\n使用说明：\\n  - 重要：如果有 MCP 提供的网络获取工具可用，请优先使用该工具而不是此工具，因为它可能限制更少。所有 MCP 提供的工具都以 \\\"mcp__\\\" 开头。\\n  - URL 必须是完全形成的有效 URL\\n  - HTTP URL 将自动升级为 HTTPS\\n  - 提示应描述您想从页面提取的信息\\n  - 此工具只读，不会修改任何文件\\n  - 内容很大时结果可能会摘要\\n  - 包含自清理 15 分钟缓存，以便在重复访问同一 URL 时更快响应\\n  - 当 URL 重定向到不同主机时，工具将通知您并以特殊格式提供重定向 URL。然后您应使用重定向 URL 进行新的 WebFetch 请求以获取内容。\\n",
      "input_schema": {
        "type": "object",
        "properties": {
          "url": {
            "type": "string",
            "format": "uri",
            "description": "要获取内容的 URL"
          },
          "prompt": {
            "type": "string",
            "description": "在获取内容上运行的提示"
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
      "description": "使用此工具为当前编码会话创建和管理结构化任务列表。这有助于您跟踪进度，组织复杂任务，并向用户展示您的彻底性。\\n它还有助于用户了解任务进度和他们请求的整体进度。\\n\\n## 何时使用此工具\\n在这些情况下主动使用此工具：\\n\\n1. 复杂多步骤任务 - 当任务需要 3 个或更多不同步骤或操作时\\n2. 非简单的复杂任务 - 需要仔细规划或多次操作的任务\\n3. 用户明确请求待办事项列表 - 当用户直接要求您使用待办事项列表时\\n4. 用户提供多个任务 - 当用户提供要完成的事项列表时（编号或逗号分隔）\\n5. 收到新指令后 - 立即将用户需求捕获为待办事项\\n6. 开始处理任务时 - 在开始工作前将其标记为 in_progress。理想情况下，一次应只有一个待办事项为 in_progress\\n7. 完成任务后 - 将其标记为已完成，并添加在实施过程中发现的任何新后续任务\\n\\n## 何时不使用此工具\\n\\n在以下情况下跳过使用此工具：\\n1. 只有一个简单直接的任务\\n2. 任务微不足道，跟踪它不会带来组织效益\\n3. 任务可以在少于 3 个微不足道的步骤中完成\\n4. 任务纯粹是对话或信息性的\\n\\n请注意，如果只有一个微不足道的任务要做，则最好直接执行该任务。\\n\\n## 何时使用待办事项列表的示例\\n\\n<example>\\n用户：我想在应用程序设置中添加暗模式切换。确保完成后运行测试和构建！\\n助手：我将帮助您在应用程序设置中添加暗模式切换。让我创建一个待办事项列表来跟踪此实现。\\n*创建包含以下项目的待办事项列表：*\\n1. 在设置页面创建暗模式切换组件\\n2. 添加暗...",
      "input_schema": {
        "type": "object",
        "properties": {
          "todos": {
            "type": "array",
            "items": {
              "type": "object",
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
            "description": "更新的待办事项列表"
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
      "description": "\\n- 允许 Claude 搜索网络并使用结果来告知响应\\n- 为当前事件和最新数据提供最新信息\\n- 以搜索结果块格式返回搜索结果信息\\n- 使用此工具访问超出 Claude 知识截止点的信息\\n- 搜索在单个 API 调用内自动执行\\n\\n使用说明：\\n  - 支持域过滤以包含或阻止特定网站\\n  - Web 搜索仅在美国可用\\n  - 考虑 <env> 中的\\\"今天日期\\\"。例如，如果 <env> 显示\\\"今天日期：2025-07-01\\\"，且用户想要最新文档，请不要在搜索查询中使用 2024。使用 2025。\\n",
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
            "description": "仅包含这些域的搜索结果"
          },
          "blocked_domains": {
            "type": "array",
            "items": {
              "type": "string"
            },
            "description": "永不包含这些域的搜索结果"
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
      "description": "\\n- 检索正在运行或已完成的后台 bash shell 的输出\\n- 采用标识 shell 的 shell_id 参数\\n- 始终仅返回自上次检查以来的新输出\\n- 返回 stdout 和 stderr 输出以及 shell 状态\\n- 支持可选的正则表达式过滤以仅显示匹配模式的行\\n- 在需要监视或检查长时间运行的 shell 输出时使用此工具\\n- Shell ID 可以使用 /bashes 命令找到\\n",
      "input_schema": {
        "type": "object",
        "properties": {
          "bash_id": {
            "type": "string",
            "description": "要检索输出的后台 shell 的 ID"
          },
          "filter": {
            "type": "string",
            "description": "可选正则表达式，用于过滤输出行。仅包含匹配此正则表达式的行。任何不匹配的行将不再可读。"
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
      "description": "\\n- 通过其 ID 终止正在运行的后台 bash shell\\n- 采用标识要终止的 shell 的 shell_id 参数\\n- 返回成功或失败状态 \\n- 在需要终止长时间运行的 shell 时使用此工具\\n- Shell ID 可以使用 /bashes 命令找到\\n",
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