import {
  getItemCodesUnderTask,
  getResponseCode,
  ItemCodeSchema,
  TaskCodeSchema,
  type ItemCode,
  type ResponseCode,
  type TaskCode,
} from './index';

// ==========================================================
// 1. 正交原子维度定义 (Orthogonal Dimensions)
// ==========================================================

/** 维度 1: 学科/考查领域 (Domain) */
export type ItemDomain =
  | 'reading'
  | 'listening'
  | 'writing'
  | 'speaking'
  | 'general';

/** 维度 2: 判分裁决范式 (Scoring Paradigm) */
export type ItemScoringParadigm = 'objective' | 'subjective';

/** 维度 3: 硬件输入设备要求 (Device Requirement) */
export type InputDevice = 'pointer' | 'keyboard' | 'microphone' | 'camera';

/**
 * 维度 4: 针对“未来意想不到判定”的开放能力集 (Capabilities)
 * 未来只要在此追加字面量，便可无缝支持任意业务判定！
 */
export type ItemCapability =
  | 'requires_audio_playback' // 题干是否包含音频听力播放
  | 'requires_recording' // 作答是否需要录制音频/视频
  | 'supports_ai_rubric' // 是否支持/需要大模型 Rubric 深度评分
  | 'supports_auto_cloze'; // 是否为完形/占位符挖空交互

// ==========================================================
// 2. 特征契约 (Traits Contracts)
// ==========================================================

export interface ItemTraits {
  readonly itemCode: ItemCode;
  readonly responseCode: ResponseCode;

  // 正交核心维度
  readonly domain: ItemDomain;
  readonly scoring: ItemScoringParadigm;
  readonly requiredDevices: ReadonlySet<InputDevice>;
  readonly capabilities: ReadonlySet<ItemCapability>;

  // 极速访问语法糖 (Getters / Helper Booleans)
  readonly isSubjective: boolean;
  readonly isObjective: boolean;
  readonly isSpeaking: boolean;
  readonly isWriting: boolean;
}

export interface TaskTraits {
  readonly taskCode: TaskCode;
  readonly itemCodes: readonly ItemCode[];
  readonly domain: ItemDomain;
  readonly scoring: ItemScoringParadigm | 'hybrid';

  readonly isSubjective: boolean;
  readonly isPureObjective: boolean;
  readonly isSpeaking: boolean;
  readonly isWriting: boolean;

  readonly requiredDevices: ReadonlySet<InputDevice>;
  readonly capabilities: ReadonlySet<ItemCapability>;
}

// ==========================================================
// 3. 确定性正交推导引擎 (Deterministic Derivation)
// ==========================================================

/**
 * 从编码规则中提取考查领域（独立于作答方式）
 * 命名规范契约：{examCode}_{section}_{task}_{item}
 */
function resolveItemDomain(itemCode: string): ItemDomain {
  const lower = itemCode.toLowerCase();
  if (lower.includes('_speaking_')) return 'speaking';
  if (lower.includes('_writing_')) return 'writing';
  if (lower.includes('_listening_')) return 'listening';
  if (lower.includes('_reading_')) return 'reading';
  return 'general';
}

function computeItemTraits(itemCode: ItemCode): ItemTraits {
  const responseCode = getResponseCode(itemCode);
  const domain = resolveItemDomain(itemCode);

  // 1. 判分范式正交判定
  const scoring: ItemScoringParadigm = [
    'writing',
    'speaking',
    'filming',
  ].includes(responseCode)
    ? 'subjective'
    : 'objective';

  // 2. 所需交互设备判定
  const devices = new Set<InputDevice>();
  if (responseCode === 'speaking') {
    devices.add('microphone');
  } else if (responseCode === 'filming') {
    devices.add('microphone');
    devices.add('camera');
  } else if (
    responseCode === 'writing' ||
    responseCode === 'filling_array' ||
    responseCode === 'filling_record'
  ) {
    devices.add('keyboard');
  } else {
    devices.add('pointer');
  }

  // 3. 特性能力集判定（未来新增意想不到的特性在此声明）
  const capabilities = new Set<ItemCapability>();
  if (scoring === 'subjective') {
    capabilities.add('supports_ai_rubric');
  }
  if (devices.has('microphone') || devices.has('camera')) {
    capabilities.add('requires_recording');
  }
  if (
    responseCode === 'filling_record' ||
    responseCode === 'selection_record'
  ) {
    capabilities.add('supports_auto_cloze');
  }
  if (domain === 'listening') {
    capabilities.add('requires_audio_playback');
  }

  const isSubjective = scoring === 'subjective';

  return {
    itemCode,
    responseCode,
    domain,
    scoring,
    requiredDevices: devices,
    capabilities,
    isSubjective,
    isObjective: !isSubjective,
    isSpeaking: domain === 'speaking' || devices.has('microphone'),
    isWriting: domain === 'writing',
  };
}

