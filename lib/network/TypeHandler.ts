/**
 * 각 데이터 타입의 직렬화/역직렬화 로직을 정의하는 인터페이스
 */
export interface TypeHandler<T> {
	serialize(value: T, manager: DataTypeManager): ArrayBuffer

	deserialize(
		view: DataView,
		offset: number,
		manager: DataTypeManager,
		instance?: T,
	): { value: T; readBytes: number }
}

/**
 * TypeHandler들을 등록하고 관리하는 중앙 관리자
 */
export class DataTypeManager {
	private handlers = new Map<any, TypeHandler<any>>()

	public register<T>(
		typeConstructor: new (...args: any[]) => T,
		handler: TypeHandler<T>,
	): void {
		this.handlers.set(typeConstructor, handler)
	}

	public getHandler<T>(
		typeConstructor: new (...args: any[]) => T,
	): TypeHandler<T> | undefined {
		return this.handlers.get(typeConstructor)
	}
}

export interface ValueData<T> {
	value: T

	fromByteArray(
		buffer: ArrayBuffer,
		offset: number,
	): { value: ValueData<T>; byteLength: number }
	setByte(view: DataView, offset: number): { byteLength: number }
	getByteLength(): number
}
