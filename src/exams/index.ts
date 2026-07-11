import z from 'zod';

import toefl_ibt_20260121 from './toefl-ibt-20260121';

export const ExamCodeSchema = z.enum([
	...toefl_ibt_20260121.ExamCodeSchema.options,
]);

export const SectionCodeSchema = z.enum([
	...toefl_ibt_20260121.SectionCodeSchema.options,
]);

export const TaskCodeSchema = z.enum([
	...toefl_ibt_20260121.TaskCodeSchema.options,
]);

export const ItemCodeSchema = z.enum([
	...toefl_ibt_20260121.ItemCodeSchema.options,
]);

export const TaskContentSchema = z.discriminatedUnion('taskCode', [
	...toefl_ibt_20260121.TaskContentSchema.options,
]);

export const ItemContentSchema = z.discriminatedUnion('itemCode', [
	...toefl_ibt_20260121.ItemContentSchema.options,
]);

export const ResponseContentSchema = z.discriminatedUnion('itemCode', [
	...toefl_ibt_20260121.ResponseContentSchema.options,
]);

export type ExamCode = z.infer<typeof ExamCodeSchema>;
export type SectionCode = z.infer<typeof SectionCodeSchema>;
export type TaskCode = z.infer<typeof TaskCodeSchema>;
export type ItemCode = z.infer<typeof ItemCodeSchema>;
export type TaskContent = z.infer<typeof TaskContentSchema>;
export type ItemContent = z.infer<typeof ItemContentSchema>;
export type ResponseContent = z.infer<typeof ResponseContentSchema>;

export type ExtractTaskContentSchema<T extends TaskCode> = Extract<
	(typeof TaskContentSchema)['options'][number],
	z.ZodObject<{ taskCode: z.ZodEnum<Record<T, T>> }>
>;

export type ExtractItemContentSchema<T extends ItemCode> = Extract<
	(typeof ItemContentSchema)['options'][number],
	z.ZodObject<{ itemCode: z.ZodEnum<Record<T, T>> }>
>;

export type ExtractResponseContentSchema<T extends ItemCode> = Extract<
	(typeof ResponseContentSchema)['options'][number],
	z.ZodObject<{ itemCode: z.ZodEnum<Record<T, T>> }>
>;

export function getTaskContentSchema<T extends TaskCode>(
	taskCode: T,
): ExtractTaskContentSchema<T> {
	const schema = TaskContentSchema.options.find((opt) =>
		(opt.shape as any).taskCode.options.includes(taskCode),
	);
	if (!schema) {
		throw new Error(`TaskContentSchema not found for taskCode: ${taskCode}`);
	}
	return schema as any;
}

export function getItemContentSchema<T extends ItemCode>(
	itemCode: T,
): ExtractItemContentSchema<T> {
	const schema = ItemContentSchema.options.find((opt) =>
		(opt.shape as any).itemCode.options.includes(itemCode),
	);
	if (!schema) {
		throw new Error(`ItemContentSchema not found for itemCode: ${itemCode}`);
	}
	return schema as any;
}

export function getResponseContentSchema<T extends ItemCode>(
	itemCode: T,
): ExtractResponseContentSchema<T> {
	const schema = ResponseContentSchema.options.find((opt) =>
		(opt.shape as any).itemCode.options.includes(itemCode),
	);
	if (!schema) {
		throw new Error(
			`ResponseContentSchema not found for itemCode: ${itemCode}`,
		);
	}
	return schema as any;
}
