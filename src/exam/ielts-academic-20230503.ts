import { z } from 'zod';

import { defineExam } from './__definer';
import {
	EmptyObjectSchema,
	FillingRecordSchema,
	InformativeImageSchema,
	NonEmpMdSchema,
	NonEmpStrSchema,
	PassageSchema,
	SelectionArraySchema,
	SelectionRecordSchema,
	SeqIdSchema,
	SpeakingSchema,
	TranscriptedAudioSchema,
	WritingSchema,
} from './__shared';

const PartitionsSchema = z
	.object({
		partitionSequence: SeqIdSchema.describe(
			`${SeqIdSchema.description}\n题组在 Task 内部的顺序，从 1 开始`,
		),
		startItemSequence: SeqIdSchema.describe(
			`${SeqIdSchema.description}\n该题组起始 Item 的全局 sequence`,
		),
		endItemSequence: SeqIdSchema.describe(
			`${SeqIdSchema}\n该题组结束 Item 的全局 sequence`,
		),
		content: InformativeImageSchema.optional().describe(
			'Turn the whole partition (including but not limited to instructions, prompt, title, options etc.) into informative image, so as to capture all the nuances.',
		),
	})
	.array()
	.describe(
		'雅思特有的partition制度 (task下面所有items 按照题型分为一个或多个group/partition。partitions是一个寄生在taskContent里面的字段。)\n\n 识别partition的原则：在两个标题e.g.`Questions 1-7`和`Questions 8-13`之间的全部内容，即为一个partition（不包含`Questions 1-7`标题本身）。',
	);

/**
 * @link https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-listening
 */
const ListeningItems = {
	multiple_choice: {
		__displayName: { zh: '选择题', en: 'Multiple Choice' },
		__questionContentSchema: EmptyObjectSchema,
		__responseContentSchema: SelectionArraySchema,
	},

	matching: {
		__displayName: { zh: '配对题', en: 'Matching' },
		__questionContentSchema: EmptyObjectSchema,
		__responseContentSchema: SelectionRecordSchema,
	},

	plan_or_map_or_diagram_labelling_by_filling: {
		__displayName: {
			zh: '地图/平面图/结构图标记填空题',
			en: 'Plan/Map/Diagram Labelling by Filling',
		},
		__questionContentSchema: EmptyObjectSchema,
		__responseContentSchema: FillingRecordSchema,
	},

	plan_or_map_or_diagram_labelling_by_selection: {
		__displayName: {
			zh: '地图/平面图/结构图标记选择题',
			en: 'Plan/Map/Diagram Labelling by Selection',
		},
		__questionContentSchema: EmptyObjectSchema,
		__responseContentSchema: SelectionArraySchema,
	},

	form_completion_by_filling: {
		__displayName: {
			zh: '表单填空题',
			en: 'Form Completion by Filling',
		},
		__questionContentSchema: EmptyObjectSchema,
		__responseContentSchema: FillingRecordSchema,
	},

	form_completion_by_selection: {
		__displayName: {
			zh: '表单选择填空题',
			en: 'Form Completion by Selection',
		},
		__questionContentSchema: EmptyObjectSchema,
		__responseContentSchema: SelectionRecordSchema,
	},

	note_completion_by_filling: {
		__displayName: {
			zh: '笔记填空题',
			en: 'Note Completion by Filling',
		},
		__questionContentSchema: EmptyObjectSchema,
		__responseContentSchema: FillingRecordSchema,
	},

	note_completion_by_selection: {
		__displayName: {
			zh: '笔记选择填空题',
			en: 'Note Completion by Selection',
		},
		__questionContentSchema: EmptyObjectSchema,
		__responseContentSchema: SelectionRecordSchema,
	},

	table_completion_by_filling: {
		__displayName: {
			zh: '表格填空题',
			en: 'Table Completion by Filling',
		},
		__questionContentSchema: EmptyObjectSchema,
		__responseContentSchema: FillingRecordSchema,
	},

	table_completion_by_selection: {
		__displayName: {
			zh: '表格选择填空题',
			en: 'Table Completion by Selection',
		},
		__questionContentSchema: EmptyObjectSchema,
		__responseContentSchema: SelectionRecordSchema,
	},

	flow_chart_completion_by_filling: {
		__displayName: {
			zh: '流程图填空题',
			en: 'Flow Chart Completion by Filling',
		},
		__questionContentSchema: EmptyObjectSchema,
		__responseContentSchema: FillingRecordSchema,
	},

	flow_chart_completion_by_selection: {
		__displayName: {
			zh: '流程图选择填空题',
			en: 'Flow Chart Completion by Selection',
		},
		__questionContentSchema: EmptyObjectSchema,
		__responseContentSchema: SelectionRecordSchema,
	},

	summary_completion_by_filling: {
		__displayName: {
			zh: '摘要填空题',
			en: 'Summary Completion by Filling',
		},
		__questionContentSchema: EmptyObjectSchema,
		__responseContentSchema: FillingRecordSchema,
	},

	summary_completion_by_selection: {
		__displayName: {
			zh: '摘要选择填空题',
			en: 'Summary Completion by Selection',
		},
		__questionContentSchema: EmptyObjectSchema,
		__responseContentSchema: SelectionRecordSchema,
	},

	sentence_completion: {
		__displayName: { zh: '句子填空题', en: 'Sentence Completion' },
		__questionContentSchema: EmptyObjectSchema,
		__responseContentSchema: FillingRecordSchema,
	},

	short_answer_questions: {
		__displayName: { zh: '简答题', en: 'Short-Answer Questions' },
		__questionContentSchema: EmptyObjectSchema,
		__responseContentSchema: WritingSchema,
	},
};

