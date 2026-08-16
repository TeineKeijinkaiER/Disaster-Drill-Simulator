type Tone = [frequency: number, start: number, duration: number, gain: number];

const progression: Tone[][] = [
  [[261.63, 0, 2.5, 0.16], [329.63, 0.08, 2.3, 0.1], [392, 0.16, 2.1, 0.08], [659.25, 1.45, 0.65, 0.07]],
  [[293.66, 0, 2.5, 0.15], [369.99, 0.08, 2.3, 0.1], [440, 0.16, 2.1, 0.08], [587.33, 1.45, 0.65, 0.07]],
  [[349.23, 0, 2.5, 0.15], [440, 0.08, 2.3, 0.1], [523.25, 0.16, 2.1, 0.08], [698.46, 1.45, 0.65, 0.07]],
  [[392, 0, 3.1, 0.17], [493.88, 0.08, 2.9, 0.11], [587.33, 0.16, 2.7, 0.09], [783.99, 1.45, 0.85, 0.08]],
];

export class ResultsMusic {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private timer: number | null = null;

  async unlock() {
    this.context ??= new AudioContext();
    this.master ??= this.context.createGain();
    this.master.connect(this.context.destination);
    await this.context.resume();
  }

  start(volume: number) {
    if (this.timer !== null) {
      this.setVolume(volume);
      return;
    }
    if (!this.context || !this.master) return;
    this.setVolume(volume);
    this.playPhrase();
    this.timer = window.setInterval(() => this.playPhrase(), 10_000);
  }

  setVolume(volume: number) {
    if (!this.master || !this.context) return;
    this.master.gain.setTargetAtTime(Math.max(0, Math.min(0.2, volume * 0.16)), this.context.currentTime, 0.12);
  }

  stop() {
    if (this.timer !== null) window.clearInterval(this.timer);
    this.timer = null;
    if (this.master && this.context) this.master.gain.setTargetAtTime(0, this.context.currentTime, 0.08);
  }

  private playPhrase() {
    if (!this.context || !this.master) return;
    const phraseStart = this.context.currentTime + 0.06;
    progression.forEach((chord, chordIndex) => chord.forEach(([frequency, start, duration, gain]) => {
      const oscillator = this.context!.createOscillator();
      const envelope = this.context!.createGain();
      oscillator.type = chordIndex === 3 ? "sine" : "triangle";
      oscillator.frequency.value = frequency;
      envelope.gain.setValueAtTime(0.0001, phraseStart + chordIndex * 2.45 + start);
      envelope.gain.exponentialRampToValueAtTime(gain, phraseStart + chordIndex * 2.45 + start + 0.16);
      envelope.gain.exponentialRampToValueAtTime(0.0001, phraseStart + chordIndex * 2.45 + start + duration);
      oscillator.connect(envelope).connect(this.master!);
      oscillator.start(phraseStart + chordIndex * 2.45 + start);
      oscillator.stop(phraseStart + chordIndex * 2.45 + start + duration + 0.05);
    }));
  }
}
