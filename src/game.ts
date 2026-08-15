import { patients, type Patient, type Triage, type ZoneId } from "./data";

export type ScenarioId = "notion";
export type ScoreAxis = "triage" | "clinical" | "flow" | "coordination";

export interface ScenarioPreset {
  id: ScenarioId;
  name: string;
  description: string;
  patientIds: number[];
  arrivalOffsets: Record<number, number>;
}

export interface GameEvent {
  id: string;
  type: string;
  atSeconds: number;
  label: string;
  patientId?: number;
}

export interface ScoreEntry {
  id: string;
  axis: ScoreAxis;
  points: number;
  reason: string;
  atSeconds: number;
  patientId?: number;
  countsTowardTotal?: boolean;
}

export interface DeteriorationRule {
  patientId: number;
  sourceEventMinute: number;
  level: "warning" | "critical";
  message: string;
  triggerZone?: ZoneId;
  regardlessOfTreatment?: boolean;
}

export type TreatmentOption =
  | "モニター装着"
  | "酸素投与"
  | "気道確保・挿管"
  | "末梢ルート確保"
  | "急速輸液"
  | "輸血"
  | "アトロピン投与"
  | "アドレナリン投与"
  | "胸腔ドレーン留置"
  | "骨盤バインダー"
  | "骨折部の固定"
  | "頭部挙上"
  | "鎮痛"
  | "創部処置"
  | "外科コール"
  | "脳神経外科コール"
  | "整形外科コール"
  | "心臓血管外科コール"
  | "循環器科コール"
  | "小児科コール"
  | "消化器科コール"
  | "放射線科コール"
  | "手術室/麻酔科コール"
  | "ICUコール";

export interface TreatmentPlan {
  required: TreatmentOption[];
  deadlineSeconds: number;
  deteriorationMessage: string;
}

export const treatmentOptions: TreatmentOption[] = [
  "モニター装着", "酸素投与", "気道確保・挿管", "末梢ルート確保", "急速輸液", "輸血",
  "アトロピン投与", "アドレナリン投与", "胸腔ドレーン留置", "骨盤バインダー",
  "骨折部の固定", "頭部挙上", "鎮痛", "創部処置",
];

export const departmentCallOptions: TreatmentOption[] = [
  "外科コール", "脳神経外科コール", "整形外科コール", "心臓血管外科コール",
  "循環器科コール", "小児科コール", "消化器科コール", "放射線科コール",
  "手術室/麻酔科コール", "ICUコール",
];

const treatmentPlans: Record<number, TreatmentPlan> = {
  1: { required: ["モニター装着", "酸素投与", "末梢ルート確保", "輸血", "胸腔ドレーン留置", "外科コール", "ICUコール"], deadlineSeconds: 5 * 60, deteriorationMessage: "呼吸・循環状態が悪化。酸素、輸血、胸腔ドレーン、外科・ICUへの連絡が未完了です。" },
  2: { required: ["モニター装着", "末梢ルート確保", "急速輸液", "輸血", "骨盤バインダー", "放射線科コール", "ICUコール"], deadlineSeconds: 6 * 60, deteriorationMessage: "出血性ショックが進行。骨盤固定、輸血、放射線科との止血方針が未完了です。" },
  3: { required: ["モニター装着", "気道確保・挿管", "頭部挙上", "脳神経外科コール", "手術室/麻酔科コール", "ICUコール"], deadlineSeconds: 6 * 60, deteriorationMessage: "意識・呼吸状態が悪化。気道保護と脳神経外科・手術室への連絡が未完了です。" },
  5: { required: ["モニター装着", "末梢ルート確保", "急速輸液", "輸血", "外科コール", "手術室/麻酔科コール", "ICUコール"], deadlineSeconds: 6 * 60, deteriorationMessage: "循環動態が悪化。出血性ショックへの初期蘇生と手術調整が未完了です。" },
  13: { required: ["モニター装着", "酸素投与", "気道確保・挿管", "末梢ルート確保", "輸血", "脳神経外科コール", "ICUコール"], deadlineSeconds: 6 * 60, deteriorationMessage: "ショックが進行。気道・循環管理と脳神経外科・ICUへの連絡が未完了です。" },
  38: { required: ["モニター装着", "末梢ルート確保", "脳神経外科コール"], deadlineSeconds: 8 * 60, deteriorationMessage: "神経所見が悪化。脳卒中対応と専門科への連絡が未完了です。" },
  39: { required: ["モニター装着", "末梢ルート確保", "急速輸液", "鎮痛", "外科コール"], deadlineSeconds: 7 * 60, deteriorationMessage: "腹痛と循環動態が悪化。再評価と初期治療が未完了です。" },
  40: { required: ["モニター装着", "末梢ルート確保", "急速輸液", "輸血", "放射線科コール", "外科コール", "手術室/麻酔科コール", "ICUコール"], deadlineSeconds: 7 * 60, deteriorationMessage: "肝損傷による出血性ショックが進行。止血と手術・ICU調整が未完了です。" },
  41: { required: ["モニター装着", "酸素投与", "気道確保・挿管", "末梢ルート確保", "骨折部の固定", "整形外科コール", "ICUコール"], deadlineSeconds: 7 * 60, deteriorationMessage: "脂肪塞栓症候群による呼吸不全が進行。気道管理とICU調整が未完了です。" },
  45: { required: ["モニター装着", "末梢ルート確保", "アトロピン投与", "循環器科コール", "ICUコール"], deadlineSeconds: 7 * 60, deteriorationMessage: "徐脈性ショックが悪化。薬剤投与と循環器科・ICUへの連絡が未完了です。" },
};

