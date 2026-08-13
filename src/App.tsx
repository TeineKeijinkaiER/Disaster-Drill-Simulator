import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DndContext,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  Ambulance,
  BedDouble,
  Car,
  ChevronRight,
  ClipboardList,
  CirclePause,
  CirclePlay,
  Clock3,
  DoorOpen,
  Hospital,
  Phone,
  RotateCcw,
  ScanLine,
  Settings2,
  SlidersHorizontal,
  Stethoscope,
  Trophy,
  UserRound,
  UsersRound,
  Volume2,
  VolumeX,
} from "lucide-react";
import {
  patients,
  type Patient,
  type RoleState,
  type Triage,
  type ZoneId,
  zoneLabels,
} from "./data";
import {
  createId,
  departmentCallOptions,
  deteriorationOffset,
  deteriorationRules,
  isTreatmentAllowed,
  scenarioById,
  scenarios,
  scoreAxisLabels,
  scoreRules,
  scoreTriage,
  treatmentOptions,
  treatmentPlanFor,
  type TreatmentOption,
  type GameEvent,
  type ScenarioId,
  type ScoreAxis,
  type ScoreEntry,
} from "./game";

interface PatientRuntime {
  zone: ZoneId;
  role: RoleState;
  transitTo?: ZoneId;
  transitRemaining?: number;
  imagingRemaining?: number;
  imagingCompleted?: boolean;
  primaryTriageComplete?: boolean;
  secondaryTriageComplete?: boolean;
  erAssessmentComplete?: boolean;
  assignedTriage?: Triage;
  revealedVitals?: boolean;
  revealedExam?: boolean;
  zoneEnteredAt?: number;
  deteriorationLevel?: "warning" | "critical";
  deteriorationMessage?: string;
  deteriorationAt?: number;
  deteriorationAcknowledged?: boolean;
  appliedTreatments?: TreatmentOption[];
  treatmentComplete?: boolean;
  treatmentDeteriorationTriggered?: boolean;
  treatmentAppliedAt?: Partial<Record<TreatmentOption, number>>;
  deteriorationResolved?: boolean;
}

interface CapacitySettings {
  icuExisting: number;
  euExisting: number;
  orGeneralInUse: number;
  agExisting: number;
  eyeRoomInUse: boolean;
  erSevereExisting: number;
  erModerateExisting: number;
}

type BgmMode = "opening" | "training";

const START_MINUTE = 10 * 60;
const STORAGE_KEY = "disaster-tabletop-v11";
const BGM_SOURCES: Record<BgmMode, string> = {
  opening: `${import.meta.env.BASE_URL}bgm-loop.wav`,
  training: `${import.meta.env.BASE_URL}game-bgm-loop.wav`,
};

const defaultRuntime = (scenarioId: ScenarioId): Record<number, PatientRuntime> => {
  const activeIds = new Set(scenarioById(scenarioId).patientIds);
  return Object.fromEntries(patients.map((patient) => [
    patient.id,
    { zone: activeIds.has(patient.id) ? "scheduled" : "complete", role: "active" },
  ]));
};

const defaultCapacity: CapacitySettings = {
  icuExisting: 8,
  euExisting: 18,
  orGeneralInUse: 8,
  agExisting: 0,
  eyeRoomInUse: true,
  erSevereExisting: 0,
  erModerateExisting: 0,
};

function formatClock(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600) % 24;
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
}

function firstSentence(value: string) {
  const end = value.indexOf("。");
  return end === -1 ? value : value.slice(0, end + 1);
}

function preHospitalHistory(value: string) {
  return firstSentence(value);
}

