import type { TypeHandler } from '../TypeHandler'

export class StringData {
	constructor(public value: string = '') {}
}

export class StringDataHandler implements TypeHandler<StringData> {
	private encoder = new TextEncoder()
	private decoder = new TextDecoder()

	serialize(data: StringData): ArrayBuffer {
		const strBytes = this.encoder.encode(data.value)
		const buffer = new ArrayBuffer(4 + strBytes.length)
		const view = new DataView(buffer)
		view.setUint32(0, strBytes.length, true)
		new Uint8Array(buffer, 4).set(strBytes)
		return buffer
	}
	deserialize(
		view: DataView,
		offset: number,
	): { value: StringData; readBytes: number } {
		const length = view.getInt32(offset)
		offset += 4
		const strBytes = new Uint8Array(view.buffer, offset, length)
		const value = this.decoder.decode(strBytes)
		return { value: new StringData(value), readBytes: 4 + length }
	}
}
