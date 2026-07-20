import z from 'zod';

import { OffsetDatetimeStrSchema, PosIntSchema } from './__shared';
import { ManifestPaperSchema } from './manifest';

export const CatalogPaperSchema = ManifestPaperSchema.pick({
	fileKey: true,
	createdAt: true,
	updatedAt: true,
	examCode: true,
	collectionName: true,
	paperName: true,
	issuedAt: true,
}).extend({
	downloadUrl: z.url(),
	fileSizeInBytes: PosIntSchema,
});
export type CatalogPaper = z.infer<typeof CatalogPaperSchema>;

/**
 * catalog.json schema
 */
export const CatalogSchema = z.object({
	createdAt: OffsetDatetimeStrSchema,
	updatedAt: OffsetDatetimeStrSchema,
	papers: CatalogPaperSchema.array(),
});
export type Catalog = z.infer<typeof CatalogSchema>;
