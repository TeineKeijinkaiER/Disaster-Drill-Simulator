import { useEffect, useState } from "react";
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
  ChevronRight,
  CirclePause,
  CirclePlay,
  Clock3,
  DoorOpen,
  Hospital,
  Phone,
  RotateCcw,
  ScanLine,
  Settings2,
  Stethoscope,
  UserRound,
  UsersRound,
} from "lucide-react";
import {
  patients,
  type Patient,
  type RoleState,
  type ZoneId,
  zoneLabels,
} from "./data";

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
}

interface CapacitySettings {
  icuExisting: number;
  euExisting: number;
  orGeneralInUse: number;
  eyeRoomInUse: boolean;
  erSevereExisting: number;
  erModerateExisting: number;
}

const START_MINUTE = 10 * 60;
const STORAGE_KEY = "disaster-tabletop-v06";

const defaultRuntime = (): Record<number, PatientRuntime> =>
  Object.fromEntries(patients.map((patient) => [patient.id, { zone: "scheduled", role: "active" }]));

const defaultCapacity: CapacitySettings = {
  icuExisting: 8,
  euExisting: 18,
  orGeneralInUse: 8,
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
  const markers = ["。胸腔", "。CT", "。画像", "。ER", "。救外", "。軽症ゾーン", "。手術", "。FAST", "。入院", "。点滴", "。カテ", "。気管", "。人工", "。ICU", "。EU"];
  const ends = markers.map((marker) => value.indexOf(marker)).filter((index) => index >= 0);
  return ends.length ? value.slice(0, Math.min(...ends) + 1) : firstSentence(value);
}

