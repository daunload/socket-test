import type { TypeHandler, ValueData } from '../TypeHandler'

export class ByteData implements ValueData<number> {
	value: number
	static byteLength = 1

	constructor(value = 0) {
		this.value = value
	}

	fromByteArray(
		array: ArrayBuffer,
		offset: number,
	): { value: ByteData; byteLength: number } {
		const view: DataView = new DataView(array)
		this.value = view.getInt8(offset)

		return {
			value: this,
			byteLength: ByteData.byteLength,
		}
	}
	setByte(view: DataView, offset: number) {
		view.setInt8(offset, this.value)
		return { byteLength: ByteData.byteLength }
	}
	getByteLength() {
		return ByteData.byteLength
	}
}
