import { z } from 'zod';

export type LangCode = z.infer<typeof LangCodeSchema>;
export type VerbatimSequence = z.infer<typeof VerbatimSequenceSchema>;
export type SeqId = z.infer<typeof SeqIdSchema>;
export type FileKey = z.infer<typeof FileKeySchema>;
export type OffsetDatetimeStr = z.infer<typeof OffsetDatetimeStrSchema>;
export type TransDict = z.infer<typeof TransDictSchema>;
export type MdTransDict = z.infer<typeof MdTransDictSchema>;
export type SimpleImage = z.infer<typeof SimpleImageSchema>;
export type InformativeImage = z.infer<typeof InformativeImageSchema>;
export type SimpleAudio = z.infer<typeof SimpleAudioSchema>;
export type SimpleVideo = z.infer<typeof SimpleVideoSchema>;
export type Transcript = z.infer<typeof TranscriptSchema>;
export type TranscriptedAudio = z.infer<typeof TranscriptedAudioSchema>;
export type TranscriptedVideo = z.infer<typeof TranscriptedVideoSchema>;
export type SilentNoddingVideo = z.infer<typeof SilentNoddingVideoSchema>;
export type Token = z.infer<typeof TokenSchema>;
export type SegmentedSentence = z.infer<typeof SegmentedSentenceSchema>;
export type SegmentedParagraphs = z.infer<typeof SegmentedParagraphsSchema>;
export type SegmentedPassage = z.infer<typeof SegmentedPassageSchema>;
export type NarratedInstruction = z.infer<typeof NarratedInstructionSchema>;
export type ResponseCode = z.infer<typeof ResponseCodeSchema>;

/**
 * 多语种支持
 * 可选项包括：'en','zh','zh-hant','es','ar','fr','pt','ko','ja','hi','de','it','ru','id','vi','tr'
 */
export const LangCodeSchema = z.enum(['en', 'zh']);

export const IndexSchema = z
  .number()
  .int()
  .min(0)
  .describe('Index starting from 0');

export const PosIntSchema = z
  .number()
  .int()
  .min(1)
  .describe('Positive integer');

export const PaperWideSequenceSchema = z
  .number()
  .int()
  .min(1)
  .max(1000)
  .describe('Paper-wide global sequence, starting from 1.');

export const VerbatimSequenceSchema = z
  .number()
  .int()
  .min(1)
  .max(1000)
  .describe(
    'Verbatim sequence shown on the PDF materials. If none is shown, use scoped 1,2,3...',
  );

/**
 * 确定性的顺序指针 ID 规范
 * 强约束：必须从 "1" 开始，自增 1 递增
 * 适用场景：完形填空 Gap ID、选择题 Option ID、匹配题连线 ID 等
 */
export const SeqIdSchema = z
  .string()
  .regex(/^[1-9]\d*$/)
  .describe(
    'Deterministic sequential pointer ID, starting from "1", incrementing by 1',
  );

export const LabelIdSchema = z
  .string()
  .min(1)
  .trim()
  .describe(
    'Label ID. A/B/C, True/False/Not Given, i/ii/iii/iv etc. if none, use 1,2,3...',
  );

export const NonEmptyStringSchema = z
  .string()
  .min(1)
  .trim()
  .describe('Non-empty string');

export const MaybeEmptyStringSchema = z.string().trim();

export const NonEmptyMdSchema = NonEmptyStringSchema.describe(
  'Fully-featured Markdown text.',
);

export const EmptyObjectSchema = z
  .object({})
  .describe('Intentionally empty content.');

// 用占位符代表 Undetermined Schema 比如雅思有些理论上存在的题型的QuestionContentSchema
export const PlaceholderObjectSchema = z.object({
  placeholder: z.enum(['PLACEHOLDER']),
});

export const FileKeySchema = z
  .string()
  .regex(
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\.[a-zA-Z0-9]+$/,
  )
  .describe('file key: UUID with extension');

/**
 * 绝对时间，包含时区偏移，能唯一确定一个宇宙时间点
 */
export const OffsetDatetimeStrSchema = z.iso.datetime({ offset: true });

