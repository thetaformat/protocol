import z from 'zod';

import { ManifestPaperSchema } from './__manifest';
import {
  FileKeySchema,
  OffsetDatetimeStrSchema,
  PosIntSchema,
} from './__shared';

export const CatalogPaperSchema = ManifestPaperSchema.pick({
  id: true,
  createdAt: true,
  examCode: true,
  collectionName: true,
  paperName: true,
  releaseNotes: true,
  issuedAt: true,
}).extend({
  fileKey: FileKeySchema,
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
