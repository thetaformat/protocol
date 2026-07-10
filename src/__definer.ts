import z from 'zod';

import {
	type AllowedQuestionContentKey,
	AllowedQuestionContentKeySchema,
} from './__shared';

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
	k: infer I,
) => void
	? I
	: never;

type LastOf<U> =
	UnionToIntersection<U extends any ? () => U : never> extends () => infer R
		? R
		: never;

type Push<T extends any[], V> = [...T, V];

type UnionToTuple<T, L = LastOf<T>> = [T] extends [never]
	? []
	: Push<UnionToTuple<Exclude<T, L>>, L>;

type ToEnumLike<T extends string> = { [K in T]: K };

interface LooseNestedSections {
	[S: string]: {
		__tasks: {
			[Task: string]: {
				__questionContentSchema: z.ZodObject<any>;
				__items: {
					[Item: string]: {
						__questionContentSchema: z.ZodObject<any>;
						__responseContentSchema: z.ZodObject<any>;
					};
				};
			};
		};
	};
}

type GetSectionKeys<TSections extends LooseNestedSections> = keyof TSections &
	string;

type GetTaskKeys<TSections extends LooseNestedSections> = {
	[S in keyof TSections & string]: {
		[Task in keyof TSections[S]['__tasks'] & string]: `${S}_${Task}`;
	}[keyof TSections[S]['__tasks'] & string];
}[keyof TSections & string];

type GetItemKeys<TSections extends LooseNestedSections> = {
	[S in keyof TSections & string]: {
		[Task in keyof TSections[S]['__tasks'] & string]: {
			[Item in keyof TSections[S]['__tasks'][Task]['__items'] &
				string]: `${S}_${Task}_${Item}`;
		}[keyof TSections[S]['__tasks'][Task]['__items'] & string];
	}[keyof TSections[S]['__tasks'] & string];
}[keyof TSections & string];

type GetSectionCodes<
	TCode extends string,
	TSections extends LooseNestedSections,
> = `${TCode}_${GetSectionKeys<TSections>}`;

type GetTaskCodes<
	TCode extends string,
	TSections extends LooseNestedSections,
> = `${TCode}_${GetTaskKeys<TSections>}`;

type GetItemCodes<
	TCode extends string,
	TSections extends LooseNestedSections,
> = `${TCode}_${GetItemKeys<TSections>}`;

type GetTaskSchemaUnion<
	TCode extends string,
	TSections extends LooseNestedSections,
> = {
	[S in keyof TSections & string]: {
		[Task in keyof TSections[S]['__tasks'] & string]: z.ZodObject<
			TSections[S]['__tasks'][Task]['__questionContentSchema']['shape'] & {
				taskCode: z.ZodEnum<ToEnumLike<`${TCode}_${S}_${Task}`>>;
			}
		>;
	}[keyof TSections[S]['__tasks'] & string];
}[keyof TSections & string];

type GetItemSchemaUnion<
	TCode extends string,
	TSections extends LooseNestedSections,
> = {
	[S in keyof TSections & string]: {
		[Task in keyof TSections[S]['__tasks'] & string]: {
			[Item in keyof TSections[S]['__tasks'][Task]['__items'] &
				string]: z.ZodObject<
				TSections[S]['__tasks'][Task]['__items'][Item]['__questionContentSchema']['shape'] & {
					itemCode: z.ZodEnum<ToEnumLike<`${TCode}_${S}_${Task}_${Item}`>>;
				}
			>;
		}[keyof TSections[S]['__tasks'][Task]['__items'] & string];
	}[keyof TSections[S]['__tasks'] & string];
}[keyof TSections & string];

type GetResponseSchemaUnion<
	TCode extends string,
	TSections extends LooseNestedSections,
> = {
	[S in keyof TSections & string]: {
		[Task in keyof TSections[S]['__tasks'] & string]: {
			[Item in keyof TSections[S]['__tasks'][Task]['__items'] &
				string]: z.ZodObject<
				TSections[S]['__tasks'][Task]['__items'][Item]['__responseContentSchema']['shape'] & {
					itemCode: z.ZodEnum<ToEnumLike<`${TCode}_${S}_${Task}_${Item}`>>;
				}
			>;
		}[keyof TSections[S]['__tasks'][Task]['__items'] & string];
	}[keyof TSections[S]['__tasks'] & string];
}[keyof TSections & string];

type ValidateNestedSections<TSections> = {
	[S in keyof TSections]: TSections[S] extends { __tasks: infer Tasks }
		? {
				__tasks: {
					[Task in keyof Tasks]: Tasks[Task] extends {
						__questionContentSchema: z.ZodObject<infer TaskShape>;
						__items: infer Items;
					}
						? {
								__questionContentSchema: z.ZodObject<{
									[K in keyof TaskShape]: K extends AllowedQuestionContentKey
										? TaskShape[K]
										: never;
								}>;
								__items: {
									[Item in keyof Items]: Items[Item] extends {
										__questionContentSchema: z.ZodObject<infer ItemShape>;
										__responseContentSchema: z.ZodObject<infer ResponseShape>;
									}
										? {
												__questionContentSchema: z.ZodObject<{
													[K in keyof ItemShape]: K extends AllowedQuestionContentKey
														? ItemShape[K]
														: never;
												}>;
												__responseContentSchema: z.ZodObject<ResponseShape>;
											}
										: never;
								};
							}
						: never;
				};
			}
		: never;
};

