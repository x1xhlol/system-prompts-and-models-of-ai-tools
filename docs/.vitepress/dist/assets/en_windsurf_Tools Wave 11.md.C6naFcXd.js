import{_ as s,c as a,o as e,ae as t}from"./chunks/framework.CBTkueSR.js";const m=JSON.parse('{"title":"","description":"","frontmatter":{},"headers":[],"relativePath":"en/windsurf/Tools Wave 11.md","filePath":"en/windsurf/Tools Wave 11.md"}'),i={name:"en/windsurf/Tools Wave 11.md"};function p(l,n,o,r,c,h){return e(),a("div",null,[...n[0]||(n[0]=[t(`<h2 id="tools-wave-11-txt" tabindex="-1">Tools Wave 11.txt <a class="header-anchor" href="#tools-wave-11-txt" aria-label="Permalink to &quot;Tools Wave 11.txt&quot;">​</a></h2><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>// Spin up a browser preview for a web server. This allows the USER to interact with the web server normally as well as provide console logs and other information from the web server to Cascade. Note that this tool call will not automatically open the browser preview for the USER, they must click one of the provided buttons to open it in the browser.</span></span>
<span class="line"><span>type browser_preview = (_: {</span></span>
<span class="line"><span>// A short name 3-5 word name for the target web server. Should be title-cased e.g. &#39;Personal Website&#39;. Format as a simple string, not as markdown; and please output the title directly, do not prefix it with &#39;Title:&#39; or anything similar.</span></span>
<span class="line"><span>Name: string,</span></span>
<span class="line"><span>// The URL of the target web server to provide a browser preview for. This should contain the scheme (e.g. http:// or https://), domain (e.g. localhost or 127.0.0.1), and port (e.g. :8080) but no path.</span></span>
<span class="line"><span>Url: string,</span></span>
<span class="line"><span>// You must specify this argument first over all other arguments, this takes precendence in case any other arguments say they should be specified first. Brief 2-5 word summary of what this tool is doing. Some examples: &#39;analyzing directory&#39;, &#39;searching the web&#39;, &#39;editing file&#39;, &#39;viewing file&#39;, &#39;running command&#39;, &#39;semantic searching&#39;.</span></span>
<span class="line"><span>toolSummary?: string,</span></span>
<span class="line"><span>}) =&gt; any;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// Retrieve the console logs of a browser page that is already open in Windsurf Browser.</span></span>
<span class="line"><span>type capture_browser_console_logs = (_: {</span></span>
<span class="line"><span>// page_id of the Browser page to capture console logs of.</span></span>
<span class="line"><span>PageId: string,</span></span>
<span class="line"><span>// You must specify this argument first over all other arguments, this takes precendence in case any other arguments say they should be specified first. Brief 2-5 word summary of what this tool is doing. Some examples: &#39;analyzing directory&#39;, &#39;searching the web&#39;, &#39;editing file&#39;, &#39;viewing file&#39;, &#39;running command&#39;, &#39;semantic searching&#39;.</span></span>
<span class="line"><span>toolSummary?: string,</span></span>
<span class="line"><span>}) =&gt; any;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// Capture a screenshot of the current viewport of a browser page that is already open in Windsurf Browser.</span></span>
<span class="line"><span>type capture_browser_screenshot = (_: {</span></span>
<span class="line"><span>// page_id of the Browser page to capture a screenshot of.</span></span>
<span class="line"><span>PageId: string,</span></span>
<span class="line"><span>// You must specify this argument first over all other arguments, this takes precendence in case any other arguments say they should be specified first. Brief 2-5 word summary of what this tool is doing. Some examples: &#39;analyzing directory&#39;, &#39;searching the web&#39;, &#39;editing file&#39;, &#39;viewing file&#39;, &#39;running command&#39;, &#39;semantic searching&#39;.</span></span>
<span class="line"><span>toolSummary?: string,</span></span>
<span class="line"><span>}) =&gt; any;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// Check the status of the deployment using its windsurf_deployment_id for a web application and determine if the application build has succeeded and whether it has been claimed. Do not run this unless asked by the user. It must only be run after a deploy_web_app tool call.</span></span>
<span class="line"><span>type check_deploy_status = (_: {</span></span>
<span class="line"><span>// The Windsurf deployment ID for the deploy we want to check status for. This is NOT a project_id.</span></span>
<span class="line"><span>WindsurfDeploymentId: string,</span></span>
<span class="line"><span>// You must specify this argument first over all other arguments, this takes precendence in case any other arguments say they should be specified first. Brief 2-5 word summary of what this tool is doing. Some examples: &#39;analyzing directory&#39;, &#39;searching the web&#39;, &#39;editing file&#39;, &#39;viewing file&#39;, &#39;running command&#39;, &#39;semantic searching&#39;.</span></span>
<span class="line"><span>toolSummary?: string,</span></span>
<span class="line"><span>}) =&gt; any;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// Find snippets of code from the codebase most relevant to the search query. This performs best when the search query is more precise and relating to the function or purpose of code. Results will be poor if asking a very broad question, such as asking about the general &#39;framework&#39; or &#39;implementation&#39; of a large component or system. Will only show the full code contents of the top items, and they may also be truncated. For other items it will only show the docstring and signature. Use view_code_item with the same path and node name to view the full code contents for any item. Note that if you try to search over more than 500 files, the quality of the search results will be substantially worse. Try to only search over a large number of files if it is really necessary.</span></span>
<span class="line"><span>type codebase_search = (_: {</span></span>
<span class="line"><span>// Search query</span></span>
<span class="line"><span>Query: string,</span></span>
<span class="line"><span>// List of absolute paths to directories to search over</span></span>
<span class="line"><span>TargetDirectories: string[],</span></span>
<span class="line"><span>// You must specify this argument first over all other arguments, this takes precendence in case any other arguments say they should be specified first. Brief 2-5 word summary of what this tool is doing. Some examples: &#39;analyzing directory&#39;, &#39;searching the web&#39;, &#39;editing file&#39;, &#39;viewing file&#39;, &#39;running command&#39;, &#39;semantic searching&#39;.</span></span>
<span class="line"><span>toolSummary?: string,</span></span>
<span class="line"><span>}) =&gt; any;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// Get the status of a previously executed terminal command by its ID. Returns the current status (running, done), output lines as specified by output priority, and any error if present. Do not try to check the status of any IDs other than Background command IDs.</span></span>
<span class="line"><span>type command_status = (_: {</span></span>
<span class="line"><span>// ID of the command to get status for</span></span>
<span class="line"><span>CommandId: string,</span></span>
<span class="line"><span>// Number of characters to view. Make this as small as possible to avoid excessive memory usage.</span></span>
<span class="line"><span>OutputCharacterCount: integer,</span></span>
<span class="line"><span>// Number of seconds to wait for command completion before getting the status. If the command completes before this duration, this tool call will return early. Set to 0 to get the status of the command immediately. If you are only interested in waiting for command completion, set to 60.</span></span>
<span class="line"><span>// You must specify this argument first over all other arguments, this takes precendence in case any other arguments say they should be specified first. Brief 2-5 word summary of what this tool is doing. Some examples: &#39;analyzing directory&#39;, &#39;searching the web&#39;, &#39;editing file&#39;, &#39;viewing file&#39;, &#39;running command&#39;, &#39;semantic searching&#39;.</span></span>
<span class="line"><span>WaitDurationSeconds: integer,</span></span>
<span class="line"><span>toolSummary?: string,</span></span>
<span class="line"><span>}) =&gt; any;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// Save important context relevant to the USER and their task to a memory database.</span></span>
<span class="line"><span>// Examples of context to save:</span></span>
<span class="line"><span>// - USER preferences</span></span>
<span class="line"><span>// - Explicit USER requests to remember something or otherwise alter your behavior</span></span>
<span class="line"><span>// - Important code snippets</span></span>
<span class="line"><span>// - Technical stacks</span></span>
<span class="line"><span>// - Project structure</span></span>
<span class="line"><span>// - Major milestones or features</span></span>
<span class="line"><span>// - New design patterns and architectural decisions</span></span>
<span class="line"><span>// - Any other information that you think is important to remember.</span></span>
<span class="line"><span>// Before creating a new memory, first check to see if a semantically related memory already exists in the database. If found, update it instead of creating a duplicate.</span></span>
<span class="line"><span>// Use this tool to delete incorrect memories when necessary.</span></span>
<span class="line"><span>type create_memory = (_: {</span></span>
<span class="line"><span>// The type of action to take on the MEMORY. Must be one of &#39;create&#39;, &#39;update&#39;, or &#39;delete&#39;</span></span>
<span class="line"><span>Action: &quot;create&quot; | &quot;update&quot; | &quot;delete&quot;,</span></span>
<span class="line"><span>// Content of a new or updated MEMORY. When deleting an existing MEMORY, leave this blank.</span></span>
<span class="line"><span>Content: string,</span></span>
<span class="line"><span>// CorpusNames of the workspaces associated with the MEMORY. Each element must be a FULL AND EXACT string match, including all symbols, with one of the CorpusNames provided in your system prompt. Only used when creating a new MEMORY.</span></span>
<span class="line"><span>CorpusNames: string[],</span></span>
<span class="line"><span>// Id of an existing MEMORY to update or delete. When creating a new MEMORY, leave this blank.</span></span>
<span class="line"><span>Id: string,</span></span>
<span class="line"><span>// Tags to associate with the MEMORY. These will be used to filter or retrieve the MEMORY. Only used when creating a new MEMORY. Use snake_case.</span></span>
<span class="line"><span>Tags: string[],</span></span>
<span class="line"><span>// Descriptive title for a new or updated MEMORY. This is required when creating or updating a memory. When deleting an existing MEMORY, leave this blank.</span></span>
<span class="line"><span>Title: string,</span></span>
<span class="line"><span>// Set to true if the user explicitly asked you to create/modify this memory.</span></span>
<span class="line"><span>UserTriggered: boolean,</span></span>
<span class="line"><span>// You must specify this argument first over all other arguments, this takes precendence in case any other arguments say they should be specified first. Brief 2-5 word summary of what this tool is doing. Some examples: &#39;analyzing directory&#39;, &#39;searching the web&#39;, &#39;editing file&#39;, &#39;viewing file&#39;, &#39;running command&#39;, &#39;semantic searching&#39;.</span></span>
<span class="line"><span>toolSummary?: string,</span></span>
<span class="line"><span>}) =&gt; any;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// Deploy a JavaScript web application to a deployment provider like Netlify. Site does not need to be built. Only the source files are required. Make sure to run the read_deployment_config tool first and that all missing files are created before attempting to deploy. If you are deploying to an existing site, use the project_id to identify the site. If you are deploying a new site, leave the project_id empty.</span></span>
<span class="line"><span>type deploy_web_app = (_: {</span></span>
<span class="line"><span>// The framework of the web application.</span></span>
<span class="line"><span>Framework: &quot;eleventy&quot; | &quot;angular&quot; | &quot;astro&quot; | &quot;create-react-app&quot; | &quot;gatsby&quot; | &quot;gridsome&quot; | &quot;grunt&quot; | &quot;hexo&quot; | &quot;hugo&quot; | &quot;hydrogen&quot; | &quot;jekyll&quot; | &quot;middleman&quot; | &quot;mkdocs&quot; | &quot;nextjs&quot; | &quot;nuxtjs&quot; | &quot;remix&quot; | &quot;sveltekit&quot; | &quot;svelte&quot;,</span></span>
<span class="line"><span>// The project ID of the web application if it exists in the deployment configuration file. Leave this EMPTY for new sites or if the user would like to rename a site. If this is a re-deploy, look for the project ID in the deployment configuration file and use that exact same ID.</span></span>
<span class="line"><span>ProjectId: string,</span></span>
<span class="line"><span>// The full absolute project path of the web application.</span></span>
<span class="line"><span>ProjectPath: string,</span></span>
<span class="line"><span>// Subdomain or project name used in the URL. Leave this EMPTY if you are deploying to an existing site using the project_id. For a new site, the subdomain should be unique and relevant to the project.</span></span>
<span class="line"><span>// You must specify this argument first over all other arguments, this takes precendence in case any other arguments say they should be specified first. Brief 2-5 word summary of what this tool is doing. Some examples: &#39;analyzing directory&#39;, &#39;searching the web&#39;, &#39;editing file&#39;, &#39;viewing file&#39;, &#39;running command&#39;, &#39;semantic searching&#39;.</span></span>
<span class="line"><span>Subdomain: string,</span></span>
<span class="line"><span>toolSummary?: string,</span></span>
<span class="line"><span>}) =&gt; any;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// Search for files and subdirectories within a specified directory using fd.</span></span>
<span class="line"><span>// Search uses smart case and will ignore gitignored files by default.</span></span>
<span class="line"><span>// Pattern and Excludes both use the glob format. If you are searching for Extensions, there is no need to specify both Pattern AND Extensions.</span></span>
<span class="line"><span>// To avoid overwhelming output, the results are capped at 50 matches. Use the various arguments to filter the search scope as needed.</span></span>
<span class="line"><span>// Results will include the type, size, modification time, and relative path.</span></span>
<span class="line"><span>type find_by_name = (_: {</span></span>
<span class="line"><span>// Optional, exclude files/directories that match the given glob patterns</span></span>
<span class="line"><span>Excludes: string[],</span></span>
<span class="line"><span>// Optional, file extensions to include (without leading .), matching paths must match at least one of the included extensions</span></span>
<span class="line"><span>Extensions: string[],</span></span>
<span class="line"><span>// Optional, whether the full absolute path must match the glob pattern, default: only filename needs to match. Take care when specifying glob patterns with this flag on, e.g when FullPath is on, pattern &#39;*.py&#39; will not match to the file &#39;/foo/bar.py&#39;, but pattern &#39;**/*.py&#39; will match.</span></span>
<span class="line"><span>FullPath: boolean,</span></span>
<span class="line"><span>// Optional, maximum depth to search</span></span>
<span class="line"><span>MaxDepth: integer,</span></span>
<span class="line"><span>// Optional, Pattern to search for, supports glob format</span></span>
<span class="line"><span>Pattern: string,</span></span>
<span class="line"><span>// The directory to search within</span></span>
<span class="line"><span>SearchDirectory: string,</span></span>
<span class="line"><span>// Optional, type filter, enum=file,directory,any</span></span>
<span class="line"><span>Type: string,</span></span>
<span class="line"><span>// You must specify this argument first over all other arguments, this takes precendence in case any other arguments say they should be specified first. Brief 2-5 word summary of what this tool is doing. Some examples: &#39;analyzing directory&#39;, &#39;searching the web&#39;, &#39;editing file&#39;, &#39;viewing file&#39;, &#39;running command&#39;, &#39;semantic searching&#39;.</span></span>
<span class="line"><span>toolSummary?: string,</span></span>
<span class="line"><span>}) =&gt; any;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// Get the DOM tree of an open page in the Windsurf Browser.</span></span>
<span class="line"><span>type get_dom_tree = (_: {</span></span>
<span class="line"><span>// page_id of the Browser page to get the DOM tree of</span></span>
<span class="line"><span>PageId: string,</span></span>
<span class="line"><span>// You must specify this argument first over all other arguments, this takes precendence in case any other arguments say they should be specified first. Brief 2-5 word summary of what this tool is doing. Some examples: &#39;analyzing directory&#39;, &#39;searching the web&#39;, &#39;editing file&#39;, &#39;viewing file&#39;, &#39;running command&#39;, &#39;semantic searching&#39;.</span></span>
<span class="line"><span>toolSummary?: string,</span></span>
<span class="line"><span>}) =&gt; any;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// Use ripgrep to find exact pattern matches within files or directories.</span></span>
<span class="line"><span>// Results are returned in JSON format and for each match you will receive the:</span></span>
<span class="line"><span>// - Filename</span></span>
<span class="line"><span>// - LineNumber</span></span>
<span class="line"><span>// - LineContent: the content of the matching line</span></span>
<span class="line"><span>// Total results are capped at 50 matches. Use the Includes option to filter by file type or specific paths to refine your search.</span></span>
<span class="line"><span>type grep_search = (_: {</span></span>
<span class="line"><span>// If true, performs a case-insensitive search.</span></span>
<span class="line"><span>CaseInsensitive: boolean,</span></span>
<span class="line"><span>// Glob patterns to filter files found within the &#39;SearchPath&#39;, if &#39;SearchPath&#39; is a directory. For example, &#39;*.go&#39; to only include Go files, or &#39;!**/vendor/*&#39; to exclude vendor directories. This is NOT for specifying the primary search directory; use &#39;SearchPath&#39; for that. Leave empty if no glob filtering is needed or if &#39;SearchPath&#39; is a single file.</span></span>
<span class="line"><span>Includes: string[],</span></span>
<span class="line"><span>// If true, treats Query as a regular expression pattern with special characters like *, +, (, etc. having regex meaning. If false, treats Query as a literal string where all characters are matched exactly. Use false for normal text searches and true only when you specifically need regex functionality.</span></span>
<span class="line"><span>IsRegex: boolean,</span></span>
<span class="line"><span>// If true, returns each line that matches the query, including line numbers and snippets of matching lines (equivalent to &#39;git grep -nI&#39;). If false, only returns the names of files containing the query (equivalent to &#39;git grep -l&#39;).</span></span>
<span class="line"><span>MatchPerLine: boolean,</span></span>
<span class="line"><span>// The search term or pattern to look for within files.</span></span>
<span class="line"><span>Query: string,</span></span>
<span class="line"><span>// The path to search. This can be a directory or a file. This is a required parameter.</span></span>
<span class="line"><span>SearchPath: string,</span></span>
<span class="line"><span>// You must specify this argument first over all other arguments, this takes precendence in case any other arguments say they should be specified first. Brief 2-5 word summary of what this tool is doing. Some examples: &#39;analyzing directory&#39;, &#39;searching the web&#39;, &#39;editing file&#39;, &#39;viewing file&#39;, &#39;running command&#39;, &#39;semantic searching&#39;.</span></span>
<span class="line"><span>toolSummary?: string,</span></span>
<span class="line"><span>}) =&gt; any;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// List all open pages in Windsurf Browser and their metadata (page_id, url, title, viewport size, etc.).</span></span>
<span class="line"><span>type list_browser_pages = (_: {</span></span>
<span class="line"><span>// You must specify this argument first over all other arguments, this takes precendence in case any other arguments say they should be specified first. Brief 2-5 word summary of what this tool is doing. Some examples: &#39;analyzing directory&#39;, &#39;searching the web&#39;, &#39;editing file&#39;, &#39;viewing file&#39;, &#39;running command&#39;, &#39;semantic searching&#39;.</span></span>
<span class="line"><span>toolSummary?: string,</span></span>
<span class="line"><span>}) =&gt; any;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// List the contents of a directory. Directory path must be an absolute path to a directory that exists. For each child in the directory, output will have: relative path to the directory, whether it is a directory or file, size in bytes if file, and number of children (recursive) if directory.</span></span>
<span class="line"><span>type list_dir = (_: {</span></span>
<span class="line"><span>// Path to list contents of, should be absolute path to a directory that exists.</span></span>
<span class="line"><span>DirectoryPath: string,</span></span>
<span class="line"><span>// You must specify this argument first over all other arguments, this takes precendence in case any other arguments say they should be specified first. Brief 2-5 word summary of what this tool is doing. Some examples: &#39;analyzing directory&#39;, &#39;searching the web&#39;, &#39;editing file&#39;, &#39;viewing file&#39;, &#39;running command&#39;, &#39;semantic searching&#39;.</span></span>
<span class="line"><span>toolSummary?: string,</span></span>
<span class="line"><span>}) =&gt; any;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// Lists the available resources from an MCP server.</span></span>
<span class="line"><span>type list_resources = (_: {</span></span>
<span class="line"><span>// Name of the server to list available resources from.</span></span>
<span class="line"><span>ServerName: string,</span></span>
<span class="line"><span>// You must specify this argument first over all other arguments, this takes precendence in case any other arguments say they should be specified first. Brief 2-5 word summary of what this tool is doing. Some examples: &#39;analyzing directory&#39;, &#39;searching the web&#39;, &#39;editing file&#39;, &#39;viewing file&#39;, &#39;running command&#39;, &#39;semantic searching&#39;.</span></span>
<span class="line"><span>toolSummary?: string,</span></span>
<span class="line"><span>}) =&gt; any;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// Open a URL in Windsurf Browser to view the page contents of a URL in a rendered format.</span></span>
<span class="line"><span>type open_browser_url = (_: {</span></span>
<span class="line"><span>// The URL to open in the user&#39;s browser.</span></span>
<span class="line"><span>Url: string,</span></span>
<span class="line"><span>// You must specify this argument first over all other arguments, this takes precendence in case any other arguments say they should be specified first. Brief 2-5 word summary of what this tool is doing. Some examples: &#39;analyzing directory&#39;, &#39;searching the web&#39;, &#39;editing file&#39;, &#39;viewing file&#39;, &#39;running command&#39;, &#39;semantic searching&#39;.</span></span>
<span class="line"><span>toolSummary?: string,</span></span>
<span class="line"><span>}) =&gt; any;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// Read an open page in the Windsurf Browser.</span></span>
<span class="line"><span>type read_browser_page = (_: {</span></span>
<span class="line"><span>// page_id of the Browser page to read</span></span>
<span class="line"><span>PageId: string,</span></span>
<span class="line"><span>// You must specify this argument first over all other arguments, this takes precendence in case any other arguments say they should be specified first. Brief 2-5 word summary of what this tool is doing. Some examples: &#39;analyzing directory&#39;, &#39;searching the web&#39;, &#39;editing file&#39;, &#39;viewing file&#39;, &#39;running command&#39;, &#39;semantic searching&#39;.</span></span>
<span class="line"><span>toolSummary?: string,</span></span>
<span class="line"><span>}) =&gt; any;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// Read the deployment configuration for a web application and determine if the application is ready to be deployed. Should only be used in preparation for the deploy_web_app tool.</span></span>
<span class="line"><span>type read_deployment_config = (_: {</span></span>
<span class="line"><span>// The full absolute project path of the web application.</span></span>
<span class="line"><span>ProjectPath: string,</span></span>
<span class="line"><span>// You must specify this argument first over all other arguments, this takes precendence in case any other arguments say they should be specified first. Brief 2-5 word summary of what this tool is doing. Some examples: &#39;analyzing directory&#39;, &#39;searching the web&#39;, &#39;editing file&#39;, &#39;viewing file&#39;, &#39;running command&#39;, &#39;semantic searching&#39;.</span></span>
<span class="line"><span>toolSummary?: string,</span></span>
<span class="line"><span>}) =&gt; any;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// Retrieves a specified resource&#39;s contents.</span></span>
<span class="line"><span>type read_resource = (_: {</span></span>
<span class="line"><span>// Name of the server to read the resource from.</span></span>
<span class="line"><span>ServerName: string,</span></span>
<span class="line"><span>// Unique identifier for the resource.</span></span>
<span class="line"><span>Uri: string,</span></span>
<span class="line"><span>// You must specify this argument first over all other arguments, this takes precendence in case any other arguments say they should be specified first. Brief 2-5 word summary of what this tool is doing. Some examples: &#39;analyzing directory&#39;, &#39;searching the web&#39;, &#39;editing file&#39;, &#39;viewing file&#39;, &#39;running command&#39;, &#39;semantic searching&#39;.</span></span>
<span class="line"><span>toolSummary?: string,</span></span>
<span class="line"><span>}) =&gt; any;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// Reads the contents of a terminal given its process ID.</span></span>
<span class="line"><span>type read_terminal = (_: {</span></span>
<span class="line"><span>// Name of the terminal to read.</span></span>
<span class="line"><span>Name: string,</span></span>
<span class="line"><span>// Process ID of the terminal to read.</span></span>
<span class="line"><span>ProcessID: string,</span></span>
<span class="line"><span>// You must specify this argument first over all other arguments, this takes precendence in case any other arguments say they should be specified first. Brief 2-5 word summary of what this tool is doing. Some examples: &#39;analyzing directory&#39;, &#39;searching the web&#39;, &#39;editing file&#39;, &#39;viewing file&#39;, &#39;running command&#39;, &#39;semantic searching&#39;.</span></span>
<span class="line"><span>toolSummary?: string,</span></span>
<span class="line"><span>}) =&gt; any;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// Read content from a URL. URL must be an HTTP or HTTPS URL that points to a valid internet resource accessible via web browser.</span></span>
<span class="line"><span>type read_url_content = (_: {</span></span>
<span class="line"><span>// URL to read content from</span></span>
<span class="line"><span>Url: string,</span></span>
<span class="line"><span>// You must specify this argument first over all other arguments, this takes precendence in case any other arguments say they should be specified first. Brief 2-5 word summary of what this tool is doing. Some examples: &#39;analyzing directory&#39;, &#39;searching the web&#39;, &#39;editing file&#39;, &#39;viewing file&#39;, &#39;running command&#39;, &#39;semantic searching&#39;.</span></span>
<span class="line"><span>toolSummary?: string,</span></span>
<span class="line"><span>}) =&gt; any;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// Use this tool to edit an existing file.. Follow these rules:</span></span>
<span class="line"><span>// 1. Do NOT make multiple parallel calls to this tool for the same file.</span></span>
<span class="line"><span>// 2. To edit multiple, non-adjacent lines of code in the same file, make a single call to this tool. Specify each edit as a separate ReplacementChunk.</span></span>
<span class="line"><span>// 3. For each ReplacementChunk, specify TargetContent and ReplacementContent. In TargetContent, specify the precise lines of code to edit. These lines MUST EXACTLY MATCH text in the existing file content. In ReplacementContent, specify the replacement content for the specified target content. This must be a complete drop-in replacement of the TargetContent, with necessary modifications made.</span></span>
<span class="line"><span>// 4. If you are making multiple edits across a single file, specify multiple separate ReplacementChunks. DO NOT try to replace the entire existing content with the new content, this is very expensive.</span></span>
<span class="line"><span>// 5. You may not edit file extensions: [.ipynb]</span></span>
<span class="line"><span>// IMPORTANT: You must generate the following arguments first, before any others: [TargetFile]</span></span>
<span class="line"><span>type replace_file_content = (_: {</span></span>
<span class="line"><span>// Markdown language for the code block, e.g &#39;python&#39; or &#39;javascript&#39;</span></span>
<span class="line"><span>CodeMarkdownLanguage: string,</span></span>
<span class="line"><span>// A description of the changes that you are making to the file.</span></span>
<span class="line"><span>Instruction: string,</span></span>
<span class="line"><span>// A list of chunks to replace. It is best to provide multiple chunks for non-contiguous edits if possible. This must be a JSON array, not a string.</span></span>
<span class="line"><span>ReplacementChunks: Array&lt;</span></span>
<span class="line"><span>{</span></span>
<span class="line"><span>// If true, multiple occurrences of &#39;targetContent&#39; will be replaced by &#39;replacementContent&#39; if they are found. Otherwise if multiple occurences are found, an error will be returned.</span></span>
<span class="line"><span>AllowMultiple: boolean,</span></span>
<span class="line"><span>// The content to replace the target content with.</span></span>
<span class="line"><span>ReplacementContent: string,</span></span>
<span class="line"><span>// The exact string to be replaced. This must be the exact character-sequence to be replaced, including whitespace. Be very careful to include any leading whitespace otherwise this will not work at all. If AllowMultiple is not true, then this must be a unique substring within the file, or else it will error.</span></span>
<span class="line"><span>TargetContent: string,</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span>&gt;,</span></span>
<span class="line"><span>// The target file to modify. Always specify the target file as the very first argument.</span></span>
<span class="line"><span>TargetFile: string,</span></span>
<span class="line"><span>// If applicable, IDs of lint errors this edit aims to fix (they&#39;ll have been given in recent IDE feedback). If you believe the edit could fix lints, do specify lint IDs; if the edit is wholly unrelated, do not. A rule of thumb is, if your edit was influenced by lint feedback, include lint IDs. Exercise honest judgement here.</span></span>
<span class="line"><span>TargetLintErrorIds?: string[],</span></span>
<span class="line"><span>// You must specify this argument first over all other arguments, this takes precendence in case any other arguments say they should be specified first. Brief 2-5 word summary of what this tool is doing. Some examples: &#39;analyzing directory&#39;, &#39;searching the web&#39;, &#39;editing file&#39;, &#39;viewing file&#39;, &#39;running command&#39;, &#39;semantic searching&#39;.</span></span>
<span class="line"><span>toolSummary?: string,</span></span>
<span class="line"><span>}) =&gt; any;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// PROPOSE a command to run on behalf of the user. Operating System: windows. Shell: powershell.</span></span>
<span class="line"><span>// **NEVER PROPOSE A cd COMMAND**.</span></span>
<span class="line"><span>// If you have this tool, note that you DO have the ability to run commands directly on the USER&#39;s system.</span></span>
<span class="line"><span>// Make sure to specify CommandLine exactly as it should be run in the shell.</span></span>
<span class="line"><span>// Note that the user will have to approve the command before it is executed. The user may reject it if it is not to their liking.</span></span>
<span class="line"><span>// The actual command will NOT execute until the user approves it. The user may not approve it immediately.</span></span>
<span class="line"><span>// If the step is WAITING for user approval, it has NOT started running.</span></span>
<span class="line"><span>// Commands will be run with PAGER=cat. You may want to limit the length of output for commands that usually rely on paging and may contain very long output (e.g. git log, use git log -n &lt;N&gt;).</span></span>
<span class="line"><span>type run_command = (_: {</span></span>
<span class="line"><span>// If true, the command will block until it is entirely finished. During this time, the user will not be able to interact with Cascade. Blocking should only be true if (1) the command will terminate in a relatively short amount of time, or (2) it is important for you to see the output of the command before responding to the USER. Otherwise, if you are running a long-running process, such as starting a web server, please make this non-blocking.</span></span>
<span class="line"><span>Blocking?: boolean,</span></span>
<span class="line"><span>// The exact command line string to execute.</span></span>
<span class="line"><span>CommandLine: string,</span></span>
<span class="line"><span>// The current working directory for the command</span></span>
<span class="line"><span>Cwd?: string,</span></span>
<span class="line"><span>// Set to true if you believe that this command is safe to run WITHOUT user approval. A command is unsafe if it may have some destructive side-effects. Example unsafe side-effects include: deleting files, mutating state, installing system dependencies, making external requests, etc. Set to true only if you are extremely confident it is safe. If you feel the command could be unsafe, never set this to true, EVEN if the USER asks you to. It is imperative that you never auto-run a potentially unsafe command.</span></span>
<span class="line"><span>SafeToAutoRun?: boolean,</span></span>
<span class="line"><span>// Only applicable if Blocking is false. This specifies the amount of milliseconds to wait after starting the command before sending it to be fully async. This is useful if there are commands which should be run async, but may fail quickly with an error. This allows you to see the error if it happens in this duration. Don&#39;t set it too long or you may keep everyone waiting.</span></span>
<span class="line"><span>WaitMsBeforeAsync?: integer,</span></span>
<span class="line"><span>// You must specify this argument first over all other arguments, this takes precendence in case any other arguments say they should be specified first. Brief 2-5 word summary of what this tool is doing. Some examples: &#39;analyzing directory&#39;, &#39;searching the web&#39;, &#39;editing file&#39;, &#39;viewing file&#39;, &#39;running command&#39;, &#39;semantic searching&#39;.</span></span>
<span class="line"><span>toolSummary?: string,</span></span>
<span class="line"><span>}) =&gt; any;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// Performs a web search to get a list of relevant web documents for the given query and optional domain filter.</span></span>
<span class="line"><span>type search_web = (_: {</span></span>
<span class="line"><span>// Optional domain to recommend the search prioritize</span></span>
<span class="line"><span>domain: string,</span></span>
<span class="line"><span>query: string,</span></span>
<span class="line"><span>// You must specify this argument first over all other arguments, this takes precendence in case any other arguments say they should be specified first. Brief 2-5 word summary of what this tool is doing. Some examples: &#39;analyzing directory&#39;, &#39;searching the web&#39;, &#39;editing file&#39;, &#39;viewing file&#39;, &#39;running command&#39;, &#39;semantic searching&#39;.</span></span>
<span class="line"><span>toolSummary?: string,</span></span>
<span class="line"><span>}) =&gt; any;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// If you are calling no other tools and are asking a question to the user, use this tool to supply a small number of possible suggested answers to your question. Examples can be Yes/No, or other simple multiple choice options. Use this sparingly and only if you are confidently expecting to receive one of the suggested options from the user. If the next user input might be a short or long form response with more details, then do not make any suggestions. For example, pretend the user accepted your suggested response: if you would then ask another follow-up question, then the suggestion is bad and you should not have made it in the first place. Try not to use this many times in a row.</span></span>
<span class="line"><span>type suggested_responses = (_: {</span></span>
<span class="line"><span>// List of suggestions. Each should be at most a couple words, do not return more than 3 options.</span></span>
<span class="line"><span>Suggestions: string[],</span></span>
<span class="line"><span>// You must specify this argument first over all other arguments, this takes precendence in case any other arguments say they should be specified first. Brief 2-5 word summary of what this tool is doing. Some examples: &#39;analyzing directory&#39;, &#39;searching the web&#39;, &#39;analyzing directory&#39;, &#39;searching the web&#39;, &#39;editing file&#39;, &#39;viewing file&#39;, &#39;running command&#39;, &#39;semantic searching&#39;.</span></span>
<span class="line"><span>toolSummary?: string,</span></span>
<span class="line"><span>}) =&gt; any;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// Semantic search or retrieve trajectory. Trajectories are one of conversations. Returns chunks from the trajectory, scored, sorted, and filtered by relevance. Maximum number of chunks returned is 50. Call this tool when the user @mentions a @conversation. Do NOT call this tool with SearchType: &#39;user&#39;. IGNORE @activity mentions.</span></span>
<span class="line"><span>type trajectory_search = (_: {</span></span>
<span class="line"><span>// The ID of the trajectory to search or retrieve: cascade ID for conversations, trajectory ID for user activities.</span></span>
<span class="line"><span>ID: string,</span></span>
<span class="line"><span>// The query string to search for within the trajectory. An empty query will return all trajectory steps.</span></span>
<span class="line"><span>Query: string,</span></span>
<span class="line"><span>// The type of item to search or retrieve: &#39;cascade&#39; for conversations, or &#39;user&#39; for user activities.</span></span>
<span class="line"><span>SearchType: &quot;cascade&quot; | &quot;user&quot;,</span></span>
<span class="line"><span>// You must specify this argument first over all other arguments, this takes precendence in case any other arguments say they should be specified first. Brief 2-5 word summary of what this tool is doing. Some examples: &#39;analyzing directory&#39;, &#39;searching the web&#39;, &#39;editing file&#39;, &#39;viewing file&#39;, &#39;running command&#39;, &#39;semantic searching&#39;.</span></span>
<span class="line"><span>toolSummary?: string,</span></span>
<span class="line"><span>}) =&gt; any;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// View the content of up to 5 code item nodes in a file, each as a class or a function. You must use fully qualified code item names, such as those return by the grep_search or other tools. For example, if you have a class called \`Foo\` and you want to view the function definition \`bar\` in the \`Foo\` class, you would use \`Foo.bar\` as the NodeName. Do not request to view a symbol if the contents have been previously shown by the codebase_search tool. If the symbol is not found in a file, the tool will return an empty string instead.</span></span>
<span class="line"><span>type view_code_item = (_: {</span></span>
<span class="line"><span>// Absolute path to the node to view, e.g /path/to/file</span></span>
<span class="line"><span>File?: string,</span></span>
<span class="line"><span>// Path of the nodes within the file, e.g package.class.FunctionName</span></span>
<span class="line"><span>NodePaths: string[],</span></span>
<span class="line"><span>// You must specify this argument first over all other arguments, this takes precendence in case any other arguments say they should be specified first. Brief 2-5 word summary of what this tool is doing. Some examples: &#39;analyzing directory&#39;, &#39;searching the web&#39;, &#39;editing file&#39;, &#39;viewing file&#39;, &#39;running command&#39;, &#39;semantic searching&#39;.</span></span>
<span class="line"><span>toolSummary?: string,</span></span>
<span class="line"><span>}) =&gt; any;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// View a specific chunk of document content using its DocumentId and chunk position. The DocumentId must have already been read by the read_url_content or read_knowledge_base_item tool before this can be used on that particular DocumentId.</span></span>
<span class="line"><span>type view_content_chunk = (_: {</span></span>
<span class="line"><span>// The ID of the document that the chunk belongs to</span></span>
<span class="line"><span>document_id: string,</span></span>
<span class="line"><span>// The position of the chunk to view</span></span>
<span class="line"><span>position: integer,</span></span>
<span class="line"><span>// You must specify this argument first over all other arguments, this takes precendence in case any other arguments say they should be specified first. Brief 2-5 word summary of what this tool is doing. Some examples: &#39;analyzing directory&#39;, &#39;searching the web&#39;, &#39;editing file&#39;, &#39;viewing file&#39;, &#39;running command&#39;, &#39;semantic searching&#39;.</span></span>
<span class="line"><span>toolSummary?: string,</span></span>
<span class="line"><span>}) =&gt; any;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// View the contents of a file. The lines of the file are 1-indexed, and the output of this tool call will be the file contents from StartLine to EndLine (inclusive), together with a summary of the lines outside of StartLine and EndLine. Note that this call can view at most 400 lines at a time.</span></span>
<span class="line"><span>//</span></span>
<span class="line"><span>// When using this tool to gather information, it&#39;s your responsibility to ensure you have the COMPLETE context. Specifically, each time you call this command you should:</span></span>
<span class="line"><span>// 1) Assess if the file contents you viewed are sufficient to proceed with your task.</span></span>
<span class="line"><span>// 2) If the file contents you have viewed are insufficient, and you suspect they may be in lines not shown, proactively call the tool again to view those lines.</span></span>
<span class="line"><span>// 3) When in doubt, call this tool again to gather more information. Remember that partial file views may miss critical dependencies, imports, or functionality.</span></span>
<span class="line"><span>type view_file = (_: {</span></span>
<span class="line"><span>// Path to file to view. Must be an absolute path.</span></span>
<span class="line"><span>AbsolutePath: string,</span></span>
<span class="line"><span>// Endline to view, 1-indexed as usual, inclusive.</span></span>
<span class="line"><span>EndLine: integer,</span></span>
<span class="line"><span>// If true, you will also get a condensed summary of the full file contents in addition to the exact lines of code from StartLine to EndLine.</span></span>
<span class="line"><span>IncludeSummaryOfOtherLines: boolean,</span></span>
<span class="line"><span>// Startline to view, 1-indexed as usual</span></span>
<span class="line"><span>StartLine: integer,</span></span>
<span class="line"><span>// You must specify this argument first over all other arguments, this takes precendence in case any other arguments say they should be specified first. Brief 2-5 word summary of what this tool is doing. Some examples: &#39;analyzing directory&#39;, &#39;searching the web&#39;, &#39;editing file&#39;, &#39;viewing file&#39;, &#39;running command&#39;, &#39;semantic searching&#39;.</span></span>
<span class="line"><span>toolSummary?: string,</span></span>
<span class="line"><span>}) =&gt; any;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// Use this tool to create new files. The file and any parent directories will be created for you if they do not already exist.</span></span>
<span class="line"><span>// Follow these instructions:</span></span>
<span class="line"><span>// 1. NEVER use this tool to modify or overwrite existing files. Always first confirm that TargetFile does not exist before calling this tool.</span></span>
<span class="line"><span>// 2. You MUST specify tooSummary as the FIRST argument and you MUST specify TargetFile as the SECOND argument. Please specify the full TargetFile before any of the code contents.</span></span>
<span class="line"><span>// IMPORTANT: You must generate the following arguments first, before any others: [TargetFile]</span></span>
<span class="line"><span>type write_to_file = (_: {</span></span>
<span class="line"><span>// The code contents to write to the file.</span></span>
<span class="line"><span>CodeContent: string,</span></span>
<span class="line"><span>// Set this to true to create an empty file.</span></span>
<span class="line"><span>EmptyFile: boolean,</span></span>
<span class="line"><span>// The target file to create and write code to.</span></span>
<span class="line"><span>TargetFile: string,</span></span>
<span class="line"><span>// You must specify this argument first over all other arguments, this takes precendence in case any other arguments say they should be specified first. Brief 2-5 word summary of what this tool is doing. Some examples: &#39;analyzing directory&#39;, &#39;searching the web&#39;, &#39;editing file&#39;, &#39;viewing file&#39;, &#39;running command&#39;, &#39;semantic searching&#39;.</span></span>
<span class="line"><span>toolSummary?: string,</span></span>
<span class="line"><span>}) =&gt; any;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>} // namespace functions</span></span>
<span class="line"><span></span></span>
<span class="line"><span>## multi_tool_use</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// Use this function to run multiple tools simultaneously, but only if they can operate in parallel. Do this even if the prompt suggests using the tools sequentially.</span></span>
<span class="line"><span>type parallel = (_: {</span></span>
<span class="line"><span>// The tools to be executed in parallel. NOTE: only functions tools are permitted</span></span>
<span class="line"><span>tool_uses: {</span></span>
<span class="line"><span>// The name of the tool to use. The format should either be just the name of the tool, or in the format namespace.function_name for plugin and function tools.</span></span>
<span class="line"><span>recipient_name: string,</span></span>
<span class="line"><span>// The parameters to pass to the tool. Ensure these are valid according to the tool&#39;s own specifications.</span></span>
<span class="line"><span>parameters: object,</span></span>
<span class="line"><span>}[],</span></span>
<span class="line"><span>}) =&gt; any;</span></span></code></pre></div>`,2)])])}const d=s(i,[["render",p]]);export{m as __pageData,d as default};
