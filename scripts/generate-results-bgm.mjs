import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const sampleRate = 22050;
const bpm = 88;
const beatsPerBar = 4;
const bars = 8;
const secondsPerBeat = 60 / bpm;
const duration = bars * beatsPerBar * secondsPerBeat;
const samples = Math.ceil(duration * sampleRate);
const left = new Float64Array(samples);
const right = new Float64Array(samples);

const hz = (midi) => 440 * 2 ** ((midi - 69) / 12);
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const pan = (value) => [Math.cos((value + 1) * Math.PI / 4), Math.sin((value + 1) * Math.PI / 4)];

function addTone(startBeat, beatLength, midi, gain, voice, position = 0) {
  const start = startBeat * secondsPerBeat;
  const length = beatLength * secondsPerBeat;
  const first = Math.floor(start * sampleRate);
  const last = Math.min(samples, Math.ceil((start + length) * sampleRate));
  const frequency = hz(midi);
  const [leftGain, rightGain] = pan(position);
  for (let index = first; index < last; index += 1) {
    const time = index / sampleRate - start;
    const attack = Math.min(1, time / (voice === "pad" ? 0.28 : 0.018));
    const release = Math.min(1, (length - time) / (voice === "pad" ? 0.35 : 0.12));
    const envelope = Math.max(0, Math.min(attack, release));
    const phase = 2 * Math.PI * frequency * time;
    let wave;
    if (voice === "pad") wave = Math.sin(phase) + 0.22 * Math.sin(phase * 2) + 0.08 * Math.sin(phase * 3);
    else if (voice === "bell") wave = Math.sin(phase) + 0.42 * Math.sin(phase * 2.01) + 0.16 * Math.sin(phase * 3.99);
    else if (voice === "bass") wave = Math.sin(phase) + 0.12 * Math.sin(phase * 2);
    else wave = Math.sin(phase) + 0.28 * Math.sin(phase * 2) + 0.1 * Math.sin(phase * 3);
    const decay = voice === "bell" ? Math.exp(-3.5 * time / length) : 1;
    const value = wave * envelope * decay * gain;
    left[index] += value * leftGain;
    right[index] += value * rightGain;
  }
}

const chords = [
  [50, 54, 57, 62], // D
  [45, 49, 52, 57], // A
  [47, 50, 54, 59], // Bm
  [43, 47, 50, 55], // G
  [50, 54, 57, 62],
  [45, 49, 52, 57],
  [43, 47, 50, 55],
  [50, 54, 57, 62],
];
const melody = [
  [74, 76, 78, 81], [76, 74, 73, 69], [71, 74, 78, 74], [71, 69, 67, 66],
  [74, 78, 81, 78], [76, 73, 69, 73], [71, 74, 76, 74], [69, 74, 78, 81],
];

chords.forEach((chord, bar) => {
  const beat = bar * beatsPerBar;
  chord.slice(1).forEach((note, index) => addTone(beat, 3.92, note + 12, 0.038, "pad", index === 0 ? -0.42 : index === 2 ? 0.42 : 0));
  addTone(beat, 1.85, chord[0] - 12, 0.11, "bass", -0.1);
  addTone(beat + 2, 1.85, chord[0] - 7, 0.085, "bass", 0.1);
  for (let step = 0; step < 8; step += 1) {
    const note = chord[(step + (bar % 2)) % chord.length] + 12;
    addTone(beat + step * 0.5, 0.42, note, 0.045, "piano", step % 2 ? 0.36 : -0.36);
  }
  melody[bar].forEach((note, step) => addTone(beat + step, 0.78, note, 0.05, "bell", 0.12));
});

let peak = 0;
for (let index = 0; index < samples; index += 1) peak = Math.max(peak, Math.abs(left[index]), Math.abs(right[index]));
const master = 0.78 / peak;
const channels = 2;
const bytesPerSample = 2;
const dataSize = samples * channels * bytesPerSample;
const buffer = Buffer.alloc(44 + dataSize);
buffer.write("RIFF", 0);
buffer.writeUInt32LE(36 + dataSize, 4);
buffer.write("WAVE", 8);
buffer.write("fmt ", 12);
buffer.writeUInt32LE(16, 16);
buffer.writeUInt16LE(1, 20);
buffer.writeUInt16LE(channels, 22);
buffer.writeUInt32LE(sampleRate, 24);
buffer.writeUInt32LE(sampleRate * channels * bytesPerSample, 28);
buffer.writeUInt16LE(channels * bytesPerSample, 32);
buffer.writeUInt16LE(bytesPerSample * 8, 34);
buffer.write("data", 36);
buffer.writeUInt32LE(dataSize, 40);
for (let index = 0; index < samples; index += 1) {
  const offset = 44 + index * 4;
  buffer.writeInt16LE(Math.round(clamp(left[index] * master, -1, 1) * 32767), offset);
  buffer.writeInt16LE(Math.round(clamp(right[index] * master, -1, 1) * 32767), offset + 2);
}

const directory = path.dirname(fileURLToPath(import.meta.url));
const output = path.resolve(directory, "../public/results-bgm-loop.wav");
fs.writeFileSync(output, buffer);
console.log(`Generated ${output} (${duration.toFixed(2)}s, ${bpm} BPM)`);
