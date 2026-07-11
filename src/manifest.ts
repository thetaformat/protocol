import semver from 'semver';
import { z } from 'zod';

import {
	FileKeySchema,
	OffsetDatetimeStrSchema,
	SequenceSchema,
	TransDictSchema,
} from './__shared';
import {
	ExamCodeSchema,
	ItemCodeSchema,
	ItemContentSchema,
	ResponseContentSchema,
	SectionCodeSchema,
	TaskCodeSchema,
	TaskContentSchema,
} from './exams';

export const ManifestPaperSchema = z.object({
	fileKey: FileKeySchema,
	createdAt: OffsetDatetimeStrSchema,
	updatedAt: OffsetDatetimeStrSchema,
	examCode: ExamCodeSchema,
	collectionName: TransDictSchema,
	paperName: TransDictSchema,
	issueDate: OffsetDatetimeStrSchema,
	sections: z
		.object({
			code: SectionCodeSchema,
			sequence: SequenceSchema,
			tasks: z
				.object({
					code: TaskCodeSchema,
					sequence: SequenceSchema,
					content: TaskContentSchema,
					items: z
						.object({
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
		schemaVersion: z.string().refine((val) => semver.valid(val) !== null, {
			message: 'Only accept valid SemVer string.',
		}),
	}),
	paper: ManifestPaperSchema,
});
export type Manifest = z.infer<typeof ManifestSchema>;
