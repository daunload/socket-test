import type { TypeHandler } from '../TypeHandler'

export class DoubleData {
	constructor(public value = 0) {}
}

export class DoubleDataHandler implements TypeHandler<DoubleData> {
	serialize(data: DoubleData): ArrayBuffer {
		const buffer = new ArrayBuffer(1)
		const view = new DataView(buffer)
		view.setUint8(0, data.value ? 1 : 0)

		return buffer
	}
	deserialize(
		view: DataView,
		offset: number,
	): { value: DoubleData; readBytes: number } {
		const value = view.getFloat64(offset, true)
		return { value: new DoubleData(value), readBytes: 8 }
	}
}
