import z from 'zod';

import {
  type TransDict,
  TransDictSchema,
  type VerbatimSequence,
  VerbatimSequenceSchema,
} from './__shared';

type ToEnumLike<T extends string> = { [K in T]: K };

interface LooseNestedSections {
  [S: string]: {
    __displayName: TransDict;
    __tasks: {
      [Task: string]: {
        __displayName: TransDict;
        __questionContentSchema: z.ZodObject<any>;
        __items: {
          [Item: string]: {
            __displayName: TransDict;
            __questionContentSchema: z.ZodObject<any>;
            __responseContentSchema: z.ZodObject<any>;
          };
        };
      };
    };
  };
}

type GetSectionKeys<TSections extends LooseNestedSections> = keyof TSections &
  string;

type GetTaskKeys<TSections extends LooseNestedSections> = {
  [S in keyof TSections & string]: {
    [Task in keyof TSections[S]['__tasks'] & string]: `${S}_${Task}`;
  }[keyof TSections[S]['__tasks'] & string];
}[keyof TSections & string];

type GetItemKeys<TSections extends LooseNestedSections> = {
  [S in keyof TSections & string]: {
    [Task in keyof TSections[S]['__tasks'] & string]: {
      [
        Item in keyof TSections[S]['__tasks'][Task]['__items'] & string
      ]: `${S}_${Task}_${Item}`;
    }[keyof TSections[S]['__tasks'][Task]['__items'] & string];
  }[keyof TSections[S]['__tasks'] & string];
}[keyof TSections & string];

type GetSectionCodes<
  TCode extends string,
  TSections extends LooseNestedSections,
> = `${TCode}_${GetSectionKeys<TSections>}`;

type GetTaskCodes<
  TCode extends string,
  TSections extends LooseNestedSections,
> = `${TCode}_${GetTaskKeys<TSections>}`;

type GetItemCodes<
  TCode extends string,
  TSections extends LooseNestedSections,
> = `${TCode}_${GetItemKeys<TSections>}`;

type GetTaskSchemaUnion<
  TCode extends string,
  TSections extends LooseNestedSections,
> = {
  [S in keyof TSections & string]: {
    [Task in keyof TSections[S]['__tasks'] & string]: z.ZodObject<
      TSections[S]['__tasks'][Task]['__questionContentSchema']['shape'] & {
        taskCode: z.ZodEnum<ToEnumLike<`${TCode}_${S}_${Task}`>>;
      }
    >;
  }[keyof TSections[S]['__tasks'] & string];
}[keyof TSections & string];

type GetItemSchemaUnion<
  TCode extends string,
  TSections extends LooseNestedSections,
> = {
  [S in keyof TSections & string]: {
    [Task in keyof TSections[S]['__tasks'] & string]: {
      [
        Item in keyof TSections[S]['__tasks'][Task]['__items'] & string
      ]: z.ZodObject<
        TSections[S]['__tasks'][Task]['__items'][Item]['__questionContentSchema']['shape'] & {
          itemCode: z.ZodEnum<ToEnumLike<`${TCode}_${S}_${Task}_${Item}`>>;
          verbatimSequence: VerbatimSequence;
        }
      >;
    }[keyof TSections[S]['__tasks'][Task]['__items'] & string];
  }[keyof TSections[S]['__tasks'] & string];
}[keyof TSections & string];

type GetResponseSchemaUnion<
  TCode extends string,
  TSections extends LooseNestedSections,
> = {
  [S in keyof TSections & string]: {
    [Task in keyof TSections[S]['__tasks'] & string]: {
      [
        Item in keyof TSections[S]['__tasks'][Task]['__items'] & string
      ]: z.ZodObject<
        TSections[S]['__tasks'][Task]['__items'][Item]['__responseContentSchema']['shape'] & {
          itemCode: z.ZodEnum<ToEnumLike<`${TCode}_${S}_${Task}_${Item}`>>;
        }
      >;
    }[keyof TSections[S]['__tasks'][Task]['__items'] & string];
  }[keyof TSections[S]['__tasks'] & string];
}[keyof TSections & string];

type GetDisplayNamesKeys<
  TCode extends string,
  TSections extends LooseNestedSections,
