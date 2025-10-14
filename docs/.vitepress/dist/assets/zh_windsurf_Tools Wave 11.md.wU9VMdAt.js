import{_ as s,c as a,o as p,ae as l}from"./chunks/framework.CBTkueSR.js";const m=JSON.parse('{"title":"","description":"","frontmatter":{},"headers":[],"relativePath":"zh/windsurf/Tools Wave 11.md","filePath":"zh/windsurf/Tools Wave 11.md"}'),e={name:"zh/windsurf/Tools Wave 11.md"};function i(c,n,t,r,o,g){return p(),a("div",null,[...n[0]||(n[0]=[l(`<h2 id="tools-wave-11-txt" tabindex="-1">Tools Wave 11.txt <a class="header-anchor" href="#tools-wave-11-txt" aria-label="Permalink to &quot;Tools Wave 11.txt&quot;">​</a></h2><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// 为 Web 服务器启动浏览器预览。这允许用户正常与 Web 服务器交互，并向 Cascade 提供来自 Web 服务器的控制台日志和其他信息。请注意，此工具调用不会自动为用户打开浏览器预览，他们必须单击提供的按钮之一才能在浏览器中打开它。</span></span>
<span class="line"><span>type browser_preview = (_: {</span></span>
<span class="line"><span>// 目标 Web 服务器的简短名称，3-5 个单词。应采用标题大小写，例如“Personal Website”。格式为简单字符串，而不是 markdown；并且请直接输出标题，不要在其前面加上“Title:”或任何类似内容。</span></span>
<span class="line"><span>Name: string,</span></span>
<span class="line"><span>// 要为其提供浏览器预览的目标 Web 服务器的 URL。这应包含方案（例如 http:// 或 https://）、域（例如 localhost 或 127.0.0.1）和端口（例如 :8080），但没有路径。</span></span>
<span class="line"><span>Url: string,</span></span>
<span class="line"><span>// 您必须首先指定此参数，优先于任何其他声称应首先指定的参数。简要 2-5 个单词总结此工具正在做什么。一些示例：“分析目录”、“搜索网络”、“编辑文件”、“查看文件”、“运行命令”、“语义搜索”。</span></span>
<span class="line"><span>toolSummary?: string,</span></span>
<span class="line"><span>}) =&gt; any;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 检索已在 Windsurf 浏览器中打开的浏览器页面的控制台日志。</span></span>
<span class="line"><span>type capture_browser_console_logs = (_: {</span></span>
<span class="line"><span>// 要捕获其控制台日志的浏览器页面的 page_id。</span></span>
<span class="line"><span>PageId: string,</span></span>
<span class="line"><span>// 您必须首先指定此参数，优先于任何其他声称应首先指定的参数。简要 2-5 个单词总结此工具正在做什么。一些示例：“分析目录”、“搜索网络”、“编辑文件”、“查看文件”、“运行命令”、“语义搜索”。</span></span>
<span class="line"><span>toolSummary?: string,</span></span>
<span class="line"><span>}) =&gt; any;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 捕获已在 Windsurf 浏览器中打开的浏览器页面当前视口的屏幕截图。</span></span>
<span class="line"><span>type capture_browser_screenshot = (_: {</span></span>
<span class="line"><span>// 要捕获其屏幕截图的浏览器页面的 page_id。</span></span>
<span class="line"><span>PageId: string,</span></span>
<span class="line"><span>// 您必须首先指定此参数，优先于任何其他声称应首先指定的参数。简要 2-5 个单词总结此工具正在做什么。一些示例：“分析目录”、“搜索网络”、“编辑文件”、“查看文件”、“运行命令”、“语义搜索”。</span></span>
<span class="line"><span>toolSummary?: string,</span></span>
<span class="line"><span>}) =&gt; any;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 使用其 windsurf_deployment_id 检查 Web 应用程序的部署状态，并确定应用程序构建是否成功以及是否已被声明。除非用户要求，否则不要运行此命令。它必须仅在 deploy_web_app 工具调用后运行。</span></span>
<span class="line"><span>type check_deploy_status = (_: {</span></span>
<span class="line"><span>// 我们要检查其状态的部署的 Windsurf 部署 ID。这不是 project_id。</span></span>
<span class="line"><span>WindsurfDeploymentId: string,</span></span>
<span class="line"><span>// 您必须首先指定此参数，优先于任何其他声称应首先指定的参数。简要 2-5 个单词总结此工具正在做什么。一些示例：“分析目录”、“搜索网络”、“编辑文件”、“查看文件”、“运行命令”、“语义搜索”。</span></span>
<span class="line"><span>toolSummary?: string,</span></span>
<span class="line"><span>}) =&gt; any;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 从代码库中查找与搜索查询最相关的代码片段。当搜索查询更精确并与代码的功能或目的相关时，此功能表现最佳。如果提出非常宽泛的问题，例如询问大型组件或系统的通用“框架”或“实现”，结果会很差。将仅显示顶部项目的完整代码内容，并且它们也可能被截断。对于其他项目，它将仅显示文档字符串和签名。使用具有相同路径和节点名称的 view_code_item 查看任何项目的完整代码内容。请注意，如果您尝试搜索超过 500 个文件，搜索结果的质量将大大降低。仅在确实必要时才尝试搜索大量文件。</span></span>
<span class="line"><span>type codebase_search = (_: {</span></span>
<span class="line"><span>// 搜索查询</span></span>
<span class="line"><span>Query: string,</span></span>
<span class="line"><span>// 要搜索的目录的绝对路径列表</span></span>
<span class="line"><span>TargetDirectories: string[],</span></span>
<span class="line"><span>// 您必须首先指定此参数，优先于任何其他声称应首先指定的参数。简要 2-5 个单词总结此工具正在做什么。一些示例：“分析目录”、“搜索网络”、“编辑文件”、“查看文件”、“运行命令”、“语义搜索”。</span></span>
<span class="line"><span>toolSummary?: string,</span></span>
<span class="line"><span>}) =&gt; any;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 通过其 ID 获取先前执行的终端命令的状态。返回当前状态（正在运行、已完成）、按输出优先级指定的输出行以及任何错误（如果存在）。不要尝试检查除后台命令 ID 之外的任何 ID 的状态。</span></span>
<span class="line"><span>type command_status = (_: {</span></span>
<span class="line"><span>// 要获取其状态的命令的 ID</span></span>
<span class="line"><span>CommandId: string,</span></span>
<span class="line"><span>// 要查看的字符数。使其尽可能小以避免过多的内存使用。</span></span>
<span class="line"><span>OutputCharacterCount: integer,</span></span>
<span class="line"><span>// 在获取状态之前等待命令完成的秒数。如果命令在此持续时间之前完成，则此工具调用将提前返回。设置为 0 以立即获取命令的状态。如果您只对等待命令完成感兴趣，请设置为 60。</span></span>
<span class="line"><span>// 您必须首先指定此参数，优先于任何其他声称应首先指定的参数。简要 2-5 个单词总结此工具正在做什么。一些示例：“分析目录”、“搜索网络”、“编辑文件”、“查看文件”、“运行命令”、“语义搜索”。</span></span>
<span class="line"><span>WaitDurationSeconds: integer,</span></span>
<span class="line"><span>toolSummary?: string,</span></span>
<span class="line"><span>}) =&gt; any;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 将与用户及其任务相关的重要上下文保存到内存数据库中。</span></span>
<span class="line"><span>// 要保存的上下文示例：</span></span>
<span class="line"><span>// - 用户偏好</span></span>
<span class="line"><span>// - 用户明确要求记住某事或以其他方式改变您的行为</span></span>
<span class="line"><span>// - 重要的代码片段</span></span>
<span class="line"><span>// - 技术栈</span></span>
<span class="line"><span>// - 项目结构</span></span>
<span class="line"><span>// - 主要里程碑或功能</span></span>
<span class="line"><span>// - 新的设计模式和架构决策</span></span>
<span class="line"><span>// - 您认为重要的任何其他信息。</span></span>
<span class="line"><span>// 在创建新内存之前，首先检查数据库中是否已存在语义相关的内存。如果找到，请更新它而不是创建重复项。</span></span>
<span class="line"><span>// 必要时使用此工具删除不正确的内存。</span></span>
<span class="line"><span>type create_memory = (_: {</span></span>
<span class="line"><span>// 对内存执行的操作类型。必须是“create”、“update”或“delete”之一</span></span>
<span class="line"><span>Action: &quot;create&quot; | &quot;update&quot; | &quot;delete&quot;,</span></span>
<span class="line"><span>// 新的或更新的内存的内容。删除现有内存时，将此项留空。</span></span>
<span class="line"><span>Content: string,</span></span>
<span class="line"><span>// 与内存关联的工作区的 CorpusNames。每个元素必须是与您的系统提示中提供的 CorpusNames 之一的完整且精确的字符串匹配，包括所有符号。仅在创建新内存时使用。</span></span>
<span class="line"><span>CorpusNames: string[],</span></span>
<span class="line"><span>// 要更新或删除的现有内存的 ID。创建新内存时，将此项留空。</span></span>
<span class="line"><span>Id: string,</span></span>
<span class="line"><span>// 与内存关联的标签。这些将用于筛选或检索内存。仅在创建新内存时使用。使用 snake_case。</span></span>
<span class="line"><span>Tags: string[],</span></span>
<span class="line"><span>// 新的或更新的内存的描述性标题。在创建或更新内存时这是必需的。删除现有内存时，将此项留空。</span></span>
<span class="line"><span>Title: string,</span></span>
<span class="line"><span>// 如果用户明确要求您创建/修改此内存，则设置为 true。</span></span>
<span class="line"><span>UserTriggered: boolean,</span></span>
<span class="line"><span>// 您必须首先指定此参数，优先于任何其他声称应首先指定的参数。简要 2-5 个单词总结此工具正在做什么。一些示例：“分析目录”、“搜索网络”、“编辑文件”、“查看文件”、“运行命令”、“语义搜索”。</span></span>
<span class="line"><span>toolSummary?: string,</span></span>
<span class="line"><span>}) =&gt; any;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 将 JavaScript Web 应用程序部署到像 Netlify 这样的部署提供商。站点无需构建。只需要源文件。在尝试部署之前，请确保首先运行 read_deployment_config 工具并创建所有缺失的文件。如果您要部署到现有站点，请使用 project_id 来标识该站点。如果您要部署新站点，请将 project_id 留空。</span></span>
<span class="line"><span>type deploy_web_app = (_: {</span></span>
<span class="line"><span>// Web 应用程序的框架。</span></span>
<span class="line"><span>Framework: &quot;eleventy&quot; | &quot;angular&quot; | &quot;astro&quot; | &quot;create-react-app&quot; | &quot;gatsby&quot; | &quot;gridsome&quot; | &quot;grunt&quot; | &quot;hexo&quot; | &quot;hugo&quot; | &quot;hydrogen&quot; | &quot;jekyll&quot; | &quot;middleman&quot; | &quot;mkdocs&quot; | &quot;nextjs&quot; | &quot;nuxtjs&quot; | &quot;remix&quot; | &quot;sveltekit&quot; | &quot;svelte&quot;,</span></span>
<span class="line"><span>// Web 应用程序的项目 ID（如果它存在于部署配置文件中）。对于新站点或用户希望重命名站点的情况，请将此项留空。如果这是重新部署，请在部署配置文件中查找项目 ID 并使用完全相同的 ID。</span></span>
<span class="line"><span>ProjectId: string,</span></span>
<span class="line"><span>// Web 应用程序的完整绝对项目路径。</span></span>
<span class="line"><span>ProjectPath: string,</span></span>
<span class="line"><span>// URL 中使用的子域或项目名称。如果您要使用 project_id 部署到现有站点，请将此项留空。对于新站点，子域应唯一且与项目相关。</span></span>
<span class="line"><span>// 您必须首先指定此参数，优先于任何其他声称应首先指定的参数。简要 2-5 个单词总结此工具正在做什么。一些示例：“分析目录”、“搜索网络”、“编辑文件”、“查看文件”、“运行命令”、“语义搜索”。</span></span>
<span class="line"><span>Subdomain: string,</span></span>
<span class="line"><span>toolSummary?: string,</span></span>
<span class="line"><span>}) =&gt; any;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 使用 fd 在指定目录中搜索文件和子目录。</span></span>
<span class="line"><span>// 搜索使用智能大小写，并默认忽略 gitignored 文件。</span></span>
<span class="line"><span>// Pattern 和 Excludes 都使用 glob 格式。如果您正在搜索扩展名，则无需同时指定 Pattern 和 Extensions。</span></span>
<span class="line"><span>// 为避免输出过多，结果上限为 50 个匹配项。根据需要使用各种参数来筛选搜索范围。</span></span>
<span class="line"><span>// 结果将包括类型、大小、修改时间和相对路径。</span></span>
<span class="line"><span>type find_by_name = (_: {</span></span>
<span class="line"><span>// 可选，排除与给定 glob 模式匹配的文件/目录</span></span>
<span class="line"><span>Excludes: string[],</span></span>
<span class="line"><span>// 可选，要包含的文件扩展名（不带前导 .），匹配的路径必须至少匹配一个包含的扩展名</span></span>
<span class="line"><span>Extensions: string[],</span></span>
<span class="line"><span>// 可选，完整绝对路径是否必须匹配 glob 模式，默认：仅文件名需要匹配。启用此标志时，请注意指定 glob 模式，例如，当 FullPath 启用时，模式“*.py”将不匹配文件“/foo/bar.py”，但模式“**/*.py”将匹配。</span></span>
<span class="line"><span>FullPath: boolean,</span></span>
<span class="line"><span>// 可选，最大搜索深度</span></span>
<span class="line"><span>MaxDepth: integer,</span></span>
<span class="line"><span>// 可选，要搜索的模式，支持 glob 格式</span></span>
<span class="line"><span>Pattern: string,</span></span>
<span class="line"><span>// 要搜索的目录</span></span>
<span class="line"><span>SearchDirectory: string,</span></span>
<span class="line"><span>// 可选，类型筛选器，枚举=文件、目录、任何</span></span>
<span class="line"><span>Type: string,</span></span>
<span class="line"><span>// 您必须首先指定此参数，优先于任何其他声称应首先指定的参数。简要 2-5 个单词总结此工具正在做什么。一些示例：“分析目录”、“搜索网络”、“编辑文件”、“查看文件”、“运行命令”、“语义搜索”。</span></span>
<span class="line"><span>toolSummary?: string,</span></span>
<span class="line"><span>}) =&gt; any;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 获取 Windsurf 浏览器中打开页面的 DOM 树。</span></span>
<span class="line"><span>type get_dom_tree = (_: {</span></span>
<span class="line"><span>// 要获取其 DOM 树的浏览器页面的 page_id</span></span>
<span class="line"><span>PageId: string,</span></span>
<span class="line"><span>// 您必须首先指定此参数，优先于任何其他声称应首先指定的参数。简要 2-5 个单词总结此工具正在做什么。一些示例：“分析目录”、“搜索网络”、“编辑文件”、“查看文件”、“运行命令”、“语义搜索”。</span></span>
<span class="line"><span>toolSummary?: string,</span></span>
<span class="line"><span>}) =&gt; any;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 使用 ripgrep 在文件或目录中查找精确的模式匹配。</span></span>
<span class="line"><span>// 结果以 JSON 格式返回，对于每个匹配项，您将收到：</span></span>
<span class="line"><span>// - 文件名</span></span>
<span class="line"><span>// - 行号</span></span>
<span class="line"><span>// - 行内容：匹配行的内容</span></span>
<span class="line"><span>// 总结果上限为 50 个匹配项。使用 Includes 选项按文件类型或特定路径筛选以优化您的搜索。</span></span>
<span class="line"><span>type grep_search = (_: {</span></span>
<span class="line"><span>// 如果为 true，则执行不区分大小写的搜索。</span></span>
<span class="line"><span>CaseInsensitive: boolean,</span></span>
<span class="line"><span>// 用于筛选在“SearchPath”中找到的文件的 Glob 模式，如果“SearchPath”是目录。例如，“*.go”仅包含 Go 文件，或“!**/vendor/*”排除 vendor 目录。这不用于指定主搜索目录；请为此使用“SearchPath”。如果不需要 glob 筛选或“SearchPath”是单个文件，则留空。</span></span>
<span class="line"><span>Includes: string[],</span></span>
<span class="line"><span>// 如果为 true，则将 Query 视为具有特殊字符（如 *、+、（ 等）具有正则表达式含义的正则表达式模式。如果为 false，则将 Query 视为所有字符都精确匹配的文字字符串。对普通文本搜索使用 false，仅在您特别需要正则表达式功能时使用 true。</span></span>
<span class="line"><span>IsRegex: boolean,</span></span>
<span class="line"><span>// 如果为 true，则返回与查询匹配的每一行，包括行号和匹配行的片段（等效于“git grep -nI”）。如果为 false，则仅返回包含查询的文件的名称（等效于“git grep -l”）。</span></span>
<span class="line"><span>MatchPerLine: boolean,</span></span>
<span class="line"><span>// 要在文件中查找的搜索词或模式。</span></span>
<span class="line"><span>Query: string,</span></span>
<span class="line"><span>// 要搜索的路径。这可以是目录或文件。这是一个必需的参数。</span></span>
<span class="line"><span>SearchPath: string,</span></span>
<span class="line"><span>// 您必须首先指定此参数，优先于任何其他声称应首先指定的参数。简要 2-5 个单词总结此工具正在做什么。一些示例：“分析目录”、“搜索网络”、“编辑文件”、“查看文件”、“运行命令”、“语义搜索”。</span></span>
<span class="line"><span>toolSummary?: string,</span></span>
<span class="line"><span>}) =&gt; any;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 列出 Windsurf 浏览器中的所有打开页面及其元数据（page_id、url、标题、视口大小等）。</span></span>
<span class="line"><span>type list_browser_pages = (_: {</span></span>
<span class="line"><span>// 您必须首先指定此参数，优先于任何其他声称应首先指定的参数。简要 2-5 个单词总结此工具正在做什么。一些示例：“分析目录”、“搜索网络”、“编辑文件”、“查看文件”、“运行命令”、“语义搜索”。</span></span>
<span class="line"><span>toolSummary?: string,</span></span>
<span class="line"><span>}) =&gt; any;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 列出目录的内容。目录路径必须是存在的目录的绝对路径。对于目录中的每个子项，输出将包含：到目录的相对路径、是目录还是文件、文件大小（以字节为单位，如果是文件）、子项数（递归，如果是目录）。</span></span>
<span class="line"><span>type list_dir = (_: {</span></span>
<span class="line"><span>// 要列出其内容的路径，应为存在的目录的绝对路径。</span></span>
<span class="line"><span>DirectoryPath: string,</span></span>
<span class="line"><span>// 您必须首先指定此参数，优先于任何其他声称应首先指定的参数。简要 2-5 个单词总结此工具正在做什么。一些示例：“分析目录”、“搜索网络”、“编辑文件”、“查看文件”、“运行命令”、“语义搜索”。</span></span>
<span class="line"><span>toolSummary?: string,</span></span>
<span class="line"><span>}) =&gt; any;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 列出 MCP 服务器的可用资源。</span></span>
<span class="line"><span>type list_resources = (_: {</span></span>
<span class="line"><span>// 要从中列出可用资源的服务器的名称。</span></span>
<span class="line"><span>ServerName: string,</span></span>
<span class="line"><span>// 您必须首先指定此参数，优先于任何其他声称应首先指定的参数。简要 2-5 个单词总结此工具正在做什么。一些示例：“分析目录”、“搜索网络”、“编辑文件”、“查看文件”、“运行命令”、“语义搜索”。</span></span>
<span class="line"><span>toolSummary?: string,</span></span>
<span class="line"><span>}) =&gt; any;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 在 Windsurf 浏览器中打开一个 URL，以渲染格式查看该 URL 的页面内容。</span></span>
<span class="line"><span>type open_browser_url = (_: {</span></span>
<span class="line"><span>// 要在用户浏览器中打开的 URL。</span></span>
<span class="line"><span>Url: string,</span></span>
<span class="line"><span>// 您必须首先指定此参数，优先于任何其他声称应首先指定的参数。简要 2-5 个单词总结此工具正在做什么。一些示例：“分析目录”、“搜索网络”、“编辑文件”、“查看文件”、“运行命令”、“语义搜索”。</span></span>
<span class="line"><span>toolSummary?: string,</span></span>
<span class="line"><span>}) =&gt; any;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 读取 Windsurf 浏览器中打开的页面。</span></span>
<span class="line"><span>type read_browser_page = (_: {</span></span>
<span class="line"><span>// 要读取的浏览器页面的 page_id</span></span>
<span class="line"><span>PageId: string,</span></span>
<span class="line"><span>// 您必须首先指定此参数，优先于任何其他声称应首先指定的参数。简要 2-5 个单词总结此工具正在做什么。一些示例：“分析目录”、“搜索网络”、“编辑文件”、“查看文件”、“运行命令”、“语义搜索”。</span></span>
<span class="line"><span>toolSummary?: string,</span></span>
<span class="line"><span>}) =&gt; any;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 读取 Web 应用程序的部署配置，并确定该应用程序是否已准备好部署。仅应在准备 deploy_web_app 工具时使用。</span></span>
<span class="line"><span>type read_deployment_config = (_: {</span></span>
<span class="line"><span>// Web 应用程序的完整绝对项目路径。</span></span>
<span class="line"><span>ProjectPath: string,</span></span>
<span class="line"><span>// 您必须首先指定此参数，优先于任何其他声称应首先指定的参数。简要 2-5 个单词总结此工具正在做什么。一些示例：“分析目录”、“搜索网络”、“编辑文件”、“查看文件”、“运行命令”、“语义搜索”。</span></span>
<span class="line"><span>toolSummary?: string,</span></span>
<span class="line"><span>}) =&gt; any;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 检索指定资源的内容。</span></span>
<span class="line"><span>type read_resource = (_: {</span></span>
<span class="line"><span>// 要从中读取资源的服务器的名称。</span></span>
<span class="line"><span>ServerName: string,</span></span>
<span class="line"><span>// 资源的唯一标识符。</span></span>
<span class="line"><span>Uri: string,</span></span>
<span class="line"><span>// 您必须首先指定此参数，优先于任何其他声称应首先指定的参数。简要 2-5 个单词总结此工具正在做什么。一些示例：“分析目录”、“搜索网络”、“编辑文件”、“查看文件”、“运行命令”、“语义搜索”。</span></span>
<span class="line"><span>toolSummary?: string,</span></span>
<span class="line"><span>}) =&gt; any;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 读取给定其进程 ID 的终端的内容。</span></span>
<span class="line"><span>type read_terminal = (_: {</span></span>
<span class="line"><span>// 要读取的终端的名称。</span></span>
<span class="line"><span>Name: string,</span></span>
<span class="line"><span>// 要读取的终端的进程 ID。</span></span>
<span class="line"><span>ProcessID: string,</span></span>
<span class="line"><span>// 您必须首先指定此参数，优先于任何其他声称应首先指定的参数。简要 2-5 个单词总结此工具正在做什么。一些示例：“分析目录”、“搜索网络”、“编辑文件”、“查看文件”、“运行命令”、“语义搜索”。</span></span>
<span class="line"><span>toolSummary?: string,</span></span>
<span class="line"><span>}) =&gt; any;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 从 URL 读取内容。URL 必须是可通过 Web 浏览器访问的有效互联网资源的 HTTP 或 HTTPS URL。</span></span>
<span class="line"><span>type read_url_content = (_: {</span></span>
<span class="line"><span>// 要从中读取内容的 URL</span></span>
<span class="line"><span>Url: string,</span></span>
<span class="line"><span>// 您必须首先指定此参数，优先于任何其他声称应首先指定的参数。简要 2-5 个单词总结此工具正在做什么。一些示例：“分析目录”、“搜索网络”、“编辑文件”、“查看文件”、“运行命令”、“语义搜索”。</span></span>
<span class="line"><span>toolSummary?: string,</span></span>
<span class="line"><span>}) =&gt; any;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 使用此工具编辑现有文件。请遵循以下规则：</span></span>
<span class="line"><span>// 1. 不要对同一文件进行多个并行调用此工具。</span></span>
<span class="line"><span>// 2. 要在同一文件中编辑多个不相邻的代码行，请对此工具进行单次调用。将每个编辑指定为单独的 ReplacementChunk。</span></span>
<span class="line"><span>// 3. 对于每个 ReplacementChunk，指定 TargetContent 和 ReplacementContent。在 TargetContent 中，指定要编辑的确切代码行。这些行必须与现有文件内容中的文本完全匹配。在 ReplacementContent 中，指定指定目标内容的替换内容。这必须是 TargetContent 的完整直接替换，并进行了必要的修改。</span></span>
<span class="line"><span>// 4. 如果您要对单个文件进行多次编辑，请指定多个单独的 ReplacementChunks。不要试图用新内容替换整个现有内容，这非常昂贵。</span></span>
<span class="line"><span>// 5. 您可能无法编辑文件扩展名：[.ipynb]</span></span>
<span class="line"><span>// 重要提示：您必须首先生成以下参数，然后再生成任何其他参数：[TargetFile]</span></span>
<span class="line"><span>type replace_file_content = (_: {</span></span>
<span class="line"><span>// 代码块的 Markdown 语言，例如“python”或“javascript”</span></span>
<span class="line"><span>CodeMarkdownLanguage: string,</span></span>
<span class="line"><span>// 您对文件所做更改的描述。</span></span>
<span class="line"><span>Instruction: string,</span></span>
<span class="line"><span>// 要替换的块列表。如果可能，最好为非连续编辑提供多个块。这必须是 JSON 数组，而不是字符串。</span></span>
<span class="line"><span>ReplacementChunks: Array&lt;</span></span>
<span class="line"><span>{</span></span>
<span class="line"><span>// 如果为 true，则如果找到多个“targetContent”的出现，它们将被“replacementContent”替换。否则，如果找到多个出现，将返回错误。</span></span>
<span class="line"><span>AllowMultiple: boolean,</span></span>
<span class="line"><span>// 替换目标内容的内容。</span></span>
<span class="line"><span>ReplacementContent: string,</span></span>
<span class="line"><span>// 要替换的确切字符串。这必须是要替换的确切字符序列，包括空格。请非常小心地包含任何前导空格，否则这将根本不起作用。如果 AllowMultiple 不为 true，则这必须是文件中的唯一子字符串，否则将出错。</span></span>
<span class="line"><span>TargetContent: string,</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span>&gt;,</span></span>
<span class="line"><span>// 要修改的目标文件。始终将目标文件指定为第一个参数。</span></span>
<span class="line"><span>TargetFile: string,</span></span>
<span class="line"><span>// 如果适用，此编辑旨在修复的 lint 错误的 ID（它们将在最近的 IDE 反馈中给出）。如果您认为编辑可以修复 lint，请指定 lint ID；如果编辑完全不相关，则不要指定。经验法则是，如果您的编辑受到 lint 反馈的影响，请包含 lint ID。在此处进行诚实的判断。</span></span>
<span class="line"><span>TargetLintErrorIds?: string[],</span></span>
<span class="line"><span>// 您必须首先指定此参数，优先于任何其他声称应首先指定的参数。简要 2-5 个单词总结此工具正在做什么。一些示例：“分析目录”、“搜索网络”、“编辑文件”、“查看文件”、“运行命令”、“语义搜索”。</span></span>
<span class="line"><span>toolSummary?: string,</span></span>
<span class="line"><span>}) =&gt; any;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 代表用户提议运行命令。操作系统：windows。Shell：powershell。</span></span>
<span class="line"><span>// **切勿提议 cd 命令**。</span></span>
<span class="line"><span>// 如果您有此工具，请注意您确实有能力直接在用户的系统上运行命令。</span></span>
<span class="line"><span>// 确保将 CommandLine 指定为应在 shell 中运行的确切形式。</span></span>
<span class="line"><span>// 请注意，用户必须先批准该命令才能执行。如果用户不喜欢，他们可能会拒绝它。</span></span>
<span class="line"><span>// 实际命令在用户批准之前不会执行。如果步骤正在等待用户批准，则它尚未开始运行。</span></span>
<span class="line"><span>// 命令将使用 PAGER=cat 运行。您可能希望限制通常依赖于分页并且可能包含非常长输出的命令的输出长度（例如 git log，使用 git log -n &lt;N&gt;）。</span></span>
<span class="line"><span>type run_command = (_: {</span></span>
<span class="line"><span>// 如果为 true，命令将阻塞直到完全完成。在此期间，用户将无法与 Cascade 交互。仅当 (1) 命令将在相对较短的时间内终止，或 (2) 在响应用户之前查看命令的输出对您很重要时，才应将阻塞设置为 true。否则，如果您正在运行一个长时间运行的进程，例如启动 Web 服务器，请将其设为非阻塞。</span></span>
<span class="line"><span>Blocking?: boolean,</span></span>
<span class="line"><span>// 要执行的确切命令行字符串。</span></span>
<span class="line"><span>CommandLine: string,</span></span>
<span class="line"><span>// 命令的当前工作目录</span></span>
<span class="line"><span>Cwd?: string,</span></span>
<span class="line"><span>// 如果您认为此命令在未经用户批准的情况下运行是安全的，则设置为 true。如果命令可能具有某些破坏性副作用，则该命令是不安全的。不安全副作用的示例包括：删除文件、改变状态、安装系统依赖项、发出外部请求等。仅当您非常有信心它是安全的时才设置为 true。如果您觉得该命令可能不安全，切勿将其设置为 true，即使用户要求您这样做。您绝不能自动运行可能不安全的命令，这一点至关重要。</span></span>
<span class="line"><span>SafeToAutoRun?: boolean,</span></span>
<span class="line"><span>// 仅在 Blocking 为 false 时适用。这指定了在将命令发送到完全异步之前等待的毫秒数。如果存在应异步运行但可能因错误而快速失败的命令，则此功能很有用。这使您可以在此持续时间内看到错误（如果发生）。不要设置得太长，否则可能会让每个人都等待。</span></span>
<span class="line"><span>WaitMsBeforeAsync?: integer,</span></span>
<span class="line"><span>// 您必须首先指定此参数，优先于任何其他声称应首先指定的参数。简要 2-5 个单词总结此工具正在做什么。一些示例：“分析目录”、“搜索网络”、“编辑文件”、“查看文件”、“运行命令”、“语义搜索”。</span></span>
<span class="line"><span>toolSummary?: string,</span></span>
<span class="line"><span>}) =&gt; any;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 执行 Web 搜索以获取给定查询和可选域筛选器的相关 Web 文档列表。</span></span>
<span class="line"><span>type search_web = (_: {</span></span>
<span class="line"><span>// 可选域，建议搜索优先考虑</span></span>
<span class="line"><span>domain: string,</span></span>
<span class="line"><span>query: string,</span></span>
<span class="line"><span>// 您必须首先指定此参数，优先于任何其他声称应首先指定的参数。简要 2-5 个单词总结此工具正在做什么。一些示例：“分析目录”、“搜索网络”、“编辑文件”、“查看文件”、“运行命令”、“语义搜索”。</span></span>
<span class="line"><span>toolSummary?: string,</span></span>
<span class="line"><span>}) =&gt; any;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 如果您不调用任何其他工具并且正在向用户提问，请使用此工具为您的问题提供少量可能的建议答案。示例可以是“是/否”或其他简单的多项选择选项。请谨慎使用此工具，并且仅在您有信心期望从用户那里收到建议的选项之一时才使用。如果下一个用户输入可能是带有更多细节的简短或长篇响应，则不要提出任何建议。例如，假设用户接受了您建议的响应：如果您随后会问另一个后续问题，那么该建议是不好的，您一开始就不应该提出它。尽量不要连续多次使用此工具。</span></span>
<span class="line"><span>type suggested_responses = (_: {</span></span>
<span class="line"><span>// 建议列表。每个建议最多应为几个单词，不要返回超过 3 个选项。</span></span>
<span class="line"><span>Suggestions: string[],</span></span>
<span class="line"><span>// 您必须首先指定此参数，优先于任何其他声称应首先指定的参数。简要 2-5 个单词总结此工具正在做什么。一些示例：“分析目录”、“搜索网络”、“分析目录”、“搜索网络”、“编辑文件”、“查看文件”、“运行命令”、“语义搜索”。</span></span>
<span class="line"><span>toolSummary?: string,</span></span>
<span class="line"><span>}) =&gt; any;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 语义搜索或检索轨迹。轨迹是对话之一。返回轨迹中的块，按相关性评分、排序和筛选。返回的最大块数为 50。当用户@提及@对话时调用此工具。不要使用 SearchType: &#39;user&#39; 调用此工具。忽略@活动提及。</span></span>
<span class="line"><span>type trajectory_search = (_: {</span></span>
<span class="line"><span>// 要搜索或检索的轨迹的 ID：对话的级联 ID，用户活动的用户 ID。</span></span>
<span class="line"><span>ID: string,</span></span>
<span class="line"><span>// 要在轨迹中搜索的查询字符串。空查询将返回所有轨迹步骤。</span></span>
<span class="line"><span>Query: string,</span></span>
<span class="line"><span>// 要搜索或检索的项目类型：“级联”表示对话，“用户”表示用户活动。</span></span>
<span class="line"><span>SearchType: &quot;cascade&quot; | &quot;user&quot;,</span></span>
<span class="line"><span>// 您必须首先指定此参数，优先于任何其他声称应首先指定的参数。简要 2-5 个单词总结此工具正在做什么。一些示例：“分析目录”、“搜索网络”、“编辑文件”、“查看文件”、“运行命令”、“语义搜索”。</span></span>
<span class="line"><span>toolSummary?: string,</span></span>
<span class="line"><span>}) =&gt; any;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 查看文件中最多 5 个代码项节点的内容，每个节点为一个类或一个函数。您必须使用完全限定的代码项名称，例如 grep_search 或其他工具返回的名称。例如，如果您有一个名为 \`Foo\` 的类，并且想要查看 \`Foo\` 类中的函数定义 \`bar\`，则应使用 \`Foo.bar\` 作为 NodeName。如果 codebase_search 工具先前已显示了符号的内容，请不要请求查看该符号。如果文件中未找到该符号，该工具将返回一个空字符串。</span></span>
<span class="line"><span>type view_code_item = (_: {</span></span>
<span class="line"><span>// 要查看的节点的绝对路径，例如 /path/to/file</span></span>
<span class="line"><span>File?: string,</span></span>
<span class="line"><span>// 文件中节点的路径，例如 package.class.FunctionName</span></span>
<span class="line"><span>NodePaths: string[],</span></span>
<span class="line"><span>// 您必须首先指定此参数，优先于任何其他声称应首先指定的参数。简要 2-5 个单词总结此工具正在做什么。一些示例：“分析目录”、“搜索网络”、“编辑文件”、“查看文件”、“运行命令”、“语义搜索”。</span></span>
<span class="line"><span>toolSummary?: string,</span></span>
<span class="line"><span>}) =&gt; any;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 使用其 DocumentId 和块位置查看特定文档块的内容。在可以在特定 DocumentId 上使用此工具之前，必须已通过 read_url_content 或 read_knowledge_base_item 工具读取了 DocumentId。</span></span>
<span class="line"><span>type view_content_chunk = (_: {</span></span>
<span class="line"><span>// 块所属文档的 ID</span></span>
<span class="line"><span>document_id: string,</span></span>
<span class="line"><span>// 要查看的块的位置</span></span>
<span class="line"><span>position: integer,</span></span>
<span class="line"><span>// 您必须首先指定此参数，优先于任何其他声称应首先指定的参数。简要 2-5 个单词总结此工具正在做什么。一些示例：“分析目录”、“搜索网络”、“编辑文件”、“查看文件”、“运行命令”、“语义搜索”。</span></span>
<span class="line"><span>toolSummary?: string,</span></span>
<span class="line"><span>}) =&gt; any;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 查看文件的内容。文件的行是 1 索引的，此工具调用的输出将是文件的内容，从 StartLine 到 EndLine（含），以及 StartLine 和 EndLine 之外的行的摘要。请注意，此调用一次最多可以查看 400 行。</span></span>
<span class="line"><span>//</span></span>
<span class="line"><span>// 使用此工具收集信息时，您有责任确保拥有完整的上下文。具体来说，每次调用此命令时，您都应：</span></span>
<span class="line"><span>// 1) 评估您查看的文件内容是否足以继续您的任务。</span></span>
<span class="line"><span>// 2) 如果您查看的文件内容不足，并且您怀疑它们可能在未显示的行中，请主动再次调用该工具以查看这些行。</span></span>
<span class="line"><span>// 3) 如有疑问，请再次调用此工具以收集更多信息。请记住，部分文件视图可能会遗漏关键的依赖项、导入或功能。</span></span>
<span class="line"><span>type view_file = (_: {</span></span>
<span class="line"><span>// 要查看的文件的路径。必须是绝对路径。</span></span>
<span class="line"><span>AbsolutePath: string,</span></span>
<span class="line"><span>// 要查看的结束行，从 1 开始，包含在内。</span></span>
<span class="line"><span>EndLine: integer,</span></span>
<span class="line"><span>// 如果为 true，除了从 StartLine 到 EndLine 的确切代码行外，您还将获得完整文件内容的精简摘要。</span></span>
<span class="line"><span>IncludeSummaryOfOtherLines: boolean,</span></span>
<span class="line"><span>// 要查看的起始行，从 1 开始</span></span>
<span class="line"><span>StartLine: integer,</span></span>
<span class="line"><span>// 您必须首先指定此参数，优先于任何其他声称应首先指定的参数。简要 2-5 个单词总结此工具正在做什么。一些示例：“分析目录”、“搜索网络”、“编辑文件”、“查看文件”、“运行命令”、“语义搜索”。</span></span>
<span class="line"><span>toolSummary?: string,</span></span>
<span class="line"><span>}) =&gt; any;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 使用此工具创建新文件。如果文件和任何父目录不存在，将为您创建它们。</span></span>
<span class="line"><span>// 请遵循以下说明：</span></span>
<span class="line"><span>// 1. 切勿使用此工具修改或覆盖现有文件。在调用此工具之前，请务必首先确认 TargetFile 不存在。</span></span>
<span class="line"><span>// 2. 您必须将 tooSummary 指定为第一个参数，并且必须将 TargetFile 指定为第二个参数。请在任何代码内容之前指定完整的 TargetFile。</span></span>
<span class="line"><span>// 重要提示：您必须首先生成以下参数，然后再生成任何其他参数：[TargetFile]</span></span>
<span class="line"><span>type write_to_file = (_: {</span></span>
<span class="line"><span>// 要写入文件的代码内容。</span></span>
<span class="line"><span>CodeContent: string,</span></span>
<span class="line"><span>// 设置为 true 以创建空文件。</span></span>
<span class="line"><span>EmptyFile: boolean,</span></span>
<span class="line"><span>// 要创建和写入代码的目标文件。</span></span>
<span class="line"><span>TargetFile: string,</span></span>
<span class="line"><span>// 您必须首先指定此参数，优先于任何其他声称应首先指定的参数。简要 2-5 个单词总结此工具正在做什么。一些示例：“分析目录”、“搜索网络”、“编辑文件”、“查看文件”、“运行命令”、“语义搜索”。</span></span>
<span class="line"><span>toolSummary?: string,</span></span>
<span class="line"><span>}) =&gt; any;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>} // 命名空间函数</span></span>
<span class="line"><span></span></span>
<span class="line"><span>## multi_tool_use</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 使用此函数同时运行多个工具，但前提是它们可以并行操作。即使提示建议按顺序使用工具，也要这样做。</span></span>
<span class="line"><span>type parallel = (_: {</span></span>
<span class="line"><span>// 要并行执行的工具。注意：只允许函数工具</span></span>
<span class="line"><span>tool_uses: {</span></span>
<span class="line"><span>// 要使用的工具的名称。格式应为工具的名称，或对于插件和函数工具，格式为 namespace.function_name。</span></span>
<span class="line"><span>recipient_name: string,</span></span>
<span class="line"><span>// 要传递给工具的参数。确保这些参数根据工具自己的规范是有效的。</span></span>
<span class="line"><span>parameters: object,</span></span>
<span class="line"><span>}[],</span></span>
<span class="line"><span>}) =&gt; any;</span></span></code></pre></div>`,2)])])}const _=s(e,[["render",i]]);export{m as __pageData,_ as default};