function withoutTriageHint(value: string) {
  return value
    .replace(/(?:判定|トリアージ結果)\s*[:：][^。\n]*/g, "")
    .replace(/(?:来院時の一次トリアージは|一次トリアージは)[^。\n]*/g, "")
    .replace(/(?:赤|黄|緑)として[^。\n]*/g, "")
    .replace(/。{2,}/g, "。")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function injurySite(patient: Patient) {
  const text = `${patient.history} ${patient.triageFindings} ${patient.exam}`;
  const sites = ["頭部", "顔面", "頸部", "胸部", "腹部", "腰部", "骨盤", "背部", "肩", "上腕", "前腕", "手", "大腿", "膝", "下腿", "足"];
  const matched = sites.filter((site) => text.includes(site));
  return matched.length ? [...new Set(matched)].slice(0, 3).join("・") : "部位不明";
}

function arrivalMobility(patient: Patient) {
  if (patient.method === "walk") return "自力歩行で来院";
  const text = `${patient.triageFindings} ${patient.actingPoints}`;
  if (/歩行不可|歩行不能|自力歩行不可|動けない/.test(text)) return "車内で自力移動できない";
  if (/歩行可能|歩行可|自力歩行/.test(text)) return "車内から自力で移動可能";
  return "車内での移動可否は未確認";
}

function isVehicleBound(patient: Patient) {
  return patient.method === "car" && arrivalMobility(patient).includes("自力移動できない");
}

function isGoalZone(zone: ZoneId) {
  return zone === "icu" || zone === "eu" || zone === "general" || zone === "complete";
}

function goalTreatmentRequirements(patient: Patient) {
  const requirements = [...(treatmentPlanFor(patient.id)?.required ?? [])];
  for (const option of ["骨折部の固定", "創部処置"] as TreatmentOption[]) {
    if (isTreatmentAllowed(patient, option) && !requirements.includes(option)) requirements.push(option);
  }
  return requirements;
}

function App() {
  const [scenarioId, setScenarioId] = useState<ScenarioId>("standard");
  const [showOpening, setShowOpening] = useState(true);
  const [clockSeconds, setClockSeconds] = useState(START_MINUTE * 60);
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState<1 | 2>(1);
  const [runtime, setRuntime] = useState<Record<number, PatientRuntime>>(() => defaultRuntime("standard"));
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showScore, setShowScore] = useState(false);
  const [workflowNotice, setWorkflowNotice] = useState("");
  const [treatmentFeedback, setTreatmentFeedback] = useState("");
  const [postArrivalInfo, setPostArrivalInfo] = useState<"vitals" | "exam" | "event">("vitals");
  const [dragOverZone, setDragOverZone] = useState<ZoneId | null>(null);
  const [capacity, setCapacity] = useState<CapacitySettings>(defaultCapacity);
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [bgmEnabled, setBgmEnabled] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const bgmAudioRef = useRef<HTMLAudioElement | null>(null);
  const bgmModeRef = useRef<BgmMode | null>(null);
  const bgmSourceRef = useRef<BgmMode | null>(null);
  const audioUnlockedRef = useRef(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const scenario = useMemo(() => scenarioById(scenarioId), [scenarioId]);
  const elapsedSeconds = clockSeconds - START_MINUTE * 60;
  const scoreTotals = useMemo(() => {
    const totals: Record<ScoreAxis, number> = { triage: 0, clinical: 0, flow: 0, coordination: 0 };
    for (const entry of scores) {
      if (entry.points < 0 || entry.countsTowardTotal) totals[entry.axis] += entry.points;
    }
    return totals;
  }, [scores]);
  const totalScore = Math.max(0, Math.min(100, 100 + Object.values(scoreTotals).reduce((sum, value) => sum + value, 0)));
  const completedPatients = patients.filter((patient) => isGoalZone(runtime[patient.id]?.zone)).length;
  const activeDeteriorations = useMemo(() => scenario.patientIds.filter((id) => {
    const state = runtime[id];
    return state?.deteriorationLevel && !state.deteriorationAcknowledged;
  }).length, [runtime, scenario.patientIds]);

  const recordEvent = useCallback((type: string, label: string, patientId?: number) => {
    setEvents((current) => [...current, { id: createId("event"), type, label, patientId, atSeconds: clockSeconds }]);
  }, [clockSeconds]);

  const getAudioContext = useCallback(() => {
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!audioContextRef.current) audioContextRef.current = new AudioContextClass();
    return audioContextRef.current;
  }, []);

  const ensureAudioContext = useCallback(async () => {
    const context = getAudioContext();
    if (!context) return null;
    if (context.state !== "running") await context.resume();
    return context;
  }, [getAudioContext]);

  const ensureBgmAudio = useCallback((mode: BgmMode) => {
    if (!bgmAudioRef.current || bgmSourceRef.current !== mode) {
      bgmAudioRef.current?.pause();
      const audio = new Audio(BGM_SOURCES[mode]);
      audio.loop = true;
      audio.preload = "auto";
      audio.volume = 0.5;
      bgmAudioRef.current = audio;
      bgmSourceRef.current = mode;
    }
    return bgmAudioRef.current;
  }, []);

  const unlockAudio = useCallback(async () => {
    const context = await ensureAudioContext();
    if (context && !audioUnlockedRef.current) {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      gain.gain.setValueAtTime(0.0001, context.currentTime);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + 0.01);
    }

    const audio = ensureBgmAudio(showOpening ? "opening" : "training");
    const wasMuted = audio.muted;
    const originalTime = audio.currentTime;
    audio.muted = true;
    try {
      await audio.play();
      audio.pause();
      audio.currentTime = originalTime;
      audioUnlockedRef.current = true;
    } catch {
      audio.currentTime = originalTime;
    } finally {
      audio.muted = wasMuted;
    }
    return context;
  }, [ensureAudioContext, ensureBgmAudio, showOpening]);

  const stopBgm = useCallback(() => {
    const audio = bgmAudioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    bgmModeRef.current = null;
  }, []);

  const startBgm = useCallback(async (mode?: BgmMode, force = false) => {
    if (!bgmEnabled && !force) return;
    const requestedMode = mode ?? (showOpening ? "opening" : "training");
    const audio = ensureBgmAudio(requestedMode);
    bgmModeRef.current = requestedMode;
    audio.volume = requestedMode === "opening" ? 0.56 : 0.46;
    try {
      await audio.play();
      audioUnlockedRef.current = true;
    } catch {
      // Browser blocked playback until the user interacts.
    }
  }, [bgmEnabled, ensureBgmAudio, showOpening]);

  const playMoveSound = useCallback(async () => {
    const context = await ensureAudioContext();
    if (!context || context.state !== "running") return;
    const now = context.currentTime;
    [523.25, 659.25, 783.99].forEach((frequency, index) => {
      const start = now + index * 0.04;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "triangle";
      oscillator.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.028, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.18);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + 0.2);
    });
  }, [ensureAudioContext]);

  const playAlarmSound = useCallback(async () => {
    const context = await ensureAudioContext();
    if (!context || context.state !== "running") return;
    const now = context.currentTime;
    [880, 740, 880, 740].forEach((frequency, index) => {
      const start = now + index * 0.22;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sawtooth";
      oscillator.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.08, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.16);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + 0.18);
    });
  }, [ensureAudioContext]);

  const playAmbulanceSiren = useCallback(async () => {
    const context = await ensureAudioContext();
    if (!context || context.state !== "running") return;
    const now = context.currentTime;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const cycleSeconds = 0.32;
    const cycles = 5;

    oscillator.type = "square";
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.09, now + 0.025);
    for (let index = 0; index < cycles; index += 1) {
      const start = now + index * cycleSeconds;
      oscillator.frequency.setValueAtTime(660, start);
      oscillator.frequency.linearRampToValueAtTime(880, start + cycleSeconds / 2);
      oscillator.frequency.linearRampToValueAtTime(660, start + cycleSeconds);
    }
    const end = now + cycles * cycleSeconds;
    gain.gain.exponentialRampToValueAtTime(0.0001, end);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(end + 0.02);
  }, [ensureAudioContext]);

  const playCarHorn = useCallback(async () => {
    const context = await ensureAudioContext();
    if (!context || context.state !== "running") return;
    const now = context.currentTime;
    [0, 0.22].forEach((offset) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "square";
      oscillator.frequency.setValueAtTime(392, now + offset);
      oscillator.frequency.linearRampToValueAtTime(440, now + offset + 0.12);
      gain.gain.setValueAtTime(0.0001, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.075, now + offset + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.14);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(now + offset);
      oscillator.stop(now + offset + 0.16);
    });
  }, [ensureAudioContext]);

  const playBuzzerSound = useCallback(async () => {
    const context = await ensureAudioContext();
    if (!context || context.state !== "running") return;
    const now = context.currentTime;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(220, now);
    oscillator.frequency.linearRampToValueAtTime(180, now + 0.18);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.045, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.2);
  }, [ensureAudioContext]);

  const playFanfare = useCallback((acute = false) => {
    const context = audioContextRef.current;
    if (!context || context.state !== "running") return;
    const notes = acute ? [146.83, 110] : [392, 523.25, 659.25];
    const now = context.currentTime;
    notes.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = acute ? "sawtooth" : "triangle";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0, now + index * 0.12);
      gain.gain.linearRampToValueAtTime(acute ? 0.05 : 0.07, now + index * 0.12 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.12 + 0.45);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(now + index * 0.12);
      oscillator.stop(now + index * 0.12 + 0.5);
    });
  }, []);

  useEffect(() => {
    if (!bgmEnabled) {
      stopBgm();
      return;
    }
    if (showOpening) {
      void startBgm("opening");
      return;
    }
    void startBgm("training");
  }, [bgmEnabled, running, showOpening, startBgm, stopBgm]);

  useEffect(() => stopBgm, [stopBgm]);

  useEffect(() => {
    if (!workflowNotice) return;
    const timer = window.setTimeout(() => setWorkflowNotice(""), 4000);
    return () => window.clearTimeout(timer);
  }, [workflowNotice]);

  useEffect(() => {
    if (!treatmentFeedback) return;
    void playBuzzerSound();
    const timer = window.setTimeout(() => setTreatmentFeedback(""), 4000);
    return () => window.clearTimeout(timer);
  }, [playBuzzerSound, treatmentFeedback]);

  const applyScore = useCallback((entry: Omit<ScoreEntry, "id" | "atSeconds">, stableId?: string) => {
    const id = stableId ?? createId("score");
    setScores((current) => current.some((item) => item.id === id)
      ? current
      : [...current, { ...entry, id, atSeconds: clockSeconds }]);
  }, [clockSeconds]);

  const advanceTime = (seconds: number) => {
    setClockSeconds((value) => value + seconds);
    setRuntime((current) => {
      let changed = false;
      const next = { ...current };
      for (const patient of patients) {
        const state = current[patient.id];
        if (state.zone === "transit" && state.transitRemaining && state.transitTo) {
          const remaining = Math.max(0, state.transitRemaining - seconds);
          next[patient.id] = remaining === 0
            ? {
              ...state,
              zone: state.transitTo,
              transitTo: undefined,
              transitRemaining: undefined,
              zoneEnteredAt: clockSeconds,
              primaryTriageComplete: state.primaryTriageComplete,
              secondaryTriageComplete: state.secondaryTriageComplete || state.transitTo === "light-secondary",
              erAssessmentComplete: state.erAssessmentComplete || state.transitTo === "er-severe" || state.transitTo === "er-moderate",
              revealedVitals: state.revealedVitals || state.transitTo === "light-secondary",
            }
            : { ...state, transitRemaining: remaining };
          changed = true;
        }
        if ((state.zone === "er-imaging" || state.zone === "light-imaging") && state.imagingRemaining) {
          const remaining = Math.max(0, state.imagingRemaining - seconds);
          next[patient.id] = { ...state, imagingRemaining: remaining, imagingCompleted: remaining === 0 };
          changed = true;
        }
      }
      return changed ? next : current;
    });
  };

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      setHydrated(true);
      return;
    }
    try {
      const parsed = JSON.parse(saved) as {
        scenarioId?: ScenarioId;
        clockSeconds: number;
        runtime: Record<number, PatientRuntime>;
        capacity: CapacitySettings;
        events?: GameEvent[];
        scores?: ScoreEntry[];
        speed?: 1 | 2;
      };
      setScenarioId(parsed.scenarioId ?? "standard");
      setClockSeconds(parsed.clockSeconds);
      setRuntime(parsed.runtime);
      setCapacity({ ...defaultCapacity, ...parsed.capacity });
      setEvents(parsed.events ?? []);
      setScores(parsed.scores ?? []);
      setSpeed(parsed.speed ?? 1);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ scenarioId, clockSeconds, runtime, capacity, events, scores, speed }));
  }, [scenarioId, clockSeconds, runtime, capacity, events, scores, speed, hydrated]);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => advanceTime(speed), 1000);
    return () => window.clearInterval(timer);
  }, [running, speed]);

  useEffect(() => {
    const elapsedMinutes = elapsedSeconds / 60;
    const arrivedIds = scenario.patientIds.filter((id) => {
      const state = runtime[id];
      return state?.zone === "scheduled" && scenario.arrivalOffsets[id] <= elapsedMinutes;
    });
    if (arrivedIds.length === 0) return;
    setRuntime((current) => {
      const next = { ...current };
      for (const id of arrivedIds) {
        const patient = patients.find((item) => item.id === id)!;
        const initialZone: ZoneId = patient.method === "ambulance"
          ? "ambulance"
          : patient.method === "walk" || !isVehicleBound(patient) ? "triage" : "walkin";
        next[id] = {
          ...current[id],
          zone: initialZone,
          zoneEnteredAt: clockSeconds,
        };
      }
      return next;
    });
    setEvents((current) => [...current, ...arrivedIds.map((id) => ({
      id: createId("arrival"), type: "patient_arrived", patientId: id,
      label: `症例${id}が来院`, atSeconds: clockSeconds,
    }))]);
    const ambulanceArrived = arrivedIds.some((id) => patients.find((patient) => patient.id === id)?.method === "ambulance");
    const carArrived = arrivedIds.some((id) => patients.find((patient) => patient.id === id)?.method === "car");
    if (ambulanceArrived) {
      void playAmbulanceSiren();
    }
    if (carArrived) {
      void playCarHorn();
    }
    const arrivalMessages = [
      ambulanceArrived ? "救急車が来ました" : "",
      carArrived ? "車の中で動けない人がいるようです" : "",
    ].filter(Boolean);
    if (arrivalMessages.length > 0) setTreatmentFeedback(`看護師: ${arrivalMessages.join("　")}`);
  }, [clockSeconds, elapsedSeconds, playAmbulanceSiren, playCarHorn, runtime, scenario]);

  useEffect(() => {
    if (!running || completedPatients < scenario.patientIds.length) return;
    setRunning(false);
    recordEvent("session_ended", "全症例がゴールに到達し、シミュレーションを完了");
    setWorkflowNotice("全症例ゴール到達！ 最終スコアを確認してください");
    playFanfare(false);
  }, [completedPatients, playFanfare, recordEvent, running, scenario.patientIds.length]);

  useEffect(() => {
    const elapsedMinutes = elapsedSeconds / 60;
    for (const id of scenario.patientIds) {
      const state = runtime[id];
      if (!state || state.zone === "scheduled" || state.zone === "complete" || state.assignedTriage) continue;
      if (elapsedMinutes - scenario.arrivalOffsets[id] < scoreRules.delayedPrimaryTriageMinutes) continue;
      applyScore({ axis: "triage", points: scoreRules.delayedPrimaryTriage, reason: `来院後${scoreRules.delayedPrimaryTriageMinutes}分以上、一次トリアージ未完了`, patientId: id }, `untriaged-${id}`);
    }
  }, [applyScore, elapsedSeconds, runtime, scenario]);

  useEffect(() => {
    const elapsedMinutes = elapsedSeconds / 60;
    const dueRules = deteriorationRules.filter((rule) => {
      const state = runtime[rule.patientId];
      return state && state.zone !== "scheduled" && state.zone !== "complete" && !state.deteriorationLevel
        && (!rule.triggerZone || state.zone === rule.triggerZone)
        && (rule.regardlessOfTreatment || !treatmentPlanFor(rule.patientId) || !state.treatmentComplete)
        && elapsedMinutes >= deteriorationOffset(rule, scenario);
    });
    if (dueRules.length === 0) return;
    setRuntime((current) => {
      const next = { ...current };
      for (const rule of dueRules) {
        next[rule.patientId] = {
          ...current[rule.patientId],
          deteriorationLevel: rule.level,
          deteriorationMessage: rule.message,
          deteriorationAt: clockSeconds,
          deteriorationAcknowledged: false,
        };
      }
      return next;
    });
    setEvents((current) => [...current, ...dueRules.map((rule) => ({
      id: createId("deterioration"), type: "patient_deteriorated", patientId: rule.patientId,
      label: `症例${rule.patientId}が急変: ${rule.message}`, atSeconds: clockSeconds,
    }))]);
    setWorkflowNotice(`症例${dueRules[0].patientId}　急変です！`);
    void playAlarmSound();
  }, [clockSeconds, elapsedSeconds, playAlarmSound, runtime, scenario]);

  useEffect(() => {
    for (const id of scenario.patientIds) {
      const state = runtime[id];
      if (!state?.deteriorationAt || state.deteriorationAcknowledged) continue;
      if (clockSeconds - state.deteriorationAt < 3 * 60) continue;
      applyScore({ axis: "clinical", points: scoreRules.delayedDeteriorationReassessment, reason: "急変後3分以上、再評価未実施", patientId: id }, `deterioration-delay-${id}`);
    }
  }, [applyScore, clockSeconds, runtime, scenario.patientIds]);

  useEffect(() => {
    const overdue = scenario.patientIds.filter((id) => {
      const state = runtime[id];
      const plan = treatmentPlanFor(id);
      const clinicalPhase = state?.erAssessmentComplete || state?.secondaryTriageComplete || state?.zone === "light-room";
      return state && plan && clinicalPhase && !state.treatmentComplete && !state.treatmentDeteriorationTriggered
        && !state.deteriorationLevel && state.zoneEnteredAt !== undefined
        && clockSeconds - state.zoneEnteredAt >= plan.deadlineSeconds;
    });
    if (overdue.length === 0) return;
    setRuntime((current) => {
      const next = { ...current };
      for (const id of overdue) {
        const plan = treatmentPlanFor(id)!;
        next[id] = {
          ...current[id],
          treatmentDeteriorationTriggered: true,
          deteriorationLevel: "critical",
          deteriorationMessage: plan.deteriorationMessage,
          deteriorationAt: clockSeconds,
          deteriorationAcknowledged: false,
        };
      }
      return next;
    });
    setEvents((current) => [...current, ...overdue.map((id) => ({
      id: createId("treatment-deterioration"), type: "treatment_deteriorated", patientId: id,
      label: `症例${id}: 必須初期治療が期限内に完了せず状態悪化`, atSeconds: clockSeconds,
    }))]);
    setWorkflowNotice(`症例${overdue[0]}　急変です！`);
    void playAlarmSound();
  }, [clockSeconds, playAlarmSound, runtime, scenario.patientIds]);

  const selectedPatient = patients.find((patient) => patient.id === selectedId) ?? null;
  const selectedState = selectedPatient ? runtime[selectedPatient.id] : null;
  const imagingAvailable = Boolean(selectedState?.imagingCompleted);
  const hasPrimaryTriage = Boolean(selectedState?.assignedTriage);
  const hasSecondaryTriage = Boolean(selectedState?.secondaryTriageComplete);
  const hasErAssessment = Boolean(selectedState?.erAssessmentComplete);
  const canClinicalAssess = hasErAssessment || hasSecondaryTriage || selectedState?.zone === "light-room";
  const awaitingPrimaryTriageTransfer = Boolean(
    selectedPatient && selectedState && selectedPatient.method !== "ambulance" &&
    selectedState.zone === "walkin" && !selectedState.assignedTriage,
  );
  const showStartResult = Boolean(
    selectedPatient && selectedState && selectedPatient.method !== "ambulance" &&
    selectedState.zone === "triage" && !selectedState.assignedTriage,
  );
  const canSubmitPrimaryTriage = Boolean(
    selectedPatient && selectedState && !selectedState.assignedTriage &&
    selectedState.zone !== "scheduled" && selectedState.zone !== "complete" &&
    (selectedPatient.method === "ambulance" || selectedState.zone === "triage"),
  );
  const selectedTreatmentPlan = selectedPatient ? treatmentPlanFor(selectedPatient.id) : undefined;

  const zonePatients = (zone: ZoneId) => patients.filter((patient) => runtime[patient.id]?.zone === zone);
  const disasterCount = (zone: ZoneId) => zonePatients(zone).length;

  const movePatientTo = (patientId: number, target: ZoneId) => {
    const state = runtime[patientId];
    const patient = patients.find((item) => item.id === patientId);
    if (!state || !patient || target === "transit" || target === "scheduled") return;
    if (isGoalZone(target) && !isGoalZone(state.zone)) {
      const missingTreatments = goalTreatmentRequirements(patient)
        .filter((option) => !state.appliedTreatments?.includes(option));
      if (missingTreatments.length > 0) {
        setWorkflowNotice(`症例${patientId}: ゴール前に${missingTreatments.join("・")}を実施してください`);
        return;
      }
    }
    if (patient.method !== "ambulance" && state.zone === "walkin" && target !== "triage") {
      setWorkflowNotice(`症例${patientId}は一次トリアージへ移動してください`);
      return;
    }
    if (patient.method !== "ambulance" && state.zone === "triage" && !state.assignedTriage && target !== "triage") {
      setWorkflowNotice(`症例${patientId}はSTART評価とトリアージ判定が未完了です`);
      return;
    }
    if (patient.method === "ambulance" && state.zone === "ambulance" && !state.assignedTriage && target !== "triage") {
      setWorkflowNotice(`症例${patientId}は救急隊情報からトリアージ判定を確定してください`);
      return;
    }
    if ((state.zone === "er-imaging" || state.zone === "light-imaging") && !state.imagingCompleted) return;
    const leavingErCare = (state.zone === "er-severe" || state.zone === "er-moderate")
      && target !== "er-severe" && target !== "er-moderate" && !target.startsWith("light-");
    if (leavingErCare) {
      const applied = state.appliedTreatments ?? [];
      const missing = ["モニター装着", "末梢ルート確保"].filter((option) => !applied.includes(option as TreatmentOption));
      if (missing.length > 0) {
        setWorkflowNotice(`症例${patientId}: 救外から進む前に${missing.join("・")}を実施してください`);
        return;
      }
    }
    const destinationCall = target === "or" ? "手術室/麻酔科コール" : target === "icu" ? "ICUコール" : null;
    if (destinationCall) {
      const calledAt = state.treatmentAppliedAt?.[destinationCall];
      if (calledAt === undefined) {
        setWorkflowNotice(`症例${patientId}: ${destinationCall}が必要です`);
        return;
      }
      const waitRemaining = 5 * 60 - (clockSeconds - calledAt);
      if (waitRemaining > 0) {
        setWorkflowNotice(`症例${patientId}: ${destinationCall.replace("コール", "")}受入準備中です。あと${Math.ceil(waitRemaining / 60)}分で入室できます`);
        return;
      }
    }
    const enteringErImaging = target === "er-imaging";
    const enteringLightImaging = target === "light-imaging";
    if (enteringErImaging && !state.zone.startsWith("er-")) return;
    if (enteringLightImaging && !state.zone.startsWith("light-")) return;
    const fromLight = state.zone.startsWith("light-");
    const toLight = target.startsWith("light-");
    const fromEr = state.zone.startsWith("er-");
    const toEr = target.startsWith("er-");
    const needsTransit = (fromLight && toEr) || (fromEr && toLight);

    setRuntime((current) => {
      if (enteringErImaging && Object.entries(current).some(([id, item]) => Number(id) !== patientId && item.zone === "er-imaging")) return current;
      const stageUpdates = needsTransit ? {} : {
        primaryTriageComplete: current[patientId].primaryTriageComplete,
        secondaryTriageComplete: current[patientId].secondaryTriageComplete || target === "light-secondary",
        erAssessmentComplete: current[patientId].erAssessmentComplete || target === "er-severe" || target === "er-moderate",
        revealedVitals: current[patientId].revealedVitals || target === "light-secondary",
      };
      const nextState = needsTransit
        ? { ...current[patientId], ...stageUpdates, zone: "transit" as ZoneId, transitTo: target, transitRemaining: 240, zoneEnteredAt: clockSeconds }
        : enteringErImaging || enteringLightImaging
          ? { ...current[patientId], ...stageUpdates, zone: target, transitTo: undefined, transitRemaining: undefined, imagingRemaining: 240, imagingCompleted: false, zoneEnteredAt: clockSeconds }
          : { ...current[patientId], ...stageUpdates, zone: target, transitTo: undefined, transitRemaining: undefined, imagingRemaining: undefined, zoneEnteredAt: clockSeconds };
      return { ...current, [patientId]: nextState };
    });
    recordEvent("patient_moved", `症例${patientId}: ${zoneLabels[state.zone]} → ${zoneLabels[target]}`, patientId);
    if (running) void playMoveSound();
    const movedToEr = target === "er-severe" || target === "er-moderate";
    const movedToLight = target.startsWith("light-");
    if (patient && (movedToEr || movedToLight)) {
      const correct = (patient.expectedZone === "er" && movedToEr) || (patient.expectedZone === "light" && movedToLight);
      applyScore({ axis: "flow", points: correct ? 5 : scoreRules.incorrectInitialZone, reason: correct ? "想定診療ゾーンへ移動" : "想定と異なる初期診療ゾーン", patientId }, `initial-zone-${patientId}`);
    }
    setSelectedId(patientId);
    if (isGoalZone(target) && !isGoalZone(state.zone)) {
      const goalLabel = target === "complete" ? "帰宅" : "入院";
      applyScore({ axis: "flow", points: 20, reason: `${goalLabel}まで搬送完了`, patientId }, `goal-${patientId}`);
      const isSeverePatient = patient.triage === "red";
      const severeCareComplete = !treatmentPlanFor(patientId) || state.treatmentComplete;
      if (isSeverePatient && severeCareComplete) {
        applyScore({
          axis: "clinical",
          points: scoreRules.severePatientGoalBonus,
          reason: "重症症例を適切な治療後にゴールへ搬送",
          patientId,
          countsTowardTotal: true,
        }, `severe-goal-bonus-${patientId}`);
      }
      recordEvent("goal_reached", `症例${patientId}: ${goalLabel}ゴール到達`, patientId);
      setWorkflowNotice(isSeverePatient && severeCareComplete
        ? `症例${patientId}　重症対応ゴール！ ボーナス +${scoreRules.severePatientGoalBonus}点`
        : `症例${patientId}　ゴール到達！`);
      playFanfare(false);
    }
  };

  const submitTriage = (patientId: number, assigned: Triage) => {
    const patient = patients.find((item) => item.id === patientId);
    if (!patient || runtime[patientId]?.assignedTriage) return;
    const result = scoreTriage(patient.triage, assigned);
    setRuntime((current) => ({
      ...current,
      [patientId]: { ...current[patientId], assignedTriage: assigned, primaryTriageComplete: true },
    }));
    recordEvent("triage_submitted", `症例${patientId}: 一次トリアージを${assigned === "red" ? "赤" : assigned === "yellow" ? "黄" : "緑"}で確定`, patientId);
    applyScore({ axis: "triage", points: result.points, reason: result.reason, patientId }, `triage-${patientId}`);
  };

  const revealInformation = (patientId: number, kind: "vitals" | "exam") => {
    const state = runtime[patientId];
    if (!state || (kind === "vitals" ? state.revealedVitals : state.revealedExam)) return;
    setRuntime((current) => ({
      ...current,
      [patientId]: {
        ...current[patientId],
        revealedVitals: current[patientId].revealedVitals || kind === "vitals",
        revealedExam: current[patientId].revealedExam || kind === "exam",
      },
    }));
    recordEvent("information_revealed", `症例${patientId}: ${kind === "vitals" ? "モニター装着・バイタル確認" : "診察"}`, patientId);
    applyScore({ axis: "clinical", points: 2, reason: kind === "vitals" ? "モニターを装着してバイタルを評価" : "診察所見を評価", patientId }, `${kind}-${patientId}`);
  };

  const selectTreatment = (patientId: number, option: TreatmentOption) => {
    const patient = patients.find((item) => item.id === patientId);
    const state = runtime[patientId];
    const plan = treatmentPlanFor(patientId);
    if (!patient || !state || state.appliedTreatments?.includes(option)) return;
    if (!isTreatmentAllowed(patient, option)) {
      setTreatmentFeedback("看護師: それ今必要ですか？");
      return;
    }
    const applied = [...(state.appliedTreatments ?? []), option];
    const complete = Boolean(plan?.required.every((required) => applied.includes(required)));
    setRuntime((current) => ({
      ...current,
      [patientId]: {
        ...current[patientId],
        appliedTreatments: applied,
        treatmentAppliedAt: { ...(current[patientId].treatmentAppliedAt ?? {}), [option]: clockSeconds },
        treatmentComplete: complete || current[patientId].treatmentComplete,
        deteriorationResolved: complete && current[patientId].deteriorationLevel
          ? true
          : current[patientId].deteriorationResolved,
        deteriorationAcknowledged: complete && current[patientId].deteriorationLevel ? true : current[patientId].deteriorationAcknowledged,
      },
    }));
    setTreatmentFeedback("");
    recordEvent("treatment_selected", `症例${patientId}: ${option}を実施`, patientId);
    if (complete && plan) {
      applyScore({ axis: "clinical", points: 15, reason: "必須初期治療を期限内に完了", patientId }, `treatment-complete-${patientId}`);
      recordEvent("treatment_complete", `症例${patientId}: 必須初期治療を完了`, patientId);
    }
  };

  const acknowledgeDeterioration = (patientId: number) => {
    const state = runtime[patientId];
    if (!state?.deteriorationLevel || state.deteriorationAcknowledged) return;
    setRuntime((current) => ({
      ...current,
      [patientId]: { ...current[patientId], deteriorationAcknowledged: true, revealedVitals: true },
    }));
    recordEvent("deterioration_acknowledged", `症例${patientId}: 急変を再評価し対応開始`, patientId);
    applyScore({ axis: "clinical", points: 5, reason: "急変を認識して再評価を開始", patientId }, `deterioration-ack-${patientId}`);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const patientId = event.active.data.current?.patientId;
    if (typeof patientId === "number") setSelectedId(patientId);
  };

  const handleDragOver = (event: DragOverEvent) => {
    setDragOverZone((event.over?.data.current?.zoneId as ZoneId | undefined) ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const patientId = event.active.data.current?.patientId;
    const target = event.over?.data.current?.zoneId as ZoneId | undefined;
    setDragOverZone(null);
    if (typeof patientId === "number" && target) movePatientTo(patientId, target);
  };

  const resetSession = (nextScenarioId: ScenarioId = scenarioId, confirmReset = true) => {
    if (confirmReset && !window.confirm("現在の進行状況を消去してシナリオを最初から開始しますか？")) return;
    setRunning(false);
    setClockSeconds(START_MINUTE * 60);
    setScenarioId(nextScenarioId);
    setRuntime(defaultRuntime(nextScenarioId));
    setSelectedId(null);
    setEvents([]);
    setScores([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const changeScenario = (nextScenarioId: ScenarioId) => {
    if (nextScenarioId === scenarioId) return;
    if ((events.length > 0 || elapsedSeconds > 0) && !window.confirm("進行状況を消去してシナリオ時間を変更しますか？")) return;
    resetSession(nextScenarioId, false);
  };

  const addMinutes = (minutes: number) => advanceTime(minutes * 60);

  const beginTraining = async () => {
    await unlockAudio();
    await startBgm("training", true);
    setShowOpening(false);
    setRunning(true);
    recordEvent("training_started", "訓練を開始");
  };

  const activateAudio = useCallback(async () => {
    await unlockAudio();
    if (!bgmEnabled) return;
    await startBgm(showOpening ? "opening" : "training", true);
  }, [bgmEnabled, running, showOpening, startBgm, unlockAudio]);

  const zonesInMap: Array<{ id: ZoneId; title: string; icon: typeof Hospital; className: string; capacity?: number }> = [
    { id: "ambulance", title: "救急車搬入口", icon: Ambulance, className: "arrival-zone" },
    { id: "walkin", title: "乗用車", icon: Car, className: "arrival-zone" },
    { id: "triage", title: "一次トリアージ", icon: Stethoscope, className: "triage-zone" },
    { id: "er-severe", title: "ER 重症", icon: BedDouble, className: "er-zone", capacity: 4 },
    { id: "er-moderate", title: "ER 中等症", icon: BedDouble, className: "er-zone", capacity: 7 },
    { id: "er-imaging", title: "救外用画像検査室", icon: ScanLine, className: "imaging-zone", capacity: 1 },
    { id: "light-secondary", title: "二次トリアージ", icon: Stethoscope, className: "light-zone" },
    { id: "light-wait", title: "軽症 診察待合", icon: UsersRound, className: "light-zone" },
    { id: "light-imaging", title: "軽症用画像検査室", icon: ScanLine, className: "imaging-zone" },
    { id: "transit", title: "外来間移動", icon: Clock3, className: "transit-zone" },
  ];

  if (showOpening) {
    return <OpeningScreen
      scenarioId={scenarioId}
      capacity={capacity}
      bgmEnabled={bgmEnabled}
      onScenarioChange={changeScenario}
      onCapacityChange={setCapacity}
      onAudioActivate={activateAudio}
      onBgmPlay={async () => {
        await unlockAudio();
        setBgmEnabled(true);
        await startBgm("opening", true);
      }}
      onStart={beginTraining}
    />;
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd} onDragCancel={() => setDragOverZone(null)}>
    <div className="app projection" onPointerDownCapture={activateAudio}>
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark"><Hospital size={22} /></div>
          <div>
            <h1>災害机上訓練</h1>
            <p>2026 多数傷病者受入シミュレーション</p>
          </div>
        </div>
        <div className="clock-panel" aria-label="訓練時計">
          <button className="icon-button" onClick={() => {
            const nextRunning = !running;
            setRunning(nextRunning);
            recordEvent(running ? "clock_paused" : "clock_started", running ? "時計を一時停止" : "訓練を開始");
          }} title={running ? "一時停止" : "開始"}>
            {running ? <CirclePause /> : <CirclePlay />}
          </button>
          <strong>{formatClock(clockSeconds)}</strong>
          <span className="scenario-badge">{scenario.name} 到着目安 {scenario.durationMinutes}分</span>
          <span className="remaining-time">経過 {Math.floor(elapsedSeconds / 60)}分</span>
          <span className="goal-pill">Goal {completedPatients}/{scenario.patientIds.length}</span>
          {activeDeteriorations > 0 && <span className="acute-counter">急変 {activeDeteriorations}</span>}
          <button className="speed-badge" onClick={() => setSpeed((value) => value === 1 ? 2 : 1)} title="進行速度を変更">{speed}x</button>
          <button className="small-button" onClick={() => addMinutes(1)}>+1分</button>
          <button className="small-button" onClick={() => addMinutes(5)}>+5分</button>
        </div>
        <div className="total-score" aria-label={`合計スコア ${totalScore}点 / 100点`}>
          <span>合計スコア</span>
          <strong>{totalScore}<small>/100</small></strong>
        </div>
        <div className="top-actions">
          <button className={`icon-button ${bgmEnabled ? "active" : ""}`} onClick={() => {
            const nextEnabled = !bgmEnabled;
            setBgmEnabled(nextEnabled);
            if (nextEnabled) void activateAudio();
            if (!nextEnabled) stopBgm();
          }} title={bgmEnabled ? "BGMを停止" : "BGMを再生"}>{bgmEnabled ? <Volume2 /> : <VolumeX />}</button>
          <button className={`icon-button ${showScore ? "active" : ""}`} onClick={() => setShowScore((value) => !value)} title="スコアと履歴"><Trophy /></button>
          <button className="icon-button" onClick={() => setShowSettings((value) => !value)} title="初期設定"><Settings2 /></button>
          <button className="icon-button" onClick={() => resetSession()} title="リセット"><RotateCcw /></button>
        </div>
      </header>

      <section className="capacity-strip" aria-label="収容状況">
        <Capacity label="ER重症" used={capacity.erSevereExisting + disasterCount("er-severe")} total={4} tone="red" />
        <Capacity label="ER中等症" used={capacity.erModerateExisting + disasterCount("er-moderate")} total={7} tone="yellow" />
        <Capacity label="ICU" used={capacity.icuExisting + disasterCount("icu")} total={16} tone="blue" />
        <Capacity label="EU" used={capacity.euExisting + disasterCount("eu")} total={30} tone="green" />
        <Capacity label="OPE室" used={capacity.orGeneralInUse + disasterCount("or")} total={14} tone="purple" />
        <Capacity label="AG室" used={capacity.agExisting + disasterCount("ag")} total={3} tone="blue" />
      </section>

      {showSettings && (
        <section className="settings-panel">
          <div className="scenario-settings">
            <strong>シナリオ時間</strong>
            <div>{scenarios.map((item) => <button key={item.id} className={item.id === scenarioId ? "active" : ""} onClick={() => changeScenario(item.id)}>{item.durationMinutes}分</button>)}</div>
            <span>全50症例・投入順を比例圧縮</span>
          </div>
          <NumberSetting label="ER重症" value={capacity.erSevereExisting} max={4} onChange={(value) => setCapacity({ ...capacity, erSevereExisting: value })} />
          <NumberSetting label="ER中等症" value={capacity.erModerateExisting} max={7} onChange={(value) => setCapacity({ ...capacity, erModerateExisting: value })} />
          <NumberSetting label="ICU" value={capacity.icuExisting} max={16} onChange={(value) => setCapacity({ ...capacity, icuExisting: value })} />
          <NumberSetting label="EU" value={capacity.euExisting} max={30} onChange={(value) => setCapacity({ ...capacity, euExisting: value })} />
          <NumberSetting label="OPE室" value={capacity.orGeneralInUse} max={14} onChange={(value) => setCapacity({ ...capacity, orGeneralInUse: value })} />
          <NumberSetting label="AG室" value={capacity.agExisting} max={3} onChange={(value) => setCapacity({ ...capacity, agExisting: value })} />
        </section>
      )}

      {showScore && <ScorePanel totals={scoreTotals} entries={scores} events={events} totalScore={totalScore} completedPatients={completedPatients} goalCount={scenario.patientIds.length} />}
      {(workflowNotice || treatmentFeedback) && <div className="notice-stack" role="status">
        {workflowNotice && <div className="workflow-notice acute-notice">{workflowNotice}</div>}
        {treatmentFeedback && <div className="workflow-notice nurse-notice"><strong>看護師</strong><span>{treatmentFeedback.replace("看護師: ", "")}</span></div>}
      </div>}

      <main className="workspace">
        <section className="map-area">
          <div className="map-heading">
            <div><span className="eyebrow">HOSPITAL FLOW BOARD</span><h2>患者フロー</h2></div>
            <div className="legend">
              <span><i className="role-dot active-dot" />実動</span>
              <span><i className="role-dot virtual-dot" />想定のみ</span>
              <span><i className="triage-line red-line" />赤</span>
              <span><i className="triage-line yellow-line" />黄</span>
              <span><i className="triage-line green-line" />緑</span>
            </div>
          </div>

          <div className="hospital-map">
            <div className="flow-column arrivals">
              {zonesInMap.slice(0, 3).map((zone) => <Zone key={zone.id} {...zone} patients={zonePatients(zone.id)} runtime={runtime} onSelect={setSelectedId} dragOver={dragOverZone === zone.id} />)}
            </div>
            <div className="flow-arrow"><ChevronRight /></div>
            <div className="clinical-grid">
              <div className="er-section section-frame">
                <div className="section-title"><Hospital size={18} /><strong>救外ゾーン</strong><span>実ベッド 11床</span></div>
                {zonesInMap.slice(3, 6).map((zone) => <Zone key={zone.id} {...zone} patients={zonePatients(zone.id)} runtime={runtime} onSelect={setSelectedId} dragOver={dragOverZone === zone.id} disabled={zone.id === "er-imaging" && zonePatients("er-imaging").length > 0} />)}
              </div>
              <Zone {...zonesInMap[9]} patients={zonePatients("transit")} runtime={runtime} onSelect={setSelectedId} disabled />
              <div className="light-section section-frame">
                <div className="section-title"><DoorOpen size={18} /><strong>軽症ゾーン</strong><span>一般外来</span></div>
                {zonesInMap.slice(6, 8).map((zone) => <Zone key={zone.id} {...zone} patients={zonePatients(zone.id)} runtime={runtime} onSelect={setSelectedId} dragOver={dragOverZone === zone.id} />)}
                <div className="subsection-title"><Stethoscope size={15} /><strong>診察室</strong><span>稼働中</span></div>
                <div className="rooms-grid">
                  <Zone id="light-room" title="診察室" icon={Stethoscope} className="room-zone" capacity={4} patients={zonePatients("light-room")} runtime={runtime} onSelect={setSelectedId} dragOver={dragOverZone === "light-room"} />
                </div>
                <Zone {...zonesInMap[8]} patients={zonePatients("light-imaging")} runtime={runtime} onSelect={setSelectedId} dragOver={dragOverZone === "light-imaging"} />
              </div>
            </div>
            <div className="flow-arrow"><ChevronRight /></div>
            <div className="destination-column">
              <Destination id="ag" title="AG室" subtitle="3室" icon={ScanLine} patients={zonePatients("ag")} used={capacity.agExisting + disasterCount("ag")} total={3} runtime={runtime} onSelect={setSelectedId} dragOver={dragOverZone === "ag"} />
              <Destination id="or" title="OPE室" subtitle="14床" icon={DoorOpen} patients={zonePatients("or")} used={capacity.orGeneralInUse + disasterCount("or")} total={14} runtime={runtime} onSelect={setSelectedId} dragOver={dragOverZone === "or"} />
              <Destination id="icu" title="ICU" subtitle="集中治療室" icon={BedDouble} patients={zonePatients("icu")} used={capacity.icuExisting + disasterCount("icu")} total={16} runtime={runtime} onSelect={setSelectedId} dragOver={dragOverZone === "icu"} compact countOnly />
              <Destination id="eu" title="EU" subtitle="救急病棟" icon={BedDouble} patients={zonePatients("eu")} used={capacity.euExisting + disasterCount("eu")} total={30} runtime={runtime} onSelect={setSelectedId} dragOver={dragOverZone === "eu"} compact countOnly />
              <Destination id="general" title="一般床" subtitle="制限なし" icon={BedDouble} patients={zonePatients("general")} runtime={runtime} onSelect={setSelectedId} dragOver={dragOverZone === "general"} unlimited compact countOnly />
              <Destination id="complete" title="帰宅" subtitle="制限なし" icon={DoorOpen} patients={zonePatients("complete")} runtime={runtime} onSelect={setSelectedId} dragOver={dragOverZone === "complete"} unlimited compact countOnly />
            </div>
          </div>
        </section>

          <aside className="control-panel">
            {selectedPatient && selectedState ? (
              <>
                <div className="patient-detail-head">
                  <span className={`triage-badge ${selectedState.assignedTriage ?? "unknown"}`}>{selectedState.assignedTriage === "red" ? "赤" : selectedState.assignedTriage === "yellow" ? "黄" : selectedState.assignedTriage === "green" ? "緑" : "?"}</span>
                  <div><span>症例 {selectedPatient.id}</span><h3>{selectedPatient.patientName && selectedPatient.patientName !== "フリー" ? selectedPatient.patientName : `来院患者 ${selectedPatient.id}`}</h3></div>
                </div>
                <dl className="patient-facts">
                  <div><dt>来院</dt><dd>開始+{scenario.arrivalOffsets[selectedPatient.id]}分 / {selectedPatient.method === "ambulance" ? "救急車" : selectedPatient.method === "car" ? "乗用車" : "徒歩"}</dd></div>
                  <div><dt>現在</dt><dd>{zoneLabels[selectedState.zone]}</dd></div>
                  {hasPrimaryTriage && <div><dt>一次判定</dt><dd>{selectedState.assignedTriage === "red" ? "赤" : selectedState.assignedTriage === "yellow" ? "黄" : "緑"}</dd></div>}
                </dl>
                {selectedState.deteriorationLevel && <section className={`deterioration-alert ${selectedState.deteriorationLevel} ${selectedState.deteriorationResolved ? "resolved" : selectedState.deteriorationAcknowledged ? "acknowledged" : ""}`}><div><strong>{selectedState.deteriorationResolved ? "急変対応完了" : selectedState.deteriorationAcknowledged ? "急変対応中" : "患者が急変"}</strong><span>{selectedState.deteriorationMessage}</span></div>{!selectedState.deteriorationAcknowledged && <button onClick={() => acknowledgeDeterioration(selectedPatient.id)}>再評価して対応開始</button>}</section>}
                <div className="detail-sections">
                  {selectedPatient.method === "ambulance" ? (
                    <section className="information-stage prehospital-stage ambulance-information">
                      <span>救急隊情報</span>
                      <DetailBlock label="救急隊からの情報" value={selectedPatient.ambulanceInfo ?? selectedPatient.triageFindings} prominent />
                      <DetailBlock label="救急隊測定バイタル" value={selectedPatient.rescueVitals ?? selectedPatient.vitals} />
                      <DetailBlock label="年齢・性別" value={selectedPatient.ageSex} />
                    </section>
                  ) : (
                    <section className="information-stage prehospital-stage walkin-information">
                      <span>{selectedPatient.method === "car" ? "乗用車到着時情報" : "徒歩来院時情報"}</span>
                      <DetailBlock label="受傷機転" value={preHospitalHistory(selectedPatient.history)} prominent />
                      <DetailBlock label="受傷部位" value={injurySite(selectedPatient)} />
                      <DetailBlock label={selectedPatient.method === "car" ? "車内での移動可否" : "移動状況"} value={arrivalMobility(selectedPatient)} />
                      <DetailBlock label="年齢・性別" value={selectedPatient.ageSex} />
                    </section>
                  )}
                  {awaitingPrimaryTriageTransfer && <section className="information-stage route-stage"><span>次工程</span><strong>一次トリアージへ移動</strong></section>}
                  {showStartResult && <section className="information-stage start-stage"><span>START法評価</span><DetailBlock label="歩行・呼吸・循環・意識" value={withoutTriageHint(selectedPatient.triageFindings)} prominent /></section>}
                  {canSubmitPrimaryTriage && <section className="information-stage action-stage"><span>{selectedPatient.method === "ambulance" ? "救急隊情報による一次判定" : "START法による一次判定"}</span><p>{selectedPatient.method === "ambulance" ? "救急隊情報と搬入時バイタルから判定してください。" : "表示されたSTART所見から判定してください。"}</p><div className="triage-actions"><button className="red" onClick={() => submitTriage(selectedPatient.id, "red")}>赤</button><button className="yellow" onClick={() => submitTriage(selectedPatient.id, "yellow")}>黄</button><button className="green" onClick={() => submitTriage(selectedPatient.id, "green")}>緑</button></div></section>}
                  {hasPrimaryTriage && <section className="information-stage"><span>一次トリアージ</span><DetailBlock label="取得した所見" value={withoutTriageHint(selectedPatient.triageFindings)} /><DetailBlock label="プレイヤー判定" value={selectedState.assignedTriage === "red" ? "赤" : selectedState.assignedTriage === "yellow" ? "黄" : "緑"} prominent /></section>}
                  {hasSecondaryTriage && <section className="information-stage secondary-vitals-stage"><span>二次トリアージ</span><DetailBlock label="来院時バイタル" value={selectedPatient.vitals} prominent /></section>}
                  {canClinicalAssess && <section className="information-stage">
                    <span>診療ゾーン到着後の情報</span>
                    <section className="post-arrival-section">
                      <div className="post-arrival-buttons">
                        <button className={selectedState.revealedVitals ? "completed" : ""} onClick={() => { revealInformation(selectedPatient.id, "vitals"); selectTreatment(selectedPatient.id, "モニター装着"); setPostArrivalInfo("vitals"); }}>{selectedState.revealedVitals ? "モニター確認済み" : "モニター装着"}</button>
                        <button className={selectedState.revealedExam ? "completed" : ""} onClick={() => { revealInformation(selectedPatient.id, "exam"); setPostArrivalInfo("exam"); }}>{selectedState.revealedExam ? "診察済み" : "診察を実施"}</button>
                      </div>
                      {postArrivalInfo === "vitals" && selectedState.revealedVitals && <div className="post-arrival-content monitor-result"><div className="result-source"><strong>モニター画面</strong><span>QRコード提示相当</span></div><p>{selectedPatient.vitals}</p></div>}
                      {postArrivalInfo === "exam" && selectedState.revealedExam && <div className="post-arrival-content"><strong>診察所見</strong><p>{selectedPatient.exam}</p></div>}
                    </section>
                  </section>}
                  {canClinicalAssess && <section className="information-stage treatment-stage">
                    <span>救急治療</span>
                    <p>{selectedTreatmentPlan ? `初療開始から ${Math.ceil(selectedTreatmentPlan.deadlineSeconds / 60)}分以内に必要な対応を選択してください。` : "患者の状態に応じて必要な対応を選択してください。"}</p>
                    <div className="treatment-actions">
                      {treatmentOptions.map((option) => <button key={option} className={selectedState.appliedTreatments?.includes(option) ? "completed" : ""} disabled={selectedState.appliedTreatments?.includes(option)} onClick={() => selectTreatment(selectedPatient.id, option)}>{option}</button>)}
                    </div>
                    <div className="department-call-group">
                      <strong>各科・各部署コール</strong>
                      <div className="treatment-actions department-actions">
                        {departmentCallOptions.map((option) => {
                          const calledAt = selectedState.treatmentAppliedAt?.[option];
                          const ready = calledAt !== undefined && clockSeconds - calledAt >= 5 * 60;
                          const isTimedDestination = option === "手術室/麻酔科コール" || option === "ICUコール";
                          const label = calledAt === undefined
                            ? option.replace("コール", "")
                            : isTimedDestination && !ready
                              ? `${option.replace("コール", "")} 準備中（あと${Math.ceil((5 * 60 - (clockSeconds - calledAt)) / 60)}分）`
                              : `${option.replace("コール", "")} 連絡済み`;
                          return <button key={option} className={selectedState.appliedTreatments?.includes(option) ? `completed ${ready ? "ready" : ""}` : ""} disabled={selectedState.appliedTreatments?.includes(option)} onClick={() => selectTreatment(selectedPatient.id, option)}>{label}</button>;
                        })}
                      </div>
                    </div>
                    {selectedState.treatmentComplete && <div className="treatment-complete">必要な初期治療を完了しました</div>}
                  </section>}
                  {canClinicalAssess && !imagingAvailable && selectedPatient.tests && <section className="information-stage media-prompt-stage"><span>検査・画像</span><p>必要と判断した場合は、患者を画像検査室へ移動してください。検査完了後に結果を確認できます。</p></section>}
                  {imagingAvailable && <section className="information-stage imaging-result-stage"><span>検査・画像結果</span><div className="result-source"><strong>検査・画像</strong><span>QRコード提示相当</span></div><DetailBlock label="CT・XP・検査所見" value={selectedPatient.tests} prominent /></section>}
                </div>
                {selectedState.zone === "transit" && (
                  <div className="transit-status"><Clock3 /><div><span>外来間移動</span><strong>残り {Math.ceil((selectedState.transitRemaining ?? 0) / 60)}分</strong></div></div>
                )}
              </>
            ) : (
              <div className="empty-control"><UserRound /><strong>患者を選択</strong><span>マップ上の患者コマを選ぶと、症例の詳細が表示されます。</span></div>
            )}
          </aside>
      </main>
    </div>
    </DndContext>
  );
}

function ScorePanel({ totals, entries, events, totalScore, completedPatients, goalCount }: { totals: Record<ScoreAxis, number>; entries: ScoreEntry[]; events: GameEvent[]; totalScore: number; completedPatients: number; goalCount: number }) {
  return <section className="score-panel" aria-label="スコアと操作履歴">
    <div className="score-summary">
      <div className="score-total-cell"><span>総合スコア</span><strong>{totalScore}</strong><small>ゴール {completedPatients}/{goalCount}</small></div>
      {(Object.keys(scoreAxisLabels) as ScoreAxis[]).map((axis) => <div key={axis}><span>{scoreAxisLabels[axis]}</span><strong className={totals[axis] < 0 ? "negative" : ""}>{totals[axis]}</strong></div>)}
    </div>
    <div className="score-feed">
      <strong>直近の評価</strong>
      {entries.length === 0 ? <span>評価はまだありません</span> : entries.slice(-5).reverse().map((entry) => <span key={entry.id}><time>{formatClock(entry.atSeconds)}</time><b className={entry.points < 0 ? "negative" : ""}>{entry.points > 0 ? `+${entry.points}` : entry.points}</b>{entry.patientId ? `症例${entry.patientId} ` : ""}{entry.reason}</span>)}
    </div>
    <div className="event-feed">
      <strong>操作履歴</strong>
      {events.length === 0 ? <span>訓練開始後の操作が記録されます</span> : events.slice(-5).reverse().map((event) => <span key={event.id}><time>{formatClock(event.atSeconds)}</time>{event.label}</span>)}
    </div>
  </section>;
}

function OpeningScreen({
  scenarioId,
  capacity,
  bgmEnabled,
  onScenarioChange,
  onCapacityChange,
  onAudioActivate,
  onBgmPlay,
  onStart,
}: {
  scenarioId: ScenarioId;
  capacity: CapacitySettings;
  bgmEnabled: boolean;
  onScenarioChange: (id: ScenarioId) => void;
  onCapacityChange: (capacity: CapacitySettings) => void;
  onAudioActivate: () => void;
  onBgmPlay: () => void;
  onStart: () => void;
}) {
  const selectedScenario = scenarioById(scenarioId);
  return <main className="opening-screen" onPointerDownCapture={onAudioActivate}>
    <div className="opening-visual" aria-hidden="true"><img src={`${import.meta.env.BASE_URL}opening-hospital.png`} alt="" /></div>
    <div className="opening-shade" />
    <section className="opening-hero">
      <div className="opening-total-score" aria-label="合計スコア 100点 / 100点"><span>合計スコア</span><strong>100<small>/100</small></strong></div>
      <div className="opening-brand"><span><Hospital size={21} /></span><strong>災害机上訓練</strong></div>
      <p className="opening-kicker">HOSPITAL DISASTER TABLETOP SIMULATOR</p>
      <h1>多数傷病者受入<br />シミュレーション</h1>
      <p className="opening-lead">状況を見極め、受入れの流れをつくる。</p>
      <button className="opening-start" onClick={onStart}><CirclePlay size={20} />訓練を開始</button>
      <button className="opening-audio" onClick={onBgmPlay}>{bgmEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}{bgmEnabled ? "オープニングBGM: オン" : "オープニングBGM: オフ"}</button>
    </section>

    <section className="opening-options" aria-label="訓練開始前の設定">
      <div className="opening-option-head"><div><span>TRAINING SETUP</span><h2>開始前設定</h2></div><small>{selectedScenario.name} / {selectedScenario.durationMinutes}分</small></div>
      <div className="opening-option-grid">
        <section className="opening-section">
          <div className="opening-section-title"><ClipboardList size={18} /><div><strong>操作方法</strong><span>患者コマをドラッグして移動</span></div></div>
          <ol className="opening-steps">
            <li>時計を開始すると、患者が時刻に応じて来院します。</li>
            <li>患者コマを次の場所へドラッグします。</li>
            <li>患者が評価場所へ到達すると、右側に情報が順次表示されます。</li>
            <li>画像検査室では4分後に検査所見が解放されます。</li>
          </ol>
        </section>
        <section className="opening-section">
          <div className="opening-section-title"><Trophy size={18} /><div><strong>スコア</strong><span>開始時は100点</span></div></div>
          <p className="opening-score">到着目安を過ぎても訓練は継続し、全症例のゴール到達時に評価します。未トリアージ、過小トリアージ、急変時の対応遅れは減点。重症症例を必要な治療後にゴールさせるとボーナスで回復します。</p>
          <div className="opening-score-scale"><span>100</span><i /><span>0</span></div>
        </section>
        <section className="opening-section opening-setup-section">
          <div className="opening-section-title"><SlidersHorizontal size={18} /><div><strong>病床・手術室の初期占有</strong><span>災害発生前の使用数を設定</span></div></div>
          <div className="opening-scenario-row"><span>訓練時間</span><div>{scenarios.map((item) => <button key={item.id} className={item.id === scenarioId ? "active" : ""} onClick={() => onScenarioChange(item.id)}>{item.durationMinutes}分</button>)}</div></div>
          <div className="opening-capacity-grid">
            <NumberSetting label="ER重症" value={capacity.erSevereExisting} max={4} onChange={(value) => onCapacityChange({ ...capacity, erSevereExisting: value })} />
            <NumberSetting label="ER中等症" value={capacity.erModerateExisting} max={7} onChange={(value) => onCapacityChange({ ...capacity, erModerateExisting: value })} />
            <NumberSetting label="ICU" value={capacity.icuExisting} max={16} onChange={(value) => onCapacityChange({ ...capacity, icuExisting: value })} />
            <NumberSetting label="EU" value={capacity.euExisting} max={30} onChange={(value) => onCapacityChange({ ...capacity, euExisting: value })} />
            <NumberSetting label="OPE室" value={capacity.orGeneralInUse} max={14} onChange={(value) => onCapacityChange({ ...capacity, orGeneralInUse: value })} />
            <NumberSetting label="AG室" value={capacity.agExisting} max={3} onChange={(value) => onCapacityChange({ ...capacity, agExisting: value })} />
          </div>
        </section>
      </div>
    </section>
  </main>;
}

function Capacity({ label, used, total, tone }: { label: string; used: number; total: number; tone: string }) {
  const safeUsed = Math.min(used, total);
  return <div className="capacity-item"><div><span>{label}</span><strong>{Math.max(0, total - used)} 空き</strong></div><div className="capacity-bar"><i className={tone} style={{ width: `${(safeUsed / total) * 100}%` }} /></div><small>{used} / {total} 使用</small></div>;
}

function NumberSetting({ label, value, max, onChange }: { label: string; value: number; max: number; onChange: (value: number) => void }) {
  return <label className="number-setting"><span>{label}</span><input type="number" min={0} max={max} value={value} onChange={(event) => onChange(Math.min(max, Math.max(0, Number(event.target.value))))} /><small>/ {max}</small></label>;
}

function DetailBlock({ label, value, prominent = false }: { label: string; value: string; prominent?: boolean }) {
  return <section className={`detail-block ${prominent ? "prominent" : ""}`}><span>{label}</span><p>{value || "記載なし"}</p></section>;
}

function PatientRow({ patient, state, selected, onClick }: { patient: Patient; state: PatientRuntime; selected: boolean; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: `list-${patient.id}`, data: { patientId: patient.id } });
  return <button ref={setNodeRef} {...attributes} {...listeners} style={{ transform: CSS.Translate.toString(transform), zIndex: isDragging ? 20 : undefined }} className={`patient-row ${selected ? "selected" : ""} ${state.zone === "scheduled" ? "scheduled" : ""} ${isDragging ? "dragging" : ""} ${state.deteriorationLevel ? `deteriorating ${state.deteriorationLevel}` : ""} ${state.deteriorationResolved ? "acute-resolved" : state.deteriorationAcknowledged ? "acute-acknowledged" : ""}`} onClick={onClick}>
    <i className={`triage-stripe ${state.deteriorationResolved ? "acute-orange" : state.assignedTriage ?? "unknown"}`} />
    <span className="patient-id">{String(patient.id).padStart(2, "0")}</span>
    <span className="patient-copy"><strong>{patient.patientName && patient.patientName !== "フリー" ? patient.patientName : `来院患者 ${patient.id}`}</strong><small>{zoneLabels[state.zone]}</small></span>
    <span className={`role-icon ${state.role}`}>{state.role === "active" ? <UserRound size={15} /> : <Phone size={14} />}</span>
  </button>;
}

function PatientToken({ patient, state, onClick }: { patient: Patient; state: PatientRuntime; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: `token-${patient.id}`, data: { patientId: patient.id } });
  return <button ref={setNodeRef} {...attributes} {...listeners} style={{ transform: CSS.Translate.toString(transform), zIndex: isDragging ? 20 : undefined }} className={`patient-token ${state.role} ${isDragging ? "dragging" : ""} ${state.deteriorationLevel ? `deteriorating ${state.deteriorationLevel}` : ""} ${state.deteriorationResolved ? "acute-resolved" : state.deteriorationAcknowledged ? "acute-acknowledged" : ""}`} onClick={onClick} title={`症例${patient.id}${state.deteriorationResolved ? " 急変対応完了" : state.deteriorationAcknowledged ? " 急変対応中" : state.deteriorationLevel ? " 急変" : ""}`}>
    <i className={state.deteriorationResolved ? "acute-orange" : state.assignedTriage ?? "unknown"} />
    <span>{patient.id}</span>
    {state.role === "active" ? <UserRound size={13} /> : <Phone size={12} />}
    {state.deteriorationLevel && <em className="acute-label">{state.deteriorationResolved ? "対応完了" : state.deteriorationAcknowledged ? "対応中" : "急変"}</em>}
    {state.zone === "transit" && <small>{Math.ceil((state.transitRemaining ?? 0) / 60)}分</small>}
    {(state.zone === "er-imaging" || state.zone === "light-imaging") && <small>{state.imagingCompleted ? "完了" : `${Math.ceil((state.imagingRemaining ?? 0) / 60)}分`}</small>}
  </button>;
}