export const TransDictSchema = z.object(
  Object.fromEntries(
    LangCodeSchema.options.map((code) => [code, NonEmptyStringSchema]),
  ) as Record<LangCode, z.ZodString>,
);

export const MdTransDictSchema = z.object(
  Object.fromEntries(
    LangCodeSchema.options.map((code) => [code, NonEmptyMdSchema]),
  ) as Record<LangCode, z.ZodString>,
);

export const SimpleImageSchema = z.object({
  formatCode: z.enum(['simple_image']),
  fileKey: FileKeySchema,
  fileSizeInBytes: PosIntSchema,
  height: PosIntSchema,
  width: PosIntSchema,
});

export const InformativeImageSchema = SimpleImageSchema.extend({
  formatCode: z.enum(['informative_image']),
}).describe(
  'Image that bears essential question information rather than pure illustration.',
);

export const SimpleAudioSchema = z.object({
  formatCode: z.enum(['simple_audio']),
  fileKey: FileKeySchema,
  durationSeconds: z.number().min(0),
  fileSizeInBytes: PosIntSchema,
});

/**
 * inputImage and inputAudio are temporary variables in AI video generation.
 * They should be deleted after video generation.
 * Or they should not be present at all if video fileKey is provided directly.
 * Not support inputText as video-gen source, as it is unlikely in real case.
 */
export const SimpleVideoSchema = SimpleAudioSchema.extend({
  formatCode: z.enum(['simple_video']),
  inputImage: z.object({ fileKey: FileKeySchema }).optional(),
  inputAudio: z.object({ fileKey: FileKeySchema }).optional(),
});

export const TranscriptSchema = z
  .object({
    startTime: NonEmptyStringSchema.describe(
      'timestamp format is MM:SS, to the highest accuracy.',
    ),
    endTime: NonEmptyStringSchema.describe(
      'timestamp format is MM:SS, to the highest accuracy.',
    ),
    speaker: NonEmptyStringSchema.default('Speaker').describe(
      'Speaker name or role.',
    ),
    sentenceText: NonEmptyStringSchema.describe(
      `${NonEmptyStringSchema.description}\n Text of EACH SENTENCE.`,
    ),
  })
  .array()
  .describe('The full verbatim transcript text.');

export const TranscriptedAudioSchema = SimpleAudioSchema.extend({
  formatCode: z.enum(['transcripted_audio']),
  transcript: TranscriptSchema,
});

export const TranscriptedVideoSchema = SimpleVideoSchema.extend({
  formatCode: z.enum(['transcripted_video']),
  transcript: TranscriptSchema,
});

export const SilentNoddingVideoSchema = SimpleAudioSchema.extend({
  formatCode: z.enum(['silent_nodding_video']),
  inputImage: z.object({ fileKey: FileKeySchema }).optional(),
});

export const TitleSchema = z.object({
  title: NonEmptyStringSchema.optional().describe(
    'Title is optional unless explicitly provided.',
  ),
  subtitle: NonEmptyStringSchema.optional().describe(
    'Subtitle is optional unless explicitly provided.',
  ),
});

export const SimpleParagraphsSchema = z
  .object({ id: LabelIdSchema, text: NonEmptyStringSchema })
  .array()
  .describe('The full text paragraph by paragraph.');

export const SimplePassageSchema = TitleSchema.extend({
  paragraphs: SimpleParagraphsSchema,
});

/**
 * 嵌套树设计（passage->paragraphs->sentences->tokens），配置 Label ID 进行定位。
 */
export const TokenSchema = z
  .object({
    id: SeqIdSchema,
    text: NonEmptyStringSchema,
    type: z.enum(['word', 'non_word']).default('word'),
    spaceAfter: z.string().default(''),
  })
  .describe('A single word or punctuation mark with its trailing spaces.');

export const SegmentedSentenceSchema = z
  .object({
    formatCode: z.enum(['segmented_sentence']),
    id: SeqIdSchema,
    tokens: TokenSchema.array(),
    fullText: NonEmptyStringSchema.describe('Whole sentence full text.'),
  })
  .describe('A segmented sentence containing tokens.');

