import type { TypeHandler } from '../TypeHandler'

export class LongData {
	constructor(public value = 0n) {}
}

export class LongDataHandler implements TypeHandler<LongData> {
	serialize(data: LongData): ArrayBuffer {
		const buffer = new ArrayBuffer(8)
		new DataView(buffer).setBigInt64(0, data.value, true)
		return buffer
	}
	deserialize(
		view: DataView,
		offset: number,
	): { value: LongData; readBytes: number } {
		const value = view.getBigInt64(offset, true)
		return { value: new LongData(value), readBytes: 8 }
	}
}
