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

export const SeqIdSchema = z
	.string()
	.regex(/^[1-9]\d*$/)
	.describe(
		'Deterministic sequential pointer ID, starting from "1", incrementing by 1',
	);

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

export const OffsetDatetimeStrSchema = z.iso.datetime({ offset: true });

export const LangCodeSchema = z.enum(['en', 'zh']);
export type LangCode = z.infer<typeof LangCodeSchema>;

export const TransDictSchema = z.object(
	Object.fromEntries(
		LangCodeSchema.options.map((code) => [code, NonEmpStrSchema]),
	) as Record<LangCode, z.ZodString>,
);

export const MdTransDictSchema = z.object(
	Object.fromEntries(
		LangCodeSchema.options.map((code) => [code, NonEmpMdSchema]),
	) as Record<LangCode, z.ZodString>,
);

export const SimpleImageSchema = z.object({
	formatCode: z.enum(['simple_image']),
	fileKey: FileKeySchema,
	fileSizeInBytes: PosIntSchema,
	height: PosIntSchema,
	width: PosIntSchema,
});

export const SimpleAudioSchema = z.object({
	formatCode: z.enum(['simple_audio']),
	fileKey: FileKeySchema,
	durationSeconds: z.number().min(0),
	fileSizeInBytes: PosIntSchema,
});

export const SimpleVideoSchema = SimpleAudioSchema.extend({
	formatCode: z.enum(['simple_video']),
	inputImage: z.object({ fileKey: FileKeySchema }).optional(),
	inputAudio: z.object({ fileKey: FileKeySchema }).optional(),
});

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

export const TokenSchema = z
	.object({
		id: SeqIdSchema,
		text: z.string(),
		type: z.enum(['word', 'non_word']).default('word'),
		spaceAfter: z.string().default(''),
	})
	.describe('A single word or punctuation mark with its trailing spaces.');

export const SegmentedSentenceSchema = z
	.object({
		formatCode: z.enum(['segmented_sentence']),
		id: SeqIdSchema,
		tokens: TokenSchema.array(),
		fullText: NonEmpStrSchema.describe('Whole sentence full text.'),
	})
	.describe('A segmented sentence containing tokens.');

export const SegmentedParagraphsSchema = z
	.object({
		id: SeqIdSchema,
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
	text: NonEmpMdSchema,
	audio: SimpleAudioSchema.describe(
		'Audio narration of the text. Usually generated from AI TTS.',
	),
});

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

export const ResponseContentClozeSchema = z.object({
	responseCode: z.enum([ResponseCodeSchema.enum.cloze]),
	values: z
		.record(SeqIdSchema, z.string().trim().array())
		.describe(
			'1. Key 为 gapId。Value 为该片段的可接受答案数组（例如 ["ese"]）。通常只有一个正确答案，但使用数组可以兼容极少数的拼写变体情况。2. 对于包含多个空的一个 Item（如 con__atu__tions），一次性提交该 Item 下所有 gap 的解答。例如: {"1": "gr", "2": "la"}',
		),
});

export const ResponseContentChoiceSchema = z.object({
	responseCode: z.enum([ResponseCodeSchema.enum.choice]),
	selectedIds: SeqIdSchema.array().describe(
		'选择题 (单选、多选、判断统一处理)。对于多选题，Selection order is not important.',
	),
});

export const ResponseContentAudioSchema = z.object({
	responseCode: z.enum([ResponseCodeSchema.enum.audio]),
	...TranscriptedAudioSchema.shape,
});

export const ResponseContentDictationSchema = z.object({
	responseCode: z.enum([ResponseCodeSchema.enum.dictation]),
	text: z.string().trim(),
	wordCount: z.number().int().min(0).optional(),
});

export const ResponseContentEssaySchema = z.object({
	responseCode: z.enum([ResponseCodeSchema.enum.essay]),
	text: z.string().trim(),
	wordCount: z.number().int().min(0).optional(),
});

export const ResponseContentHighlightingSchema = z.object({
	responseCode: z.enum([ResponseCodeSchema.enum.highlighting]),
	selectedIds: SeqIdSchema.array().describe('选中的 Token 或 Span 的 ID'),
});

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

export const ResponseContentCategorizationSchema = z.object({
	responseCode: z.enum([ResponseCodeSchema.enum.categorization]),
	buckets: z.record(
		SeqIdSchema.describe('Key: bucketId (例如 "1", "2")'),
		SeqIdSchema.array().describe('Value: 拖入该框的 optionId 列表'),
	),
});

export const ResponseContentSlotMappingSchema = z.object({
	responseCode: z.enum([ResponseCodeSchema.enum.slot_mapping]),
	placements: z
		.record(SeqIdSchema, SeqIdSchema)
		.describe(
			'Key 为 gapId (插槽ID)，Value 为 chunkId (词块ID)。O(1) 匹配判分，且完美处理干扰项被剩下的情况。',
		),
});

export const ResponseContentVideoSchema = z.object({
	responseCode: z.enum([ResponseCodeSchema.enum.video]),
	...TranscriptedVideoSchema.shape,
});

export const ResponseContentShortAnswerSchema = z.object({
	responseCode: z.enum([ResponseCodeSchema.enum.short_answer]),
	text: z.string().trim(),
	wordCount: z.number().int().min(0).optional(),
});

export const ResponseContentOrderingSchema = z.object({
	responseCode: z.enum([ResponseCodeSchema.enum.ordering]),
	ordered: SeqIdSchema.array().describe(
		'提交一个有序的 ID 数组即可，数组的 index 隐含了顺序',
	),
});

export const ResponseContentMatrixSchema = z.object({
	responseCode: z.enum([ResponseCodeSchema.enum.matrix]),
	rows: z
		.record(
			SeqIdSchema.describe('Key: rowId'),
			SeqIdSchema.array().describe('Value: 选中的 columnIds (支持单选或多选)'),
		)
		.describe('行(Row)为题干/条件，列(Column)为用户的勾选项'),
});

export const AllowedQuestionContentKeySchema = z.enum([
	'instruction',
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
