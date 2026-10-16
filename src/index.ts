import z from 'zod';

import {
  type LangCode,
  type ResponseCode,
  type SegmentedParagraphs,
  type Transcript,
  type TransDict,
  FileKeySchema,
  OffsetDatetimeStrSchema,
  PaperWideSequenceSchema,
  PosIntSchema,
  SimpleImageSchema,
  TransDictSchema,
} from './__shared';
import ielts_academic_20230503 from './ielts-academic-20230503';
import toefl_ibt_20260121 from './toefl-ibt-20260121';

export * from './__shared';
export * from './traits';

export const ExamCodeSchema = z.enum([
  ...toefl_ibt_20260121.ExamCodeSchema.options,
  ...ielts_academic_20230503.ExamCodeSchema.options,
]);
export type ExamCode = z.infer<typeof ExamCodeSchema>;

export const examSpecs = {
  toefl_ibt_20260121,
  ielts_academic_20230503,
} satisfies Record<ExamCode, any>;

export const SectionCodeSchema = z.enum([
  ...toefl_ibt_20260121.SectionCodeSchema.options,
  ...ielts_academic_20230503.SectionCodeSchema.options,
]);
export type SectionCode = z.infer<typeof SectionCodeSchema>;

export const TaskCodeSchema = z.enum([
  ...toefl_ibt_20260121.TaskCodeSchema.options,
  ...ielts_academic_20230503.TaskCodeSchema.options,
]);
export type TaskCode = z.infer<typeof TaskCodeSchema>;

export const ItemCodeSchema = z.enum([
  ...toefl_ibt_20260121.ItemCodeSchema.options,
  ...ielts_academic_20230503.ItemCodeSchema.options,
]);
export type ItemCode = z.infer<typeof ItemCodeSchema>;

export type TaskContent =
  | z.infer<typeof toefl_ibt_20260121.TaskContentSchema>
  | z.infer<typeof ielts_academic_20230503.TaskContentSchema>;

export const TaskContentSchema = z.discriminatedUnion('taskCode', [
  ...toefl_ibt_20260121.TaskContentSchema.options,
  ...ielts_academic_20230503.TaskContentSchema.options,
] as [any, ...any[]]) as unknown as z.ZodType<TaskContent> & {
  options: any[];
  optionsMap?: Map<string, any>;
};

export type ItemContent =
  | z.infer<typeof toefl_ibt_20260121.ItemContentSchema>
  | z.infer<typeof ielts_academic_20230503.ItemContentSchema>;

export const ItemContentSchema = z.discriminatedUnion('itemCode', [
  ...toefl_ibt_20260121.ItemContentSchema.options,
  ...ielts_academic_20230503.ItemContentSchema.options,
] as [any, ...any[]]) as unknown as z.ZodType<ItemContent> & {
  options: any[];
  optionsMap?: Map<string, any>;
};

export type ResponseContent =
  | z.infer<typeof toefl_ibt_20260121.ResponseContentSchema>
  | z.infer<typeof ielts_academic_20230503.ResponseContentSchema>;

export const ResponseContentSchema = z.discriminatedUnion('itemCode', [
  ...toefl_ibt_20260121.ResponseContentSchema.options,
  ...ielts_academic_20230503.ResponseContentSchema.options,
] as [any, ...any[]]) as unknown as z.ZodType<ResponseContent> & {
  options: any[];
  optionsMap?: Map<string, any>;
};

export const ManifestPaperSchema = z.object({
  id: z.uuid().describe('Canonical Paper ID'),
  createdAt: OffsetDatetimeStrSchema,
  examCode: ExamCodeSchema,
  collectionName: TransDictSchema,
  paperName: TransDictSchema,
  releaseNotes: TransDictSchema,
  issuedAt: OffsetDatetimeStrSchema,
  cover: SimpleImageSchema.optional().describe(
    '试卷封面图片（保存在包内 media/ 目录下）',
  ),
  sections: z
    .object({
      id: z.uuid().describe('Canonical Section ID'),
      code: SectionCodeSchema,
      sequence: PaperWideSequenceSchema,
      tasks: z
        .object({
          id: z.uuid().describe('Canonical Task ID'),
          code: TaskCodeSchema,
          sequence: PaperWideSequenceSchema,
          content: TaskContentSchema,
          items: z
            .object({
              id: z.uuid().describe('Canonical Item ID'),
              code: ItemCodeSchema,
              sequence: PaperWideSequenceSchema,
              content: ItemContentSchema,
              referenceResponseContent: ResponseContentSchema,
            })
            .array(),
        })
        .array(),
    })
    .array(),
});
export type ManifestPaper = z.infer<typeof ManifestPaperSchema>;

