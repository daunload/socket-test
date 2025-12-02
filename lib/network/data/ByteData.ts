import type { TypeHandler } from '../TypeHandler'

export class ByteData {
	value: number
	constructor(value = 0) {
		this.value = value
	}
}

export class ByteDataHandler implements TypeHandler<ByteData> {
	serialize(data: ByteData): ArrayBuffer {
		const buffer = new ArrayBuffer(1)
		const view = new DataView(buffer)
		view.setUint8(0, data.value ? 1 : 0)

		return buffer
	}
	deserialize(
		view: DataView,
		offset: number,
	): { value: ByteData; readBytes: number } {
		const byteValue = view.getUint8(offset)

		return {
			value: new ByteData(byteValue),
			readBytes: 1,
		}
	}
}
