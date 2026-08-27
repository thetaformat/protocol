import z from 'zod';

import {
  FileKeySchema,
  OffsetDatetimeStrSchema,
  PosIntSchema,
} from './exam/__shared';
import { ManifestPaperSchema } from './manifest';

export const CatalogPaperSchema = ManifestPaperSchema.pick({
  id: true,
  createdAt: true,
  examCode: true,
  collectionName: true,
  paperName: true,
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