function computeTaskTraits(taskCode: TaskCode): TaskTraits {
  const itemCodes = getItemCodesUnderTask(taskCode);
  const childTraits = itemCodes.map((code) => getItemTraits(code));

  // 聚合学科领域
  const domain = childTraits[0]?.domain || resolveItemDomain(taskCode);

  // 聚合判分方式
  const hasSubjective = childTraits.some((t) => t.isSubjective);
  const hasObjective = childTraits.some((t) => t.isObjective);
  const scoring =
    hasSubjective && hasObjective
      ? 'hybrid'
      : hasSubjective
        ? 'subjective'
        : 'objective';

  // 聚合设备需求与能力集
  const requiredDevices = new Set<InputDevice>();
  const capabilities = new Set<ItemCapability>();

  childTraits.forEach((t) => {
    t.requiredDevices.forEach((d) => requiredDevices.add(d));
    t.capabilities.forEach((c) => capabilities.add(c));
  });

  return {
    taskCode,
    itemCodes,
    domain,
    scoring,
    isSubjective: hasSubjective,
    isPureObjective: !hasSubjective && childTraits.length > 0,
    isSpeaking: domain === 'speaking' || requiredDevices.has('microphone'),
    isWriting: domain === 'writing',
    requiredDevices,
    capabilities,
  };
}

// ==========================================================
// 4. 延迟初始化单例缓存
// ==========================================================

let itemTraitsCache: Map<ItemCode, ItemTraits> | null = null;
let taskTraitsCache: Map<TaskCode, TaskTraits> | null = null;

function getItemTraitsCache(): Map<ItemCode, ItemTraits> {
  if (!itemTraitsCache) {
    itemTraitsCache = new Map();
    for (const code of ItemCodeSchema.options) {
      itemTraitsCache.set(code, computeItemTraits(code));
    }
  }
  return itemTraitsCache;
}

function getTaskTraitsCache(): Map<TaskCode, TaskTraits> {
  if (!taskTraitsCache) {
    taskTraitsCache = new Map();
    for (const code of TaskCodeSchema.options) {
      taskTraitsCache.set(code, computeTaskTraits(code));
    }
  }
  return taskTraitsCache;
}

// ==========================================================
// 5. 对外高阶语义 API (Predicates & Capabilities)
// ==========================================================

export function getItemTraits(itemCode: ItemCode): ItemTraits {
  const traits = getItemTraitsCache().get(itemCode);
  if (!traits) throw new Error(`[getItemTraits] 未知 itemCode: ${itemCode}`);
  return traits;
}

export function getTaskTraits(taskCode: TaskCode): TaskTraits {
  const traits = getTaskTraitsCache().get(taskCode);
  if (!traits) throw new Error(`[getTaskTraits] 未知 taskCode: ${taskCode}`);
  return traits;
}

// Item 语义断言
export const isSubjectiveItem = (code: ItemCode) =>
  getItemTraits(code).isSubjective;
export const isObjectiveItem = (code: ItemCode) =>
  getItemTraits(code).isObjective;
export const isSpeakingItem = (code: ItemCode) =>
  getItemTraits(code).isSpeaking;
export const isWritingItem = (code: ItemCode) => getItemTraits(code).isWriting;
export const hasItemCapability = (code: ItemCode, cap: ItemCapability) =>
  getItemTraits(code).capabilities.has(cap);

// Task 语义断言
export const isSubjectiveTask = (code: TaskCode) =>
  getTaskTraits(code).isSubjective;
export const isPureObjectiveTask = (code: TaskCode) =>
  getTaskTraits(code).isPureObjective;
export const isSpeakingTask = (code: TaskCode) =>
  getTaskTraits(code).isSpeaking;
export const isWritingTask = (code: TaskCode) => getTaskTraits(code).isWriting;
export const hasTaskCapability = (code: TaskCode, cap: ItemCapability) =>
  getTaskTraits(code).capabilities.has(cap);

// 核心大盘集合
export const getSubjectiveItemCodes = () =>
  ItemCodeSchema.options.filter(isSubjectiveItem);
export const getSubjectiveTaskCodes = () =>
  TaskCodeSchema.options.filter(isSubjectiveTask);