> =
  | TCode
  | GetSectionCodes<TCode, TSections>
  | GetTaskCodes<TCode, TSections>
  | GetItemCodes<TCode, TSections>;

// 1. 校验 Item 层级：只允许 __displayName, __questionContentSchema 和 __responseContentSchema
type ValidateItem<TItem> = TItem extends {
  __displayName: TransDict;
  __questionContentSchema: z.ZodObject<infer ItemShape>;
  __responseContentSchema: z.ZodObject<infer ResponseShape>;
}
  ? {
      __displayName: TransDict;
      __questionContentSchema: z.ZodObject<ItemShape>;
      __responseContentSchema: z.ZodObject<ResponseShape>;
    } & {
      [
        K in Exclude<
          keyof TItem,
          | '__displayName'
          | '__questionContentSchema'
          | '__responseContentSchema'
        >
      ]: never;
    }
  : never;

// 2. 校验 Task 层级：只允许 __displayName, __questionContentSchema 和 __items
type ValidateTask<TTask> = TTask extends {
  __displayName: TransDict;
  __questionContentSchema: z.ZodObject<infer TaskShape>;
  __items: infer Items;
}
  ? {
      __displayName: TransDict;
      __questionContentSchema: z.ZodObject<TaskShape>;
      __items: {
        [Item in keyof Items]: ValidateItem<Items[Item]>;
      };
    } & {
      [
        K in Exclude<
          keyof TTask,
          '__displayName' | '__questionContentSchema' | '__items'
        >
      ]: never;
    }
  : never;

// 3. 校验 Section 层级：只允许 __displayName 和 __tasks
type ValidateSection<TSection> = TSection extends {
  __displayName: TransDict;
  __tasks: infer Tasks;
}
  ? {
      __displayName: TransDict;
      __tasks: {
        [Task in keyof Tasks]: ValidateTask<Tasks[Task]>;
      };
    } & {
      [K in Exclude<keyof TSection, '__displayName' | '__tasks'>]: never;
    }
  : never;

// 4. 汇总入口
type ValidateNestedSections<TSections> = {
  [S in keyof TSections]: ValidateSection<TSections[S]>;
};

export function defineExam<
  const TCode extends string,
  const TDisplayName extends TransDict,
  const TSections extends LooseNestedSections &
    ValidateNestedSections<TSections>,
