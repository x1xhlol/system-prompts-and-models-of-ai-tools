export type Module = {
	readDir: (args: { dir: string; tree?: boolean }) => {
		entries: Array<string>
		tree?: string
	}
	readFiles: (args: { files: Array<string> }) => {
		files: Array<{ path: string; content: string }>
	}
}

export type ReadDir = Module["readDir"]
export type ReadFiles = Module["readFiles"]

export type {
	FsIntegration,
	ModulePermissions,
	ModuleState,
} from "./integration"