import 'reflect-metadata';

const METADATA_KEY = Symbol('packet:fields');

export interface FieldMetadata {
	propertyKey: string;
	order: number;
	type: new (...args: any[]) => object;
}

/**
 * 새로운 필드 등록
 */
export function Field(
	order: number,
	type: new (...args: any[]) => object,
): PropertyDecorator {
	return (target: object, propertyKey: string | symbol) => {
		const fields =
			Reflect.getMetadata(METADATA_KEY, target.constructor) || [];

		fields.push({ propertyKey, order, type });

		Reflect.defineMetadata(METADATA_KEY, fields, target.constructor);
	};
}

/**
 * 등록된 순서대로 필드를 반환
 */
export function getFields(target: object): FieldMetadata[] {
	const fields = Reflect.getMetadata(METADATA_KEY, target) || [];
	return fields.sort(
		(a: { order: number }, b: { order: number }) => a.order - b.order,
	);
}
