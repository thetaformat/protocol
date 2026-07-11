import { z } from 'zod';

import {
	EmptyObjectSchema,
	NarratedInstructionSchema,
	NonEmpMdSchema,
	NonEmpStrSchema,
	OptionsSchema,
	PosIntSchema,
	ResponseContentAudioSchema,
	ResponseContentChoiceSchema,
	ResponseContentClozeSchema,
	ResponseContentEssaySchema,
	ResponseContentSlotMappingSchema,
	SeqIdSchema,
	SilentNoddingVideoSchema,
	SimpleImageSchema,
	SimpleParagraphsSchema,
	SimplePassageSchema,
	StemSchema,
	TranscriptedAudioSchema,
	TranscriptedVideoSchema,
} from '../__shared';
import { defineExam } from './__definer';

export default defineExam({
	code: 'toefl_ibt_20260121',
	__sections: {
		reading: {
			s:1,
			__tasks: {
				complete_the_words: {
					__questionContentSchema: z.object({
						instruction: NonEmpStrSchema,
						prompt: z.object({
							paragraphs: SimpleParagraphsSchema.describe(
								`${SimpleParagraphsSchema.description}` +
									'完整段落文本。挖空处用占位符表示。' +
									'例如："We might think th{{g1}} prehistoric peo{{g2}} concentrated on{{g3}} on ba{{g4}} survival."',
							),
						}),
					}),
					s:2,
					__items: {
						default: {
							__questionContentSchema: z.object({
								prompt: z.object({
									gaps: z
										.object({
											fullWord: NonEmpStrSchema.optional().describe(
												'该空位对应的完整单词（例如 "these"）。' +
													'用于 AI 分析时的上下文理解。',
											),
											gapLength: PosIntSchema.describe(
												'该空位缺失的字符数量。极其重要：前端需要根据这个数字渲染出正确宽度（或对应数量）的灰色输入框。',
											),
											id: SeqIdSchema.describe(
												'占位符ID，与 textTemplate 中的占位符对应',
											),
										})
										.array()
										.describe('段落中所有的挖空配置'),
								}),
							}),
							__responseContentSchema: ResponseContentClozeSchema,
						},
					},
				},
				read_an_academic_passage: {
					__questionContentSchema: z.object({
						passage: SimplePassageSchema.describe(
							"高亮规范：如果段落内有需要配合题目高亮的单词或句子，必须使用包裹型标签，例如：'This is a <mark id='id'>highlighted word</mark>.'",
						),
					}),
					__items: {
						default: {
							__questionContentSchema: z.object({
								options: OptionsSchema,
								prompt: z.object({
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
									stem: StemSchema,
								}),
							}),
							__responseContentSchema: ResponseContentChoiceSchema,
						},
					},
				},
				read_in_daily_life: {
					__questionContentSchema: z.object({
						instruction: NonEmpStrSchema,
						stimulus: NonEmpMdSchema,
					}),
					__items: {
						default: {
							__questionContentSchema: z.object({
								options: OptionsSchema,
								stem: StemSchema,
							}),
							__responseContentSchema: ResponseContentChoiceSchema,
						},
					},
				},
			},
		},
		listening: {
			__tasks: {
				listen_and_choose_a_response: {
					__questionContentSchema: z.object({
						instruction: NonEmpStrSchema,
					}),
					__items: {
						default: {
							__questionContentSchema: z.object({
								audio: TranscriptedAudioSchema,
								image: SimpleImageSchema.describe('Illustration of the item.'),
								options: OptionsSchema,
							}),
							__responseContentSchema: ResponseContentChoiceSchema,
						},
					},
				},
				listen_to_a_conversation: {
					__questionContentSchema: z.object({
						audio: TranscriptedAudioSchema,
						image: SimpleImageSchema.describe(
							'The illustration for the conversation.',
						),
						instruction: NarratedInstructionSchema,
					}),
					__items: {
						default: {
							__questionContentSchema: z.object({
								options: OptionsSchema,
								stem: StemSchema,
							}),
							__responseContentSchema: ResponseContentChoiceSchema,
						},
					},
				},
				listen_to_an_academic_talk: {
					__questionContentSchema: z.object({
						audio: TranscriptedAudioSchema,
						image: SimpleImageSchema.describe(
							'The illustration of the academic talk.',
						),
						instruction: NarratedInstructionSchema,
					}),
					__items: {
						default: {
							__questionContentSchema: z.object({
								options: OptionsSchema,
								stem: StemSchema,
							}),
							__responseContentSchema: ResponseContentChoiceSchema,
						},
					},
				},
				listen_to_an_announcement: {
					__questionContentSchema: z.object({
						audio: TranscriptedAudioSchema,
						image: SimpleImageSchema.describe(
							'The illustration of the Announcement.',
						),
						instruction: NarratedInstructionSchema,
					}),
					__items: {
						default: {
							__questionContentSchema: z.object({
								options: OptionsSchema,
								stem: StemSchema,
							}),
							__responseContentSchema: ResponseContentChoiceSchema,
						},
					},
				},
			},
		},
		writing: {
			__tasks: {
				build_a_sentence: {
					__questionContentSchema: z.object({
						instruction: NonEmpStrSchema,
					}),
					__items: {
						default: {
							__questionContentSchema: z.object({
								prompt: z.object({
									chunks: z
										.object({
											id: SeqIdSchema,
											text: NonEmpStrSchema,
										})
										.array()
										.describe(
											'所有可供拖拽的词块 (Draggables)。包含正确项和干扰项。',
										),
									conversation: z
										.object({
											avatar: SimpleImageSchema,
											content: NonEmpStrSchema.describe(
												`对话内容。普通上下文直接写纯文本；如果是需要拼接的目标句，则在句中包含占位符。例如："Yes! The {{id1}} {{id2}} {{id3}} fantastic. How about you?" 站位id必须为：${SeqIdSchema.description}`,
											),
											id: SeqIdSchema.describe('单条对话的唯一标识'),
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
							}),
							__responseContentSchema: ResponseContentSlotMappingSchema,
						},
					},
				},
				write_an_email: {
					__questionContentSchema: EmptyObjectSchema,
					__items: {
						default: {
							__questionContentSchema: z.object({
								instruction: NonEmpMdSchema,
								prompt: z.object({
									subject: NonEmpStrSchema,
									text: NonEmpMdSchema,
									to: NonEmpStrSchema,
								}),
							}),
							__responseContentSchema: ResponseContentEssaySchema,
						},
					},
				},
				write_for_an_academic_discussion: {
					__questionContentSchema: EmptyObjectSchema,
					__items: {
						default: {
							__questionContentSchema: z.object({
								instruction: NonEmpMdSchema,
								prompt: z
									.object({
										avatar: SimpleImageSchema,
										content: NonEmpStrSchema,
										name: NonEmpStrSchema,
										role: z.enum(['professor', 'student']),
									})
									.array()
									.length(3),
							}),
							__responseContentSchema: ResponseContentEssaySchema,
						},
					},
				},
			},
		},
		speaking: {
			__tasks: {
				listen_and_repeat: {
					__questionContentSchema: z.object({
						image: SimpleImageSchema.describe(
							'Illustration without any highlighted area. (unlike later illustration for each item, which has highlighted area.)',
						),
						instruction: NarratedInstructionSchema,
					}),
					__items: {
						default: {
							__questionContentSchema: z.object({
								instruction: NonEmpStrSchema,
								audio: TranscriptedAudioSchema,
								image: SimpleImageSchema.describe(
									'Illustration for the item. With highlighted area.',
								),
							}),
							__responseContentSchema: ResponseContentAudioSchema,
						},
					},
				},
				take_an_interview: {
					__questionContentSchema: z.object({
						instruction: NarratedInstructionSchema,
						video: SilentNoddingVideoSchema.describe(
							'Silent video of the examiner nodding played during user responding for each item',
						),
					}),
					__items: {
						default: {
							__questionContentSchema: z.object({
								instruction: NonEmpStrSchema,
								video: TranscriptedVideoSchema.describe(
									'Question prompt video',
								),
							}),
							__responseContentSchema: ResponseContentAudioSchema,
						},
					},
				},
			},
		},
	},
});
