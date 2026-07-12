import { z } from 'zod';

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

export const SequenceSchema = z
	.number()
	.int()
	.min(1)
	.max(1000)
	.describe('Global sequence within the paper, starting from 1');

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
export type SeqId = z.infer<typeof SeqIdSchema>;

export const NonEmpStrSchema = z
	.string()
	.min(1)
	.trim()
	.describe('Non-empty string');

export const NonEmpMdSchema = NonEmpStrSchema.describe(
	'Fully featured markdown text.',
);

export const EmptyObjectSchema = z
	.object({})
	.describe('Intentionally empty content.');

export const FileKeySchema = z
	.string()
	.regex(
		/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\.[a-zA-Z0-9]+$/,
	)
	.describe('file key: UUID with extension');
export type FileKey = z.infer<typeof FileKeySchema>;

/**
 * 绝对时间，包含时区偏移，能唯一确定一个宇宙时间点
 */
export const OffsetDatetimeStrSchema = z.iso.datetime({ offset: true });
export type OffsetDatetimeStr = z.infer<typeof OffsetDatetimeStrSchema>;

/**
 * 多语种支持
 * 可选项包括：'en','zh','zh-hant','es','ar','fr','pt','ko','ja','hi','de','it','ru','id','vi','tr'
 */
export const LangCodeSchema = z.enum(['en', 'zh']);
export type LangCode = z.infer<typeof LangCodeSchema>;

export const TransDictSchema = z.object(
	Object.fromEntries(
		LangCodeSchema.options.map((code) => [code, NonEmpStrSchema]),
	) as Record<LangCode, z.ZodString>,
);
export type TransDict = z.infer<typeof TransDictSchema>;

export const MdTransDictSchema = z.object(
	Object.fromEntries(
		LangCodeSchema.options.map((code) => [code, NonEmpMdSchema]),
	) as Record<LangCode, z.ZodString>,
);
export type MdTransDict = z.infer<typeof MdTransDictSchema>;

export const SimpleImageSchema = z.object({
	formatCode: z.enum(['simple_image']),
	fileKey: FileKeySchema,
	fileSizeInBytes: PosIntSchema,
	height: PosIntSchema,
	width: PosIntSchema,
});
export type SimpleImage = z.infer<typeof SimpleImageSchema>;

export const SimpleAudioSchema = z.object({
	formatCode: z.enum(['simple_audio']),
	fileKey: FileKeySchema,
	durationSeconds: z.number().min(0),
	fileSizeInBytes: PosIntSchema,
});
export type SimpleAudio = z.infer<typeof SimpleAudioSchema>;

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
export type SimpleVideo = z.infer<typeof SimpleVideoSchema>;

export const TranscriptSchema = z
	.object({
		startTime: NonEmpStrSchema.describe(
			'timestamp format is MM:SS, to the highest accuracy.',
		),
		endTime: NonEmpStrSchema.describe(
			'timestamp format is MM:SS, to the highest accuracy.',
		),
		speaker: NonEmpStrSchema.default('Speaker').describe(
			'Speaker name or role.',
		),
		sentenceText: NonEmpStrSchema.describe(
			`${NonEmpStrSchema.description}\n Transcript text of each sentence.`,
		),
	})
	.array();
export type Transcript = z.infer<typeof TranscriptSchema>;

export const TranscriptedAudioSchema = SimpleAudioSchema.extend({
	formatCode: z.enum(['transcripted_audio']),
	transcript: TranscriptSchema,
});
export type TranscriptedAudio = z.infer<typeof TranscriptedAudioSchema>;

export const TranscriptedVideoSchema = SimpleVideoSchema.extend({
	formatCode: z.enum(['transcripted_video']),
	transcript: TranscriptSchema,
});
export type TranscriptedVideo = z.infer<typeof TranscriptedVideoSchema>;

export const SilentNoddingVideoSchema = SimpleAudioSchema.extend({
	formatCode: z.enum(['silent_nodding_video']),
	inputImage: z.object({ fileKey: FileKeySchema }).optional(),
});
export type SilentNoddingVideo = z.infer<typeof SilentNoddingVideoSchema>;

export const TitleSchema = z.object({
	title: NonEmpStrSchema.optional().describe(
		'Title is optional unless explicitly provided.',
	),
	subtitle: NonEmpStrSchema.optional().describe(
		'Subtitle is optional unless explicitly provided.',
	),
});

export const SimpleParagraphsSchema = z
	.object({ id: SeqIdSchema, text: NonEmpStrSchema })
	.array()
	.describe('The full text paragraph by paragraph.');

