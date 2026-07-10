import { z } from 'zod';

import { defineExam } from '../__definer';
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

export default defineExam({
	code: 'toefl_ibt_20260121',
	__sections: {
		reading: {
			__tasks: {
				complete_the_words: {
					__questionContentSchema: z.object({
						instruction: NonEmpStrSchema,
						prompt: z.object({
							paragraphs: SimpleParagraphsSchema,
						}),
					}),
					__items: {
						default: {
							__questionContentSchema: z.object({
								prompt: z.object({
									gaps: z
										.object({
											fullWord: NonEmpStrSchema.optional(),
											gapLength: PosIntSchema,
											id: SeqIdSchema,
										})
										.array(),
								}),
							}),
							__responseContentSchema: ResponseContentClozeSchema,
						},
					},
				},
				read_an_academic_passage: {
					__questionContentSchema: z.object({
						passage: SimplePassageSchema,
					}),
					__items: {
						default: {
							__questionContentSchema: z.object({
								options: OptionsSchema,
								prompt: z.object({
									paragraphReference: SeqIdSchema.array().optional(),
									relatedHighlightId: SeqIdSchema.array().optional(),
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
								image: SimpleImageSchema,
								options: OptionsSchema,
							}),
							__responseContentSchema: ResponseContentChoiceSchema,
						},
					},
				},
				listen_to_a_conversation: {
					__questionContentSchema: z.object({
						audio: TranscriptedAudioSchema,
						image: SimpleImageSchema,
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
						image: SimpleImageSchema,
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
						image: SimpleImageSchema,
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
										.array(),
									conversation: z
										.object({
											avatar: SimpleImageSchema,
											content: NonEmpStrSchema,
											id: SeqIdSchema,
											isTarget: z.boolean(),
										})
										.array()
										.min(1),
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
						image: SimpleImageSchema,
						instruction: NarratedInstructionSchema,
					}),
					__items: {
						default: {
							__questionContentSchema: z.object({
								instruction: NonEmpStrSchema,
								audio: TranscriptedAudioSchema,
								image: SimpleImageSchema,
							}),
							__responseContentSchema: ResponseContentAudioSchema,
						},
					},
				},
				take_an_interview: {
					__questionContentSchema: z.object({
						instruction: NarratedInstructionSchema,
						video: SilentNoddingVideoSchema,
					}),
					__items: {
						default: {
							__questionContentSchema: z.object({
								instruction: NonEmpStrSchema,
								video: TranscriptedVideoSchema,
							}),
							__responseContentSchema: ResponseContentAudioSchema,
						},
					},
				},
			},
		},
	},
});
