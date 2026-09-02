import { z } from 'zod';

import { defineExam } from './__definer';
import {
  EmptyObjectSchema,
  FillingArraySchema,
  FillingRecordSchema,
  InformativeImageSchema,
  NonEmptyMdSchema,
  NonEmptyStringSchema,
  OptionsSchema,
  PaperWideSequenceSchema,
  PlaceholderObjectSchema,
  SelectionArraySchema,
  SimplePassageSchema,
  SpeakingSchema,
  StemSchema,
  TranscriptedAudioSchema,
  WritingSchema,
} from './__shared';

const BaseParitionSchema = z
  .object({
    partitionSequence: PaperWideSequenceSchema.describe(
      `${PaperWideSequenceSchema.description}\n题组在 paper全局中的顺序`,
    ),
    startItemSequence: PaperWideSequenceSchema.describe(
      `${PaperWideSequenceSchema.description}\n该题组起始 Item 的全局 sequence（区别于每个itemContent下的verbatimSequence，那是卷面上写的局部编号）`,
    ),
    endItemSequence: PaperWideSequenceSchema.describe(
      `${PaperWideSequenceSchema.description}\n该题组结束 Item 的全局 sequence（区别于每个itemContent下的verbatimSequence，那是卷面上写的局部编号）`,
    ),
  })
  .describe(
    '雅思特有的partition制度 (task下面所有items 按照题型分为一个或多个group/partition。partitions是一个寄生在taskContent里面的字段。)\n\n 识别partition的原则：在两个标题e.g.`Questions 1-7`和`Questions 8-13`之间的全部内容，即为一个partition（不包含`Questions 1-7`标题本身）。',
  );

