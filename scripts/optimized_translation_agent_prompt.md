# 优化的翻译代理任务：文档翻译方案

## 1. 目标

您的主要任务是建立一个更高效的翻译流程，通过创建带有 `_zh` 后缀的临时文档来翻译原始文档，并逐步生成高质量的中文翻译内容，最终这些 `_zh` 文件将替换原始文件。

## 2. 核心原则

- **保留源文件**：永远不要修改原始文档，只在临时的 `_zh` 文件中生成翻译内容。
- **创建临时文件**：为每个需要翻译的文档创建一个带有 `_zh` 后缀的临时文档（例如，`prompt.md` → `prompt_zh.md`），这些临时文件最终会替换原始文件。
- **不要翻译代码**：永远不要翻译变量名、函数名、代码片段、文件路径或任何其他技术标识符。
- **保持格式**：保持原始 Markdown 格式，包括标题、列表、代码块和链接。
- **上下文准确性**：确保翻译在 AI、提示和软件开发的技术上下文中是准确的。

## 3. 新的工作流程

### 步骤 1：临时文件创建
- 对于每个需要翻译的 `.md` 文件，在同一目录下创建对应的新文件，文件名添加 `_zh` 后缀
- 例如：`prompt.md` → `prompt_zh.md`
- 这些 `_zh` 文件是临时的，最终将替换原始文件

### 步骤 2：内容翻译
- 逐步翻译原始文档内容到新创建的 `_zh` 文件中
- 严格遵守以下规则：

### 步骤 3：质量检查
- 确保翻译内容完整、准确
- 验证格式是否正确保留
- 检查代码块和技术术语是否未被翻译

## 4. 文件特定翻译说明

根据文件名应用以下规则：

### `index.md` 文件规则
- **创建新的 `index_zh.md` 临时文件**
- **摘要**：阅读同一目录中的所有其他 `.md` 文件（例如，`prompt.md`，`tools.md`）。
- **生成中文摘要**：写一个简洁的中文摘要作为文件夹的指南。它应该介绍 AI 工具并简要描述其他文件的内容（例如，“此目录包含 Claude Code 的系统提示词和工具定义。`claude-code-system-prompt.md` 文件定义了其核心行为，而 `claude-code-tools.md` 文件则详细说明了它可用的工具。”）。
- **更新链接**：确保 `index_zh.md` 文件中的链接指向目录中的其他原始文件名（如 `./prompt.md` 而不是 `./prompt_zh.md`），因为 `_zh` 文件是临时的，最终会替换原始文件。

### `prompt.md`（或类似的提示文件）规则
- **创建新的 `prompt_zh.md` 临时文件**
- **全文翻译**：将所有描述性英文文本翻译成中文。
- **保持完整性**：不要翻译类 XML 标签（例如，`<example>`，`<THOUGHT>`）、占位符或提示中的示例代码。

### `tool.md`（或类似的工具定义文件）规则
- **创建新的 `tool_zh.md` 临时文件**
- 这是一个多步骤过程：

1. **汇总工具**：在文件顶部添加一个新部分。用中文写一个简短的摘要，列出文件中定义的所有工具及其主要功能。这可以作为快速参考。
2. **仅翻译描述**：在文件正文中，找到每个工具定义。仅翻译每个工具的 `description` 字段的值。
3. **不要翻译**：将工具定义的所有其他部分（如工具名称、参数名称（`<parameter>`）和示例用法块）保留为原始英文。

## 5. `tool.md` 文件示例工作流程

**原始 `example-tools.md`：**

```markdown
## example-tools.txt

```text
# Tool Use Formatting

<tool_name>
  <parameter1_name>value1</parameter1_name>
</tool_name>

## read_file
Description: Request to read the contents of a file at the specified path. Use this when you need to examine the contents of an existing file.

Parameters:
- path: (required) The path of the file to read.
```
```

**新创建的 `example-tools_zh.md`（临时文件）：**

```markdown
## example-tools_zh.txt

本文档定义了以下工具：
- `read_file`: 用于请求读取指定路径文件的内容。

```text
# Tool Use Formatting

<tool_name>
  <parameter1_name>value1</parameter1_name>
</tool_name>

## read_file
Description: 请求读取指定路径文件的内容。当您需要检查现有文件的内容时使用此工具。

Parameters:
- path: (required) The path of the file to read.
```
```

## 6. 重要说明

- **临时性质**：所有带 `_zh` 后缀的文件都是临时翻译文件，最终将替换相应的原始文件
- **链接更新**：在 `index_zh.md` 等索引文件中，链接应该指向原始文件名（不带 `_zh` 后缀），因为这些 `_zh` 文件是临时的
- **最终替换**：翻译完成后，`_zh` 文件将重命名为原始文件名，替换原始内容

## 7. 优势

1. **非破坏性**：保持原始文档不变，降低出错风险
2. **并行工作**：可以同时处理原始文档和翻译文档
3. **易于比较**：原文件和翻译文件并存，便于对比和验证
4. **逐步翻译**：可以分段进行翻译，避免一次性处理大量内容