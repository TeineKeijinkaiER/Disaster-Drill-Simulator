import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const sampleRate = 44100;
const bpm = 126;
const secondsPerBeat = 60 / bpm;
const beatsPerBar = 4;
const bars = 24;
const duration = bars * beatsPerBar * secondsPerBeat;
const sampleCount = Math.ceil(duration * sampleRate);
const left = new Float64Array(sampleCount);
const right = new Float64Array(sampleCount);

const noteFrequency = (midi) => 440 * (2 ** ((midi - 69) / 12));
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function envelope(time, length, attack, release) {
  const fadeIn = clamp(time / attack, 0, 1);
  const fadeOut = clamp((length - time) / release, 0, 1);
  return Math.min(fadeIn, fadeOut);
}

function addTone(startBeat, beatLength, midi, gain, voice, pan = 0) {
  const start = startBeat * secondsPerBeat;
  const length = beatLength * secondsPerBeat;
  const startSample = Math.floor(start * sampleRate);
  const endSample = Math.min(sampleCount, Math.ceil((start + length) * sampleRate));
  const frequency = noteFrequency(midi);
  const leftGain = Math.cos((pan + 1) * Math.PI / 4);
  const rightGain = Math.sin((pan + 1) * Math.PI / 4);

  for (let sample = startSample; sample < endSample; sample += 1) {
    const time = sample / sampleRate - start;
    let wave = 0;
    let amp = 1;

    if (voice === "brass") {
      const vibrato = 1 + 0.003 * Math.sin(2 * Math.PI * 5.2 * time);
      const phase = 2 * Math.PI * frequency * vibrato * time;
      wave = Math.sin(phase) + 0.42 * Math.sin(2 * phase) + 0.2 * Math.sin(3 * phase) + 0.08 * Math.sin(4 * phase);
      amp = envelope(time, length, 0.025, 0.11) * (0.9 + 0.1 * Math.sin(Math.PI * time / length));
    } else if (voice === "strings") {
      const phase = 2 * Math.PI * frequency * time;
      wave = Math.sin(phase) + 0.34 * Math.sin(2 * phase) + 0.16 * Math.sin(3 * phase);
      amp = envelope(time, length, 0.18, 0.22);
    } else if (voice === "pluck") {
      const phase = 2 * Math.PI * frequency * time;
      wave = Math.sin(phase) + 0.3 * Math.sin(2 * phase) + 0.12 * Math.sin(3 * phase);
      amp = Math.exp(-4.5 * time / length) * envelope(time, length, 0.008, 0.07);
    } else {
      const phase = 2 * Math.PI * frequency * time;
      wave = Math.sin(phase) + 0.18 * Math.sin(2 * phase);
      amp = envelope(time, length, 0.015, 0.09);
    }

    const value = wave * amp * gain;
    left[sample] += value * leftGain;
    right[sample] += value * rightGain;
  }
}

let noiseState = 0x6d2b79f5;
function noise() {
  noiseState = (noiseState * 1664525 + 1013904223) >>> 0;
  return (noiseState / 0xffffffff) * 2 - 1;
}

function addDrum(startBeat, kind, gain) {
  const start = startBeat * secondsPerBeat;
  const length = kind === "kick" ? 0.2 : kind === "snare" ? 0.13 : 0.045;
  const startSample = Math.floor(start * sampleRate);
  const endSample = Math.min(sampleCount, Math.ceil((start + length) * sampleRate));
  for (let sample = startSample; sample < endSample; sample += 1) {
    const time = sample / sampleRate - start;
    let value;
    if (kind === "kick") {
      const phase = 2 * Math.PI * (82 - 42 * time / length) * time;
      value = Math.sin(phase) * Math.exp(-18 * time);
    } else if (kind === "snare") {
      value = (0.76 * noise() + 0.24 * Math.sin(2 * Math.PI * 180 * time)) * Math.exp(-27 * time);
    } else {
      value = noise() * Math.exp(-78 * time);
    }
    left[sample] += value * gain;
    right[sample] += value * gain;
  }
}

const chordProgression = [
  [50, 53, 57], [46, 50, 53], [41, 45, 48], [48, 52, 55],
  [50, 53, 57], [46, 50, 53], [43, 46, 50], [45, 49, 52],
  [43, 46, 50], [48, 52, 55], [41, 45, 48], [50, 53, 57],
  [46, 50, 53], [43, 46, 50], [45, 49, 52], [45, 49, 52],
];

