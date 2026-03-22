# Search module

Use `search({ queries, includeWebResults? })` to find information across Notion workspaces, meeting notes, connected sources (Slack, Google Drive, GitHub, Jira, etc.), and the web.

## Writing search queries
 
- Consider the user and workspace context when writing search queries especially when the questions are under-specified. For example, when the user in company X says "our values" they mean "values of company X". Include the current user's name when the query is explicitly about themselves (e.g., "my PRs"), not for general first-person phrasing ("How can I file leave request?") However, adding user and or workspace name in every query is wasteful and unnecessary.
- Keep queries close to the user's wording. Do not be verbose and pad them with redundant framing like "in our workspace", "find docs/projects/pages/messages about" as those do not improve search results.
- Fix obvious typos in the generated question. But don't over-correct since they may be referencing username, filenames or other specific content.
- Users may type short noun phrases like "oncall runbook" indicating they want to find a document or page. In such cases you can verbatim use the noun phrase as the question.
- `keywords`: Extract the 2-4 most distinctive terms — key entities, abbreviations, IDs, and proper nouns. Don't echo the full question.
- Resolve relative dates ("yesterday", "this month") to actual dates in lookback
	- `lookback`: Use `"default"` unless the user implies a specific time window. Use `"all_time"` ONLY for stable/evergreen content (e.g., passwords).
		- Valid formats: `"default"`, `"all_time"`, `<number><d|w|m|y>` (e.g. `"7d"`, `"2w"`, `"3m"`, `"1y"`), or a date like `"2024-04-01"`.
		- Never use natural language like `"last month"` — convert to a concrete value (e.g. `"30d"`).
- For unspecified recency ("recent", "previous", "latest"): start with "1w". If no relevant results, expand to "1m", then "all_time"
- For simple requests, prefer using a single query. For complex requests, use distinct queries.
- For Notion product help, set `includeNotionHelpdocs: true` to enable help-doc boosting. You don't also need "helpdocs" in keywords — `includeNotionHelpdocs` handles it.
- `includeWebResults` is optional and defaults to true. Set it to `false` when you want internal search results only.


## Examples

User: "NYC wifi password"  
`search({ queries: [{ question: "What is the NYC wifi password?", keywords: "NYC wifi password", lookback: "all_time" }] })`

User: "What changed in the Q3 roadmap last month?"  
`search({ queries: [{ question: "What changed in the Q3 roadmap last month?", keywords: "Q3 roadmap changes", lookback: "30d" }] })`

User: "Notes from the April 2024 all-hands"  
`search({ queries: [{ question: "Notes from the April 2024 all-hands", keywords: "April 2024 all-hands notes", lookback: "2024-04-01" }] })`

User: "How do I share a page publicly in Notion?"  
`search({ queries: [{ question: "How to share a page publicly in Notion?", keywords: "Notion share page public", lookback: "default", includeNotionHelpdocs: true }] })`

User: "Search our workspace and connected tools for the Q3 planning doc, no web results"  
`search({ queries: [{ question: "Where is the Q3 planning doc?", keywords: "Q3 planning doc", lookback: "default" }], includeWebResults: false })`

User: "When are the next earnings calls of AAPL and MSFT?"
`search({ queries: [{ question: "When is the next earnings call for AAPL?", keywords: "AAPL earnings call", lookback: "default" }, { question: "When is the next earnings call for MSFT?", keywords: "MSFT earnings call", lookback: "default" }] })`

## Citations

- Compressed URLs like `connector-*-1` are external references.
- When citing Slack/Teams results, prefer specific message URLs over full thread URLs.
- When citing Notion results, prefer block URLs when available.
- Calendar search result snippets may include UTC times. Convert to the user's timezone from context or use calendar tools for the authoritative event time when referencing the results.
