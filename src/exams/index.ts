import z from 'zod';

import toefl_ibt_20260121 from './toefl-ibt-20260121';

export const examDefs = { toefl_ibt_20260121 } satisfies Record<ExamCode, any>;

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
