type AgentIcon =
	| { type: "agent_icon"; shape: string; color: string }
	| { type: "emoji"; emoji: string }
	| { type: "url"; url: string }

type AgentIntegration = {
	type: string
	name: string
	permissions?: Array<Record<string, unknown>>
	state?: Record<string, unknown>
}

type AgentTrigger = {
	enabled: boolean
	state: Record<string, unknown>
	integrationUrl?: string
}

type AgentConfiguration = {
	name?: string
	description?: string
	icon?: AgentIcon
	integrations?: Record<string, AgentIntegration>
	triggers?: Record<string, AgentTrigger>
}

type Agent = {
	agentUrl: string
	instructionsPageUrl: string
	configuration: AgentConfiguration
}

export type LoadAgent = (args: { url: string }) => Promise<Agent>

export type Module = {
	loadAgent: LoadAgent
}
