import type { Module as asanaModule } from "./modules/asana"
import type { Module as boxModule } from "./modules/box"
import type { Module as calendarModule } from "./modules/calendar"
import type { Module as confluenceModule } from "./modules/confluence"
import type { Module as discordModule } from "./modules/discord"
import type { Module as fsModule } from "./modules/fs"
import type { Module as githubModule } from "./modules/github"
import type { Module as gmailModule } from "./modules/gmail"
import type { Module as googleCalendarModule } from "./modules/googleCalendar"
import type { Module as googleDriveModule } from "./modules/googleDrive"
import type { Module as helpdocsModule } from "./modules/helpdocs"
import type { Module as jiraModule } from "./modules/jira"
import type { Module as linearModule } from "./modules/linear"
import type { Module as mailModule } from "./modules/mail"
import type { Module as mcpServerModule } from "./modules/mcpServer"
import type { Module as microsoftTeamsModule } from "./modules/microsoftTeams"
import type { Module as notionModule } from "./modules/notion"
import type { Module as outlookModule } from "./modules/outlook"
import type { Module as salesforceModule } from "./modules/salesforce"
import type { Module as searchModule } from "./modules/search"
import type { Module as sharepointModule } from "./modules/sharepoint"
import type { Module as slackModule } from "./modules/slack"
import type { Module as testModule } from "./modules/test"
import type { Module as webModule } from "./modules/web"

declare const connections: {
	fs: fsModule
	calendar: calendarModule
	helpdocs: helpdocsModule
	notion: notionModule
	search: searchModule
	web: webModule
}

export default connections
