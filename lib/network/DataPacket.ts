import { getFields } from './Field.decorator'
import type { DataTypeManager } from './TypeHandler'

export abstract class DataPacket {
	private static concatBuffers(buffers: ArrayBuffer[]): ArrayBuffer {
		const totalLength = buffers.reduce(
			(acc, buffer) => acc + buffer.byteLength,
			0,
		)
		const result = new Uint8Array(totalLength)
		let offset = 0
		for (const buffer of buffers) {
			result.set(new Uint8Array(buffer), offset)
			offset += buffer.byteLength
		}
		return result.buffer
	}

	public toByteArray(manager: DataTypeManager): ArrayBuffer {
		const fields = getFields(this.constructor)
		const buffers: ArrayBuffer[] = []

		for (const field of fields) {
			const handler = manager.getHandler(field.type)
			if (!handler) {
				throw new Error(
					`Handler for type ${field.type.name} is not registered.`,
				)
			}

			const value = (this as any)[field.propertyKey]
			buffers.push(handler.serialize(value, manager))
		}

		return DataPacket.concatBuffers(buffers)
	}

	public fromByteArray(
		buffer: ArrayBuffer,
		manager: DataTypeManager,
	): number {
		const view = new DataView(buffer)
		const fields = getFields(this.constructor)
		let offset = 0

		for (const field of fields) {
			const handler = manager.getHandler(field.type)
			if (!handler) {
				throw new Error(
					`Handler for type ${field.type.name} is not registered.`,
				)
			}

			const currentInstance = (this as any)[field.propertyKey]
			const { value, readBytes } = handler.deserialize(
				view,
				offset,
				manager,
				currentInstance,
			)

			;(this as any)[field.propertyKey] = value
			offset += readBytes
		}

		return offset
	}
}
