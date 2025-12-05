import type { ValueData } from '../TypeHandler'

export class IntData implements ValueData<number> {
	value: number
	static byteLength = 4

	constructor(value = 0) {
		this.value = value
	}

	fromByteArray(
		array: ArrayBuffer,
		offset: number,
	): { value: IntData; byteLength: number } {
		const view: DataView = new DataView(array)
		this.value = view.getInt32(offset)

		return {
			value: this,
			byteLength: IntData.byteLength,
		}
	}
	setByte(view: DataView, offset: number) {
		view.setInt32(offset, this.value)
		return { byteLength: IntData.byteLength }
	}
	getByteLength() {
		return IntData.byteLength
	}
}