function Zone({ id, title, icon: Icon, className, capacity, patients: items, runtime, onSelect, dragOver, disabled = false }: { id: ZoneId; title: string; icon: typeof Hospital; className: string; capacity?: number; patients: Patient[]; runtime: Record<number, PatientRuntime>; onSelect: (id: number) => void; dragOver?: boolean; disabled?: boolean }) {
  const { setNodeRef, isOver } = useDroppable({ id: `zone-${id}`, data: { zoneId: id }, disabled });
  return <div ref={setNodeRef} className={`zone ${className} ${dragOver || isOver ? "drag-over" : ""}`} data-zone={id}>
    <div className="zone-head"><Icon size={16} /><strong>{title}</strong><span>{capacity === undefined ? items.length : `${items.length}/${capacity}`}</span></div>
    <div className="token-bed">{items.length === 0 ? <span className="empty-label">待機なし</span> : items.map((patient) => <PatientToken key={patient.id} patient={patient} state={runtime[patient.id]} onClick={() => onSelect(patient.id)} />)}</div>
  </div>;
}

function Destination({ id, title, subtitle, icon: Icon, patients: items, used = 0, total = 0, runtime, onSelect, dragOver, unlimited = false, compact = false, countOnly = false }: { id: ZoneId; title: string; subtitle: string; icon: typeof Hospital; patients: Patient[]; used?: number; total?: number; runtime: Record<number, PatientRuntime>; onSelect: (id: number) => void; dragOver: boolean; unlimited?: boolean; compact?: boolean; countOnly?: boolean }) {
  const { setNodeRef, isOver } = useDroppable({ id: `zone-${id}`, data: { zoneId: id } });
  return <div ref={setNodeRef} className={`destination ${compact ? "compact" : ""} ${dragOver || isOver ? "drag-over" : ""}`} data-zone={id}>
    <div className="destination-head"><div className="destination-icon"><Icon size={18} /></div><div><strong>{title}</strong><span>{subtitle}</span></div><b>{unlimited ? "制限なし" : Math.max(0, total - used)}{!unlimited && <small>空き</small>}</b></div>
    <div className="token-bed">{countOnly ? <span className="goal-count">{items.length}名</span> : items.length === 0 ? <span className="empty-label">災害患者なし</span> : items.map((patient) => <PatientToken key={patient.id} patient={patient} state={runtime[patient.id]} onClick={() => onSelect(patient.id)} />)}</div>
  </div>;
}

export default App;
