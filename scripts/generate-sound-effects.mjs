import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const sampleRate = 44100;
const clamp = (value) => Math.max(-1, Math.min(1, value));

function createSound(duration, build) {
  const samples = new Float64Array(Math.ceil(duration * sampleRate));
  const addTone = (start, length, frequency, gain, shape = "sine") => {
    const first = Math.max(0, Math.floor(start * sampleRate));
    const last = Math.min(samples.length, Math.ceil((start + length) * sampleRate));
    for (let index = first; index < last; index += 1) {
      const time = index / sampleRate - start;
      const attack = Math.min(1, time / 0.012);
      const release = Math.min(1, (length - time) / 0.035);
      const phase = (time * frequency) % 1;
      const wave = shape === "triangle"
        ? 1 - 4 * Math.abs(Math.round(phase) - phase)
        : shape === "square" ? (phase < 0.5 ? 1 : -1)
          : Math.sin(2 * Math.PI * phase);
      samples[index] += wave * gain * Math.min(attack, release);
    }
  };
  build(addTone);
  return samples;
}

function writeWav(filename, samples) {
  let peak = 0;
  for (const sample of samples) peak = Math.max(peak, Math.abs(sample));
  const scale = peak > 0 ? 0.82 / peak : 1;
  const buffer = Buffer.alloc(44 + samples.length * 2);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + samples.length * 2, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(samples.length * 2, 40);
  samples.forEach((sample, index) => buffer.writeInt16LE(Math.round(clamp(sample * scale) * 32767), 44 + index * 2));
  fs.writeFileSync(path.resolve(outputDirectory, filename), buffer);
}

const outputDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../public");

writeWav("game-sfx-move.wav", createSound(0.25, (tone) => [523.25, 659.25, 783.99].forEach((frequency, index) => tone(index * 0.055, 0.14, frequency, 0.22, "triangle"))));
writeWav("game-sfx-ambulance.wav", createSound(1.55, (tone) => [880, 660, 880, 660, 880, 660, 880, 660].forEach((frequency, index) => tone(index * 0.18, 0.16, frequency, 0.28, "triangle"))));
writeWav("game-sfx-car.wav", createSound(0.55, (tone) => {
  [0, 0.28].forEach((start) => [392, 494].forEach((frequency) => tone(start, 0.22, frequency, 0.18, "square")));
}));
writeWav("game-sfx-alarm.wav", createSound(1.08, (tone) => [980, 740, 980, 740, 980, 740].forEach((frequency, index) => tone(index * 0.17, 0.15, frequency, 0.25, "square"))));
writeWav("game-sfx-buzzer.wav", createSound(0.25, (tone) => tone(0, 0.2, 190, 0.2, "square")));
writeWav("game-sfx-fanfare.wav", createSound(0.85, (tone) => [[392, 0], [523.25, 0.12], [659.25, 0.24], [783.99, 0.42]].forEach(([frequency, start]) => tone(start, 0.38, frequency, 0.25, "triangle"))));

console.log("Generated game sound effects.");
