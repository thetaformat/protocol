import z from 'zod';

import {
	type AllowedQuestionContentKey,
	AllowedQuestionContentKeySchema,
	type TransDict,
	TransDictSchema,
} from '../__shared';

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
		__displayName: TransDict;
		__tasks: {
			[Task: string]: {
				__displayName: TransDict;
				__questionContentSchema: z.ZodObject<any>;
				__items: {
					[Item: string]: {
						__displayName: TransDict;
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
			[
				Item in keyof TSections[S]['__tasks'][Task]['__items'] & string
			]: `${S}_${Task}_${Item}`;
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
			[
				Item in keyof TSections[S]['__tasks'][Task]['__items'] & string
			]: z.ZodObject<
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
			[
				Item in keyof TSections[S]['__tasks'][Task]['__items'] & string
			]: z.ZodObject<
				TSections[S]['__tasks'][Task]['__items'][Item]['__responseContentSchema']['shape'] & {
					itemCode: z.ZodEnum<ToEnumLike<`${TCode}_${S}_${Task}_${Item}`>>;
				}
			>;
		}[keyof TSections[S]['__tasks'][Task]['__items'] & string];
	}[keyof TSections[S]['__tasks'] & string];
}[keyof TSections & string];

type GetDisplayNamesKeys<
	TCode extends string,
	TSections extends LooseNestedSections,
> =
	| TCode
	| GetSectionCodes<TCode, TSections>
	| GetTaskCodes<TCode, TSections>
	| GetItemCodes<TCode, TSections>;

// 1. 校验 Item 层级：只允许 __displayName, __questionContentSchema 和 __responseContentSchema
type ValidateItem<TItem> = TItem extends {
	__displayName: TransDict;
	__questionContentSchema: z.ZodObject<infer ItemShape>;
	__responseContentSchema: z.ZodObject<infer ResponseShape>;
}
	? {
			__displayName: TransDict;
			__questionContentSchema: z.ZodObject<{
				[K in keyof ItemShape]: K extends AllowedQuestionContentKey
					? ItemShape[K]
					: never;
			}>;
			__responseContentSchema: z.ZodObject<ResponseShape>;
		} & {
			[
				K in Exclude<
					keyof TItem,
					| '__displayName'
					| '__questionContentSchema'
					| '__responseContentSchema'
				>
			]: never;
		}
	: never;

// 2. 校验 Task 层级：只允许 __displayName, __questionContentSchema 和 __items
type ValidateTask<TTask> = TTask extends {
	__displayName: TransDict;
	__questionContentSchema: z.ZodObject<infer TaskShape>;
	__items: infer Items;
}
	? {
			__displayName: TransDict;
			__questionContentSchema: z.ZodObject<{
				[K in keyof TaskShape]: K extends AllowedQuestionContentKey
					? TaskShape[K]
					: never;
			}>;
			__items: {
				[Item in keyof Items]: ValidateItem<Items[Item]>;
			};
		} & {
			// 强约束：多余字段映射为 never
			[
				K in Exclude<
					keyof TTask,
					'__displayName' | '__questionContentSchema' | '__items'
				>
			]: never;
		}
	: never;

// 3. 校验 Section 层级：只允许 __displayName 和 __tasks
type ValidateSection<TSection> = TSection extends {
	__displayName: TransDict;
	__tasks: infer Tasks;
}
	? {
			__displayName: TransDict;
			__tasks: {
				[Task in keyof Tasks]: ValidateTask<Tasks[Task]>;
			};
		} & {
			// 强约束：多余字段映射为 never
			[K in Exclude<keyof TSection, '__displayName' | '__tasks'>]: never;
		}
	: never;

// 4. 汇总入口
type ValidateNestedSections<TSections> = {
	[S in keyof TSections]: ValidateSection<TSections[S]>;
};

export function defineExam<
	const TCode extends string,
	const TDisplayName extends TransDict,
	const TSections extends LooseNestedSections &
		ValidateNestedSections<TSections>,
>(input: { code: TCode; displayName: TDisplayName; __sections: TSections }) {
	const examCode = input.code;
	const examDisplayName = input.displayName;

	const displayNameParseResult = TransDictSchema.safeParse(examDisplayName);
	if (!displayNameParseResult.success) {
		throw new Error(
			`[Validation fail] Exam "${examCode}" has an invalid displayName. ` +
				`Error: ${displayNameParseResult.error.message}`,
		);
	}

	const sectionCodes: string[] = [];
	const taskCodes: string[] = [];
	const itemCodes: string[] = [];

	const taskSchemas: any[] = [];
	const itemSchemas: any[] = [];
	const responseSchemas: any[] = [];

	// 🌟 声明扁平化 displayNames 键值账本
	const displayNames: Record<string, TransDict> = {
		[examCode]: examDisplayName,
	};

	for (const [sectionKey, sectionVal] of Object.entries(input.__sections)) {
		const sectionCode = `${examCode}_${sectionKey}`;
		sectionCodes.push(sectionCode);

		const sectionTyped = sectionVal as any;

		// 运行时校验 Section 层的 __displayName
		const sectionDisplayName = sectionTyped.__displayName;
		const sectionDisplayNameParseResult =
			TransDictSchema.safeParse(sectionDisplayName);
		if (!sectionDisplayNameParseResult.success) {
			throw new Error(
				`[Validation fail] Section "${sectionCode}" has an invalid displayName. ` +
					`Error: ${sectionDisplayNameParseResult.error.message}`,
			);
		}

		// 🌟 收集 Section 的 displayName
		displayNames[sectionCode] = sectionDisplayName;

		for (const [taskKey, taskVal] of Object.entries(sectionTyped.__tasks)) {
			const taskTyped = taskVal as any;
			const taskCode = `${sectionCode}_${taskKey}`;
			taskCodes.push(taskCode);

			// 运行时校验 Task 层的 __displayName
			const taskDisplayName = taskTyped.__displayName;
			const taskDisplayNameParseResult =
				TransDictSchema.safeParse(taskDisplayName);
			if (!taskDisplayNameParseResult.success) {
				throw new Error(
					`[Validation fail] Task "${taskCode}" has an invalid displayName. ` +
						`Error: ${taskDisplayNameParseResult.error.message}`,
				);
			}

			// 🌟 收集 Task 的 displayName
			displayNames[taskCode] = taskDisplayName;

			const taskKeys = Object.keys(
				taskTyped.__questionContentSchema.shape || {},
			);
			for (const key of taskKeys) {
				const parseResult = AllowedQuestionContentKeySchema.safeParse(key);
				if (!parseResult.success) {
					throw new Error(
						`[Validation fail] Task "${taskCode}" __questionContentSchema contains unauthorized key "${key}". ` +
							`Allowed keys: [${AllowedQuestionContentKeySchema.options.join(', ')}]`,
					);
				}
			}

			taskSchemas.push(
				taskTyped.__questionContentSchema.extend({
					taskCode: z.enum([taskCode]),
				}),
			);

			for (const [itemKey, itemVal] of Object.entries(taskTyped.__items)) {
				const itemTyped = itemVal as any;
				const itemCode = `${taskCode}_${itemKey}`;
				itemCodes.push(itemCode);

				// 运行时校验 Item 层的 __displayName
				const itemDisplayName = itemTyped.__displayName;
				const itemDisplayNameParseResult =
					TransDictSchema.safeParse(itemDisplayName);
				if (!itemDisplayNameParseResult.success) {
					throw new Error(
						`[Validation fail] Item "${itemCode}" has an invalid displayName. ` +
							`Error: ${itemDisplayNameParseResult.error.message}`,
					);
				}

				// 🌟 收集 Item 的 displayName
				displayNames[itemCode] = itemDisplayName;

				const itemKeys = Object.keys(
					itemTyped.__questionContentSchema.shape || {},
				);
				for (const key of itemKeys) {
					const parseResult = AllowedQuestionContentKeySchema.safeParse(key);
					if (!parseResult.success) {
						throw new Error(
							`[Validation fail] Item "${itemCode}" __questionContentSchema contains unauthorized key "${key}". ` +
								`Allowed keys: [${AllowedQuestionContentKeySchema.options.join(', ')}]`,
						);
					}
				}

				itemSchemas.push(
					itemTyped.__questionContentSchema.extend({
						itemCode: z.enum([itemCode]),
					}),
				);

				responseSchemas.push(
					itemTyped.__responseContentSchema.extend({
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
		displayNames: displayNames as unknown as Record<
			GetDisplayNamesKeys<TCode, TSections>,
			TransDict
		>,
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