export function defineExam<
	const TCode extends string,
	const TSections extends LooseNestedSections &
		ValidateNestedSections<TSections>,
>(input: { code: TCode; __sections: TSections }) {
	const examCode = input.code;
	const sectionCodes: string[] = [];
	const taskCodes: string[] = [];
	const itemCodes: string[] = [];

	const taskSchemas: any[] = [];
	const itemSchemas: any[] = [];
	const responseSchemas: any[] = [];

	for (const [sectionKey, sectionVal] of Object.entries(input.__sections)) {
		const sectionCode = `${examCode}_${sectionKey}`;
		sectionCodes.push(sectionCode);

		const sectionTyped = sectionVal as any;

		for (const [taskKey, taskVal] of Object.entries(sectionTyped.tasks)) {
			const taskTyped = taskVal as any;
			const taskCode = `${sectionCode}_${taskKey}`;
			taskCodes.push(taskCode);

			const taskKeys = Object.keys(taskTyped.contentSchema.shape || {});
			for (const key of taskKeys) {
				const parseResult = AllowedQuestionContentKeySchema.safeParse(key);
				if (!parseResult.success) {
					throw new Error(
						`[Validation fail] Task "${taskCode}" contentSchema contains unauthorized key "${key}". ` +
							`Allowed keys: [${AllowedQuestionContentKeySchema.options.join(', ')}]`,
					);
				}
			}

			taskSchemas.push(
				taskTyped.contentSchema.extend({
					taskCode: z.enum([taskCode]),
				}),
			);

			for (const [itemKey, itemVal] of Object.entries(taskTyped.items)) {
				const itemTyped = itemVal as any;
				const itemCode = `${taskCode}_${itemKey}`;
				itemCodes.push(itemCode);

				const itemKeys = Object.keys(itemTyped.contentSchema.shape || {});
				for (const key of itemKeys) {
					const parseResult = AllowedQuestionContentKeySchema.safeParse(key);
					if (!parseResult.success) {
						throw new Error(
							`[Validation fail] Item "${itemCode}" contentSchema contains unauthorized key "${key}". ` +
								`Allowed keys: [${AllowedQuestionContentKeySchema.options.join(', ')}]`,
						);
					}
				}

				itemSchemas.push(
					itemTyped.contentSchema.extend({
						itemCode: z.enum([itemCode]),
					}),
				);

				responseSchemas.push(
					itemTyped.responseSchema.extend({
						itemCode: z.enum([itemCode]),
					}),
				);
			}
		}
	}

	const createUnion = (key: string, schemas: any[]) => {
		if (schemas.length === 1) {
			return z.discriminatedUnion(key as any, [schemas[0], schemas[0]] as any);
		}
		return z.discriminatedUnion(key as any, schemas as any);
	};

	return {
		ExamCodeSchema: z.enum([examCode]) as unknown as z.ZodEnum<
			ToEnumLike<TCode>
		>,
		SectionCodeSchema: z.enum(sectionCodes as any) as unknown as z.ZodEnum<
			ToEnumLike<GetSectionCodes<TCode, TSections>>
		>,
		TaskCodeSchema: z.enum(taskCodes as any) as unknown as z.ZodEnum<
			ToEnumLike<GetTaskCodes<TCode, TSections>>
		>,
		ItemCodeSchema: z.enum(itemCodes as any) as unknown as z.ZodEnum<
			ToEnumLike<GetItemCodes<TCode, TSections>>
		>,
		TaskContentSchema: createUnion(
			'taskCode',
			taskSchemas,
		) as unknown as z.ZodDiscriminatedUnion<
			UnionToTuple<GetTaskSchemaUnion<TCode, TSections>> extends readonly [
				any,
				...any[],
			]
				? UnionToTuple<GetTaskSchemaUnion<TCode, TSections>>
				: any
		>,
		ItemContentSchema: createUnion(
			'itemCode',
			itemSchemas,
		) as unknown as z.ZodDiscriminatedUnion<
			UnionToTuple<GetItemSchemaUnion<TCode, TSections>> extends readonly [
				any,
				...any[],
			]
				? UnionToTuple<GetItemSchemaUnion<TCode, TSections>>
				: any
		>,
		ResponseContentSchema: createUnion(
			'itemCode',
			responseSchemas,
		) as unknown as z.ZodDiscriminatedUnion<
			UnionToTuple<GetResponseSchemaUnion<TCode, TSections>> extends readonly [
				any,
				...any[],
			]
				? UnionToTuple<GetResponseSchemaUnion<TCode, TSections>>
				: any
		>,
	};
}
