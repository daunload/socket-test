import type { ValueData } from '../TypeHandler'

const textDecoder = new TextDecoder()
const textEncoder = new TextEncoder()
export class StringData implements ValueData<string> {
	value: string

	constructor(value = '') {
		this.value = value
	}

	fromByteArray(
		array: ArrayBuffer,
		offset: number,
	): { value: StringData; byteLength: number } {
		const view: DataView = new DataView(array)
		const startOffset = offset
		const byteLength = view.getInt32(offset)
		offset += 4

		const string =
			'' + textDecoder.decode(new DataView(array, offset, byteLength))
		offset += byteLength
		this.value = string
		return {
			value: this,
			byteLength: offset - startOffset,
		}
	}
	setByte(view: DataView, offset: number) {
		const uint8string = textEncoder.encode(this.value)

		for (let i = 0; i < uint8string.byteLength; i++) {
			view.setInt8(offset + i, uint8string[i])
		}
		return { byteLength: uint8string.byteLength }
	}
	getByteLength() {
		let length = 0
		for (let i = 0; i < this.value.length; i++) {
			length += this.value.charCodeAt(i) > 127 ? 3 : 1
		}
		return length
	}
}
