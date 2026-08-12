import { z } from 'zod';

import { defineExam } from './__definer';
import {
	EmptyObjectSchema,
	FillingRecordSchema,
	InformativeImageSchema,
	NarratedInstructionSchema,
	NonEmpMdSchema,
	NonEmpStrSchema,
	OptionsSchema,
	PosIntSchema,
	SelectionArraySchema,
	SelectionRecordSchema,
	SeqIdSchema,
	SilentNoddingVideoSchema,
	SimpleImageSchema,
	SimplePassageSchema,
	SpeakingSchema,
	StemSchema,
	TranscriptedAudioSchema,
	TranscriptedVideoSchema,
	WritingSchema,
} from './__shared';

export default defineExam({
	code: 'toefl_ibt_20260121',
	displayName: { en: 'TOEFL iBT, Latest Version', zh: '托福 iBT 最新版' },
	__sections: {
		reading: {
			__displayName: { en: 'Reading', zh: '阅读' },
			__tasks: {
				complete_the_words: {
					__displayName: { en: 'Complete the Words', zh: '完形填空' },
					__questionContentSchema: EmptyObjectSchema,
					__items: {
						default: {
							__displayName: { en: 'Default', zh: '默认题型' },
							__questionContentSchema: z.object({
								instruction: NonEmpStrSchema,
								text: SimplePassageSchema.describe(
									`${SimplePassageSchema.description}` +
										`完整段落文本。挖空处用占位符表示。站位id必须为：${SeqIdSchema.description}` +
										'例如："We might think th{{1}} preh{{2}}toric peo{{3}} concentrated on{{4}} on ba{{5}} survi{{6}}."',
								),
								targets: z
									.record(
										SeqIdSchema.describe(
											'所有占位符ID，与 textTemplate 中的占位符对应',
										),
										z.object({
											fullWord: NonEmpStrSchema.describe(
												'该空位对应的完整单词（例如 "prehistoric"）。',
											),
											gapLength: PosIntSchema.describe(
												'该空位缺失的字符数量。极其重要：前端需要根据这个数字渲染出正确宽度（或对应数量）的灰色输入框。',
											),
										}),
									)
									.describe(
										'整篇文本所有空算作一个题目（item），具体而言是testlet型item。',
									),
							}),
							__responseContentSchema: FillingRecordSchema,
						},
					},
				},
				read_an_academic_passage: {
					__displayName: {
						en: 'Read an Academic Passage',
						zh: '学术文章阅读',
					},
					__questionContentSchema: z.object({
						passage: SimplePassageSchema.describe(
							"高亮规范：如果段落内有需要配合题目高亮的单词或句子，必须使用包裹型标签，例如：'This is a <mark id='id'>highlighted word</mark>.'",
						),
					}),
					__items: {
						default: {
							__displayName: { en: 'Default', zh: '默认题型' },
							__questionContentSchema: z.object({
								stem: StemSchema,
								options: OptionsSchema,
								paragraphReference: SeqIdSchema.array()
									.optional()
									.describe(
										'有明确的出题段则也需要记录。数组元素对应 SimpleParagraphsSchema 中的段落 id。',
									),
								relatedHighlightId: SeqIdSchema.array()
									.optional()
									.describe(
										'题目有明确的原文引用，则需要记录。指向阅读文章中的高亮标签 ID（对应文章中的 <mark id="..."> 标签）。前端据此在文章中自动滚动并激活对应区域的 CSS 高亮状态。支持多个ID。',
									),
							}),
							__responseContentSchema: SelectionArraySchema,
						},
					},
				},
				read_in_daily_life: {
					__displayName: {
						en: 'Read in Daily Life',
						zh: '日常生活阅读',
					},
					__questionContentSchema: z.object({
						instruction: NonEmpStrSchema,
						stimulus: InformativeImageSchema.describe(
							`${InformativeImageSchema.description}\nThe image crop of the stimulus materials.`,
						),
					}),
					__items: {
						default: {
							__displayName: { en: 'Default', zh: '默认题型' },
							__questionContentSchema: z.object({
								stem: StemSchema,
								options: OptionsSchema,
							}),
							__responseContentSchema: SelectionArraySchema,
						},
					},
				},
			},
		},
		listening: {
			__displayName: { en: 'Listening', zh: '听力' },
			__tasks: {
				listen_and_choose_a_response: {
					__displayName: {
						en: 'Listen and Choose a Response',
						zh: '短音频听力',
					},
					__questionContentSchema: EmptyObjectSchema,
					__items: {
						default: {
							__displayName: { en: 'Default', zh: '默认题型' },
							__questionContentSchema: z.object({
								instruction: NonEmpStrSchema,
								audio: TranscriptedAudioSchema,
								illustration: SimpleImageSchema.describe(
									'Illustration of the item.',
								),
								options: OptionsSchema,
							}),
							__responseContentSchema: SelectionArraySchema,
						},
					},
				},
				listen_to_a_conversation: {
					__displayName: {
						en: 'Listen to a Conversation',
						zh: '对话听力',
					},
					__questionContentSchema: z.object({
						instruction: NarratedInstructionSchema,
						audio: TranscriptedAudioSchema,
						illustration: SimpleImageSchema.describe(
							'The illustration for the conversation.',
						),
					}),
					__items: {
						default: {
							__displayName: { en: 'Default', zh: '默认题型' },
							__questionContentSchema: z.object({
								options: OptionsSchema,
								stem: StemSchema,
							}),
							__responseContentSchema: SelectionArraySchema,
						},
					},
				},
				listen_to_an_academic_talk: {
					__displayName: {
						en: 'Listen to an Academic Talk',
						zh: '学术听力',
					},
					__questionContentSchema: z.object({
						instruction: NarratedInstructionSchema,
						audio: TranscriptedAudioSchema,
						illustration: SimpleImageSchema.describe(
							'The illustration of the academic talk.',
						),
					}),
					__items: {
						default: {
							__displayName: { en: 'Default', zh: '默认题型' },
							__questionContentSchema: z.object({
								stem: StemSchema,
								options: OptionsSchema,
							}),
							__responseContentSchema: SelectionArraySchema,
						},
					},
				},
				listen_to_an_announcement: {
					__displayName: {
						en: 'Listen to an Announcement',
						zh: '公告听力',
					},
					__questionContentSchema: z.object({
						instruction: NarratedInstructionSchema,
						audio: TranscriptedAudioSchema,
						illustration: SimpleImageSchema.describe(
							'The illustration of the Announcement.',
						),
					}),
					__items: {
						default: {
							__displayName: { en: 'Default', zh: '默认题型' },
							__questionContentSchema: z.object({
								stem: StemSchema,
								options: OptionsSchema,
							}),
							__responseContentSchema: SelectionArraySchema,
						},
					},
				},
			},
		},
		writing: {
			__displayName: { en: 'Writing', zh: '写作' },
			__tasks: {
				build_a_sentence: {
					__displayName: {
						en: 'Build a Sentence',
						zh: '句子构建',
					},
					__questionContentSchema: EmptyObjectSchema,
					__items: {
						default: {
							__displayName: { en: 'Default', zh: '默认题型' },
							__questionContentSchema: z.object({
								instruction: NonEmpStrSchema,
								speaker1: z
									.object({
										name: NonEmpStrSchema.describe(
											'发言人 A 的名字（如 Kelly）',
										),
										avatar: SimpleImageSchema,
									})
									.describe('发言人 A 的元信息'),
								speaker2: z
									.object({
										name: NonEmpStrSchema.describe(
											'发言人 B 的名字（如 Andrew）',
										),
										avatar: SimpleImageSchema,
									})
									.describe('发言人 B 的元信息'),
								options: OptionsSchema.describe(
									`${OptionsSchema.description}\n所有可供拖拽的词块 (Draggables)。包含正确项和干扰项。`,
								),
								conversation: z
									.object({
										id: SeqIdSchema.describe('单条对话的唯一标识'),
										speaker: z
											.enum(['speaker1', 'speaker2'])
											.describe('标识当前气泡由谁发言'),
										content: NonEmpStrSchema.describe(
											`对话内容。普通上下文直接写纯文本；如果是需要拼接的目标句，则在句中包含占位符。例如："Yes! The {{1}} {{2}} {{3}} fantastic. How about you?" 站位id必须为：${SeqIdSchema.description}`,
										),
										isTarget: z
											.boolean()
											.describe(
												'标识当前气泡是否包含需要用户操作的填空。方便前端做特殊 UI 渲染（如虚线框、特殊背景色）',
											),
									})
									.array()
									.min(1)
									.describe(
										'完整的对话流，按发生顺序排列。目标句可以出现在任意位置的任意句子中，甚至可以有多句包含填空。',
									),
							}),
							__responseContentSchema: SelectionRecordSchema,
						},
					},
				},
				write_an_email: {
					__displayName: { en: 'Write an Email', zh: '撰写电子邮件' },
					__questionContentSchema: EmptyObjectSchema,
					__items: {
						default: {
							__displayName: { en: 'Default', zh: '默认题型' },
							__questionContentSchema: z.object({
								introduction: NonEmpMdSchema.describe(
									`${NonEmpMdSchema.description}\nThe prompt main body, which includes scenario description and requirements.`,
								),
								subject: NonEmpStrSchema,
								to: NonEmpStrSchema,
							}),
							__responseContentSchema: WritingSchema,
						},
					},
				},
				write_for_an_academic_discussion: {
					__displayName: {
						en: 'Write for an Academic Discussion',
						zh: '学术讨论写作',
					},
					__questionContentSchema: EmptyObjectSchema,
					__items: {
						default: {
							__displayName: { en: 'Default', zh: '默认题型' },
							__questionContentSchema: z.object({
								introduction: NonEmpMdSchema.describe(
									`${NonEmpMdSchema.description}\nThe prompt main body, which includes scenario description and requirements.`,
								),
								professor: z.object({
									name: NonEmpStrSchema.describe('教授的名字（如 Dr. Gupta）'),
									avatar: SimpleImageSchema,
									content:
										NonEmpStrSchema.describe('教授发表的讨论引导语/问题'),
								}),
								student1: z.object({
									name: NonEmpStrSchema.describe('学生甲的名字（如 Kelly）'),
									avatar: SimpleImageSchema,
									content: NonEmpStrSchema.describe('学生甲发表的观点文本'),
								}),
								student2: z.object({
									name: NonEmpStrSchema.describe('学生乙的名字（如 Andrew）'),
									avatar: SimpleImageSchema,
									content: NonEmpStrSchema.describe('学生乙发表的观点文本'),
								}),
							}),
							__responseContentSchema: WritingSchema,
						},
					},
				},
			},
		},
		speaking: {
			__displayName: { en: 'Speaking', zh: '口语' },
			__tasks: {
				listen_and_repeat: {
					__displayName: { en: 'Listen and Repeat', zh: '听句子复述' },
					__questionContentSchema: z.object({
						instruction: NarratedInstructionSchema,
						image: SimpleImageSchema.describe(
							'Illustration without any highlighted area. (unlike later illustration for each item, which has highlighted area.)',
						),
					}),
					__items: {
						default: {
							__displayName: { en: 'Default', zh: '默认题型' },
							__questionContentSchema: z.object({
								instruction: NonEmpStrSchema,
								audio: TranscriptedAudioSchema,
								image: SimpleImageSchema.describe(
									'Illustration for the item. With highlighted area.',
								),
							}),
							__responseContentSchema: SpeakingSchema,
						},
					},
				},
				take_an_interview: {
					__displayName: { en: 'Take an Interview', zh: '面试口语问答' },
					__questionContentSchema: z.object({
						instruction: NarratedInstructionSchema,
						video: SilentNoddingVideoSchema.describe(
							'Silent video of the examiner nodding played during user responding for each item',
						),
					}),
					__items: {
						default: {
							__displayName: { en: 'Default', zh: '默认题型' },
							__questionContentSchema: z.object({
								instruction: NonEmpStrSchema,
								video: TranscriptedVideoSchema.describe(
									'Question prompt video',
								),
							}),
							__responseContentSchema: SpeakingSchema,
						},
					},
				},
			},
		},
	},
});
