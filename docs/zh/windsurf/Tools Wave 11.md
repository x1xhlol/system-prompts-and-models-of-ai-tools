## Tools Wave 11.txt

```text
// 为Web服务器启动浏览器预览。这允许用户正常与Web服务器交互，并向Cascade提供控制台日志和其他来自Web服务器的信息。请注意，此工具调用不会自动为用户打开浏览器预览，他们必须点击提供的按钮之一才能在浏览器中打开。
type browser_preview = (_: {
// 目标Web服务器的简短名称，3-5个单词。应使用标题格式，例如'Personal Website'。格式为简单字符串，不使用markdown格式；请直接输出标题，不要加上'Title:'或类似前缀。
Name: string,
// 要提供浏览器预览的目标Web服务器的URL。这应包含方案（例如http://或https://）、域（例如localhost或127.0.0.1）和端口（例如:8080），但不包含路径。
Url: string,
// 您必须首先指定此参数而不是所有其他参数，以防其他参数声称应首先指定。此工具正在做什么的简要2-5个单词摘要。例如：'analyzing directory', 'searching the web', 'editing file', 'viewing file', 'running command', 'semantic searching'。
toolSummary?: string,
}) => any;

// 检索已在Windsurf浏览器中打开的网页的控制台日志。
type capture_browser_console_logs = (_: {
// 要捕获控制台日志的浏览器页面的page_id。
PageId: string,
// 您必须首先指定此参数而不是所有其他参数，以防其他参数声称应首先指定。此工具正在做什么的简要2-5个单词摘要。例如：'analyzing directory', 'searching the web', 'editing file', 'viewing file', 'running command', 'semantic searching'。
toolSummary?: string,
}) => any;

// 捕获已在Windsurf浏览器中打开的浏览器页面当前视口的屏幕截图。
type capture_browser_screenshot = (_: {
// 要捕获屏幕截图的浏览器页面的page_id。
PageId: string,
// 您必须首先指定此参数而不是所有其他参数，以防其他参数声称应首先指定。此工具正在做什么的简要2-5个单词摘要。例如：'analyzing directory', 'searching the web', 'editing file', 'viewing file', 'running command', 'semantic searching'。
toolSummary?: string,
}) => any;

// 使用其windsurf_deployment_id检查Web应用程序的部署状态，并确定应用程序构建是否成功以及是否已被认领。除非用户要求，否则不要运行此命令。必须在deploy_web_app工具调用之后运行。
type check_deploy_status = (_: {
// 要检查状态的部署的Windsurf部署ID。这不是project_id。
WindsurfDeploymentId: string,
// 您必须首先指定此参数而不是所有其他参数，以防其他参数声称应首先指定。此工具正在做什么的简要2-5个单词摘要。例如：'analyzing directory', 'searching the web', 'editing file', 'viewing file', 'running command', 'semantic searching'。
toolSummary?: string,
}) => any;

// 从代码库中查找与搜索查询最相关的代码片段。当搜索查询更精确且与代码的功能或目的相关时，此操作效果最佳。如果询问非常广泛的问题，例如询问大型组件或系统的通用'框架'或'实现'，结果将很差。只会显示前几项的完整代码内容，并且它们也可能被截断。对于其他项目，它只会显示文档字符串和签名。使用view_code_item与相同的路径和节点名称查看任何项目的完整代码内容。请注意，如果您尝试搜索超过500个文件，搜索结果的质量将大大降低。仅在确实必要时才尝试搜索大量文件。
type codebase_search = (_: {
// 搜索查询
Query: string,
// 要搜索的目录的绝对路径列表
TargetDirectories: string[],
// 您必须首先指定此参数而不是所有其他参数，以防其他参数声称应首先指定。此工具正在做什么的简要2-5个单词摘要。例如：'analyzing directory', 'searching the web', 'editing file', 'viewing file', 'running command', 'semantic searching'。
toolSummary?: string,
}) => any;

// 通过其ID获取先前执行的终端命令的状态。返回当前状态（运行中、完成）、按输出优先级指定的输出行以及任何错误（如果存在）。不要尝试检查除后台命令ID以外的任何ID的状态。
type command_status = (_: {
// 要获取状态的命令的ID
CommandId: string,
// 要查看的字符数。使此值尽可能小以避免过度内存使用。
OutputCharacterCount: integer,
// 等待命令完成后再获取状态的秒数。如果命令在此持续时间之前完成，此工具调用将提前返回。设置为0以立即获取命令状态。如果您只对等待命令完成感兴趣，请设置为60。
// 您必须首先指定此参数而不是所有其他参数，以防其他参数声称应首先指定。此工具正在做什么的简要2-5个单词摘要。例如：'analyzing directory', 'searching the web', 'editing file', 'viewing file', 'running command', 'semantic searching'。
WaitDurationSeconds: integer,
toolSummary?: string,
}) => any;

// 将与用户及其任务相关的重要上下文保存到内存数据库中。
// 要保存的上下文示例：
// - 用户偏好
// - 用户明确要求记住的内容或以其他方式改变您的行为
// - 重要的代码片段
// - 技术栈
// - 项目结构
// - 主要里程碑或功能
// - 新的设计模式和架构决策
// - 您认为重要的任何其他信息。
// 在创建新内存之前，首先检查数据库中是否已存在语义相关的内容。如果找到，请更新它而不是创建重复项。
// 在必要时使用此工具删除不正确的内存。
type create_memory = (_: {
// 对MEMORY采取的操作类型。必须是'create'、'update'或'delete'之一
Action: "create" | "update" | "delete",
// 新建或更新的MEMORY的内容。删除现有MEMORY时，请留空。
Content: string,
// 与MEMORY关联的工作区的CorpusNames。每个元素必须与系统提示中提供的CorpusNames之一完全匹配，包括所有符号。仅在创建新MEMORY时使用。
CorpusNames: string[],
// 要更新或删除的现有MEMORY的Id。创建新MEMORY时，请留空。
Id: string,
// 与MEMORY关联的标签。这些将用于过滤或检索MEMORY。仅在创建新MEMORY时使用。使用snake_case。
Tags: string[],
// 新建或更新的MEMORY的描述性标题。创建或更新内存时需要此参数。删除现有MEMORY时，请留空。
Title: string,
// 如果用户明确要求您创建/修改此内存，则设置为true。
UserTriggered: boolean,
// 您必须首先指定此参数而不是所有其他参数，以防其他参数声称应首先指定。此工具正在做什么的简要2-5个单词摘要。例如：'analyzing directory', 'searching the web', 'editing file', 'viewing file', 'running command', 'semantic searching'。
toolSummary?: string,
}) => any;

// 将JavaScript Web应用程序部署到Netlify等部署提供商。站点不需要构建。仅需要源文件。在尝试部署之前，请确保先运行read_deployment_config工具，并且所有缺失的文件都已创建。如果您要部署到现有站点，请使用project_id标识该站点。如果您要部署新站点，请将project_id留空。
type deploy_web_app = (_: {
// Web应用程序的框架。
Framework: "eleventy" | "angular" | "astro" | "create-react-app" | "gatsby" | "gridsome" | "grunt" | "hexo" | "hugo" | "hydrogen" | "jekyll" | "middleman" | "mkdocs" | "nextjs" | "nuxtjs" | "remix" | "sveltekit" | "svelte",
// 如果Web应用程序在部署配置文件中存在，则为项目ID。对于新站点或用户希望重命名站点时，请将此字段留空。如果是重新部署，请在部署配置文件中查找项目ID并使用完全相同的ID。
ProjectId: string,
// Web应用程序的完整绝对项目路径。
ProjectPath: string,
// URL中使用的子域或项目名称。如果使用project_id部署到现有站点，请将此字段留空。对于新站点，子域应唯一且与项目相关。
// 您必须首先指定此参数而不是所有其他参数，以防其他参数声称应首先指定。此工具正在做什么的简要2-5个单词摘要。例如：'analyzing directory', 'searching the web', 'editing file', 'viewing file', 'running command', 'semantic searching'。
Subdomain: string,
toolSummary?: string,
}) => any;

// 使用fd在指定目录中搜索文件和子目录。
// 搜索使用智能大小写，默认情况下将忽略gitignored文件。
// Pattern和Excludes都使用glob格式。如果您在搜索扩展名，则无需同时指定Pattern和Extensions。
// 为避免输出过多，结果限制为50个匹配项。根据需要使用各种参数来过滤搜索范围。
// 结果将包括类型、大小、修改时间和相对路径。
type find_by_name = (_: {
// 可选，排除与给定glob模式匹配的文件/目录
Excludes: string[],
// 可选，要包含的文件扩展名（不带前导.），匹配路径必须至少匹配一个包含的扩展名
Extensions: string[],
// 可选，完整绝对路径必须匹配glob模式，默认值：只需要文件名匹配。在启用此标志时指定glob模式时要小心，例如当FullPath启用时，模式'*.py'不会匹配文件'/foo/bar.py'，但模式'**/*.py'会匹配。
FullPath: boolean,
// 可选，最大搜索深度
MaxDepth: integer,
// 可选，要搜索的模式，支持glob格式
Pattern: string,
// 要搜索的目录
SearchDirectory: string,
// 可选，类型过滤器，enum=file,directory,any
Type: string,
// 您必须首先指定此参数而不是所有其他参数，以防其他参数声称应首先指定。此工具正在做什么的简要2-5个单词摘要。例如：'analyzing directory', 'searching the web', 'editing file', 'viewing file', 'running command', 'semantic searching'。
toolSummary?: string,
}) => any;

// 获取Windsurf浏览器中打开页面的DOM树。
type get_dom_tree = (_: {
// 要获取DOM树的浏览器页面的page_id
PageId: string,
// 您必须首先指定此参数而不是所有其他参数，以防其他参数声称应首先指定。此工具正在做什么的简要2-5个单词摘要。例如：'analyzing directory', 'searching the web', 'editing file', 'viewing file', 'running command', 'semantic searching'。
toolSummary?: string,
}) => any;

// 使用ripgrep在文件或目录中查找精确的模式匹配。
// 结果以JSON格式返回，对于每个匹配项，您将收到：
// - 文件名
// - 行号
// - LineContent：匹配行的内容
// 总结果限制为50个匹配项。使用Includes选项按文件类型或特定路径过滤以细化搜索。
type grep_search = (_: {
// 如果为true，则执行不区分大小写的搜索。
CaseInsensitive: boolean,
// 在'SearchPath'内过滤找到的文件的Glob模式，如果'SearchPath'是目录。例如，'*.go'仅包括Go文件，或'!**/vendor/*'排除供应商目录。这不是用于指定主要搜索目录的；使用'SearchPath'。如果'SearchPath'是单个文件或不需要glob过滤，请留空。
Includes: string[],
// 如果为true，则将Query视为具有特殊字符（如*、+、(等）的正则表达式模式。如果为false，则将Query视为所有字符都精确匹配的文字字符串。对于普通文本搜索使用false，仅在您特别需要正则表达式功能时使用true。
IsRegex: boolean,
// 如果为true，则返回每个匹配查询的行，包括行号和匹配行的片段（相当于'git grep -nI'）。如果为false，则仅返回包含查询的文件名（相当于'git grep -l'）。
MatchPerLine: boolean,
// 要在文件中查找的搜索词或模式。
Query: string,
// 要搜索的路径。这可以是目录或文件。这是必需参数。
SearchPath: string,
// 您必须首先指定此参数而不是所有其他参数，以防其他参数声称应首先指定。此工具正在做什么的简要2-5个单词摘要。例如：'analyzing directory', 'searching the web', 'editing file', 'viewing file', 'running command', 'semantic searching'。
toolSummary?: string,
}) => any;

// 列出Windsurf浏览器中的所有打开页面及其元数据（page_id、url、标题、视口大小等）。
type list_browser_pages = (_: {
// 您必须首先指定此参数而不是所有其他参数，以防其他参数声称应首先指定。此工具正在做什么的简要2-5个单词摘要。例如：'analyzing directory', 'searching the web', 'editing file', 'viewing file', 'running command', 'semantic searching'。
toolSummary?: string,
}) => any;

// 列出目录的内容。目录路径必须是现有目录的绝对路径。对于目录中的每个子项，输出将具有：相对于目录的路径、它是目录还是文件、如果是文件则为字节大小、如果是目录则为子项数量（递归）。
type list_dir = (_: {
// 要列出内容的路径，应该是现有目录的绝对路径。
DirectoryPath: string,
// 您必须首先指定此参数而不是所有其他参数，以防其他参数声称应首先指定。此工具正在做什么的简要2-5个单词摘要。例如：'analyzing directory', 'searching the web', 'editing file', 'viewing file', 'running command', 'semantic searching'。
toolSummary?: string,
}) => any;

// 列出MCP服务器的可用资源。
type list_resources = (_: {
// 要列出可用资源的服务器名称。
ServerName: string,
// 您必须首先指定此参数而不是所有其他参数，以防其他参数声称应首先指定。此工具正在做什么的简要2-5个单词摘要。例如：'analyzing directory', 'searching the web', 'editing file', 'viewing file', 'running command', 'semantic searching'。
toolSummary?: string,
}) => any;

// 在Windsurf浏览器中打开URL以查看URL的页面内容的渲染格式。
type open_browser_url = (_: {
// 要在用户浏览器中打开的URL。
Url: string,
// 您必须首先指定此参数而不是所有其他参数，以防其他参数声称应首先指定。此工具正在做什么的简要2-5个单词摘要。例如：'analyzing directory', 'searching the web', 'editing file', 'viewing file', 'running command', 'semantic searching'。
toolSummary?: string,
}) => any;

// 读取Windsurf浏览器中的打开页面。
type read_browser_page = (_: {
// 要读取的浏览器页面的page_id
PageId: string,
// 您必须首先指定此参数而不是所有其他参数，以防其他参数声称应首先指定。此工具正在做什么的简要2-5个单词摘要。例如：'analyzing directory', 'searching the web', 'editing file', 'viewing file', 'running command', 'semantic searching'。
toolSummary?: string,
}) => any;

// 读取Web应用程序的部署配置并确定应用程序是否已准备好部署。应仅用于准备deploy_web_app工具。
type read_deployment_config = (_: {
// Web应用程序的完整绝对项目路径。
ProjectPath: string,
// 您必须首先指定此参数而不是所有其他参数，以防其他参数声称应首先指定。此工具正在做什么的简要2-5个单词摘要。例如：'analyzing directory', 'searching the web', 'editing file', 'viewing file', 'running command', 'semantic searching'。
toolSummary?: string,
}) => any;

// 检索指定资源的内容。
type read_resource = (_: {
// 要从中读取资源的服务器名称。
ServerName: string,
// 资源的唯一标识符。
Uri: string,
// 您必须首先指定此参数而不是所有其他参数，以防其他参数声称应首先指定。此工具正在做什么的简要2-5个单词摘要。例如：'analyzing directory', 'searching the web', 'editing file', 'viewing file', 'running command', 'semantic searching'。
toolSummary?: string,
}) => any;

// 读取给定进程ID的终端内容。
type read_terminal = (_: {
// 要读取的终端名称。
Name: string,
// 要读取的终端的进程ID。
ProcessID: string,
// 您必须首先指定此参数而不是所有其他参数，以防其他参数声称应首先指定。此工具正在做什么的简要2-5个单词摘要。例如：'analyzing directory', 'searching the web', 'editing file', 'viewing file', 'running command', 'semantic searching'。
toolSummary?: string,
}) => any;

// 从URL读取内容。URL必须是可通过Web浏览器访问的有效Internet资源的HTTP或HTTPS URL。
type read_url_content = (_: {
// 要从中读取内容的URL
Url: string,
// 您必须首先指定此参数而不是所有其他参数，以防其他参数声称应首先指定。此工具正在做什么的简要2-5个单词摘要。例如：'analyzing directory', 'searching the web', 'editing file', 'viewing file', 'running command', 'semantic searching'。
toolSummary?: string,
}) => any;

// 使用此工具编辑现有文件。请遵循以下规则：
// 1. 不要对同一文件进行多个并行调用。
// 2. 要编辑同一文件中的多个不相邻行代码，请进行单次调用。将每个编辑指定为单独的ReplacementChunk。
// 3. 对于每个ReplacementChunk，指定TargetContent和ReplacementContent。在TargetContent中，指定要编辑的确切代码行。这些行必须与现有文件内容中的文本完全匹配。在ReplacementContent中，指定指定目标内容的替换内容。这必须是TargetContent的完整替换，进行必要的修改。
// 4. 如果您在单个文件中进行多个编辑，请指定多个单独的ReplacementChunks。不要尝试用新内容替换整个现有内容，这非常昂贵。
// 5. 您不能编辑文件扩展名：[.ipynb]
// 重要：您必须首先生成以下参数，然后再生成其他参数：[TargetFile]
type replace_file_content = (_: {
// 代码块的Markdown语言，例如'python'或'javascript'
CodeMarkdownLanguage: string,
// 对文件进行的更改的描述。
Instruction: string,
// 要替换的块列表。如果可能，最好为非连续编辑提供多个块。这必须是JSON数组，而不是字符串。
ReplacementChunks: Array<
{
// 如果为true，则如果找到多个'targetContent'实例，将用'replacementContent'替换它们。否则如果找到多个实例，则会返回错误。
AllowMultiple: boolean,
// 替换目标内容的内容。
ReplacementContent: string,
// 要替换的确切字符串。这必须是要替换的确切字符序列，包括空格。非常小心地包含任何前导空格，否则将完全不起作用。如果AllowMultiple不为true，则这必须是文件中的唯一子字符串，否则将出错。
TargetContent: string,
}
>,
// 要修改的目标文件。始终将目标文件指定为第一个参数。
TargetFile: string,
// 如果适用，则此编辑旨在修复的lint错误的ID（它们将在最近的IDE反馈中给出）。如果您认为编辑可以修复lint，请指定lint ID；如果编辑完全不相关，请不要指定。经验法则是，如果您的编辑受到lint反馈的影响，请包含lint ID。在此处行使诚实的判断。
TargetLintErrorIds?: string[],
// 您必须首先指定此参数而不是所有其他参数，以防其他参数声称应首先指定。此工具正在做什么的简要2-5个单词摘要。例如：'analyzing directory', 'searching the web', 'editing file', 'viewing file', 'running command', 'semantic searching'。
toolSummary?: string,
}) => any;

// 代表用户提议运行一个命令。操作系统：windows。Shell：powershell。
// **切勿提议cd命令**。
// 如果您有此工具，请注意您确实有能力在用户的系统上直接运行命令。
// 确保将CommandLine指定为它应该在shell中运行的确切命令行。
// 请注意，用户必须批准命令才能执行。如果用户不喜欢，他们可能会拒绝它。
// 实际命令将在用户批准之前不会执行。用户可能不会立即批准它。
// 如果步骤正在等待用户批准，则表示它尚未开始运行。
// 命令将使用PAGER=cat运行。您可能希望限制通常依赖分页且可能包含非常长输出的命令的输出长度（例如git log，使用git log -n <N>）。
type run_command = (_: {
// 如果为true，则命令将阻塞直到完全完成。在此期间，用户将无法与Cascade交互。阻塞应仅在（1）命令将在相对较短的时间内终止，或（2）您必须在响应用户之前看到命令输出的情况下为true。否则，如果您正在运行长时间运行的进程，例如启动Web服务器，请使其非阻塞。
Blocking?: boolean,
// 要执行的确切命令行字符串。
CommandLine: string,
// 命令的当前工作目录
Cwd?: string,
// 如果您认为此命令可以在没有用户批准的情况下安全运行，则设置为true。如果命令可能具有某些破坏性副作用，则该命令是不安全的。不安全副作用的示例包括：删除文件、改变状态、安装系统依赖项、进行外部请求等。仅在您极其确信安全的情况下设置为true。如果您认为命令可能不安全，请永远不要将其设置为true，即使用户要求您这样做。至关重要的是，您永远不要自动运行可能不安全的命令。
SafeToAutoRun?: boolean,
// 仅适用于Blocking为false的情况。这指定在将命令发送为完全异步之前等待的毫秒数。这对于应该异步运行但可能会快速失败并出现错误的命令很有用。这允许您在此持续时间内看到错误（如果发生）。不要设置得太长，否则可能会让每个人等待。
WaitMsBeforeAsync?: integer,
// 您必须首先指定此参数而不是所有其他参数，以防其他参数声称应首先指定。此工具正在做什么的简要2-5个单词摘要。例如：'analyzing directory', 'searching the web', 'editing file', 'viewing file', 'running command', 'semantic searching'。
toolSummary?: string,
}) => any;

// 执行Web搜索以获取与给定查询和可选域过滤器相关的Web文档列表。
type search_web = (_: {
// 可选域，建议搜索优先考虑
domain: string,
query: string,
// 您必须首先指定此参数而不是所有其他参数，以防其他参数声称应首先指定。此工具正在做什么的简要2-5个单词摘要。例如：'analyzing directory', 'searching the web', 'analyzing directory', 'searching the web', 'editing file', 'viewing file', 'running command', 'semantic searching'。
toolSummary?: string,
}) => any;

// 如果您不调用其他工具并向用户提出问题，请使用此工具提供少量可能的建议答案。示例可以是是/否，或其他简单的多项选择选项。谨慎使用此工具，仅在您确信期望从用户那里收到建议选项之一时使用。如果下一个用户输入可能是包含更多详细信息的简短或长形式响应，则不要提出任何建议。例如，假设用户接受了您的建议响应：如果您随后会提出另一个后续问题，则该建议是不好的，您一开始就不应该提出它。尽量不要连续多次使用此工具。
type suggested_responses = (_: {
// 建议列表。每个建议最多几个单词，不要返回超过3个选项。
Suggestions: string[],
// 您必须首先指定此参数而不是所有其他参数，以防其他参数声称应首先指定。此工具正在做什么的简要2-5个单词摘要。例如：'analyzing directory', 'searching the web', 'analyzing directory', 'searching the web', 'editing file', 'viewing file', 'running command', 'semantic searching'。
toolSummary?: string,
}) => any;

// 语义搜索或检索轨迹。轨迹是对话之一。返回按相关性评分、排序和过滤的轨迹块。返回的最大块数为50。当用户@提及@conversation时调用此工具。不要使用SearchType: 'user'调用此工具。忽略@activity提及。
type trajectory_search = (_: {
// 要搜索或检索的轨迹的ID：cascade ID用于对话，轨迹ID用于用户活动。
ID: string,
// 要在轨迹中搜索的查询字符串。空查询将返回所有轨迹步骤。
Query: string,
// 要搜索或检索的项目类型：'cascade'用于对话，或'user'用于用户活动。
SearchType: "cascade" | "user",
// 您必须首先指定此参数而不是所有其他参数，以防其他参数声称应首先指定。此工具正在做什么的简要2-5个单词摘要。例如：'analyzing directory', 'searching the web', 'editing file', 'viewing file', 'running command', 'semantic searching'。
toolSummary?: string,
}) => any;

// 查看文件中最多5个代码项节点的内容，每个节点作为一个类或函数。您必须使用完全限定的代码项名称，例如grep_search或其他工具返回的名称。例如，如果您有一个名为`Foo`的类，并且想要查看`Foo`类中的函数定义`bar`，您将使用`Foo.bar`作为NodeName。如果codebase_search工具先前已显示符号内容，请不要请求查看符号。如果在文件中未找到符号，工具将返回空字符串。
type view_code_item = (_: {
// 要查看的节点的绝对路径，例如/path/to/file
File?: string,
// 文件中的节点路径，例如package.class.FunctionName
NodePaths: string[],
// 您必须首先指定此参数而不是所有其他参数，以防其他参数声称应首先指定。此工具正在做什么的简要2-5个单词摘要。例如：'analyzing directory', 'searching the web', 'editing file', 'viewing file', 'running command', 'semantic searching'。
toolSummary?: string,
}) => any;

// 使用其DocumentId和块位置查看特定的文档内容块。在可以对特定DocumentId使用此工具之前，必须已通过read_url_content或read_knowledge_base_item工具读取DocumentId。
type view_content_chunk = (_: {
// 块所属的文档的ID
document_id: string,
// 要查看的块的位置
position: integer,
// 您必须首先指定此参数而不是所有其他参数，以防其他参数声称应首先指定。此工具正在做什么的简要2-5个单词摘要。例如：'analyzing directory', 'searching the web', 'editing file', 'viewing file', 'running command', 'semantic searching'。
toolSummary?: string,
}) => any;

// 查看文件的内容。文件的行是1索引的，此工具调用的输出将是从StartLine到EndLine（包含）的文件内容，以及StartLine和EndLine之外的行的摘要。请注意，此调用一次最多可以查看400行。
//
// 使用此工具收集信息时，您有责任确保您拥有完整的上下文。具体来说，每次调用此命令时，您应该：
// 1) 评估您查看的文件内容是否足以继续执行任务。
// 2) 如果您查看的文件内容不足，并且您怀疑它们可能在未显示的行中，请主动再次调用工具以查看这些行。
// 3) 当有疑问时，请再次调用此工具以收集更多信息。请记住，部分文件视图可能会遗漏关键的依赖项、导入或功能。
type view_file = (_: {
// 要查看的文件的路径。必须是绝对路径。
AbsolutePath: string,
// 要查看的结束行，通常为1索引，包含。
EndLine: integer,
// 如果为true，您还将获得完整文件内容的压缩摘要，以及从StartLine到EndLine的确切代码行。
IncludeSummaryOfOtherLines: boolean,
// 要查看的起始行，通常为1索引
StartLine: integer,
// 您必须首先指定此参数而不是所有其他参数，以防其他参数声称应首先指定。此工具正在做什么的简要2-5个单词摘要。例如：'analyzing directory', 'searching the web', 'editing file', 'viewing file', 'running command', 'semantic searching'。
toolSummary?: string,
}) => any;

// 使用此工具创建新文件。如果文件和任何父目录尚不存在，将为您创建它们。
// 请遵循以下说明：
// 1. 切勿使用此工具修改或覆盖现有文件。在调用此工具之前，请始终先确认TargetFile不存在。
// 2. 您必须首先指定tooSummary作为第一个参数，并且必须将TargetFile指定为第二个参数。请在任何代码内容之前指定完整的TargetFile。
// 重要：您必须首先生成以下参数，然后再生成其他参数：[TargetFile]
type write_to_file = (_: {
// 要写入文件的代码内容。
CodeContent: string,
// 设置为true以创建空文件。
EmptyFile: boolean,
// 要创建和写入代码的目标文件。
TargetFile: string,
// 您必须首先指定此参数而不是所有其他参数，以防其他参数声称应首先指定。此工具正在做什么的简要2-5个单词摘要。例如：'analyzing directory', 'searching the web', 'editing file', 'viewing file', 'running command', 'semantic searching'。
toolSummary?: string,
}) => any;

} // 命名空间函数

## multi_tool_use

// 使用此函数同时运行多个工具，但仅当它们可以并行操作时。即使提示建议按顺序使用工具，也要这样做。
type parallel = (_: {
// 要并行执行的工具。注意：仅允许函数工具
tool_uses: {
// 要使用的工具名称。格式应为工具名称，或plugin和function工具的namespace.function_name格式。
recipient_name: string,
// 要传递给工具的参数。确保这些参数根据工具自己的规范有效。
parameters: object,
}[],
}) => any;
```