/**
 * @link https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-reading
 */
const ReadingItems = {
	multiple_choice: {
		__displayName: { zh: '选择题', en: 'Multiple Choice' },
		__questionContentSchema: EmptyObjectSchema,
		__responseContentSchema: SelectionArraySchema,
	},

	identifying_information: {
		__displayName: {
			zh: '事实判断题 (T/F/NG)',
			en: 'Identifying Information (True/False/Not Given)',
		},
		__questionContentSchema: EmptyObjectSchema,
		__responseContentSchema: SelectionArraySchema,
	},

	identifying_writers_views_or_claims: {
		__displayName: {
			zh: '观点判断题 (Y/N/NG)',
			en: 'Identifying Writer’s Views/Claims (Yes/No/Not Given)',
		},
		__questionContentSchema: EmptyObjectSchema,
		__responseContentSchema: SelectionArraySchema,
	},

	matching_information: {
		__displayName: { zh: '段落信息匹配题', en: 'Matching Information' },
		__questionContentSchema: EmptyObjectSchema,
		__responseContentSchema: SelectionRecordSchema,
	},

	matching_headings: {
		__displayName: { zh: '段落小标题匹配题', en: 'Matching Headings' },
		__questionContentSchema: EmptyObjectSchema,
		__responseContentSchema: SelectionRecordSchema,
	},

	matching_features: {
		__displayName: { zh: '特征/人名匹配题', en: 'Matching Features' },
		__questionContentSchema: EmptyObjectSchema,
		__responseContentSchema: SelectionRecordSchema,
	},

	matching_sentence_endings: {
		__displayName: { zh: '句尾匹配题', en: 'Matching Sentence Endings' },
		__questionContentSchema: EmptyObjectSchema,
		__responseContentSchema: SelectionRecordSchema,
	},

	sentence_completion: {
		__displayName: { zh: '完成句子题', en: 'Sentence Completion' },
		__questionContentSchema: EmptyObjectSchema,
		__responseContentSchema: WritingSchema,
	},

	summary_completion_by_filling: {
		__displayName: {
			zh: '摘要填空题',
			en: 'Summary Completion by Filling',
		},
		__questionContentSchema: EmptyObjectSchema,
		__responseContentSchema: FillingRecordSchema,
	},

	summary_completion_by_selection: {
		__displayName: {
			zh: '摘要选择填空题',
			en: 'Summary Completion by Selection',
		},
		__questionContentSchema: EmptyObjectSchema,
		__responseContentSchema: SelectionRecordSchema,
	},

	note_completion_by_filling: {
		__displayName: {
			zh: '笔记填空题',
			en: 'Note Completion by Filling',
		},
		__questionContentSchema: EmptyObjectSchema,
		__responseContentSchema: FillingRecordSchema,
	},

	note_completion_by_selection: {
		__displayName: {
			zh: '笔记选择填空题',
			en: 'Note Completion by Selection',
		},
		__questionContentSchema: EmptyObjectSchema,
		__responseContentSchema: SelectionRecordSchema,
	},

	table_completion_by_filling: {
		__displayName: {
			zh: '表格填空题',
			en: 'Table Completion by Filling',
		},
		__questionContentSchema: EmptyObjectSchema,
		__responseContentSchema: FillingRecordSchema,
	},

	table_completion_by_selection: {
		__displayName: {
			zh: '表格选择填空题',
			en: 'Table Completion by Selection',
		},
		__questionContentSchema: EmptyObjectSchema,
		__responseContentSchema: SelectionRecordSchema,
	},

	flow_chart_completion_by_filling: {
		__displayName: {
			zh: '流程图填空题',
			en: 'Flow-Chart Completion by Filling',
		},
		__questionContentSchema: EmptyObjectSchema,
		__responseContentSchema: FillingRecordSchema,
	},

	flow_chart_completion_by_selection: {
		__displayName: {
			zh: '流程图选择填空题',
			en: 'Flow-Chart Completion by Selection',
		},
		__questionContentSchema: EmptyObjectSchema,
		__responseContentSchema: SelectionRecordSchema,
	},

	diagram_label_completion: {
		__displayName: { zh: '示意图标注填空题', en: 'Diagram Label Completion' },
		__questionContentSchema: EmptyObjectSchema,
		__responseContentSchema: FillingRecordSchema,
	},

	short_answer_questions: {
		__displayName: { zh: '简答题', en: 'Short-Answer Questions' },
		__questionContentSchema: EmptyObjectSchema,
		__responseContentSchema: WritingSchema,
	},
};