const themeA = [
  [[74, 1], [77, 0.5], [79, 0.5], [81, 1], [74, 1]],
  [[70, 1], [74, 1], [77, 1], [81, 1]],
  [[79, 1], [77, 0.5], [76, 0.5], [74, 1], [69, 1]],
  [[76, 2], [69, 1], [73, 1]],
  [[74, 1], [77, 1], [81, 1], [84, 1]],
  [[82, 2], [81, 1], [79, 1]],
  [[77, 1], [79, 0.5], [81, 0.5], [86, 1], [84, 1]],
  [[81, 2], [76, 1], [73, 1]],
];

const themeB = [
  [[79, 1], [82, 1], [86, 1], [84, 1]],
  [[79, 0.5], [81, 0.5], [82, 1], [79, 1], [76, 1]],
  [[77, 1], [81, 1], [84, 1], [81, 1]],
  [[86, 2], [84, 1], [81, 1]],
  [[82, 1], [81, 0.5], [79, 0.5], [77, 1], [74, 1]],
  [[79, 1], [77, 1], [74, 1], [70, 1]],
  [[73, 1], [76, 1], [81, 1], [79, 0.5], [76, 0.5]],
  [[74, 3], [69, 0.5], [73, 0.5]],
];

function addMelody(pattern, startBar, gain) {
  pattern.forEach((barNotes, barIndex) => {
    let beat = (startBar + barIndex) * beatsPerBar;
    for (const [midi, length] of barNotes) {
      addTone(beat, length * 0.95, midi, gain, "brass", -0.08);
      beat += length;
    }
  });
}

for (let bar = 0; bar < bars; bar += 1) {
  const chord = chordProgression[bar % chordProgression.length];
  const barBeat = bar * beatsPerBar;
  chord.forEach((midi, index) => addTone(barBeat, 3.92, midi + 12, 0.026, "strings", index === 0 ? -0.45 : index === 2 ? 0.45 : 0));
  for (let step = 0; step < 8; step += 1) {
    const midi = chord[step % chord.length] + 24;
    addTone(barBeat + step * 0.5, 0.44, midi, 0.028, "pluck", step % 2 ? 0.4 : -0.4);
    addDrum(barBeat + step * 0.5, "hat", 0.018);
  }
  addTone(barBeat, 1.8, chord[0] - 12, 0.095, "bass", -0.15);
  addTone(barBeat + 2, 1.8, chord[0] - 5, 0.078, "bass", 0.15);
  addDrum(barBeat, "kick", 0.16);
  addDrum(barBeat + 1, "snare", 0.075);
  addDrum(barBeat + 2, "kick", 0.14);
  addDrum(barBeat + 3, "snare", 0.082);
}

addMelody(themeA, 0, 0.105);
addMelody(themeB, 8, 0.105);
addMelody(themeA, 16, 0.115);

for (let bar = 16; bar < 24; bar += 1) {
  const chord = chordProgression[bar % chordProgression.length];
  const barBeat = bar * beatsPerBar;
  addTone(barBeat, 1.8, chord[2] + 12, 0.035, "strings", 0.55);
  addTone(barBeat + 2, 1.8, chord[1] + 12, 0.035, "strings", 0.55);
}

let peak = 0;
for (let sample = 0; sample < sampleCount; sample += 1) {
  peak = Math.max(peak, Math.abs(left[sample]), Math.abs(right[sample]));
}
const masterGain = 0.86 / peak;

const bytesPerSample = 2;
const channels = 2;
const dataSize = sampleCount * channels * bytesPerSample;
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

for (let sample = 0; sample < sampleCount; sample += 1) {
  const offset = 44 + sample * 4;
  buffer.writeInt16LE(Math.round(clamp(left[sample] * masterGain, -1, 1) * 32767), offset);
  buffer.writeInt16LE(Math.round(clamp(right[sample] * masterGain, -1, 1) * 32767), offset + 2);
}

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const outputPath = path.resolve(scriptDirectory, "../public/game-bgm-loop.wav");
fs.writeFileSync(outputPath, buffer);
console.log(`Generated ${outputPath} (${duration.toFixed(2)}s, ${bpm} BPM)`);
