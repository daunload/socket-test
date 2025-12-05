import { ByteData } from './data/ByteData'
import { DoubleData } from './data/DoubleData'
import { IntData } from './data/IntData'
import { LongData } from './data/LongData'
import { StringData } from './data/StringData'
import { DataPacket } from './DataPacket'
import { RequestCode } from './RequestCode'
import { ResponseCode } from './ResponseCode'
import getPacketClass from './ResponseDataMapper'

export type DataModel =
	| DataPacket
	| IntData
	| StringData
	| ByteData
	| LongData
	| DoubleData

export type ResponseData = {
	responseCode: ResponseCode
	data: DataModel[]
}
export type MessageListener = (response: ResponseData) => void

function handleServerResponse(arrayBuffer: ArrayBuffer) {
	const view = new DataView(arrayBuffer)

	const responseCode = view.getInt32(4) as ResponseCode
	const dataLength = view.getInt32(8)
	const payloadBuffer = arrayBuffer.slice(12, arrayBuffer.byteLength)

	const dataList = []
	let bodyOffset = 0

	for (let i = 0; i < dataLength; i++) {
		const packetClass = getPacketClass(responseCode)

		if (packetClass == null) {
			return {
				success: false,
				message: 'Unknown response code',
			}
		}

		if (packetClass instanceof DataPacket) {
			packetClass.fromByteArray(payloadBuffer, bodyOffset)
			dataList.push(packetClass)
		} else {
			const { value, byteLength } = packetClass.fromByteArray(
				payloadBuffer,
				bodyOffset,
			)

			bodyOffset += byteLength
			packetClass.value = value.value
			dataList.push(packetClass)
		}
	}

	return {
		success: true,
		response: {
			responseCode,
			packet: dataList,
		},
	}
}

class NetworkManager {
	private socket: WebSocket | null = null
	private listeners = new Map<number, MessageListener>()
	isConnected = false

	connect(url: string) {
		if (this.isConnected) return

		return new Promise<void>((resolve, reject) => {
			this.socket = new WebSocket(url)
			this.socket.binaryType = 'arraybuffer'

			this.socket.onopen = () => {
				this.isConnected = true
				console.log('WebSocket connected.')
				resolve()
			}

			this.socket.onmessage = (message) => {
				const result = handleServerResponse(message.data)

				if (result.success && result.response) {
					this.listeners.forEach((listener) =>
						listener({
							responseCode: result.response.responseCode,
							data: result.response.packet,
						}),
					)
				}
			}
		})
	}

	send(requestCode: RequestCode, ...params: DataModel[]) {
		if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return

		let size = 4
		params.forEach((param) => {
			if (param instanceof DataPacket) {
			} else {
				size += param.getByteLength()
			}
		})

		const buffer = new ArrayBuffer(size + 4)
		const view = new DataView(buffer)

		let offset = 0
		view.setInt32(offset, size)
		offset += 4
		view.setInt32(offset, requestCode)
		offset += 4

		params.forEach((param) => {
			if (param instanceof DataPacket) {
				const arraybuffer = param.toByteArray()
				const uint8string = new Uint8Array(arraybuffer)

				for (let i = 0; i < uint8string.byteLength; i++) {
					view.setInt8(offset++, uint8string[i])
				}
			} else {
				const { byteLength } = param.setByte(view, offset)
				offset += byteLength
			}
		})

		console.log('send 완료', requestCode, params)
		this.socket.send(buffer)
	}

	private listenerId = 0
	on(onMessage: MessageListener) {
		this.listenerId += 1
		this.listeners.set(this.listenerId, onMessage)
		return this.listenerId
	}
	disconnect(listenerId: number) {
		this.listeners.delete(listenerId)
	}
}

export const $network = new NetworkManager()
