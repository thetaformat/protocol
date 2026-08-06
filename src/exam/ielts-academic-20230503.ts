import { z } from 'zod';

import { defineExam } from './__definer';
import { ResponseContentChoiceSchema } from './__shared';

/**
 * @link https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-listening
 */
const ListeningItems = {
	multiple_choice: {
		__displayName: { zh: '选择题', en: 'Multiple Choice' },
		__questionContentSchema: z.object({}),
		__responseContentSchema: ResponseContentChoiceSchema,
	},
	matching: {
		__displayName: { zh: '配对题', en: 'Matching' },
		__questionContentSchema: z.object({}),
		__responseContentSchema: z.object({}),
	},
	plan_or_map_or_diagram_labelling: {
		__displayName: {
			zh: '地图/平面图/结构图标记题',
			en: 'Plan/Map/Diagram Labelling',
		},
		__questionContentSchema: z.object({}),
		__responseContentSchema: z.object({}),
	},
	form_or_note_or_table_or_flow_chart_or_summary_completion: {
		__displayName: {
			zh: '表格/笔记/流程图/摘要填空题',
			en: 'Form/Note/Table/Flow Chart/Summary Completion',
		},
		__questionContentSchema: z.object({}),
		__responseContentSchema: z.object({}),
	},
	sentence_completion: {
		__displayName: { zh: '完成句子题', en: 'Sentence Completion' },
		__questionContentSchema: z.object({}),
		__responseContentSchema: z.object({}),
	},
	short_answer_questions: {
		__displayName: { zh: '简答题', en: 'Short-Answer Questions' },
		__questionContentSchema: z.object({}),
		__responseContentSchema: z.object({}),
	},
};

/**
 * @link https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-reading
 */
const ReadingItems = {
	multiple_choice: {
		__displayName: { zh: '选择题', en: 'Multiple Choice' },
		__questionContentSchema: z.object({}),
		__responseContentSchema: z.object({}),
	},
	identifying_information: {
		__displayName: {
			zh: '事实判断题 (T/F/NG)',
			en: 'Identifying Information (True/False/Not Given)',
		},
		__questionContentSchema: z.object({}),
		__responseContentSchema: z.object({}),
	},
	identifying_writers_views_or_claims: {
		__displayName: {
			zh: '观点判断题 (Y/N/NG)',
			en: 'Identifying Writer’s Views/Claims (Yes/No/Not Given)',
		},
		__questionContentSchema: z.object({}),
		__responseContentSchema: z.object({}),
	},
	matching_information: {
		__displayName: { zh: '段落信息匹配题', en: 'Matching Information' },
		__questionContentSchema: z.object({}),
		__responseContentSchema: z.object({}),
	},
	matching_headings: {
		__displayName: { zh: '段落小标题匹配题', en: 'Matching Headings' },
		__questionContentSchema: z.object({}),
		__responseContentSchema: z.object({}),
	},
	matching_features: {
		__displayName: { zh: '特征/人名匹配题', en: 'Matching Features' },
		__questionContentSchema: z.object({}),
		__responseContentSchema: z.object({}),
	},
	matching_sentence_endings: {
		__displayName: { zh: '句尾匹配题', en: 'Matching Sentence Endings' },
		__questionContentSchema: z.object({}),
		__responseContentSchema: z.object({}),
	},
	sentence_completion: {
		__displayName: { zh: '完成句子题', en: 'Sentence Completion' },
		__questionContentSchema: z.object({}),
		__responseContentSchema: z.object({}),
	},
	summary_or_note_or_table_or_flow_chart_completion: {
		__displayName: {
			zh: '摘要/笔记/表格/流程图填空题',
			en: 'Summary/Note/Table/Flow-Chart Completion',
		},
		__questionContentSchema: z.object({}),
		__responseContentSchema: z.object({}),
	},
	diagram_label_completion: {
		__displayName: { zh: '示意图标注填空题', en: 'Diagram Label Completion' },
		__questionContentSchema: z.object({}),
		__responseContentSchema: z.object({}),
	},
	short_answer_questions: {
		__displayName: { zh: '简答题', en: 'Short-Answer Questions' },
		__questionContentSchema: z.object({}),
		__responseContentSchema: z.object({}),
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
					__questionContentSchema: z.object({}),
					__items: ListeningItems,
				},
				part2: {
					__displayName: {
						zh: 'Part 2 日常社会独白',
						en: 'Part 2 Social Monologue',
					},
					__questionContentSchema: z.object({}),
					__items: ListeningItems,
				},
				part3: {
					__displayName: {
						zh: 'Part 3 学术讨论对话',
						en: 'Part 3 Academic Discussion',
					},
					__questionContentSchema: z.object({}),
					__items: ListeningItems,
				},
				part4: {
					__displayName: {
						zh: 'Part 4 学术讲座独白',
						en: 'Part 4 Academic Lecture',
					},
					__questionContentSchema: z.object({}),
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
					__questionContentSchema: z.object({}),
					__items: ReadingItems,
				},
				passage2: {
					__displayName: {
						zh: 'Passage 2 文章二（中等）',
						en: 'Passage 2 (Intermediate)',
					},
					__questionContentSchema: z.object({}),
					__items: ReadingItems,
				},
				passage3: {
					__displayName: {
						zh: 'Passage 3 文章三（高难）',
						en: 'Passage 3 (Advanced)',
					},
					__questionContentSchema: z.object({}),
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
					__questionContentSchema: z.object({}),
					__items: {
						default: {
							__displayName: { zh: '默认题型', en: 'Default' },
							__questionContentSchema: z.object({}),
							__responseContentSchema: z.object({}),
						},
					},
				},
				task2: {
					__displayName: {
						zh: 'Task 2 大作文（议论文）',
						en: 'Academic Writing Task 2',
					},
					__questionContentSchema: z.object({}),
					__items: {
						default: {
							__displayName: { zh: '默认题型', en: 'Default' },
							__questionContentSchema: z.object({}),
							__responseContentSchema: z.object({}),
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
					__questionContentSchema: z.object({}),
					__items: {
						default: {
							__displayName: { zh: '默认题型', en: 'Default' },
							__questionContentSchema: z.object({}),
							__responseContentSchema: z.object({}),
						},
					},
				},
				part2: {
					__displayName: { zh: 'Part 2 个人独白', en: 'Part 2 Long Turn' },
					__questionContentSchema: z.object({}),
					__items: {
						default: {
							__displayName: { zh: '默认题型', en: 'Default' },
							__questionContentSchema: z.object({}),
							__responseContentSchema: z.object({}),
						},
					},
				},
				part3: {
					__displayName: { zh: 'Part 3 双向讨论', en: 'Part 3 Discussion' },
					__questionContentSchema: z.object({}),
					__items: {
						default: {
							__displayName: { zh: '默认题型', en: 'Default' },
							__questionContentSchema: z.object({}),
							__responseContentSchema: z.object({}),
						},
					},
				},
			},
		},
	},
});