const ListeningParitionsSchema = BaseParitionSchema.extend({
  content: z.discriminatedUnion('partitionCode', [
    z.object({
      partitionCode: z.enum(['multiple_choice']),
      instruction: NonEmptyMdSchema.describe(
        `${NonEmptyMdSchema.description}\nThe shared instruction of the partition: e.g. "Choose **TWO** correct answers.", "Choose the correct answer."`,
      ),
    }),
    z.object({
      partitionCode: z.enum(['matching']),
      instruction: NonEmptyMdSchema.describe(
        `${NonEmptyMdSchema.description}\nQuestion and instruction for the partition. e.g. "What is the role of the volunteers in each of the following activities?\n\nChoose ***SIX*** answers from the box and write the correct letter, ***A-I***, next to Questions 11-16."`,
      ),
      candidatesTitle: NonEmptyStringSchema.describe(
        `${NonEmptyStringSchema.description}\nThe title of the choice candidates, e.g. "Role of volunteers".`,
      ),
      candidates: OptionsSchema,
      itemsTitle: NonEmptyStringSchema.describe(
        `${NonEmptyStringSchema.description}\nThe title of the actual question items, e.g. "Activities".`,
      ),
    }),
    z.object({
      partitionCode: z.enum(['plan_or_map_or_diagram_labelling']),
      instruction: NonEmptyMdSchema.describe(
        `${NonEmptyMdSchema.description}Instruction for the partition. e.g. "Label the map below\n\nChoose the correct letter, ***A-G***, for each label."`,
      ),
      image: InformativeImageSchema.describe(
        `${InformativeImageSchema.description}\nThe plan/map/diagram in informative image format. Including the title if there is any.`,
      ),
    }),
    z.object({
      partitionCode: z.enum(['form_completion_by_filling']),
      instruction: NonEmptyMdSchema.describe(
        `${NonEmptyMdSchema.description}Instruction for the partition. e.g. "Complete the form below\n\nWrite ***ONE WORD AND/OR A NUMBER***, for each answer."`,
      ),
      formTitle: NonEmptyStringSchema.describe(
        `${NonEmptyStringSchema.description}\nThe title of the form, e.g. "Wayside Camera Club membership form".`,
      ),
      formContent: NonEmptyMdSchema.describe(
        `${NonEmptyMdSchema.description}The form content. Use Markdown to mimic the format. Turn blanks to verbatimSequence placeholders. e.g. "1______ Street" to "{{1}} Street", "to enter competitions to 3______" to "to enter competitions to {{3}}".`,
      ),
    }),
    z.object({ partitionCode: z.enum(['form_completion_by_selection']) }),
    z.object({
      partitionCode: z.enum(['note_completion_by_filling']),
      instruction: NonEmptyMdSchema.describe(
        `${NonEmptyMdSchema.description}Instruction for the partition. e.g. "Complete the notes below\n\nWrite ***ONE WORD ONLY*** for each answer."`,
      ),
      notesTitle: NonEmptyStringSchema.describe(
        `${NonEmptyStringSchema.description}\nThe title of the notes, e.g. "Reclaiming urban rivers".`,
      ),
      notesContent: NonEmptyMdSchema.describe(
        `${NonEmptyMdSchema.description}The notes content. Use Markdown to mimic the format. Turn blanks to verbatimSequence placeholders. e.g. "- pollution from 31_______ on the river bank" to "- pollution from {{31}} on the river bank".`,
      ),
    }),
    z.object({ partitionCode: z.enum(['note_completion_by_selection']) }),
    z.object({
      partitionCode: z.enum(['table_completion_by_filling']),
      instruction: NonEmptyMdSchema.describe(
        `${NonEmptyMdSchema.description}Instruction for the partition. e.g. "Complete the table below\n\nWrite ***ONE WORD AND/OR A NUMBER*** for each answer."`,
      ),
      tableContent: NonEmptyMdSchema.describe(
        `${NonEmptyMdSchema.description}The table content. Use Markdown to mimic the format. Turn blanks to verbatimSequence placeholders. e.g. "Set lunch costs 9 £_______ per person" to "Set lunch costs £{{9}} per person", "All the 7________ are very good" to "All the {{7}} are very good".`,
      ),
    }),
    z.object({ partitionCode: z.enum(['table_completion_by_selection']) }),
    z.object({
      partitionCode: z.enum(['flow_chart_completion_by_filling']),
      instruction: NonEmptyMdSchema.describe(
        `${NonEmptyMdSchema.description}Instruction for the partition. e.g. "Complete the flow chart below\n\nWrite ***ONE WORD ONLY*** for each answer."`,
      ),
      flowChartTitle: NonEmptyStringSchema.describe(
        `${NonEmptyStringSchema.description}\nThe title of the flow chart, e.g. "Assignment plan".`,
      ),
      flowChartContent: NonEmptyMdSchema.describe(
        `${NonEmptyMdSchema.description}The flow chart content for each stage. 注意只支持单链条不分叉的flow。 Use Markdown to mimic the format. Turn blanks to verbatimSequence placeholders. e.g. "Twelve students from the 25_______ department" to "Twelve students from the {{25}} department."。`,
      )
        .array()
        .describe('All the stages.'),
    }),
    z.object({
      partitionCode: z.enum(['flow_chart_completion_by_selection']),
      instruction: NonEmptyMdSchema.describe(
        `${NonEmptyMdSchema.description}Instruction for the partition. e.g. "Complete the flow chart below\n\nChoose ***FIVE*** answers from the box and write the correct letter, ***A-H***, next to Questions 26-30."`,
      ),
      flowChartTitle: NonEmptyStringSchema.optional().describe(
        `${NonEmptyStringSchema.description}\nThe title of the flow chart, if exists.`,
      ),
      flowChartContent: NonEmptyMdSchema.describe(
        `${NonEmptyMdSchema.description}The flow chart content for each stage. 注意只支持单链条不分叉的flow。 Use Markdown to mimic the format. Turn blanks to verbatimSequence placeholders. e.g. "Choose mice which are all the same 26_______ ." to "Choose mice which are all the same {{26}}."。`,
      )
        .array()
        .describe('All the stages.'),
      options: OptionsSchema,
    }),
    z.object({
      partitionCode: z.enum(['summary_completion_by_filling']),
      instruction: NonEmptyMdSchema.describe(
        `${NonEmptyMdSchema.description}Instruction for the partition. e.g. "Complete the summary below\n\nWrite ***ONE WORD ONLY*** for each answer."`,
      ),
      summaryTitle: NonEmptyStringSchema.describe(
        `${NonEmptyStringSchema.description}\nThe title of the summary, e.g. "Looking for Asian honey bees".`,
      ),
      summaryContent: NonEmptyMdSchema.describe(
        `${NonEmptyMdSchema.description}The summary content. Use Markdown to mimic the format. Turn blanks to verbatimSequence placeholders. e.g. "Here 28________ is used to soften them, and the researchers look for the 29_______ of Asian bees in the pellets." to "Here {{28}} is used to soften them, and the researchers look for the {{29}} of Asian bees in the pellets.".`,
      ),
    }),
    z.object({ partitionCode: z.enum(['summary_completion_by_selection']) }),
    z.object({
      partitionCode: z.enum(['sentence_completion']),
      instruction: NonEmptyMdSchema.describe(
        `${NonEmptyMdSchema.description}Instruction for the partition. e.g. "Complete the sentences below\n\nWrite ***ONE WORD ONLY*** for each answer."`,
      ),
    }),
    z.object({
      partitionCode: z.enum(['short_answer_questions']),
      instruction: NonEmptyMdSchema.describe(
        `${NonEmptyMdSchema.description}Instruction for the partition. e.g. "Complete the questions below\n\nWrite ***NO MORE THAN THREE WORDS AND/OR A NUMBER*** for each answer."`,
      ),
    }),
  ]),
}).array();

/**
 * @reference https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-listening
 */