export const treatmentPlanFor = (patientId: number) => treatmentPlans[patientId];

const patientClinicalText = (patient: Patient) => [
  patient.name, patient.vitals, patient.exam, patient.tests, patient.scenario,
  patient.treatment, patient.additionalEvent, patient.branchConditions, patient.destination, patient.moulage,
].join(" ");

// Procedures that must be explicitly supported by the case instructions, not merely its diagnosis.
const patientTreatmentInstructionText = (patient: Patient) => [
  patient.treatment,
  patient.branchConditions,
  patient.controllerChecklist,
].join(" ");

export function isTreatmentAllowed(patient: Patient, option: TreatmentOption) {
  const plan = treatmentPlanFor(patient.id);
  if (plan?.required.includes(option)) return true;
  const text = patientClinicalText(patient);
  const treatmentInstructions = patientTreatmentInstructionText(patient);
  if (patient.expectedZone === "er" && ["モニター装着", "酸素投与", "末梢ルート確保", "鎮痛"].includes(option)) return true;
  if (option === "気道確保・挿管") return /挿管|呼吸不全|換気困難|GCS\s*[3-8](?:\D|$)|GCS[≦≤]\s*8|治療抵抗性.*出血性ショック/.test(text);
  if (option === "急速輸液" || option === "輸血") return /ショック|BP\s*[3-8]\d|血圧(?:が)?低下|循環(?:が|動態)?(?:不安定|悪化)|大量出血/.test(text);
  if (option === "創部処置") return /創|切創|擦過|裂創|開放骨折|皮膚欠損/.test(text);
  if (option === "骨折部の固定") {
    if (/肋骨|骨盤バインダー|テープ固定/.test(treatmentInstructions)) return false;
    return /固定|シーネ|整復/.test(treatmentInstructions);
  }
  if (option === "胸腔ドレーン留置") return /胸腔ドレーン/.test(text);
  if (option === "骨盤バインダー") return /骨盤(?:骨折|動揺)|サムスリング/.test(text);
  if (option === "頭部挙上") return /頭部外傷|頭蓋内|硬膜[下外]|脳ヘルニア/.test(text);
  if (option === "鎮痛") return /疼痛|痛|骨折|打撲/.test(text);
  if (option === "アトロピン投与") return /アトロピン|徐脈|房室ブロック/.test(text);
  if (option === "アドレナリン投与") return /アドレナリン|アナフィラキシー|心停止|CPA/.test(text);
  if (option === "外科コール") return /外科|開腹|開胸|腹膜炎|消化管穿孔/.test(text);
  if (option === "脳神経外科コール") return /脳神経外科|開頭|硬膜[下外]|頭蓋内|脳外傷|脳梗塞/.test(text);
  if (option === "整形外科コール") return /骨折|脱臼|整形外科/.test(text);
  if (option === "心臓血管外科コール") return /心臓血管外科|大動脈|心タンポナーデ/.test(text);
  if (option === "循環器科コール") return /循環器|STEMI|心筋梗塞|房室ブロック|PCI|冠動脈/.test(text);
  if (option === "小児科コール") return /小児|乳児|幼児|児童/.test(text);
  if (option === "消化器科コール") return /消化器|消化管|腸管|腸間膜|肝損傷|腹部/.test(text);
  if (option === "放射線科コール") return /TAE|血管内治療|血管造影|AG\b|IVR/.test(text);
  if (option === "手術室/麻酔科コール") return /手術|開腹|開胸|開頭|骨接合|デブリドマン/.test(text);
  if (option === "ICUコール") return patient.destination.includes("ICU") || /ICU/.test(text);
  return false;
}