export const SimplePassageSchema = TitleSchema.extend({
	paragraphs: SimpleParagraphsSchema,
});

/**
 * 嵌套树设计（passage->paragraphs->sentences->tokens），配置SeqId进行定位。
 */
export const TokenSchema = z
	.object({
		id: SeqIdSchema,
		text: z.string(),
		type: z.enum(['word', 'non_word']).default('word'),
		spaceAfter: z.string().default(''),
	})
	.describe('A single word or punctuation mark with its trailing spaces.');
export type Token = z.infer<typeof TokenSchema>;

export const SegmentedSentenceSchema = z
	.object({
		formatCode: z.enum(['segmented_sentence']),
		id: SeqIdSchema,
		tokens: TokenSchema.array(),
		fullText: NonEmpStrSchema.describe('Whole sentence full text.'),
	})
	.describe('A segmented sentence containing tokens.');
export type SegmentedSentence = z.infer<typeof SegmentedSentenceSchema>;

export const SegmentedParagraphsSchema = z
	.object({
		id: SeqIdSchema,
		sentences: SegmentedSentenceSchema.array(),
	})
	.array()
	.describe(
		'The segmented text paragraph by paragraph, ready for interaction.',
	);
export type SegmentedParagraphs = z.infer<typeof SegmentedParagraphsSchema>;

export const SegmentedPassageSchema = TitleSchema.extend({
	paragraphs: SegmentedParagraphsSchema,
});
export type SegmentedPassage = z.infer<typeof SegmentedPassageSchema>;

export const NarratedInstructionSchema = z.object({
	formatCode: z.enum(['narrated_instruction']),
	text: NonEmpMdSchema,
	audio: z
		.object({
			fileKey: FileKeySchema,
			durationSeconds: z.number().min(0),
			fileSizeInBytes: PosIntSchema,
		})
		.describe('Audio narration of the text. Generated from AI TTS.'),
});
export type NarratedInstruction = z.infer<typeof NarratedInstructionSchema>;

export const StemSchema = NonEmpMdSchema.describe(
	`${NonEmpMdSchema.description}\n Specifically if the prompt is a SINGLE question prompt, then don't include any positional indicators in the front of that prompt such as '1.', '2. ','3.' etc.`,
);

export const OptionsSchema = NonEmpStrSchema.describe(
	`${NonEmpStrSchema.description}\n Specifically, if the text contains positional indicators such as 'A.','B.','C.','D.' etc. Then remove it.`,
)
	.array()
	.min(1);

export const ResponseCodeSchema = z.enum([
	'cloze',
	'choice',
	'audio',
	'dictation',
	'essay',
	'highlighting',
	'matching',
	'categorization',
	'slot_mapping',
	'video',
	'short_answer',
	'ordering',
	'matrix',
]);
export type ResponseCode = z.infer<typeof ResponseCodeSchema>;

/**
 * 填空题 (文本内联填空，下拉/拖拽/打字均算此类，如 PTE FITB, GRE Text Completion)
 */
export const ResponseContentClozeSchema = z.object({
	responseCode: z.enum([ResponseCodeSchema.enum.cloze]),
	values: z
		.record(SeqIdSchema, z.string().trim().array())
		.describe(
			'1. Key 为 gapId。Value 为该片段的可接受答案数组（例如 ["ese"]）。通常只有一个正确答案，但使用数组可以兼容极少数的拼写变体情况。2. 对于包含多个空的一个 Item（如 con__atu__tions），一次性提交该 Item 下所有 gap 的解答。例如: {"1": "gr", "2": "la"}',
		),
});

/**
 * 选择题 (单选题、多选题、判断题)
 */
export const ResponseContentChoiceSchema = z.object({
	responseCode: z.enum([ResponseCodeSchema.enum.choice]),
	selectedIds: SeqIdSchema.array().describe(
		'选择题 (单选、多选、判断统一处理)。对于多选题，Selection order is not important.',
	),
});

/**
 * 语音录制题 (口语跟读、复述、回答，如 TOEFL Speaking, PTE Read Aloud)
 */
export const ResponseContentAudioSchema = z.object({
	responseCode: z.enum([ResponseCodeSchema.enum.audio]),
	...TranscriptedAudioSchema.shape,
});

/**
 * 听写题 (Listen and Type，按编辑距离判分，如 PTE WFD, DET 听写)
 */
export const ResponseContentDictationSchema = z.object({
	responseCode: z.enum([ResponseCodeSchema.enum.dictation]),
	text: z.string().trim(),
	wordCount: z.number().int().min(0).optional(),
});

