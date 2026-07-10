import { z } from 'zod';

export const IndexSchema = z.number().int().min(0);

export const PosIntSchema = z.number().int().min(1);

export const SequenceSchema = z.number().int().min(1).max(1000);

export const SeqIdSchema = z.string().regex(/^[1-9]\d*$/);

export const NonEmpStrSchema = z.string().min(1).trim();

export const NonEmpMdSchema = NonEmpStrSchema.trim();

export const EmptyObjectSchema = z.object({});

export const FileKeySchema = z
	.string()
	.regex(
		/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\.[a-zA-Z0-9]+$/,
	);

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
		startTime: NonEmpStrSchema,
		endTime: NonEmpStrSchema,
		speaker: NonEmpStrSchema.default('Speaker'),
		sentenceText: NonEmpStrSchema,
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
	title: NonEmpStrSchema.optional(),
	subtitle: NonEmpStrSchema.optional(),
});

export const SimpleParagraphsSchema = z
	.object({ id: SeqIdSchema, text: NonEmpStrSchema })
	.array();

export const SimplePassageSchema = TitleSchema.extend({
	paragraphs: SimpleParagraphsSchema,
});

export const TokenSchema = z.object({
	id: SeqIdSchema,
	text: z.string(),
	type: z.enum(['word', 'non_word']).default('word'),
	spaceAfter: z.string().default(''),
});

export const SegmentedSentenceSchema = z.object({
	formatCode: z.enum(['segmented_sentence']),
	id: SeqIdSchema,
	tokens: TokenSchema.array(),
	fullText: NonEmpStrSchema,
});

export const SegmentedParagraphsSchema = z
	.object({
		id: SeqIdSchema,
		sentences: SegmentedSentenceSchema.array(),
	})
	.array();

export const SegmentedPassageSchema = TitleSchema.extend({
	paragraphs: SegmentedParagraphsSchema,
});

export const NarratedInstructionSchema = z.object({
	formatCode: z.enum(['narrated_instruction']),
	text: NonEmpMdSchema,
	generatedAudio: SimpleAudioSchema,
});

export const StemSchema = NonEmpMdSchema;

export const OptionsSchema = NonEmpStrSchema.array().min(1);

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
	values: z.record(SeqIdSchema, z.string().trim().array()),
});

export const ResponseContentChoiceSchema = z.object({
	responseCode: z.enum([ResponseCodeSchema.enum.choice]),
	selectedIds: SeqIdSchema.array(),
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
	selectedIds: SeqIdSchema.array(),
});

export const ResponseContentMatchingSchema = z.object({
	responseCode: z.enum([ResponseCodeSchema.enum.matching]),
	matches: z
		.object({
			sourceId: SeqIdSchema,
			targetId: SeqIdSchema,
		})
		.array(),
});

export const ResponseContentCategorizationSchema = z.object({
	responseCode: z.enum([ResponseCodeSchema.enum.categorization]),
	buckets: z.record(SeqIdSchema, SeqIdSchema.array()),
});

export const ResponseContentSlotMappingSchema = z.object({
	responseCode: z.enum([ResponseCodeSchema.enum.slot_mapping]),
	placements: z.record(SeqIdSchema, SeqIdSchema),
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
	ordered: SeqIdSchema.array(),
});

export const ResponseContentMatrixSchema = z.object({
	responseCode: z.enum([ResponseCodeSchema.enum.matrix]),
	rows: z.record(SeqIdSchema, SeqIdSchema.array()),
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