const allPatientIds = patients.map((patient) => patient.id);
const simulationStartMinute = 10 * 60;

export const scenarios: ScenarioPreset[] = [
  {
    id: "notion",
    name: "Notion症例スケジュール",
    description: "Notion症例DBの来院時刻に合わせて、全50症例を到着させる",
    patientIds: allPatientIds,
    arrivalOffsets: Object.fromEntries(patients.map((patient) => [
      patient.id,
      Math.max(0, patient.arrivalMinute - simulationStartMinute),
    ])),
  },
];

export const deteriorationRules: DeteriorationRule[] = [
  { patientId: 1, sourceEventMinute: 10 * 60 + 22, level: "critical", triggerZone: "icu", regardlessOfTreatment: true, message: "ICU入室後、胸腔ドレーン排液量と出血量が増大。血圧低下・呼吸状態悪化" },
  { patientId: 2, sourceEventMinute: 10 * 60 + 22, level: "warning", message: "TAE後に血圧が再低下し、乳酸値が上昇。輸血継続とICU調整が必要" },
  { patientId: 3, sourceEventMinute: 10 * 60 + 24, level: "critical", message: "意識レベルが低下し、神経学的所見が悪化" },
  { patientId: 5, sourceEventMinute: 10 * 60 + 45, level: "critical", message: "腹痛が増悪し、循環動態に変化" },
  { patientId: 13, sourceEventMinute: 10 * 60 + 38, level: "critical", message: "意識レベル低下と瞳孔所見の変化" },
  { patientId: 38, sourceEventMinute: 10 * 60 + 50, level: "warning", message: "新たな神経学的所見を認める" },
  { patientId: 39, sourceEventMinute: 10 * 60 + 50, level: "warning", message: "腹痛が増悪し、再評価が必要" },
  { patientId: 40, sourceEventMinute: 11 * 60 + 35, level: "critical", message: "循環動態が再び不安定化" },
  { patientId: 41, sourceEventMinute: 10 * 60 + 55, level: "critical", message: "呼吸状態が急速に悪化" },
  { patientId: 45, sourceEventMinute: 11 * 60 + 25, level: "critical", message: "搬送後に心停止が発生" },
];

export function deteriorationOffset(rule: DeteriorationRule, scenario: ScenarioPreset) {
  return Math.max(
    (scenario.arrivalOffsets[rule.patientId] ?? 0) + 1,
    rule.sourceEventMinute - simulationStartMinute,
  );
}

export const scenarioById = (_id: ScenarioId = "notion") => scenarios[0];

export const scoreAxisLabels: Record<ScoreAxis, string> = {
  triage: "トリアージ",
  clinical: "診療判断",
  flow: "患者フロー",
  coordination: "部門連携",
};

// The overall score starts at 100 and is a deduction-based assessment.
// Small flow delays should be visible without overwhelming clinical decisions.
export const scoreRules = {
  delayedPrimaryTriage: -1,
  delayedPrimaryTriageMinutes: 8,
  underTriage: -6,
  overTriage: -2,
  incorrectInitialZone: -2,
  delayedDeteriorationReassessment: -4,
  severePatientGoalBonus: 8,
} as const;

const triageRank: Record<Triage, number> = { green: 1, yellow: 2, red: 3 };

export function scoreTriage(expected: Triage, assigned: Triage) {
  if (expected === assigned) return { points: 10, reason: "想定と一致する一次トリアージ" };
  if (triageRank[assigned] < triageRank[expected]) return { points: scoreRules.underTriage, reason: "過小トリアージ" };
  return { points: scoreRules.overTriage, reason: "過大トリアージ" };
}

export function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
