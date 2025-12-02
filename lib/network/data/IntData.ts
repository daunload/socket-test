import { TypeHandler } from '../TypeHandler'

export class IntData {
	constructor(public value: number = 0) {}
}

export class IntDataHandler implements TypeHandler<IntData> {
	serialize(data: IntData): ArrayBuffer {
		const buffer = new ArrayBuffer(4)
		new DataView(buffer).setInt32(0, data.value, true)
		return buffer
	}
	deserialize(
		view: DataView,
		offset: number,
	): { value: IntData; readBytes: number } {
		const value = view.getInt32(offset, true)
		return { value: new IntData(value), readBytes: 4 }
	}
}
