import type { ValueData } from '../TypeHandler'
export class LongData implements ValueData<bigint> {
	value: bigint
	static byteLength = 8

	constructor(value = 0n) {
		this.value = value
	}

	fromByteArray(
		array: ArrayBuffer,
		offset: number,
	): { value: LongData; byteLength: number } {
		const view: DataView = new DataView(array)
		this.value = view.getBigInt64(offset)

		return {
			value: this,
			byteLength: LongData.byteLength,
		}
	}
	setByte(view: DataView, offset: number) {
		view.setBigInt64(offset, this.value)
		return { byteLength: LongData.byteLength }
	}
	getByteLength() {
		return LongData.byteLength
	}
}