const ListeningItems = {
  /**
   * @design /design/exam/ielts-academic-20230503/listening_multiple_choice_single_answer.png
   * @design /design/exam/ielts-academic-20230503/listening_multiple_choice_multiple_answers.png
   * @design /design/exam/ielts-academic-20230503-practice/listening_multiple_choice.png
   */
  multiple_choice: {
    __displayName: { zh: '选择题', en: 'Multiple Choice' },
    __questionContentSchema: z.object({
      stem: StemSchema,
      options: OptionsSchema,
    }),
    __responseContentSchema: SelectionArraySchema,
  },

  /**
   * @design /design/exam/ielts-academic-20230503-practice/listening_matching.png
   */
  matching: {
    __displayName: { zh: '配对题', en: 'Matching' },
    __questionContentSchema: z.object({
      prompt: NonEmptyStringSchema.describe(
        `${NonEmptyStringSchema.description}\nThe question item prompt immediately following the question number. e.g. "walking around the town centre", "helping at concerts" etc. Usually a phrase.`,
      ),
    }),
    __responseContentSchema: SelectionArraySchema,
  },

  /**
   * @design /design/exam/ielts-academic-20230503/listening_plan_or_map_or_diagram_labelling.png
   * @design /design/exam/ielts-academic-20230503-practice/listening_plan_or_map_or_diagram_labelling.png
   */
  plan_or_map_or_diagram_labelling: {
    __displayName: {
      zh: '地图/平面图/结构图标记题',
      en: 'Plan/Map/Diagram Labelling',
    },
    __questionContentSchema: z.object({
      label: NonEmptyStringSchema.describe(
        `${NonEmptyStringSchema.description}\nThe question item prompt, a.k.a. the label. e.g. "bridge foundations", "rubbish pit" etc.`,
      ),
    }),
    __responseContentSchema: SelectionArraySchema,
  },

  /**
   * @design /design/exam/ielts-academic-20230503-practice/listening_form_completion_by_filling.png
   */
  form_completion_by_filling: {
    __displayName: {
      zh: '表单填空题',
      en: 'Form Completion by Filling',
    },
    __questionContentSchema: EmptyObjectSchema,
    __responseContentSchema: FillingArraySchema,
  },

  /**
   * @undetermined
   * @design /design/exam/ielts-academic-20230503/
   */
  form_completion_by_selection: {
    __displayName: {
      zh: '表单选择填空题',
      en: 'Form Completion by Selection',
    },
    __questionContentSchema: PlaceholderObjectSchema,
    __responseContentSchema: SelectionArraySchema,
  },

  /**
   * @design /design/exam/ielts-academic-20230503/listening_note_completion_by_filling.png
   * @design /design/exam/ielts-academic-20230503-practice/listening_note_completion_by_filling.png
   */
  note_completion_by_filling: {
    __displayName: {
      zh: '笔记填空题',
      en: 'Note Completion by Filling',
    },
    __questionContentSchema: EmptyObjectSchema,
    __responseContentSchema: FillingArraySchema,
  },

  /**
   * @undetermined
   * @design /design/exam/ielts-academic-20230503/
   */
  note_completion_by_selection: {
    __displayName: {
      zh: '笔记选择填空题',
      en: 'Note Completion by Selection',
    },
    __questionContentSchema: PlaceholderObjectSchema,
    __responseContentSchema: SelectionArraySchema,
  },

  /**
   * @design /design/exam/ielts-academic-20230503/listening_table_completion_by_filling.png
   * @design /design/exam/ielts-academic-20230503-practice/listening_table_completion_by_filling.png
   */
  table_completion_by_filling: {
    __displayName: {
      zh: '表格填空题',
      en: 'Table Completion by Filling',
    },
    __questionContentSchema: EmptyObjectSchema,
    __responseContentSchema: FillingArraySchema,
  },

  /**
   * @undetermined
   * @design /design/exam/ielts-academic-20230503/
   */
  table_completion_by_selection: {
    __displayName: {
      zh: '表格选择填空题',
      en: 'Table Completion by Selection',
    },
    __questionContentSchema: PlaceholderObjectSchema,
    __responseContentSchema: SelectionArraySchema,
  },

  /**
   * @design /design/exam/ielts-academic-20230503-practice/listening_flow_chart_completion_by_filling.png
   */
  flow_chart_completion_by_filling: {
    __displayName: {
      zh: '流程图填空题',
      en: 'Flow Chart Completion by Filling',
    },
    __questionContentSchema: EmptyObjectSchema,
    __responseContentSchema: FillingArraySchema,
  },

  /**
   * @design /design/exam/ielts-academic-20230503/listening_flow_chart_completion_by_selection.png
   * @design /design/exam/ielts-academic-20230503-practice/listening_flow_chart_completion_by_selection.png
   */
  flow_chart_completion_by_selection: {
    __displayName: {
      zh: '流程图选择填空题',
      en: 'Flow Chart Completion by Selection',
    },
    __questionContentSchema: EmptyObjectSchema,
    __responseContentSchema: SelectionArraySchema,
  },

  /**
   * @design /design/exam/ielts-academic-20230503-practice/listening_summary_completion_by_filling.png
   */
  summary_completion_by_filling: {
    __displayName: {
      zh: '摘要填空题',
      en: 'Summary Completion by Filling',
    },
    __questionContentSchema: EmptyObjectSchema,
    __responseContentSchema: FillingArraySchema,
  },

  /**
   * @undetermined
   * @design /design/exam/ielts-academic-20230503/
   */
  summary_completion_by_selection: {
    __displayName: {
      zh: '摘要选择填空题',
      en: 'Summary Completion by Selection',
    },
    __questionContentSchema: PlaceholderObjectSchema,
    __responseContentSchema: SelectionArraySchema,
  },

  /**
   * @design /design/exam/ielts-academic-20230503/listening_sentence_completion.png
   * @design /design/exam/ielts-academic-20230503-practice/listening_sentence_completion.png
   */
  sentence_completion: {
    __displayName: { zh: '句子填空题', en: 'Sentence Completion' },
    __questionContentSchema: z.object({
      sentence: NonEmptyStringSchema.describe(
        `${NonEmptyStringSchema.description}\n The sentence to complete. The blanks should be replaced by {{verbatimSequence}}. e.g. "23. Kira says that lecturers are easier to {{1}} than those in her {{2}}", "24. Paul suggests that Kira may be more {{1}} than when she was studying before."`,
      ),
    }),
    __responseContentSchema: FillingRecordSchema,
  },

  /**
   * @design /design/exam/ielts-academic-20230503/listening_short_answer_questions.png
   * @design /design/exam/ielts-academic-20230503-practice/listening_short_answer_questions.png
   */
  short_answer_questions: {
    __displayName: { zh: '简答题', en: 'Short-Answer Questions' },
    __questionContentSchema: z.object({
      question: NonEmptyStringSchema.describe(
        `${NonEmptyStringSchema.description}\n The question to be answered.`,
      ),
    }),
    __responseContentSchema: FillingArraySchema,
  },
};