export const SegmentedParagraphsSchema = z
  .object({
    id: LabelIdSchema, // 兼容段落名称，比如 A-G 段
    sentences: SegmentedSentenceSchema.array(),
  })
  .array()
  .describe(
    'The segmented text paragraph by paragraph, ready for interaction.',
  );

export const SegmentedPassageSchema = TitleSchema.extend({
  paragraphs: SegmentedParagraphsSchema,
});

export const NarratedInstructionSchema = z.object({
  formatCode: z.enum(['narrated_instruction']),
  text: NonEmptyMdSchema,
  audio: z
    .object({ fileKey: FileKeySchema })
    .describe('Audio narration of the text. Generated from AI TTS.'),
});

export const StemSchema = NonEmptyMdSchema.describe(
  `${NonEmptyMdSchema.description}\n Specifically 题干部分。注意: If the prompt is a SINGLE question prompt, then don't include any question label ids in the front of that prompt such as but not limited to '1.', '2. ','3.' etc.`,
);

export const OptionsSchema = z
  .object({
    id: LabelIdSchema,
    text: NonEmptyMdSchema.describe(
      `${NonEmptyMdSchema.description}\n 选项文本。`,
    ),
  })
  .array()
  .min(1);

/**
 * 采用正交底层数据原语，收敛并支持全科所有考试题型的作答数据形态。
 */
export const ResponseCodeSchema = z.enum([
  'selection_array',
  'filling_array',
  'selection_record',
  'filling_record',
  'writing',
  'speaking',
  'filming',
]);

/**
 * @客观题
 *
 * 一维序列响应 (Array-style Response)
 *
 * 适用但不限于：
 * - 单选题 / 多选题 / 判断题（如 TOEFL/IELTS Choice, T/F/NG, Y/N/NG）
 * - 排序题（如 PTE Re-order Paragraphs，数组元素的 Index 隐含了正确的排序顺序）
 * - 高亮/划线题（如 GRE Select-in-Passage, PTE Highlight Incorrect Words，数组元素为选中的 Token/Span ID）
 *
 * @example
 * // 单选/多选/高亮：选中了 ID 为 "A" 和 "C" 的选项或词块
 * { responseCode: 'array', array: ['A', 'C'] }
 *
 * @example
 * // 排序题：最终提交的有序 ID 序列
 * { responseCode: 'array', array: ['3', '1', '2'] }
 */
export const SelectionArraySchema = z.object({
  responseCode: z.enum([ResponseCodeSchema.enum.selection_array]),
  array: LabelIdSchema.array().describe(
    '选择题（单选/多选/判断，Selection order 不敏感）、排序题（数组 index 隐含顺序）或高亮划线题（选中的 Token/Span ID 列表）。',
  ),
});

/**
 * @客观题
 *
 * 一维文本答案响应 (Set-String Response)
 *
 * 针对题干无需 Markdown 占位符 {{seqId}} 的【单空/独立主观填空题】。
 * - array**所有可接受的正确文本答案数组**（包含同义词、英美式变体、拼写容错等）。
 *
 * 适用于：单空听写填空、单词默写、独立单空主观题等只需校验单个填空位但允许多种正确表达的场景。
 *
 * @example
 * // 接受 "color" 或 "colour" 作为正确答案
 * { responseCode: 'filling_array', array: ['color', 'colour'] }
 *
 * @example
 * // 拼写容错/同义词示例
 * { responseCode: 'filling_array', array: ['graffiti', 'grafiti'] }
 */
export const FillingArraySchema = z.object({
  responseCode: z.enum([ResponseCodeSchema.enum.filling_array]),
  array: z
    .string()
    .trim()
    .array()
    .describe(
      '对于标答而言，可以有一个或多个元素：该主观填空题可接受的所有正确文本答案数组（包含同义词、拼写容错变体等）。对于作答而言，只有一个元素。',
    ),
});

/**
 * @客观题
 *
 * 选择映射响应 (Record-SeqId Response)
 *
 * 针对题干 Markdown 中占位符 {{seqId}} 的【闭环式选项代号/卡片选择/拖拽】。
 * - Key：占位符 ID (对应题干 Markdown 中的 {{1}}, {{2}} ...)
 * - Value：填入该占位符的预设候选选项代号 ID 数组 (如 ["option_A"] 或 ["col_true"])
 *
 * 适用于：选词填空、段落/句尾配对、矩阵按钮勾选、分类归条等任何需要点选/拖拽预设代号的占位符场景。
 */