export const ManifestSchema = z.object({
  meta: z.object({
    magic: z.literal('theta'),
  }),
  paper: ManifestPaperSchema,
});
export type Manifest = z.infer<typeof ManifestSchema>;

export const CatalogPaperSchema = ManifestPaperSchema.pick({
  id: true,
  createdAt: true,
  examCode: true,
  collectionName: true,
  paperName: true,
  releaseNotes: true,
  issuedAt: true,
  cover: true,
}).extend({
  fileKey: FileKeySchema,
  downloadUrl: z.url(),
  fileSizeInBytes: PosIntSchema,
  coverUrl: z.url().optional().describe('公网 CDN 封面快速预览图链接'),
});
export type CatalogPaper = z.infer<typeof CatalogPaperSchema>;

export const CatalogSchema = z.object({
  createdAt: OffsetDatetimeStrSchema,
  updatedAt: OffsetDatetimeStrSchema,
  papers: CatalogPaperSchema.array(),
});
export type Catalog = z.infer<typeof CatalogSchema>;

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
  unionSchema: z.ZodType<T>,
  _discriminatorKey: D,
  discriminatorValue: V,
): z.ZodType<Extract<T, Record<D, V>>> {
  const union = unionSchema as any;

  if (union.optionsMap instanceof Map) {
    const memberSchema = union.optionsMap.get(discriminatorValue);
    if (memberSchema) {
      return memberSchema as z.ZodType<Extract<T, Record<D, V>>>;
    }
  }

  if (!union.options || !Array.isArray(union.options)) {
    throw new Error(
      `[extractDiscriminatedUnionMember] The provided schema does not appear to be a valid union or discriminated union schema.`,
    );
  }

  const memberSchema = union.options.find((option: any) => {
    const field = option.shape?.[_discriminatorKey];
    if (!field) return false;

    if ('options' in field && Array.isArray(field.options)) {
      return field.options.includes(discriminatorValue);
    }
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

export function getTaskContentSchema<V extends TaskCode>(
  taskCode: V,
): z.ZodType<Extract<TaskContent, { taskCode: V }>> {
  return extractDiscriminatedUnionMember(
    TaskContentSchema,
    'taskCode',
    taskCode,
  );
}

export function getItemContentSchema<V extends ItemCode>(
  itemCode: V,
): z.ZodType<Extract<ItemContent, { itemCode: V }>> {
  return extractDiscriminatedUnionMember(
    ItemContentSchema,
    'itemCode',
    itemCode,
  );
}

/**
 * 封装获取，对上层业务彻底屏蔽复杂获取逻辑
 * 查询itemCode对应的responseCode
 */
export function getResponseCode(itemCode: ItemCode): ResponseCode {
  const schema = ResponseContentSchema.options.find(
    (opt) => opt.shape.itemCode.options[0] === itemCode,
  );
  const responseCode = schema?.shape.responseCode.options[0];
  if (!responseCode) {
    throw new Error(`Unable to find responseCode for itemCode: ${itemCode}`);
  }
  return responseCode;
}

export function getResponseContentSchema<V extends ItemCode>(
  itemCode: V,
): z.ZodType<Extract<ResponseContent, { itemCode: V }>> {
  return extractDiscriminatedUnionMember(
    ResponseContentSchema,
    'itemCode',
    itemCode,
  );
}

// 在模块加载时，一次性扁平化聚合所有静态定义的 displayNames
const globalDisplayNames = Object.values(examSpecs).reduce(
  (acc, exam) => {
    return Object.assign(acc, exam.displayNames);
  },
  {} as Record<ExamCode | SectionCode | TaskCode | ItemCode, TransDict>,
);

/**
 * 全局、强类型安全的多语言 displayName 解析函数
 */
export function getDisplayName(
  code: ExamCode | SectionCode | TaskCode | ItemCode,
  lang: LangCode,
): string {
  // 强类型与 Schema 约束保障：code 必定存在，且其下的 lang 必定有值
  return globalDisplayNames[code][lang];
}

/**
 * 下面是一些业务代码中可能会用到的常用工具函数
 */
export type GetSectionCodeUnderExam<E extends ExamCode> = Extract<
  SectionCode,
  `${E}_${string}`
>;

export type GetTaskCodeUnderExam<E extends ExamCode> = Extract<
  TaskCode,
  `${E}_${string}`
>;

export type GetItemCodeUnderExam<E extends ExamCode> = Extract<
  ItemCode,
  `${E}_${string}`
>;

export type GetTaskCodeUnderSection<S extends SectionCode> = Extract<
  TaskCode,
  `${S}_${string}`
>;

export type GetItemCodeUnderSection<S extends SectionCode> = Extract<
  ItemCode,
  `${S}_${string}`
>;

export type GetItemCodeUnderTask<T extends TaskCode> = Extract<
  ItemCode,
  `${T}_${string}`
>;

export function getSectionCodesUnderExam<E extends ExamCode>(
  examCode: E,
): GetSectionCodeUnderExam<E>[] {
  const prefix = `${examCode}_`;
  return SectionCodeSchema.options.filter(
    (code): code is GetSectionCodeUnderExam<E> => code.startsWith(prefix),
  );
}

export function getTaskCodesUnderExam<E extends ExamCode>(
  examCode: E,
): GetTaskCodeUnderExam<E>[] {
  const prefix = `${examCode}_`;
  return TaskCodeSchema.options.filter(
    (code): code is GetTaskCodeUnderExam<E> => code.startsWith(prefix),
  );
}

export function getItemCodesUnderExam<E extends ExamCode>(
  examCode: E,
): GetItemCodeUnderExam<E>[] {
  const prefix = `${examCode}_`;
  return ItemCodeSchema.options.filter(
    (code): code is GetItemCodeUnderExam<E> => code.startsWith(prefix),
  );
}

export function getTaskCodesUnderSection<S extends SectionCode>(
  sectionCode: S,
): GetTaskCodeUnderSection<S>[] {
  const prefix = `${sectionCode}_`;
  return TaskCodeSchema.options.filter(
    (code): code is GetTaskCodeUnderSection<S> => code.startsWith(prefix),
  );
}

export function getItemCodesUnderSection<S extends SectionCode>(
  sectionCode: S,
): GetItemCodeUnderSection<S>[] {
  const prefix = `${sectionCode}_`;
  return ItemCodeSchema.options.filter(
    (code): code is GetItemCodeUnderSection<S> => code.startsWith(prefix),
  );
}

export function getItemCodesUnderTask<T extends TaskCode>(
  taskCode: T,
): GetItemCodeUnderTask<T>[] {
  const prefix = `${taskCode}_`;
  return ItemCodeSchema.options.filter(
    (code): code is GetItemCodeUnderTask<T> => code.startsWith(prefix),
  );
}

export type GetTaskCodeAboveItem<I extends ItemCode> = {
  [T in TaskCode]: I extends GetItemCodeUnderTask<T> ? T : never;
}[TaskCode];

export type InferTaskContent<K extends TaskCode> = Extract<
  TaskContent,
  { taskCode: K }
>;

export type InferItemContent<K extends ItemCode> = Extract<
  ItemContent,
  { itemCode: K }
>;

export type InferResponseContent<K extends ItemCode> = Extract<
  ResponseContent,
  { itemCode: K }
>;

/**
 * 辅助函数：根据树状 AST 节点完全反向还原原始段落文本
 * 验证数学公式：SentenceString = sum(token.text + token.spaceAfter)
 */
export function reconstructParagraphs(
  segmentedParagraphs: SegmentedParagraphs,
): string[] {
  return segmentedParagraphs.map((segmentedParagraph) =>
    segmentedParagraph.sentences
      .map((sentence) =>
        sentence.tokens.map((token) => token.text + token.spaceAfter).join(''),
      )
      .join(''),
  );
}

/**
 * 从transcript数组提取transcript纯text版本
 */
export function getTranscriptText(transcript: Transcript): string {
  return transcript.map((t) => t.sentenceText).join(' ');
}