const ReadingParitionsSchema = BaseParitionSchema.extend({
  content: z.discriminatedUnion('partitionCode', [
    z.object({
      partitionCode: z.enum(['multiple_choice']),
      instruction: NonEmptyMdSchema.describe(
        `${NonEmptyMdSchema.description}Instruction for the partition. e.g. "Choose the correct letter, ***A, B, C or D.***\n\nWrite the correct letter in boxes 27-30 on your answer sheet."`,
      ),
    }),
    z.object({
      partitionCode: z.enum(['identifying_information']),
      instruction: NonEmptyMdSchema.describe(
        `${NonEmptyMdSchema.description}Instruction for the partition. e.g. "Do the following statements agree with the information given in Reading Passage 1?\n\nIn boxes 1-6 on your answer sheet, write\n\n***TRUE***        *if the statement agrees with the information*\n\n***FALSE***        *if the statement contradicts the information*\n\n***NOT GIVEN***        *if there is no information on this*"`,
      ),
    }),
    z.object({
      partitionCode: z.enum(['identifying_writers_views_or_claims']),
      instruction: NonEmptyMdSchema.describe(
        `${NonEmptyMdSchema.description}Instruction for the partition. e.g. "Do the following statements agree with the claims of the writer in Reading Passage 2?\n\nIn boxes 20-23 on your answer sheet, write\n\n***YES***        *if the statement agrees with the claims of the writer*\n\n***NO***        *if the statement contradicts the claims of the writer*\n\n***NOT GIVEN***        *if it is impossible to say what the writer thinks about this*"`,
      ),
    }),
    z.object({
      partitionCode: z.enum(['matching_information']),
      instruction: NonEmptyMdSchema.describe(
        `${NonEmptyMdSchema.description}Instruction for the partition. e.g. "Reading Passage 2 has seven sections, **A-G**.\n\nWhich section contains the following information?\n\n*Write the correct letter, **A-G**, in boxes 14-18 on your answer sheet.*\n\n***NB**  You may use any letter more than once.*"`,
      ),
    }),
    z.object({
      partitionCode: z.enum(['matching_headings']),
      instruction: NonEmptyMdSchema.describe(
        `${NonEmptyMdSchema.description}Instruction for the partition. e.g. "Reading Passage 2 has seven paragraphs, **A-G**.\n\nChoose the correct heading for each paragraph from the list of headings below.\n\n*Write the correct number, **i-viii**, in boxes 14-20 on your answer sheet.*"`,
      ),
      headingsTitle: NonEmptyStringSchema.describe(
        `${NonEmptyStringSchema.description}\nThe title of the headings, e.g. "List of Headings".`,
      ),
      headings: z
        .object({
          identifier: NonEmptyStringSchema.describe(
            `${NonEmptyStringSchema}\ne.g."i","iv","viii" etc.`,
          ),
          content: NonEmptyStringSchema.describe(
            `${NonEmptyStringSchema}\ne.g. "Marketing issues lead to failure", "A disappointing outcome for customers" etc.`,
          ),
        })
        .array()
        .describe('All the headings.'),
    }),
    z.object({
      partitionCode: z.enum(['matching_features']),
      instruction: NonEmptyMdSchema.describe(
        `${NonEmptyMdSchema.description}Instruction for the partition. e.g. "*Look at the following purposes (Questions 19-21) and the list of timber cuts below.*\n\n*Match each purpose with the correct timber cut, **A**, **B**, or **C**.*\n\n*Write the correct letter, **A**, **B**, or **C**, in boxes 19-21 on your answer sheet.*\n\n***NB**  You may use any letter more than once.*"`,
      ),
      optionsTitle: NonEmptyStringSchema.describe(
        `${NonEmptyStringSchema.description}\nThe title of the options, e.g. "List of Timber Cuts".`,
      ),
      options: OptionsSchema,
    }),
    z.object({
      partitionCode: z.enum(['matching_sentence_endings']),
      instruction: NonEmptyMdSchema.describe(
        `${NonEmptyMdSchema.description}Instruction for the partition. e.g. "*Complete each sentence with the correct ending, **A-G**, below.*\n\n*Write the correct letter, **A-G**, in boxes 31-35 on your answer sheet.*"`,
      ),
      options: OptionsSchema,
    }),
    z.object({
      partitionCode: z.enum(['sentence_completion']),
      instruction: NonEmptyMdSchema.describe(
        `${NonEmptyMdSchema.description}Instruction for the partition. e.g. "*Complete the sentences below*\n\n*Choose **ONE WORD ONLY** from the passage for each answer.*\n\n*Write your answers in boxes 18-22 on your answer sheet.*"`,
      ),
    }),
    z.object({
      partitionCode: z.enum(['summary_completion_by_filling']),
      instruction: NonEmptyMdSchema.describe(
        `${NonEmptyMdSchema.description}Instruction for the partition. e.g. "*Complete the summary below*\n\n*Choose **ONE WORD ONLY** from the passage for each answer.*\n\n*Write your answers in boxes 7-13 on your answer sheet.*"`,
      ),
      summaryTitle: NonEmptyStringSchema.describe(
        `${NonEmptyStringSchema.description}\ne.g. Guard rails`,
      ),
      summaryContent: NonEmptyMdSchema.describe(
        `${NonEmptyMdSchema.description}\nThe summary paragraphs. Replace blank with {{verbatimSequence}} placeholder. e.g. "Guard rails were introduced on British roads to improve the {{7}} of pedestrians, while ensuring that the movement of {{8}} is not disrupted." etc.`,
      ),
    }),
    z.object({
      partitionCode: z.enum(['summary_completion_by_selection']),
      instruction: NonEmptyMdSchema.describe(
        `${NonEmptyMdSchema.description}Instruction for the partition. e.g. "*Complete the summary using the list of phrases. **A-J**, below.*\n\n*Write the correct letter, **A-J**, in boxes 27-31 on your answer sheet.*"`,
      ),
      summaryTitle: NonEmptyStringSchema.describe(
        `${NonEmptyStringSchema.description}\ne.g. "The story behind the hunt for Charles II"`,
      ),
      summaryContent: NonEmptyMdSchema.describe(
        `${NonEmptyMdSchema.description}\nThe summary paragraphs. Replace blank with {{verbatimSequence}} placeholder. e.g. "...and Charles had to flee for his life. A {{30}} was offered for Charles's capture, ..." etc.`,
      ),
      options: OptionsSchema,
    }),
    z.object({
      partitionCode: z.enum(['note_completion_by_filling']),
      instruction: NonEmptyMdSchema.describe(
        `${NonEmptyMdSchema.description}Instruction for the partition. e.g. "*Complete the notes below.*\n\n*Choose **ONE WORD AND/OR A NUMBER** from the passage for each answer.*\n\n*Write your answers in boxes 7-13 on your answer sheet.*"`,
      ),
      notesTitle: NonEmptyStringSchema.describe(
        `${NonEmptyStringSchema.description}\ne.g. "New Zealand’s kākāpō"`,
      ),
      notesContent: NonEmptyMdSchema.describe(
        `${NonEmptyMdSchema.description}\nThe notes content. Replace blank with {{verbatimSequence}} placeholder. e.g. "**A type of parrot**\n\n- diet consists of fern fronds, various parts of a tree and {{7}}" etc.`,
      ),
    }),
    z.object({ partitionCode: z.enum(['note_completion_by_selection']) }),
    z.object({
      partitionCode: z.enum(['table_completion_by_filling']),
      instruction: NonEmptyMdSchema.describe(
        `${NonEmptyMdSchema.description}Instruction for the partition. e.g. "*Complete the table below.*\n\n*Choose **ONE WORD ONLY** from the passage for each answer.*\n\n*Write your answers in boxes 4-7 on your answer sheet.*"`,
      ),
      tableTitle: NonEmptyStringSchema.describe(
        `${NonEmptyStringSchema.description}\ne.g. "Intensive farming versus aeroponic urban farming"`,
      ),
      tableContent: NonEmptyMdSchema.describe(
        `${NonEmptyMdSchema.description}\nThe table content. Use markdown syntax to mimic the table. Replace blank with {{verbatimSequence}} placeholder. e.g. "- wide range of {{4}} used\n\n- techniques pollute air" etc.`,
      ),
    }),
    z.object({ partitionCode: z.enum(['table_completion_by_selection']) }),
    z.object({
      partitionCode: z.enum(['flow_chart_completion_by_filling']),
      instruction: NonEmptyMdSchema.describe(
        `${NonEmptyMdSchema.description}Instruction for the partition. e.g. "*Complete the flow-chart below.*\n\n*Choose **NO MORE THAN TWO WORDS AND/OR A NUMBER** from the passage for each answer.*\n\n*Write your answers in boxes 34-39 on your answer sheet.*"`,
      ),
      flowChartTitle: NonEmptyStringSchema.describe(
        `${NonEmptyStringSchema.description}\nThe title of the flow chart, e.g. "Method of determing where the ancestors of turtles and tortoises come from".`,
      ),
      flowChartContent: NonEmptyMdSchema.describe(
        `${NonEmptyMdSchema.description}The flow chart content for each stage. 注意只支持单链条不分叉的flow。 Use Markdown to mimic the format. Turn blanks to verbatimSequence placeholders. e.g. "**Step 1**\n\n71 species of living turtles and tortoises were examined and a total of {{34}} were taken from the bones of their forelimbs."。`,
      )
        .array()
        .describe('All the stages.'),
    }),
    z.object({ partitionCode: z.enum(['flow_chart_completion_by_selection']) }),
    z.object({
      partitionCode: z.enum(['diagram_label_completion']),
      instruction: NonEmptyMdSchema.describe(
        `${NonEmptyMdSchema.description}Instruction for the partition. e.g. "*Label the diagrams below.*\n\n*Choose **ONE WORD ONLY** from the passage for each answer.*\n\n*Write your answers in boxes 1-6 on your answer sheet.*"`,
      ),
      diagrams: InformativeImageSchema.describe(
        `${InformativeImageSchema.description}\nThe diagrams in informative image format. Including the title if there is any. Ensure all the diagrams, titles, questions, blanks etc. a.k.a. the prompt, are contained in one image.`,
      ),
    }),
    z.object({
      partitionCode: z.enum(['short_answer_questions']),
      instruction: NonEmptyMdSchema.describe(
        `${NonEmptyMdSchema.description}Instruction for the partition. e.g. "*Complete the questions below.*\n\n*Choose **NO MORE THAN TWO WORDS AND/OR A NUMBER** from the passage for each answer.*\n\n*Write your answers in boxes 7-10 on your answer sheet.*"`,
      ),
    }),
  ]),
}).array();

