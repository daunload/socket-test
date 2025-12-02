export const REQUEST_CODE = {
	REQUEST_CODE_LOGIN: 1,
	REQUEST_CODE_LOGOUT: 2,
	REQUEST_CODE_CHAT: 3,

	REQUEST_CODE_VERSIONCHECK: 8,
} as const

export type RequestCode = (typeof REQUEST_CODE)[keyof typeof REQUEST_CODE]
