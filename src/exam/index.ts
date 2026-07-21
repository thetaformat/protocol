import z from 'zod';

import type { LangCode, TransDict } from '#/__shared';

import toefl_ibt_20260121 from './toefl-ibt-20260121';

export const examDefs = { toefl_ibt_20260121 } satisfies Record<ExamCode, any>;

export const ExamCodeSchema = z.enum([
	...toefl_ibt_20260121.ExamCodeSchema.options,
]);
export type ExamCode = z.infer<typeof ExamCodeSchema>;

export const SectionCodeSchema = z.enum([
	...toefl_ibt_20260121.SectionCodeSchema.options,
]);
export type SectionCode = z.infer<typeof SectionCodeSchema>;

export const TaskCodeSchema = z.enum([
	...toefl_ibt_20260121.TaskCodeSchema.options,
]);
export type TaskCode = z.infer<typeof TaskCodeSchema>;

export const ItemCodeSchema = z.enum([
	...toefl_ibt_20260121.ItemCodeSchema.options,
]);
export type ItemCode = z.infer<typeof ItemCodeSchema>;

export const TaskContentSchema = z.discriminatedUnion('taskCode', [
	...toefl_ibt_20260121.TaskContentSchema.options,
]);
export type TaskContent = z.infer<typeof TaskContentSchema>;

export const ItemContentSchema = z.discriminatedUnion('itemCode', [
	...toefl_ibt_20260121.ItemContentSchema.options,
]);
export type ItemContent = z.infer<typeof ItemContentSchema>;

export const ResponseContentSchema = z.discriminatedUnion('itemCode', [
	...toefl_ibt_20260121.ResponseContentSchema.options,
]);
export type ResponseContent = z.infer<typeof ResponseContentSchema>;

/**
 * 从zod discriminatedUnion里面提取出对应的schema
 * e.g. const schema = extractDiscriminatedUnionMember(union,'type','A')
 * 支持 z.enum 作为识别字段
 *
 * 用于获取特定code下的taskContentSchema, itemContentSchema or responseContentSchema
 */
export function extractDiscriminatedUnionMember<
	T extends Record<string, any>,
	D extends keyof T & string,
	V extends T[D] & string,
>(
	unionSchema: z.ZodType<T>, // 接收原有的 ZodType<Union>
	_discriminatorKey: D, // 显式传入识别字段 key (在 optionsMap 匹配失败时兜底使用)
	discriminatorValue: V, // 显式传入识别字段 value
): z.ZodType<Extract<T, Record<D, V>>> {
	const union = unionSchema as any;

	// 1. 优先使用 Zod 内置的高性能 optionsMap，直接获取 O(1) 匹配结果（同时兼容 v3 和 v4）
	if (union.optionsMap instanceof Map) {
		const memberSchema = union.optionsMap.get(discriminatorValue);
		if (memberSchema) {
			return memberSchema as z.ZodType<Extract<T, Record<D, V>>>;
		}
	}

	// 2. 兜底方案：如果 optionsMap 不存在，安全遍历 options 数组
	if (!union.options || !Array.isArray(union.options)) {
		throw new Error(
			`[extractDiscriminatedUnionMember] The provided schema does not appear to be a valid union or discriminated union schema.`,
		);
	}

	const memberSchema = union.options.find((option: any) => {
		const field = option.shape?.[_discriminatorKey];
		if (!field) return false;

		// z.enum
		if ('options' in field && Array.isArray(field.options)) {
			return field.options.includes(discriminatorValue);
		}
		// 极端情况下的 Zod 内部 _def 属性判定兜底
		if (field._def) {
			if (field._def.value === discriminatorValue) {
				return true;
			}
			if (
				Array.isArray(field._def.values) &&
				field._def.values.includes(discriminatorValue)
			) {
				return true;
			}
		}

		return false;
	});

	if (!memberSchema) {
		throw new Error(
			`[extractDiscriminatedUnionMember] Failed to find a matching union member for discriminator key "${_discriminatorKey}" with value "${discriminatorValue}".`,
		);
	}

	return memberSchema as z.ZodType<Extract<T, Record<D, V>>>;
}

// 1. 在模块加载时，一次性扁平化聚合所有静态定义的 displayNames
const globalDisplayNames = Object.values(examDefs).reduce(
	(acc, exam) => {
		return Object.assign(acc, exam.displayNames);
	},
	{} as Record<ExamCode | SectionCode | TaskCode | ItemCode, TransDict>,
);

/**
 * 🌟 全局、强类型安全的多语言 displayName 解析函数
 */
export function getDisplayName(
	code: ExamCode | SectionCode | TaskCode | ItemCode,
	lang: LangCode,
): string {
	// 强类型与 Schema 约束保障：code 必定存在，且其下的 lang 必定有值
	return globalDisplayNames[code][lang];
}
