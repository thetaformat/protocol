import z from 'zod';
import {
	NonEmpStrSchema,
	OffsetDatetimeStrSchema,
	PosIntSchema,
} from './__shared';
import { ManifestPaperSchema } from './manifest';

export const CatalogPaperSchema = ManifestPaperSchema.pick({
	fileKey: true,
	createdAt: true,
	updatedAt: true,
	examCode: true,
	collectionName: true,
	paperName: true,
	issueDate: true,
}).extend({
	downloadUrl: z.url(),
	fileSizeInBytes: PosIntSchema,
});

/**
 * catalog.json schema
 */
export const CatalogSchema = z.object({
	publisherName: NonEmpStrSchema,
	createdAt: OffsetDatetimeStrSchema,
	updatedAt: OffsetDatetimeStrSchema,
	papers: CatalogPaperSchema.array(),
});