export const SelectionRecordSchema = z.object({
  responseCode: z.enum([ResponseCodeSchema.enum.selection_record]),
  record: z
    .record(SeqIdSchema, LabelIdSchema.array())
    .describe(
      'Key 为题干 Markdown 中的占位符 ID (与 {{1}}, {{2}} 对应)，Value 为填入该占位符的预设候选选项代号 ID 答案数组',
    ),
});

/**
 * @客观题
 *
 * 填空映射响应 (Record-String Response)
 *
 * 针对题干 Markdown 中占位符 {{seqId}} 的【开放式文本/打字/听写输入】。
 * - Key：占位符 ID (对应题干 Markdown 中的 {{1}}, {{2}} ...)
 * - Value：该占位符接受的开放式文本/字符串答案数组 (如 ["graffiti", "grafiti"])
 *
 * 适用于：段落打字填空、表格单元格打字填空、矩阵单元格打字输入等任何需要自由输入纯文本的占位符场景。
 */
export const FillingRecordSchema = z.object({
  responseCode: z.enum([ResponseCodeSchema.enum.filling_record]),
  record: z
    .record(SeqIdSchema, NonEmptyStringSchema.trim().array())
    .describe(
      'Key 为题干 Markdown 中的占位符 ID (与 {{1}}, {{2}} 对应)，Value 为该占位符可接受的开放式字符串文本答案数组',
    ),
});

/**
 * @主观题
 *
 * 开放文本响应 (Text-style Response)
 *
 * 适用于：所有主观长文本输出题型（如 TOEFL/IELTS 写作 Essay、简答题 Short Answer）。没有一个“标准“答案。
 *
 * @example
 * // 写作题
 * {
 *   responseCode: 'writing',
 *   text: "In my opinion, environmental protection is vital because..."
 * }
 */
export const WritingSchema = z.object({
  responseCode: z.enum([ResponseCodeSchema.enum.writing]),
  text: MaybeEmptyStringSchema.describe('主观长文本/作文/简答回答内容数组。'),
});

/**
 * @主观题
 *
 * 语音录制响应 (Audio-style Response)
 *
 * 适用于：所有口语跟读、复述、问答录音题型（如 TOEFL Speaking, IELTS Speaking, PTE Read Aloud）。
 * 包含了录音文件元信息以及 AI TTS/ASR 生成的带时间戳逐句字幕。
 *
 * @example
 * {
 *   responseCode: 'speaking',
 *   audio: {
 *     formatCode: 'transcripted_audio',
 *     fileKey: '3a1f4b8c-d2e9-4f0a-b1c2-d3e4f5a6b7c8.mp3',
 *     durationSeconds: 45,
 *     fileSizeInBytes: 1048576,
 *     transcript: [
 *       { startTime: '00:00', endTime: '00:03', speaker: 'Candidate', sentenceText: 'I strongly agree with...' }
 *     ]
 *   }
 * }
 */
export const SpeakingSchema = z.object({
  responseCode: z.enum([ResponseCodeSchema.enum.speaking]),
  audio: TranscriptedAudioSchema.describe('口语录音资产及逐句带时间戳转写字幕'),
});

/**
 * @主观题
 *
 * 视频录制响应 (Video-style Response)
 *
 * 适用于：所有视讯面试、视频答题录制题型（如 DET Speaking Sample 面试视频）。
 *
 * @example
 * {
 *   responseCode: 'filming',
 *   video: {
 *     formatCode: 'transcripted_video',
 *     fileKey: 'c4d3e2b1-a0f9-4e8d-8c7b-6a5b4c3d2e1f.mp4',
 *     durationSeconds: 60,
 *     fileSizeInBytes: 10485760,
 *     transcript: [...]
 *   }
 * }
 */
export const FilmingSchema = z.object({
  responseCode: z.enum([ResponseCodeSchema.enum.filming]),
  video: TranscriptedVideoSchema.describe('面试视频录制资产及逐句转写字幕'),
});
