export type SharingAccessLevel =
	| "full_access"
	| "can_edit"
	| "can_edit_content"
	| "can_comment"
	| "can_view"
	| "no_access"

export type PermissionItem =
	| { type: "user"; userUrl: string; accessLevel: SharingAccessLevel }
	| { type: "public"; accessLevel: SharingAccessLevel; publicOptions?: { allowDuplicate?: boolean; allowSearchEngineIndexing?: boolean; expirationTimestamp?: number } }
	| { type: "workspace"; accessLevel: SharingAccessLevel }

export type LoadPermissions = (args: { url: string }) => Promise<{ url: string; items: PermissionItem[] }>

export type UpdatePermission = (args: { url: string; item: PermissionItem }) => Promise<{ url: string; item: PermissionItem }>