>(input: { code: TCode; displayName: TDisplayName; __sections: TSections }) {
  const examCode = input.code;
  const examDisplayName = input.displayName;

  const displayNameParseResult = TransDictSchema.safeParse(examDisplayName);
  if (!displayNameParseResult.success) {
    throw new Error(
      `[Validation fail] Exam "${examCode}" has an invalid displayName. ` +
        `Error: ${displayNameParseResult.error.message}`,
    );
  }

  const sectionCodes: string[] = [];
  const taskCodes: string[] = [];
  const itemCodes: string[] = [];

  const taskSchemas: any[] = [];
  const itemSchemas: any[] = [];
  const responseSchemas: any[] = [];

  const displayNames: Record<string, TransDict> = {
    [examCode]: examDisplayName,
  };

  for (const [sectionKey, sectionVal] of Object.entries(input.__sections)) {
    const sectionCode = `${examCode}_${sectionKey}`;
    sectionCodes.push(sectionCode);

    const sectionTyped = sectionVal as any;

    const sectionDisplayName = sectionTyped.__displayName;
    const sectionDisplayNameParseResult =
      TransDictSchema.safeParse(sectionDisplayName);
    if (!sectionDisplayNameParseResult.success) {
      throw new Error(
        `[Validation fail] Section "${sectionCode}" has an invalid displayName. ` +
          `Error: ${sectionDisplayNameParseResult.error.message}`,
      );
    }

    displayNames[sectionCode] = sectionDisplayName;

    for (const [taskKey, taskVal] of Object.entries(sectionTyped.__tasks)) {
      const taskTyped = taskVal as any;
      const taskCode = `${sectionCode}_${taskKey}`;
      taskCodes.push(taskCode);

      const taskDisplayName = taskTyped.__displayName;
      const taskDisplayNameParseResult =
        TransDictSchema.safeParse(taskDisplayName);
      if (!taskDisplayNameParseResult.success) {
        throw new Error(
          `[Validation fail] Task "${taskCode}" has an invalid displayName. ` +
            `Error: ${taskDisplayNameParseResult.error.message}`,
        );
      }

      displayNames[taskCode] = taskDisplayName;

      const extendedTaskSchema = taskTyped.__questionContentSchema.extend({
        taskCode: z.enum([taskCode]),
      });
      taskSchemas.push(
        taskTyped.__questionContentSchema.description
          ? extendedTaskSchema.describe(
              taskTyped.__questionContentSchema.description,
            )
          : extendedTaskSchema,
      );

      for (const [itemKey, itemVal] of Object.entries(taskTyped.__items)) {
        const itemTyped = itemVal as any;
        const itemCode = `${taskCode}_${itemKey}`;
        itemCodes.push(itemCode);

        const itemDisplayName = itemTyped.__displayName;
        const itemDisplayNameParseResult =
          TransDictSchema.safeParse(itemDisplayName);
        if (!itemDisplayNameParseResult.success) {
          throw new Error(
            `[Validation fail] Item "${itemCode}" has an invalid displayName. ` +
              `Error: ${itemDisplayNameParseResult.error.message}`,
          );
        }

        displayNames[itemCode] = itemDisplayName;

        // 🌟 集中注入 itemCode 与 verbatimSequence
        const extendedItemSchema = itemTyped.__questionContentSchema.extend({
          itemCode: z.enum([itemCode]),
          verbatimSequence: VerbatimSequenceSchema,
        });
        itemSchemas.push(
          itemTyped.__questionContentSchema.description
            ? extendedItemSchema.describe(
                itemTyped.__questionContentSchema.description,
              )
            : extendedItemSchema,
        );

        const extendedResponseSchema = itemTyped.__responseContentSchema.extend(
          {
            itemCode: z.enum([itemCode]),
          },
        );
        responseSchemas.push(
          itemTyped.__responseContentSchema.description
            ? extendedResponseSchema.describe(
                itemTyped.__responseContentSchema.description,
              )
            : extendedResponseSchema,
        );
      }
    }
  }

  const createUnion = (key: string, schemas: any[]) => {
    if (schemas.length === 1) {
      return z.discriminatedUnion(key as any, [schemas[0], schemas[0]] as any);
    }
    return z.discriminatedUnion(key as any, schemas as any);
  };

  return {
    displayNames: displayNames as unknown as Record<
      GetDisplayNamesKeys<TCode, TSections>,
      TransDict
    >,
    ExamCodeSchema: z.enum([examCode]) as unknown as z.ZodEnum<
      ToEnumLike<TCode>
    >,
    SectionCodeSchema: z.enum(sectionCodes as any) as unknown as z.ZodEnum<
      ToEnumLike<GetSectionCodes<TCode, TSections>>
    >,
    TaskCodeSchema: z.enum(taskCodes as any) as unknown as z.ZodEnum<
      ToEnumLike<GetTaskCodes<TCode, TSections>>
    >,
    ItemCodeSchema: z.enum(itemCodes as any) as unknown as z.ZodEnum<
      ToEnumLike<GetItemCodes<TCode, TSections>>
    >,
    TaskContentSchema: createUnion(
      'taskCode',
      taskSchemas,
    ) as unknown as z.ZodType<z.infer<GetTaskSchemaUnion<TCode, TSections>>> & {
      options: any[];
      optionsMap?: Map<string, any>;
    },
    ItemContentSchema: createUnion(
      'itemCode',
      itemSchemas,
    ) as unknown as z.ZodType<z.infer<GetItemSchemaUnion<TCode, TSections>>> & {
      options: any[];
      optionsMap?: Map<string, any>;
    },
    ResponseContentSchema: createUnion(
      'itemCode',
      responseSchemas,
    ) as unknown as z.ZodType<
      z.infer<GetResponseSchemaUnion<TCode, TSections>>
    > & {
      options: any[];
      optionsMap?: Map<string, any>;
    },
  };
}
