import { StringData } from './data/StringData'
import { RESPONSE_CODE, ResponseCode } from './ResponseCode'

export default function getPacketClass(responseCode: ResponseCode) {
	switch (responseCode) {
		case RESPONSE_CODE.RESPONSE_CODE_LOGIN:
		case RESPONSE_CODE.RESPONSE_CODE_VERSIONCHECK: {
			return new StringData()
		}
	}
}