/**
 * 写作题 (长篇写作、图表作文，AI/人工判分，如 TOEFL/GRE 写作)
 */
export const ResponseContentEssaySchema = z.object({
	responseCode: z.enum([ResponseCodeSchema.enum.essay]),
	text: z.string().trim(),
	wordCount: z.number().int().min(0).optional(), // 方便直接统计或者校验
});

/**
 * 高亮/划线题 (在文章中点选句子，如 GRE Select-in-Passage, PTE Highlight Incorrect)
 * 用基于position的答案，没有基于id的好，因为id可以很明确，无歧义。
 */
export const ResponseContentHighlightingSchema = z.object({
	responseCode: z.enum([ResponseCodeSchema.enum.highlighting]),
	selectedIds: SeqIdSchema.array().describe('选中的 Token 或 Span 的 ID'),
});

/**
 * 匹配题 (连线、1对1/多对1匹配，如 IELTS Matching Features)
 */
export const ResponseContentMatchingSchema = z.object({
	responseCode: z.enum([ResponseCodeSchema.enum.matching]),
	matches: z
		.object({
			sourceId: SeqIdSchema.describe('匹配位置节点的ID'),
			targetId: SeqIdSchema.describe('待匹配的选项的ID'),
		})
		.array()
		.describe('使用 Array of Objects 以防多对一或多对多的复杂匹配'),
});

/**
 * 分类题 (将选项拖入不同分类框，如 IELTS Classification 分类题)
 */
export const ResponseContentCategorizationSchema = z.object({
	responseCode: z.enum([ResponseCodeSchema.enum.categorization]),
	buckets: z.record(
		SeqIdSchema.describe('Key: bucketId (例如 "1", "2")'),
		SeqIdSchema.array().describe('Value: 拖入该框的 optionId 列表'),
	),
});

/**
 * 插槽填空题 (将特定词块ID填入特定占位符ID，1对1映射，如 TOEFL Build a Sentence)
 */
export const ResponseContentSlotMappingSchema = z.object({
	responseCode: z.enum([ResponseCodeSchema.enum.slot_mapping]),
	placements: z
		.record(SeqIdSchema, SeqIdSchema)
		.describe(
			'Key 为 gapId (插槽ID)，Value 为 chunkId (词块ID)。O(1) 匹配判分，且完美处理干扰项被剩下的情况。',
		),
});

/**
 * 视频录制题 (如 DET Speaking Sample 面试视频)
 */
export const ResponseContentVideoSchema = z.object({
	responseCode: z.enum([ResponseCodeSchema.enum.video]),
	...TranscriptedVideoSchema.shape,
});

/**
 * 简答题/数字填空 (短文本输入，正则/精确匹配判分，如 IELTS 简答, SAT/GRE 数学填空)
 */
export const ResponseContentShortAnswerSchema = z.object({
	responseCode: z.enum([ResponseCodeSchema.enum.short_answer]),
	text: z.string().trim(),
	wordCount: z.number().int().min(0).optional(),
});

/**
 * 排序题 (段落重排，如 PTE Re-order Paragraphs)
 */
export const ResponseContentOrderingSchema = z.object({
	responseCode: z.enum([ResponseCodeSchema.enum.ordering]),
	ordered: SeqIdSchema.array().describe(
		'提交一个有序的 ID 数组即可，数组的 index 隐含了顺序',
	),
});

/**
 * 矩阵表格题 (二维表格勾选，如 GMAT Two-Part Analysis)
 */
export const ResponseContentMatrixSchema = z.object({
	responseCode: z.enum([ResponseCodeSchema.enum.matrix]),
	rows: z
		.record(
			SeqIdSchema.describe('Key: rowId'),
			SeqIdSchema.array().describe('Value: 选中的 columnIds (支持单选或多选)'),
		)
		.describe('行(Row)为题干/条件，列(Column)为用户的勾选项'),
});

/**
 * 限制 task.content 与 item.content 只能使用预制的白名单键名，防范手抖拼错
 * Key field used in task or item content
 * In order to keep conformity, we defined an enum here.
 * This enum just provides possible combination of key names.
 * The value of the same key can be different in different task or item content.
 * To further constraint the value, you need to write schema description in the implementations.
 */
export const AllowedQuestionContentKeySchema = z.enum([
	'instruction', // 当雅思这种会有item group呈现的题目时，我们用第一个item的instruction来承装item group instruction.
	'audio',
	'image',
	'video',
	'passage',
	'stimulus',
	'stem',
	'options',
	'prompt',
]);
export type AllowedQuestionContentKey = z.infer<
	typeof AllowedQuestionContentKeySchema
>;
