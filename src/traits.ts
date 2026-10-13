import {
  ItemCodeSchema,
  getResponseCode,
  type ItemCode,
  type ResponseCode,
} from './index';

// ==========================================================
// 1. 类型定义
// ==========================================================

/**
 * 考查的核心模态
 */
export type ItemModality = 'speaking' | 'writing' | 'filming' | 'objective';

/**
 * 全量枚举标签体系
 * 供 hasItemTag() 或按 tag 筛选时统一使用
 */
export type ItemTag =
  | 'speaking' // 口语录音
  | 'writing' // 写作文本
  | 'filming' // 视频录像
  | 'subjective' // 主观题 (无唯一标准答案，需大模型或人工评阅)
  | 'objective' // 客观题 (有严格标答，系统可自动对错判分)
  | 'audio_input' // 需音频录制输入
  | 'video_input' // 需视频拍摄输入
  | 'text_input' // 需打字/自由文本输入 (写作、自由填空等)
  | 'selection_input' // 需点选/拖拽类交互 (单选、多选、匹配、排序)
  | 'ai_rubric_grading'; // 需大模型基于多维度评分量规 (Rubric) 进行深度诊断

/**
 * 题目特征完整元数据契约 (Single Source of Truth)
 */
export interface ItemTraits {
  /** 题目唯一代码 */
  readonly itemCode: ItemCode;
  /** 对应的底层作答类型 */
  readonly responseCode: ResponseCode;
  /** 考查模态 (口语 / 写作 / 视频 / 客观题) */
  readonly modality: ItemModality;

  /** 是否为主观题 (口语、写作、视频等) */
  readonly isSubjective: boolean;
  /** 是否为客观题 (单选、多选、判断、填空、配对等) */
  readonly isObjective: boolean;

  /** 是否需要麦克风收音 */
  readonly requiresMicrophone: boolean;
  /** 是否需要摄像头拍摄 */
  readonly requiresCamera: boolean;
  /** 是否需要打字/文本输入 */
  readonly requiresTyping: boolean;
  /** 是否为点选/卡片拖拽类选择输入 */
  readonly isSelectionBased: boolean;
  /** 是否适用大模型基于评分准则 (Rubric) 进行评阅打分 */
  readonly supportsAiRubricGrading: boolean;

  /**
   * 对应题目的全量特征标签集合 (只读 Set，支持 O(1) 极速查询)
   */
  readonly tags: ReadonlySet<ItemTag>;
}

// ==========================================================
// 2. 特征自动推导内核 (Derived Computation)
// ==========================================================

function computeItemTraits(itemCode: ItemCode): ItemTraits {
  const responseCode = getResponseCode(itemCode);

  const isSpeaking = responseCode === 'speaking';
  const isWriting = responseCode === 'writing';
  const isFilming = responseCode === 'filming';

  const isSubjective = isSpeaking || isWriting || isFilming;
  const isObjective = !isSubjective;

  const requiresMicrophone = isSpeaking || isFilming;
  const requiresCamera = isFilming;
  const requiresTyping =
    isWriting ||
    responseCode === 'filling_array' ||
    responseCode === 'filling_record';
  const isSelectionBased =
    responseCode === 'selection_array' || responseCode === 'selection_record';

  const supportsAiRubricGrading = isSubjective;

  let modality: ItemModality = 'objective';
  if (isSpeaking) modality = 'speaking';
  else if (isWriting) modality = 'writing';
  else if (isFilming) modality = 'filming';

  const tags = new Set<ItemTag>();
  if (isSubjective) tags.add('subjective');
  if (isObjective) tags.add('objective');
  if (isSpeaking) tags.add('speaking');
  if (isWriting) tags.add('writing');
  if (isFilming) tags.add('filming');
  if (requiresMicrophone) tags.add('audio_input');
  if (requiresCamera) tags.add('video_input');
  if (requiresTyping) tags.add('text_input');
  if (isSelectionBased) tags.add('selection_input');
  if (supportsAiRubricGrading) tags.add('ai_rubric_grading');

  return {
    itemCode,
    responseCode,
    modality,
    isSubjective,
    isObjective,
    requiresMicrophone,
    requiresCamera,
    requiresTyping,
    isSelectionBased,
    supportsAiRubricGrading,
    tags,
  };
}

// ==========================================================
// 3. 延迟初始化单例缓存 (防止模块循环导入时的时序问题)
// ==========================================================

let traitsCache: Map<ItemCode, ItemTraits> | null = null;

function getTraitsCache(): Map<ItemCode, ItemTraits> {
  if (!traitsCache) {
    traitsCache = new Map();
    for (const code of ItemCodeSchema.options) {
      traitsCache.set(code, computeItemTraits(code));
    }
  }
  return traitsCache;
}

// ==========================================================
// 4. 对外导出的核心查询与判定函数 (API)
// ==========================================================

/**
 * 获取指定 itemCode 的完整特征属性对象
 */
export function getItemTraits(itemCode: ItemCode): ItemTraits {
  const cache = getTraitsCache();
  const traits = cache.get(itemCode);
  if (!traits) {
    throw new Error(
      `[getItemTraits] 未找到该 itemCode 的特征属性: ${itemCode}`,
    );
  }
  return traits;
}

/**
 * 判定题目是否为主观题 (口语、写作、面试视频)
 */
export function isSubjectiveItem(itemCode: ItemCode): boolean {
  return getItemTraits(itemCode).isSubjective;
}

/**
 * 判定题目是否为客观题 (选择、填空、判断、配对等)
 */
export function isObjectiveItem(itemCode: ItemCode): boolean {
  return getItemTraits(itemCode).isObjective;
}

/**
 * 判定题目是否为口语题
 */
export function isSpeakingItem(itemCode: ItemCode): boolean {
  return getItemTraits(itemCode).modality === 'speaking';
}

/**
 * 判定题目是否为写作题
 */
export function isWritingItem(itemCode: ItemCode): boolean {
  return getItemTraits(itemCode).modality === 'writing';
}

/**
 * 判定题目是否具备某个特定的标签属性
 */
export function hasItemTag(itemCode: ItemCode, tag: ItemTag): boolean {
  return getItemTraits(itemCode).tags.has(tag);
}

/**
 * 获取全量题目的特征映射 Map (只读)
 */
export function getItemTraitsMap(): ReadonlyMap<ItemCode, ItemTraits> {
  return getTraitsCache();
}

/**
 * 获取全量主观题 itemCode 列表
 */
export function getSubjectiveItemCodes(): ItemCode[] {
  return ItemCodeSchema.options.filter((code) => isSubjectiveItem(code));
}

/**
 * 获取全量客观题 itemCode 列表
 */
export function getObjectiveItemCodes(): ItemCode[] {
  return ItemCodeSchema.options.filter((code) => isObjectiveItem(code));
}

/**
 * 获取全量口语题 itemCode 列表
 */
export function getSpeakingItemCodes(): ItemCode[] {
  return ItemCodeSchema.options.filter((code) => isSpeakingItem(code));
}

/**
 * 获取全量写作题 itemCode 列表
 */
export function getWritingItemCodes(): ItemCode[] {
  return ItemCodeSchema.options.filter((code) => isWritingItem(code));
}
