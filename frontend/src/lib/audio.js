// Web Audio–generated tones for the breathing sessions (no external audio
// files/licensing needed). A soft chime marks each phase change, and an
// optional filtered-noise loop stands in for the ambient "rain" toggle (FR-2.3).

const PHASE_FREQUENCIES = {
  Inhale: 392, // G4 — rising cue
  Hold: 330, // E4 — steady cue
  Exhale: 262, // C4 — settling cue
};

export class BreathAudioEngine {
  constructor() {
    this.ctx = null;
    this.ambientSource = null;
    this.ambientGain = null;
    this.muted = false;
  }

  ensureContext() {
    if (!this.ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new Ctx();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  setMuted(muted) {
    this.muted = muted;
    if (this.ambientGain) {
      this.ambientGain.gain.setTargetAtTime(muted ? 0 : 0.05, this.ctx.currentTime, 0.3);
    }
  }

  playPhaseChime(phaseName) {
    if (this.muted) return;
    const ctx = this.ensureContext();
    const freq = PHASE_FREQUENCIES[phaseName] ?? 349;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9);

    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 1);
  }

  startAmbient() {
    if (this.ambientSource) return;
    const ctx = this.ensureContext();

    const bufferSize = 2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i += 1) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 900;

    const gain = ctx.createGain();
    gain.gain.value = this.muted ? 0 : 0.05;

    noise.connect(filter).connect(gain).connect(ctx.destination);
    noise.start();

    this.ambientSource = noise;
    this.ambientGain = gain;
  }

  stopAmbient() {
    if (this.ambientSource) {
      this.ambientSource.stop();
      this.ambientSource.disconnect();
      this.ambientSource = null;
      this.ambientGain = null;
    }
  }

  teardown() {
    this.stopAmbient();
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }
}
