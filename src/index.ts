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
  TransDictSchema,
} from './__shared';
import ielts_academic_20230503 from './ielts-academic-20230503';
import toefl_ibt_20260121 from './toefl-ibt-20260121';

export * from './__shared';

export const ExamCodeSchema = z.enum([
  ...toefl_ibt_20260121.ExamCodeSchema.options,
  ...ielts_academic_20230503.ExamCodeSchema.options,
]);
export type ExamCode = z.infer<typeof ExamCodeSchema>;

export const examDefs = {
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
  id: z.uuid().describe('Canonical Paper ID'), // 🌟 试卷根节点纯 UUID
  createdAt: OffsetDatetimeStrSchema,
  examCode: ExamCodeSchema,
  collectionName: TransDictSchema,
  paperName: TransDictSchema,
  releaseNotes: TransDictSchema,
  issuedAt: OffsetDatetimeStrSchema,
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

/**
 * 下面是一些业务代码中可能会用到的常用工具函数
 */

// 提取特定 ExamCode 下所有的 SectionCode
export type GetSectionCodeUnderExam<E extends ExamCode> = Extract<
  SectionCode,
  `${E}_${string}`
>;

// 提取特定 ExamCode 下所有的 TaskCode
export type GetTaskCodeUnderExam<E extends ExamCode> = Extract<
  TaskCode,
  `${E}_${string}`
>;

// 提取特定 ExamCode 下所有的 ItemCode
export type GetItemCodeUnderExam<E extends ExamCode> = Extract<
  ItemCode,
  `${E}_${string}`
>;

// 提取特定 SectionCode 下所有的 TaskCode
export type GetTaskCodeUnderSection<S extends SectionCode> = Extract<
  TaskCode,
  `${S}_${string}`
>;

// 提取特定 SectionCode 下所有的 ItemCode
export type GetItemCodeUnderSection<S extends SectionCode> = Extract<
  ItemCode,
  `${S}_${string}`
>;

// 提取特定 TaskCode 下所有的 ItemCode
export type GetItemCodeUnderTask<T extends TaskCode> = Extract<
  ItemCode,
  `${T}_${string}`
>;

// 提取特定 ItemCode 所属的 TaskCode
export type GetTaskCodeAboveItem<I extends ItemCode> = {
  [T in TaskCode]: I extends GetItemCodeUnderTask<T> ? T : never;
}[TaskCode];

/**
 * 高阶类型推导器：给定 TaskCode K，从全局联合类型中动态选取出对应的 TaskContent 结构
 */
export type InferTaskContent<K extends TaskCode> = Extract<
  TaskContent,
  { taskCode: K }
>;

/**
 * 高阶类型推导器：给定 ItemCode K，从全局联合类型中动态选取出对应的 ItemContent 结构
 */
export type InferItemContent<K extends ItemCode> = Extract<
  ItemContent,
  { itemCode: K }
>;

/**
 * 高阶类型推导器：给定 ItemCode K，从全局联合类型中动态选取出对应的 ResponseContent 结构
 */
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
