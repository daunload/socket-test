import { getFields } from './Field.decorator'
import { DataModel } from './NetworkManager'

export abstract class DataPacket {
	public toByteArray(): ArrayBuffer {
		const fields = getFields(this.constructor)

		let size = 0
		const byteMap = new Map<string, ArrayBuffer>()
		for (const field of fields) {
			const value = (this as any)[field.propertyKey] as DataModel

			if (value instanceof DataPacket) {
				const buffer = value.toByteArray()
				byteMap.set(field.propertyKey, buffer)
				size += buffer.byteLength + 1
			} else {
				size += value.getByteLength()
			}
		}

		const buffer = new ArrayBuffer(size)
		const view = new DataView(buffer)
		let offset = 0

		for (const field of fields) {
			const value = (this as any)[field.propertyKey] as DataModel

			if (value instanceof DataPacket) {
				view.setInt8(offset, 1)
				const buffer = byteMap.get(field.propertyKey)

				if (buffer === undefined) throw new Error('Buffer is null')

				const typed = new Uint8Array(buffer)
				for (let i = 0; i < buffer.byteLength; i++) {
					view.setInt8(offset++, typed[i])
				}
			} else {
				const { byteLength } = value.setByte(view, offset)
				offset += byteLength
			}
		}

		return buffer
	}

	public fromByteArray(buffer: ArrayBuffer, offset: number) {
		const fields = getFields(this.constructor)

		for (const field of fields) {
			const currentInstance = (this as any)[field.propertyKey]
			const { value, byteLength } = currentInstance.fromByteArray(
				buffer,
				offset,
			)

			;(this as any)[field.propertyKey] = value
			offset += byteLength
		}

		return {
			value: this,
			byteLength: offset,
		}
	}
}