function App() {
  const [clockSeconds, setClockSeconds] = useState(START_MINUTE * 60);
  const [running, setRunning] = useState(false);
  const [runtime, setRuntime] = useState<Record<number, PatientRuntime>>(defaultRuntime);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [postArrivalInfo, setPostArrivalInfo] = useState<"vitals" | "exam" | "event">("vitals");
  const [dragOverZone, setDragOverZone] = useState<ZoneId | null>(null);
  const [capacity, setCapacity] = useState<CapacitySettings>(defaultCapacity);
  const [hydrated, setHydrated] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

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
              primaryTriageComplete: state.primaryTriageComplete || state.transitTo === "triage",
              secondaryTriageComplete: state.secondaryTriageComplete || state.transitTo === "light-secondary",
              erAssessmentComplete: state.erAssessmentComplete || state.transitTo === "er-severe" || state.transitTo === "er-moderate",
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
        clockSeconds: number;
        runtime: Record<number, PatientRuntime>;
        capacity: CapacitySettings;
      };
      setClockSeconds(parsed.clockSeconds);
      setRuntime(parsed.runtime);
      setCapacity(parsed.capacity);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ clockSeconds, runtime, capacity }));
  }, [clockSeconds, runtime, capacity, hydrated]);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => advanceTime(2), 1000);
    return () => window.clearInterval(timer);
  }, [running]);

  useEffect(() => {
    const currentMinute = Math.floor(clockSeconds / 60);
    setRuntime((current) => {
      let changed = false;
      const next = { ...current };
      for (const patient of patients) {
        const state = current[patient.id];
        if (state.zone === "scheduled" && patient.arrivalMinute <= currentMinute) {
          next[patient.id] = {
            ...state,
            zone: patient.method === "ambulance" ? "ambulance" : "walkin",
          };
          changed = true;
        }
      }
      return changed ? next : current;
    });
  }, [clockSeconds]);

  const selectedPatient = patients.find((patient) => patient.id === selectedId) ?? null;
  const selectedState = selectedPatient ? runtime[selectedPatient.id] : null;
  const imagingAvailable = Boolean(selectedState?.imagingCompleted);
  const hasPrimaryTriage = Boolean(selectedState?.primaryTriageComplete);
  const hasSecondaryTriage = Boolean(selectedState?.secondaryTriageComplete);
  const hasErAssessment = Boolean(selectedState?.erAssessmentComplete);

  const zonePatients = (zone: ZoneId) => patients.filter((patient) => runtime[patient.id]?.zone === zone);
  const disasterCount = (zone: ZoneId) => zonePatients(zone).length;

  const movePatientTo = (patientId: number, target: ZoneId) => {
    const state = runtime[patientId];
    if (!state || target === "transit" || target === "scheduled") return;
    if ((state.zone === "er-imaging" || state.zone === "light-imaging") && !state.imagingCompleted) return;
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
        primaryTriageComplete: current[patientId].primaryTriageComplete || target === "triage",
        secondaryTriageComplete: current[patientId].secondaryTriageComplete || target === "light-secondary",
        erAssessmentComplete: current[patientId].erAssessmentComplete || target === "er-severe" || target === "er-moderate",
      };
      const nextState = needsTransit
        ? { ...current[patientId], ...stageUpdates, zone: "transit" as ZoneId, transitTo: target, transitRemaining: 180 }
        : enteringErImaging || enteringLightImaging
          ? { ...current[patientId], ...stageUpdates, zone: target, transitTo: undefined, transitRemaining: undefined, imagingRemaining: 360, imagingCompleted: false }
          : { ...current[patientId], ...stageUpdates, zone: target, transitTo: undefined, transitRemaining: undefined, imagingRemaining: undefined };
      return { ...current, [patientId]: nextState };
    });
    setSelectedId(patientId);
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

  const resetSession = () => {
    if (!window.confirm("現在の進行状況を消去して10:00に戻しますか？")) return;
    setRunning(false);
    setClockSeconds(START_MINUTE * 60);
    setRuntime(defaultRuntime());
    setSelectedId(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const addMinutes = (minutes: number) => advanceTime(minutes * 60);

  const zonesInMap: Array<{ id: ZoneId; title: string; icon: typeof Hospital; className: string; capacity?: number }> = [
    { id: "ambulance", title: "救急車搬入口", icon: Ambulance, className: "arrival-zone" },
    { id: "walkin", title: "乗用車・徒歩", icon: UsersRound, className: "arrival-zone" },
    { id: "triage", title: "一次トリアージ", icon: Stethoscope, className: "triage-zone" },
    { id: "er-severe", title: "ER 重症", icon: BedDouble, className: "er-zone", capacity: 4 },
    { id: "er-moderate", title: "ER 中等症", icon: BedDouble, className: "er-zone", capacity: 7 },
    { id: "er-imaging", title: "救外用画像検査室", icon: ScanLine, className: "imaging-zone", capacity: 1 },
    { id: "light-secondary", title: "二次トリアージ", icon: Stethoscope, className: "light-zone" },
    { id: "light-wait", title: "軽症 診察待合", icon: UsersRound, className: "light-zone" },
    { id: "light-imaging", title: "軽症用画像検査室", icon: ScanLine, className: "imaging-zone" },
    { id: "transit", title: "ストレッチャー搬送中", icon: Clock3, className: "transit-zone" },
  ];

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd} onDragCancel={() => setDragOverZone(null)}>
    <div className="app projection">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark"><Hospital size={22} /></div>
          <div>
            <h1>災害机上訓練</h1>
            <p>2026 多数傷病者受入シミュレーション</p>
          </div>
        </div>
        <div className="clock-panel" aria-label="訓練時計">
          <button className="icon-button" onClick={() => setRunning((value) => !value)} title={running ? "一時停止" : "開始"}>
            {running ? <CirclePause /> : <CirclePlay />}
          </button>
          <strong>{formatClock(clockSeconds)}</strong>
          <span className="speed-badge">2x</span>
          <button className="small-button" onClick={() => addMinutes(1)}>+1分</button>
          <button className="small-button" onClick={() => addMinutes(5)}>+5分</button>
        </div>
        <div className="top-actions">
          <button className="icon-button" onClick={() => setShowSettings((value) => !value)} title="初期設定"><Settings2 /></button>
          <button className="icon-button" onClick={resetSession} title="リセット"><RotateCcw /></button>
        </div>
      </header>

      <section className="capacity-strip" aria-label="収容状況">
        <Capacity label="ER重症" used={capacity.erSevereExisting + disasterCount("er-severe")} total={4} tone="red" />
        <Capacity label="ER中等症" used={capacity.erModerateExisting + disasterCount("er-moderate")} total={7} tone="yellow" />
        <Capacity label="ICU" used={capacity.icuExisting + disasterCount("icu")} total={16} tone="blue" />
        <Capacity label="EU" used={capacity.euExisting + disasterCount("eu")} total={30} tone="green" />
        <Capacity label="一般手術室" used={capacity.orGeneralInUse + disasterCount("or")} total={14} tone="purple" />
        <Capacity label="眼科専用" used={capacity.eyeRoomInUse ? 1 : 0} total={1} tone="gray" />
      </section>

      {showSettings && (
        <section className="settings-panel">
          <div><strong>災害発生前の占有状況</strong><span>最大容量は固定です</span></div>
          <NumberSetting label="ER重症" value={capacity.erSevereExisting} max={4} onChange={(value) => setCapacity({ ...capacity, erSevereExisting: value })} />
          <NumberSetting label="ER中等症" value={capacity.erModerateExisting} max={7} onChange={(value) => setCapacity({ ...capacity, erModerateExisting: value })} />
          <NumberSetting label="ICU" value={capacity.icuExisting} max={16} onChange={(value) => setCapacity({ ...capacity, icuExisting: value })} />
          <NumberSetting label="EU" value={capacity.euExisting} max={30} onChange={(value) => setCapacity({ ...capacity, euExisting: value })} />
          <NumberSetting label="一般手術室" value={capacity.orGeneralInUse} max={14} onChange={(value) => setCapacity({ ...capacity, orGeneralInUse: value })} />
        </section>
      )}

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
                  <Zone id="light-room" title="診察室" icon={Stethoscope} className="room-zone" patients={zonePatients("light-room")} runtime={runtime} onSelect={setSelectedId} dragOver={dragOverZone === "light-room"} />
                </div>
                <Zone {...zonesInMap[8]} patients={zonePatients("light-imaging")} runtime={runtime} onSelect={setSelectedId} dragOver={dragOverZone === "light-imaging"} />
              </div>
            </div>
            <div className="flow-arrow"><ChevronRight /></div>
            <div className="destination-column">
              <Destination id="or" title="手術室" subtitle="一般14室 + 眼科1室" icon={DoorOpen} patients={zonePatients("or")} used={capacity.orGeneralInUse + disasterCount("or")} total={14} runtime={runtime} onSelect={setSelectedId} dragOver={dragOverZone === "or"} />
              <Destination id="icu" title="ICU" subtitle="集中治療室" icon={BedDouble} patients={zonePatients("icu")} used={capacity.icuExisting + disasterCount("icu")} total={16} runtime={runtime} onSelect={setSelectedId} dragOver={dragOverZone === "icu"} />
              <Destination id="eu" title="EU" subtitle="救急病棟" icon={BedDouble} patients={zonePatients("eu")} used={capacity.euExisting + disasterCount("eu")} total={30} runtime={runtime} onSelect={setSelectedId} dragOver={dragOverZone === "eu"} />
            </div>
          </div>
        </section>

          <aside className="control-panel">
            {selectedPatient && selectedState ? (
              <>
                <div className="patient-detail-head">
                  <span className={`triage-badge ${selectedPatient.triage}`}>{selectedPatient.triage === "red" ? "赤" : selectedPatient.triage === "yellow" ? "黄" : "緑"}</span>
                  <div><span>症例 {selectedPatient.id}</span><h3>{selectedPatient.name}</h3></div>
                </div>
                <dl className="patient-facts">
                  <div><dt>来院</dt><dd>{selectedPatient.arrival} / {selectedPatient.method === "ambulance" ? "救急車" : selectedPatient.method === "car" ? "乗用車" : "徒歩"}</dd></div>
                  <div><dt>現在</dt><dd>{zoneLabels[selectedState.zone]}</dd></div>
                  {hasPrimaryTriage && <div><dt>一次判定</dt><dd>{selectedPatient.triage === "red" ? "赤" : selectedPatient.triage === "yellow" ? "黄" : "緑"}</dd></div>}
                  {hasErAssessment && <><div><dt>想定転帰</dt><dd>{selectedPatient.destination}</dd></div><div><dt>OPE / AG</dt><dd>{selectedPatient.opeAg || "該当なし"}</dd></div></>}
                </dl>
                <div className="detail-sections">
                  <section className="information-stage prehospital-stage">
                    <span>病院前情報</span>
                    <DetailBlock label="主訴・受傷状況" value={preHospitalHistory(selectedPatient.history)} prominent />
                    <DetailBlock label="年齢・性別" value={selectedPatient.ageSex} />
                    {selectedPatient.ambulanceInfo && <><DetailBlock label="救急隊からの情報" value={selectedPatient.ambulanceInfo} prominent /><DetailBlock label="救急隊測定バイタル" value={firstSentence(selectedPatient.vitals)} /></>}
                  </section>
                  {hasPrimaryTriage && <section className="information-stage"><span>一次トリアージ</span><DetailBlock label="一次トリアージ結果" value={`判定: ${selectedPatient.triage === "red" ? "赤" : selectedPatient.triage === "yellow" ? "黄" : "緑"}。${firstSentence(selectedPatient.triageFindings)}`} /></section>}
                  {hasSecondaryTriage && <section className="information-stage"><span>二次トリアージ</span><DetailBlock label="二次トリアージ結果" value={`二次トリアージで再評価を実施。${firstSentence(selectedPatient.triageFindings)}`} /></section>}
                  {hasErAssessment && <section className="information-stage">
                    <span>救外ベッド到着後の情報</span>
                    <section className="post-arrival-section">
                      <div className="post-arrival-buttons">
                        <button className={postArrivalInfo === "vitals" ? "active" : ""} onClick={() => setPostArrivalInfo("vitals")}>来院時バイタル</button>
                        <button className={postArrivalInfo === "exam" ? "active" : ""} onClick={() => setPostArrivalInfo("exam")}>診察所見</button>
                        <button className={postArrivalInfo === "event" ? "active" : ""} onClick={() => setPostArrivalInfo("event")}>追加イベント</button>
                      </div>
                      <div className="post-arrival-content"><strong>{postArrivalInfo === "vitals" ? "来院時バイタル" : postArrivalInfo === "exam" ? "診察所見" : "追加イベント"}</strong><p>{postArrivalInfo === "vitals" ? selectedPatient.vitals : postArrivalInfo === "exam" ? selectedPatient.exam : selectedPatient.additionalEvent}</p></div>
                    </section>
                    <DetailBlock label="シナリオ想定" value={selectedPatient.scenario} />
                    <DetailBlock label="想定される治療" value={selectedPatient.treatment} />
                    <DetailBlock label="コントローラー指示" value={selectedPatient.controllerInstruction} />
                    <DetailBlock label="演技ポイント" value={selectedPatient.actingPoints} />
                    <DetailBlock label="重点訓練ポイント" value={selectedPatient.focus} />
                    <DetailBlock label="ムラージュ" value={selectedPatient.moulage} />
                    <DetailBlock label="原本ID" value={selectedPatient.originalId} />
                    <DetailBlock label="原本症例" value={selectedPatient.originalCase} />
                  </section>}
                  {imagingAvailable && <section className="information-stage imaging-result-stage"><span>画像検査結果</span><DetailBlock label="CT・XPなどの検査所見" value={selectedPatient.tests} prominent /></section>}
                </div>
                {selectedState.zone === "transit" && (
                  <div className="transit-status"><Clock3 /><div><span>ストレッチャー搬送中</span><strong>残り {Math.ceil((selectedState.transitRemaining ?? 0) / 60)}分</strong></div></div>
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
  return <button ref={setNodeRef} {...attributes} {...listeners} style={{ transform: CSS.Translate.toString(transform), zIndex: isDragging ? 20 : undefined }} className={`patient-row ${selected ? "selected" : ""} ${state.zone === "scheduled" ? "scheduled" : ""} ${isDragging ? "dragging" : ""}`} onClick={onClick}>
    <i className={`triage-stripe ${patient.triage}`} />
    <span className="patient-id">{String(patient.id).padStart(2, "0")}</span>
    <span className="patient-copy"><strong>{patient.name}</strong><small>{patient.arrival} · {zoneLabels[state.zone]}</small></span>
    <span className={`role-icon ${state.role}`}>{state.role === "active" ? <UserRound size={15} /> : <Phone size={14} />}</span>
  </button>;
}

function PatientToken({ patient, state, onClick }: { patient: Patient; state: PatientRuntime; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: `token-${patient.id}`, data: { patientId: patient.id } });
  return <button ref={setNodeRef} {...attributes} {...listeners} style={{ transform: CSS.Translate.toString(transform), zIndex: isDragging ? 20 : undefined }} className={`patient-token ${state.role} ${isDragging ? "dragging" : ""}`} onClick={onClick} title={`症例${patient.id} ${patient.name}`}>
    <i className={patient.triage} />
    <span>{patient.id}</span>
    {state.role === "active" ? <UserRound size={13} /> : <Phone size={12} />}
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

function Destination({ id, title, subtitle, icon: Icon, patients: items, used, total, runtime, onSelect, dragOver }: { id: ZoneId; title: string; subtitle: string; icon: typeof Hospital; patients: Patient[]; used: number; total: number; runtime: Record<number, PatientRuntime>; onSelect: (id: number) => void; dragOver: boolean }) {
  const { setNodeRef, isOver } = useDroppable({ id: `zone-${id}`, data: { zoneId: id } });
  return <div ref={setNodeRef} className={`destination ${dragOver || isOver ? "drag-over" : ""}`} data-zone={id}>
    <div className="destination-head"><div className="destination-icon"><Icon size={18} /></div><div><strong>{title}</strong><span>{subtitle}</span></div><b>{Math.max(0, total - used)}<small>空き</small></b></div>
    <div className="token-bed">{items.length === 0 ? <span className="empty-label">災害患者なし</span> : items.map((patient) => <PatientToken key={patient.id} patient={patient} state={runtime[patient.id]} onClick={() => onSelect(patient.id)} />)}</div>
  </div>;
}

export default App;
