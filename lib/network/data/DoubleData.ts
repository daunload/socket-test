import type { TypeHandler, ValueData } from '../TypeHandler'

export class DoubleData implements ValueData<number> {
	value: number
	static byteLength = 8

	constructor(value = 0) {
		this.value = value
	}

	fromByteArray(
		array: ArrayBuffer,
		offset: number,
	): { value: DoubleData; byteLength: number } {
		const view: DataView = new DataView(array)
		this.value = view.getFloat64(offset)

		return {
			value: this,
			byteLength: DoubleData.byteLength,
		}
	}
	setByte(view: DataView, offset: number) {
		view.setFloat64(offset, this.value)
		return { byteLength: DoubleData.byteLength }
	}
	getByteLength() {
		return DoubleData.byteLength
	}
}