/**
 * @reference https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-reading
 */
const ReadingItems = {
  /**
   * @design /design/exam/ielts-academic-20230503/reading_multiple_choice_multiple_answers.png
   * @design /design/exam/ielts-academic-20230503/reading_multiple_choice_single_answer.png
   * @design /design/exam/ielts-academic-20230503-practice/reading_multiple_choice.png
   */
  multiple_choice: {
    __displayName: { zh: '选择题', en: 'Multiple Choice' },
    __questionContentSchema: z.object({
      stem: StemSchema,
      options: OptionsSchema,
    }),
    __responseContentSchema: SelectionArraySchema,
  },

  /**
   * @design /design/exam/ielts-academic-20230503/reading_identifying_information.png
   * @design /design/exam/ielts-academic-20230503-practice/reading_identifying_information.png
   */
  identifying_information: {
    __displayName: {
      zh: '事实判断题 (T/F/NG)',
      en: 'Identifying Information (True/False/Not Given)',
    },
    __questionContentSchema: z.object({
      statement: NonEmptyStringSchema.describe(
        `${NonEmptyStringSchema.description}\nThe statement to evaluate.`,
      ),
    }),
    __responseContentSchema: SelectionArraySchema,
  },

  /**
   * @design /design/exam/ielts-academic-20230503-practice/reading_identifying_writers_views_or_claims.png
   */
  identifying_writers_views_or_claims: {
    __displayName: {
      zh: '观点判断题 (Y/N/NG)',
      en: 'Identifying Writer’s Views/Claims (Yes/No/Not Given)',
    },
    __questionContentSchema: z.object({
      statement: NonEmptyStringSchema.describe(
        `${NonEmptyStringSchema.description}\nThe statement to evaluate.`,
      ),
    }),
    __responseContentSchema: SelectionArraySchema,
  },

  /**
   * @design /design/exam/ielts-academic-20230503-practice/reading_matching_information.png
   */
  matching_information: {
    __displayName: { zh: '段落信息匹配题', en: 'Matching Information' },
    __questionContentSchema: z.object({
      information: NonEmptyStringSchema.describe(
        `${NonEmptyStringSchema.description}\nThe information to evaluate.`,
      ),
    }),
    __responseContentSchema: SelectionArraySchema,
  },

  /**
   * @design /design/exam/ielts-academic-20230503-practice/reading_matching_headings.png
   */
  matching_headings: {
    __displayName: { zh: '段落小标题匹配题', en: 'Matching Headings' },
    __questionContentSchema: z.object({
      prompt: NonEmptyMdSchema.describe(
        `${NonEmptyMdSchema.description}\n e.g. "Paragraph **C**", "Paragraph **G**" etc.`,
      ),
    }),
    __responseContentSchema: SelectionArraySchema,
  },

  /**
   * @design /design/exam/ielts-academic-20230503/reading_matching_features.png
   * @design /design/exam/ielts-academic-20230503-practice/reading_matching_features.png
   */
  matching_features: {
    __displayName: { zh: '特征/人名匹配题', en: 'Matching Features' },
    __questionContentSchema: z.object({
      prompt: NonEmptyStringSchema.describe(
        `${NonEmptyStringSchema.description}\nThe prompt, e.g. "to remove trees that are diseased" etc.`,
      ),
    }),
    __responseContentSchema: SelectionArraySchema.describe(
      `${SelectionArraySchema.description}\n Match the prompt with the correct option.`,
    ),
  },

  /**
   * @design /design/exam/ielts-academic-20230503/reading_matching_sentence_endings.png
   * @design /design/exam/ielts-academic-20230503-practice/reading_matching_sentence_endings.png
   */
  matching_sentence_endings: {
    __displayName: { zh: '句尾匹配题', en: 'Matching Sentence Endings' },
    __questionContentSchema: z.object({
      prompt: NonEmptyStringSchema.describe(
        `${NonEmptyStringSchema.description}\nThe prompt sentence stem to be added with an ending, e.g. "At times when they were relaxed, the firefighters usually" etc.`,
      ),
    }),
    __responseContentSchema: SelectionArraySchema,
  },

  /**
   * @design /design/exam/ielts-academic-20230503/reading_sentence_completion.png
   * @design /design/exam/ielts-academic-20230503-practice/reading_sentence_completion.png
   */
  sentence_completion: {
    __displayName: { zh: '完成句子题', en: 'Sentence Completion' },
    __questionContentSchema: z.object({
      sentence: NonEmptyStringSchema.describe(
        `${NonEmptyStringSchema.description}\nThe sentence to complete. Replace blank with {{verbatimSequence}} placeholder. e.g. "A project in LA has increased the number of {{1}} on the city's streets." etc.`,
      ),
    }),
    __responseContentSchema: FillingRecordSchema,
  },

  /**
   * @design /design/exam/ielts-academic-20230503/reading_summary_completion_by_filling.png
   * @design /design/exam/ielts-academic-20230503-practice/reading_summary_completion_by_filling.png
   */
  summary_completion_by_filling: {
    __displayName: {
      zh: '摘要填空题',
      en: 'Summary Completion by Filling',
    },
    __questionContentSchema: EmptyObjectSchema,
    __responseContentSchema: FillingArraySchema,
  },

  /**
   * @design /design/exam/ielts-academic-20230503/reading_summary_completion_by_selection.png
   * @design /design/exam/ielts-academic-20230503-practice/reading_summary_completion_by_selection.png
   */
  summary_completion_by_selection: {
    __displayName: {
      zh: '摘要选择填空题',
      en: 'Summary Completion by Selection',
    },
    __questionContentSchema: EmptyObjectSchema,
    __responseContentSchema: SelectionArraySchema,
  },

  /**
   * @design /design/exam/ielts-academic-20230503/reading_note_completion_by_filling.png
   * @design /design/exam/ielts-academic-20230503-practice/reading_note_completion_by_filling.png
   */
  note_completion_by_filling: {
    __displayName: {
      zh: '笔记填空题',
      en: 'Note Completion by Filling',
    },
    __questionContentSchema: EmptyObjectSchema,
    __responseContentSchema: FillingArraySchema,
  },

  /**
   * @undetermined
   * @design /design/exam/ielts-academic-20230503/
   */
  note_completion_by_selection: {
    __displayName: {
      zh: '笔记选择填空题',
      en: 'Note Completion by Selection',
    },
    __questionContentSchema: PlaceholderObjectSchema,
    __responseContentSchema: SelectionArraySchema,
  },

  /**
   * @design /design/exam/ielts-academic-20230503/reading_table_completion_by_filling.png
   * @design /design/exam/ielts-academic-20230503-practice/reading_table_completion_by_filling.png
   */
  table_completion_by_filling: {
    __displayName: {
      zh: '表格填空题',
      en: 'Table Completion by Filling',
    },
    __questionContentSchema: EmptyObjectSchema,
    __responseContentSchema: FillingArraySchema,
  },

  /**
   * @undetermined
   * @design /design/exam/ielts-academic-20230503/
   */
  table_completion_by_selection: {
    __displayName: {
      zh: '表格选择填空题',
      en: 'Table Completion by Selection',
    },
    __questionContentSchema: PlaceholderObjectSchema,
    __responseContentSchema: SelectionArraySchema,
  },

  /**
   * @design /design/exam/ielts-academic-20230503-practice/reading_flow_chart_completion_by_filling.png
   */
  flow_chart_completion_by_filling: {
    __displayName: {
      zh: '流程图填空题',
      en: 'Flow-Chart Completion by Filling',
    },
    __questionContentSchema: EmptyObjectSchema,
    __responseContentSchema: FillingArraySchema,
  },

  /**
   * @undetermined
   * @design /design/exam/ielts-academic-20230503/
   */
  flow_chart_completion_by_selection: {
    __displayName: {
      zh: '流程图选择填空题',
      en: 'Flow-Chart Completion by Selection',
    },
    __questionContentSchema: PlaceholderObjectSchema,
    __responseContentSchema: SelectionArraySchema,
  },

  /**
   * @design /design/exam/ielts-academic-20230503-practice/reading_diagram_label_completion.png
   */
  diagram_label_completion: {
    __displayName: { zh: '示意图标注填空题', en: 'Diagram Label Completion' },
    __questionContentSchema: EmptyObjectSchema,
    __responseContentSchema: FillingArraySchema,
  },

  /**
   * @design /design/exam/ielts-academic-20230503-practice/reading_short_answer_questions.png
   */
  short_answer_questions: {
    __displayName: { zh: '简答题', en: 'Short-Answer Questions' },
    __questionContentSchema: z.object({
      question: NonEmptyStringSchema.describe(
        `${NonEmptyStringSchema.description}\n The question to be answered.`,
      ),
    }),
    __responseContentSchema: FillingArraySchema,
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
            partitions: ListeningParitionsSchema,
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
            partitions: ListeningParitionsSchema,
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
            partitions: ListeningParitionsSchema,
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
            partitions: ListeningParitionsSchema,
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
            zh: 'Passage 1',
            en: 'Passage 1',
          },
          __questionContentSchema: z.object({
            partitions: ReadingParitionsSchema,
            passage: SimplePassageSchema,
          }),
          __items: ReadingItems,
        },
        passage2: {
          __displayName: {
            zh: 'Passage 2',
            en: 'Passage 2',
          },
          __questionContentSchema: z.object({
            partitions: ReadingParitionsSchema,
            passage: SimplePassageSchema,
          }),
          __items: ReadingItems,
        },
        passage3: {
          __displayName: {
            zh: 'Passage 3',
            en: 'Passage 3',
          },
          __questionContentSchema: z.object({
            partitions: ReadingParitionsSchema,
            passage: SimplePassageSchema,
          }),
          __items: ReadingItems,
        },
      },
    },

    writing: {
      __displayName: { zh: '写作', en: 'Writing' },
      __tasks: {
        /**
         * @design /design/exam/ielts-academic-20230503-practice/writing_task1_default.png
         */
        task1: {
          __displayName: {
            zh: 'Task 1（小作文）',
            en: 'Academic Writing Task 1',
          },
          __questionContentSchema: EmptyObjectSchema,
          __items: {
            default: {
              __displayName: { zh: '默认题型', en: 'Default' },
              __questionContentSchema: z.object({
                instruction: NonEmptyStringSchema.describe(
                  `${NonEmptyStringSchema.description}\ne.g. "You should spend about 20 minutes on this task."`,
                ),
                prompt: NonEmptyMdSchema.describe(
                  `${NonEmptyMdSchema.description}\n\n问题描述，通常是黑体加斜体，且有分段。e.g. "***The first table show changes in the total population of New York City from 1800 to 2000. The second and their tables show...***\n\n***Summarise the information by selecting and reporting the main features, and make comparisons where relevant.***" etc.`,
                ),
                image: InformativeImageSchema.describe(
                  '整张图表（包括子图、对比图等）放到一个image来盛装。',
                ),
              }),
              __responseContentSchema: WritingSchema,
            },
          },
        },
        /**
         * @design /design/exam/ielts-academic-20230503-practice/writing_task2_default.png
         */
        task2: {
          __displayName: {
            zh: 'Task 2（大作文）',
            en: 'Academic Writing Task 2',
          },
          __questionContentSchema: EmptyObjectSchema,
          __items: {
            default: {
              __displayName: { zh: '默认题型', en: 'Default' },
              __questionContentSchema: z.object({
                instructionBeforePrompt: NonEmptyMdSchema.describe(
                  `${NonEmptyMdSchema.description}\ne.g. "You should spend about 40 minutes on this task.\n\nWrite about the following topic:"`,
                ),
                prompt: NonEmptyMdSchema.describe(
                  `${NonEmptyMdSchema.description}\n议论文题目，通常是黑体加斜体，且有分段。e.g. "***Access to clean water is a basic human right. Therefore every home should have a water supply that is provided free of charge.***\n\n***Do you agree or disagree?***" etc.`,
                ),
                instructionAfterPrompt: NonEmptyMdSchema.describe(
                  `${NonEmptyMdSchema.description}\ne.g. "Give reasons for your answer and include any relevant examples from own knowledge or experience.\n\nWrite at least 250 words."`,
                ),
              }),
              __responseContentSchema: WritingSchema,
            },
          },
        },
      },
    },

    speaking: {
      __displayName: { zh: '口语', en: 'Speaking' },
      __tasks: {
        /**
         * @design /design/exam/ielts-academic-20230503-practice/speaking_part1_default.png
         */
        part1: {
          __displayName: {
            zh: 'Part 1（自我介绍与简短问答）',
            en: 'Part 1 (Introduction and Interview)',
          },
          __questionContentSchema: z.object({
            instruction: NonEmptyStringSchema.describe(
              `${NonEmptyStringSchema.description}\ne.g. The examiner asks you about yourself, your home, work or studies and other familiar topics.`,
            ),
            topic: NonEmptyStringSchema.describe(
              `${NonEmptyStringSchema.description}\ne.g. "Walking"`,
            ),
          }),
          __items: {
            default: {
              __displayName: { zh: '默认题型', en: 'Default' },
              __questionContentSchema: z.object({
                prompt: NonEmptyStringSchema.describe(
                  `${NonEmptyStringSchema.description}\nA single question, e.g. "How much walking do you do in your daily life?",`,
                ),
              }),
              __responseContentSchema: SpeakingSchema,
            },
          },
        },
        /**
         * @design /design/exam/ielts-academic-20230503-practice/speaking_part2_default.png
         */
        part2: {
          __displayName: { zh: 'Part 2（个人独白）', en: 'Part 2 (Long Turn)' },
          __questionContentSchema: EmptyObjectSchema,
          __items: {
            default: {
              __displayName: { zh: '默认题型', en: 'Default' },
              __questionContentSchema: z.object({
                prompt: NonEmptyMdSchema.describe(
                  `${NonEmptyMdSchema.description}\nCue Card 话题卡。用纯黑体和分段。`,
                ),
                instruction: NonEmptyStringSchema.describe(
                  `${NonEmptyStringSchema.description}\ne.g. "You will have to talk about the topic for one to two minutes. You have one minute to think about what you are going to say. You can make some notes to help you if you wish."`,
                ),
              }),
              __responseContentSchema: SpeakingSchema,
            },
          },
        },
        /**
         * @design /design/exam/ielts-academic-20230503-practice/speaking_part3_default.png
         */
        part3: {
          __displayName: { zh: 'Part 3（双向讨论）', en: 'Part 3 Discussion' },
          __questionContentSchema: z.object({
            partitions: BaseParitionSchema.extend({
              topic: NonEmptyStringSchema.describe(
                `${NonEmptyStringSchema.description}\ne.g. "Theatres today" etc.`,
              ),
            })
              .array()
              .describe('Usually two partitions.'),
          }),
          __items: {
            default: {
              __displayName: { zh: '默认题型', en: 'Default' },
              __questionContentSchema: z.object({
                prompt: NonEmptyStringSchema.describe(
                  `${NonEmptyStringSchema.description}\nA single question, e.g. "Do you think theatres need to do more to attract younger audiences?",`,
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
