export const RESPONSE_CODE = {
	RESPONSE_CODE_LOGIN: 1,
	RESPONSE_CODE_VERSIONCHECK: 4,
} as const

export type ResponseCode = (typeof RESPONSE_CODE)[keyof typeof RESPONSE_CODE]
