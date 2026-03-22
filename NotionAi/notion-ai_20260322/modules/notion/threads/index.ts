/*
Thread tools for script agents:
- queryThreads: list recent chat threads for the current agent.
- investigateThread: analyze a prior thread transcript.
- createAndRunThread: run a sub-agent and return its response.
*/

export type ThreadSummary = {
	url: string
	createdTime: string
	title?: string
}

/*
List recent threads for the current agent. Filters are optional.

- agentUrl is optional; when omitted, defaults to the current agent.
- timeStart/timeEnd are ISO-8601 datetime strings.
*/
export type QueryThreads = (args: {
	agentUrl?: string
	limit?: number
	timeStart?: string
	timeEnd?: string
}) => Promise<{
	threads: Array<ThreadSummary>
}>

/*
Investigate a prior agent thread using specific instructions.
*/
export type InvestigateThread = (args: {
	threadUrl: string
	instructions: string
}) => Promise<{
	analysis: string
}>

/*
Run a sub-agent synchronously and wait for its response.

- Call this as `connections.notion.createAndRunThread({ ... })`.
- Omit agentUrl to target "self":
  - If you are a personal agent, this runs the personal agent.
  - If you are a custom agent, this runs the custom agent.
- Personal agents may target custom agents by URL.
- Custom agents may only target themselves or other authorized agents (The request to create and run thread will be denied if you are not authorized to communicate with the target agent)
- threadUrl can be used to continue an existing sub-agent thread.
*/
export type CreateAndRunThread = (args: {
	agentUrl?: string // Custom agent URL, "personal-agent", or omitted for self.
	threadUrl?: string // Optional existing thread to continue.
	instructions: string // Message/instructions to send to the agent.
}) => Promise<{
	threadUrl: string
	response: string
}>

export type Module = {
	queryThreads: QueryThreads
	investigateThread: InvestigateThread
	createAndRunThread: CreateAndRunThread
}
