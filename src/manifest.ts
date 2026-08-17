import { z } from 'zod';

import {
	ExamCodeSchema,
	ItemCodeSchema,
	ItemContentSchema,
	ResponseContentSchema,
	SectionCodeSchema,
	TaskCodeSchema,
	TaskContentSchema,
} from './exam';
import {
	OffsetDatetimeStrSchema,
	SequenceSchema,
	TransDictSchema,
} from './exam/__shared';

export const ManifestPaperSchema = z.object({
	id: z.uuid().describe('Canonical Paper ID'), // 🌟 试卷根节点纯 UUID
	createdAt: OffsetDatetimeStrSchema,
	updatedAt: OffsetDatetimeStrSchema,
	examCode: ExamCodeSchema,
	collectionName: TransDictSchema,
	paperName: TransDictSchema,
	releaseNotes: TransDictSchema,
	issuedAt: OffsetDatetimeStrSchema,
	sections: z
		.object({
			id: z.uuid().describe('Canonical Section ID'),
			code: SectionCodeSchema,
			sequence: SequenceSchema,
			tasks: z
				.object({
					id: z.uuid().describe('Canonical Task ID'),
					code: TaskCodeSchema,
					sequence: SequenceSchema,
					content: TaskContentSchema,
					items: z
						.object({
							id: z.uuid().describe('Canonical Item ID'),
							code: ItemCodeSchema,
							sequence: SequenceSchema,
							content: ItemContentSchema,
							modelResponseContent: ResponseContentSchema,
						})
						.array(),
				})
				.array(),
		})
		.array(),
});
export type ManifestPaper = z.infer<typeof ManifestPaperSchema>;

/**
 * manifest.json schema
 */
export const ManifestSchema = z.object({
	meta: z.object({
		magic: z.literal('theta'),
	}),
	paper: ManifestPaperSchema,
});
export type Manifest = z.infer<typeof ManifestSchema>;