export default defineExam({
	code: 'ielts_academic_20230503',
	displayName: {
		en: 'IELTS Academic, Latest Version',
		zh: '雅思 学术类 最新版',
	},
	__sections: {
		listening: {
			__displayName: { zh: '听力', en: 'Listening' },
			__tasks: {
				part1: {
					__displayName: {
						zh: 'Part 1 日常生活对话',
						en: 'Part 1 Everyday Dialogue',
					},
					__questionContentSchema: z.object({
						partitions: PartitionsSchema,
						audio: TranscriptedAudioSchema,
					}),
					__items: ListeningItems,
				},
				part2: {
					__displayName: {
						zh: 'Part 2 日常社会独白',
						en: 'Part 2 Social Monologue',
					},
					__questionContentSchema: z.object({
						partitions: PartitionsSchema,
						audio: TranscriptedAudioSchema,
					}),
					__items: ListeningItems,
				},
				part3: {
					__displayName: {
						zh: 'Part 3 学术讨论对话',
						en: 'Part 3 Academic Discussion',
					},
					__questionContentSchema: z.object({
						partitions: PartitionsSchema,
						audio: TranscriptedAudioSchema,
					}),
					__items: ListeningItems,
				},
				part4: {
					__displayName: {
						zh: 'Part 4 学术讲座独白',
						en: 'Part 4 Academic Lecture',
					},
					__questionContentSchema: z.object({
						partitions: PartitionsSchema,
						audio: TranscriptedAudioSchema,
					}),
					__items: ListeningItems,
				},
			},
		},

		reading: {
			__displayName: { zh: '阅读', en: 'Reading' },
			__tasks: {
				passage1: {
					__displayName: {
						zh: 'Passage 1 文章一（基础）',
						en: 'Passage 1 (Basic)',
					},
					__questionContentSchema: z.object({
						partitions: PartitionsSchema,
						passage: PassageSchema,
					}),
					__items: ReadingItems,
				},
				passage2: {
					__displayName: {
						zh: 'Passage 2 文章二（中等）',
						en: 'Passage 2 (Intermediate)',
					},
					__questionContentSchema: z.object({
						partitions: PartitionsSchema,
						passage: PassageSchema,
					}),
					__items: ReadingItems,
				},
				passage3: {
					__displayName: {
						zh: 'Passage 3 文章三（高难）',
						en: 'Passage 3 (Advanced)',
					},
					__questionContentSchema: z.object({
						partitions: PartitionsSchema,
						passage: PassageSchema,
					}),
					__items: ReadingItems,
				},
			},
		},

		writing: {
			__displayName: { zh: '写作', en: 'Writing' },
			__tasks: {
				task1: {
					__displayName: {
						zh: 'Task 1 小作文（图表）',
						en: 'Academic Writing Task 1',
					},
					__questionContentSchema: z.object({
						prompt: NonEmpMdSchema.describe(
							'Task 1 图表题干描述以及instruction',
						),
						image: InformativeImageSchema.describe(' Task 1 整张图表'),
					}),
					__items: {
						default: {
							__displayName: { zh: '默认题型', en: 'Default' },
							__questionContentSchema: EmptyObjectSchema,
							__responseContentSchema: WritingSchema,
						},
					},
				},
				task2: {
					__displayName: {
						zh: 'Task 2 大作文（议论文）',
						en: 'Academic Writing Task 2',
					},
					__questionContentSchema: z.object({
						prompt: NonEmpMdSchema.describe('Task 2 议论文题目和instruction'),
					}),
					__items: {
						default: {
							__displayName: { zh: '默认题型', en: 'Default' },
							__questionContentSchema: EmptyObjectSchema,
							__responseContentSchema: WritingSchema,
						},
					},
				},
			},
		},

		speaking: {
			__displayName: { zh: '口语', en: 'Speaking' },
			__tasks: {
				part1: {
					__displayName: {
						zh: 'Part 1 自我介绍与简短问答',
						en: 'Part 1 Introduction and Interview',
					},
					__questionContentSchema: z.object({
						instruction: NonEmpMdSchema,
						title: NonEmpStrSchema,
					}),
					__items: {
						default: {
							__displayName: { zh: '默认题型', en: 'Default' },
							__questionContentSchema: z.object({
								prompt: NonEmpStrSchema,
								audio: TranscriptedAudioSchema,
							}),
							__responseContentSchema: SpeakingSchema,
						},
					},
				},
				part2: {
					__displayName: { zh: 'Part 2 个人独白', en: 'Part 2 Long Turn' },
					__questionContentSchema: EmptyObjectSchema,
					__items: {
						default: {
							__displayName: { zh: '默认题型', en: 'Default' },
							__questionContentSchema: z.object({
								prompt: NonEmpMdSchema.describe(
									`${NonEmpMdSchema.description}\nCue Card 话题卡`,
								),
								instruction: NonEmpMdSchema,
							}),
							__responseContentSchema: SpeakingSchema,
						},
					},
				},
				part3: {
					__displayName: { zh: 'Part 3 双向讨论', en: 'Part 3 Discussion' },
					__questionContentSchema: z.object({
						partitions: PartitionsSchema,
					}),
					__items: {
						default: {
							__displayName: { zh: '默认题型', en: 'Default' },
							__questionContentSchema: z.object({
								prompt: NonEmpStrSchema,
								audio: TranscriptedAudioSchema,
							}),
							__responseContentSchema: SpeakingSchema,
						},
					},
				},
			},
		},
	},
});
