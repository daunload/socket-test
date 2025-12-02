import { ByteData, ByteDataHandler } from './data/ByteData'
import { DoubleData } from './data/DoubleData'
import { IntData, IntDataHandler } from './data/IntData'
import { LongData, LongDataHandler } from './data/LongData'
import { StringData, StringDataHandler } from './data/StringData'
import { DataPacket } from './DataPacket'
import { RequestCode } from './RequestCode'
import { ResponseCode } from './ResponseCode'
import getPacketClass from './ResponseDataMapper'
import { DataTypeManager } from './TypeHandler'

export type ResponseData = {
	responseCode: ResponseCode
	data: (DataPacket | IntData | StringData | ByteData | LongData)[]
}
export type MessageListener = (response: ResponseData) => void

const dataTypeManager = new DataTypeManager()
dataTypeManager.register(IntData, new IntDataHandler())
dataTypeManager.register(StringData, new StringDataHandler())
dataTypeManager.register(ByteData, new ByteDataHandler())
dataTypeManager.register(LongData, new LongDataHandler())
// dataTypeManager.register(MapData, new MapDataHandler())
// dataTypeManager.register(ListData, new ListDataHandler())
// dataTypeManager.register(SetData, new SetDataHandler())

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
			packetClass.fromByteArray(payloadBuffer, dataTypeManager)
			dataList.push(packetClass)
		} else {
			const handler = dataTypeManager.getHandler(
				packetClass.constructor as any,
			)

			if (!handler) {
				return {
					success: false,
					message: 'No handler for packet data type',
				}
			}

			const dataView = new DataView(payloadBuffer)
			const { value, readBytes } = handler.deserialize(
				dataView,
				bodyOffset,
				dataTypeManager,
				packetClass,
			)
			bodyOffset += readBytes
			packetClass.value = value as any
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

	send(
		requestCode: RequestCode,
		...params: (DataPacket | IntData | StringData | ByteData | LongData)[]
	) {
		if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return

		let size = 4
		params.forEach((param) => {
			if ('value' in param) {
				if (typeof param.value == 'string') {
					for (let i = 0; i < param.value.length; i++) {
						size += param.value.charCodeAt(i) > 127 ? 3 : 1
					}
				} else if ('byteLength' in param.constructor) {
					const byteLength = param.constructor.byteLength as number
					size += byteLength
				}
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
			if (param instanceof ByteData) {
				view.setInt8(offset, param.value)
				offset += 1
			} else if (param instanceof IntData) {
				view.setInt32(offset, param.value)
				offset += 4
			} else if (param instanceof LongData) {
				if (typeof param.value === 'number')
					view.setBigInt64(offset, BigInt(param.value))
				offset += 4
			} else if (param instanceof DoubleData) {
				view.setFloat64(offset, param.value)
				offset += 4
			} else if (
				typeof param == 'string' ||
				param instanceof StringData
			) {
				const uint8string =
					typeof param === 'string'
						? new TextEncoder().encode(param)
						: new TextEncoder().encode(param.value)
				for (let i = 0; i < uint8string.byteLength; i++) {
					view.setInt8(offset++, uint8string[i])
				}
			} else if (param instanceof DataPacket) {
				const arraybuffer = param.toByteArray(dataTypeManager)
				const uint8string = new Uint8Array(arraybuffer)
				for (let i = 0; i < uint8string.byteLength; i++) {
					view.setInt8(offset++, uint8string[i])
				}
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
