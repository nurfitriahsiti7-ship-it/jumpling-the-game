/**
 * Web Audio API procedural sound effects & arcade runner background music
 * Pure synthesized audio — no external audio files needed, zero latency.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private musicGainNode: GainNode | null = null;
  private sfxGainNode: GainNode | null = null;
  private masterGainNode: GainNode | null = null;
  
  private musicVolume: number = 0.45;
  private sfxVolume: number = 0.7;
  private isMuted: boolean = false;
  
  // Background music sequencer
  private isMusicPlaying: boolean = false;
  private musicTimerId: number | null = null;
  private currentBeat: number = 0;

  // Catchy arcade runner scale (A minor pentatonic / funky runner vibes)
  private bassNotes = [110, 110, 130.81, 146.83, 110, 110, 164.81, 146.83];
  private melodyNotes = [
    440, 0, 523.25, 587.33, 659.25, 0, 587.33, 523.25,
    659.25, 783.99, 659.25, 0, 587.33, 523.25, 440, 0
  ];

  constructor() {
    // AudioContext will be initialized on first user gesture
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGainNode = this.ctx.createGain();
      this.masterGainNode.gain.setValueAtTime(this.isMuted ? 0 : 1, this.ctx.currentTime);
      this.masterGainNode.connect(this.ctx.destination);

      this.sfxGainNode = this.ctx.createGain();
      this.sfxGainNode.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
      this.sfxGainNode.connect(this.masterGainNode);

      this.musicGainNode = this.ctx.createGain();
      this.musicGainNode.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
      this.musicGainNode.connect(this.masterGainNode);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolumes(musicVol: number, sfxVol: number, muted: boolean) {
    this.musicVolume = Math.max(0, Math.min(1, musicVol));
    this.sfxVolume = Math.max(0, Math.min(1, sfxVol));
    this.isMuted = muted;

    if (this.ctx && this.masterGainNode && this.musicGainNode && this.sfxGainNode) {
      const now = this.ctx.currentTime;
      this.masterGainNode.gain.setValueAtTime(this.isMuted ? 0 : 1, now);
      this.musicGainNode.gain.setValueAtTime(this.musicVolume, now);
      this.sfxGainNode.gain.setValueAtTime(this.sfxVolume, now);
    }
  }

  // --- Sound Effects ---

  public playJump() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGainNode || this.isMuted) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(480, now + 0.15);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

      osc.connect(gain);
      gain.connect(this.sfxGainNode);

      osc.start(now);
      osc.stop(now + 0.19);
    } catch {
      // Audio fallback silent
    }
  }

  public playDoubleJump() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGainNode || this.isMuted) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(720, now + 0.12);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.22);

      gain.gain.setValueAtTime(0.45, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.24);

      osc.connect(gain);
      gain.connect(this.sfxGainNode);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch {
      // Audio fallback silent
    }
  }

  public playSlide() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGainNode || this.isMuted) return;

      const now = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 0.25;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.4;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.exponentialRampToValueAtTime(250, now + 0.25);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGainNode);

      noise.start(now);
      noise.stop(now + 0.25);
    } catch {
      // Audio fallback
    }
  }

  public playCoin() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGainNode || this.isMuted) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      // Crisp 2-tone bell chime
      osc.frequency.setValueAtTime(987.77, now); // B5
      osc.frequency.setValueAtTime(1318.51, now + 0.06); // E6

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

      osc.connect(gain);
      gain.connect(this.sfxGainNode);

      osc.start(now);
      osc.stop(now + 0.19);
    } catch {
      // Audio fallback
    }
  }

  public playPowerUp() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGainNode || this.isMuted) return;

      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C E G C
      notes.forEach((freq, i) => {
        if (!this.ctx || !this.sfxGainNode) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, now + i * 0.08);

        gain.gain.setValueAtTime(0.2, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.15);

        osc.connect(gain);
        gain.connect(this.sfxGainNode);

        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.16);
      });
    } catch {
      // Audio fallback
    }
  }

  public playShieldBreak() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGainNode || this.isMuted) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.2);

      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);

      osc.connect(gain);
      gain.connect(this.sfxGainNode);

      osc.start(now);
      osc.stop(now + 0.23);
    } catch {
      // Audio fallback
    }
  }

  public playHit() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGainNode || this.isMuted) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.3);

      gain.gain.setValueAtTime(0.65, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGainNode);

      osc.start(now);
      osc.stop(now + 0.36);
    } catch {
      // Audio fallback
    }
  }

  public playGameOver() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGainNode || this.isMuted) return;

      const now = this.ctx.currentTime;
      const notes = [440, 415.3, 392, 349.23]; // descending sad trumpet
      notes.forEach((freq, idx) => {
        if (!this.ctx || !this.sfxGainNode) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.16);

        gain.gain.setValueAtTime(0.3, now + idx * 0.16);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.16 + 0.2);

        osc.connect(gain);
        gain.connect(this.sfxGainNode);

        osc.start(now + idx * 0.16);
        osc.stop(now + idx * 0.16 + 0.22);
      });
    } catch {
      // Audio fallback
    }
  }

  public playClick() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGainNode || this.isMuted) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

      osc.connect(gain);
      gain.connect(this.sfxGainNode);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch {
      // Audio fallback
    }
  }

  public playSpeedUp() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGainNode || this.isMuted) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.25);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);

      osc.connect(gain);
      gain.connect(this.sfxGainNode);

      osc.start(now);
      osc.stop(now + 0.29);
    } catch {
      // Audio fallback
    }
  }

  // --- Dynamic Procedural Runner Music ---

  public startMusic() {
    if (this.isMusicPlaying) return;
    this.initContext();
    this.isMusicPlaying = true;
    this.currentBeat = 0;
    this.scheduleMusicStep();
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicTimerId !== null) {
      clearTimeout(this.musicTimerId);
      this.musicTimerId = null;
    }
  }

  private scheduleMusicStep = () => {
    if (!this.isMusicPlaying || !this.ctx || !this.musicGainNode) return;

    // Tempo: ~135 BPM (16th notes = ~111ms)
    const stepDuration = 0.12;
    const now = this.ctx.currentTime;

    // Bassline note (every 2 steps)
    if (this.currentBeat % 2 === 0) {
      const bassIdx = Math.floor(this.currentBeat / 2) % this.bassNotes.length;
      const bassFreq = this.bassNotes[bassIdx];
      
      const bassOsc = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();
      bassOsc.type = 'triangle';
      bassOsc.frequency.setValueAtTime(bassFreq, now);

      bassGain.gain.setValueAtTime(0.25, now);
      bassGain.gain.exponentialRampToValueAtTime(0.01, now + stepDuration * 1.8);

      bassOsc.connect(bassGain);
      bassGain.connect(this.musicGainNode);

      bassOsc.start(now);
      bassOsc.stop(now + stepDuration * 1.9);
    }

    // Melodic lead
    const melodyIdx = this.currentBeat % this.melodyNotes.length;
    const melodyFreq = this.melodyNotes[melodyIdx];
    if (melodyFreq > 0) {
      const melOsc = this.ctx.createOscillator();
      const melGain = this.ctx.createGain();
      melOsc.type = 'sine';
      melOsc.frequency.setValueAtTime(melodyFreq, now);

      melGain.gain.setValueAtTime(0.12, now);
      melGain.gain.exponentialRampToValueAtTime(0.01, now + stepDuration * 1.2);

      melOsc.connect(melGain);
      melGain.connect(this.musicGainNode);

      melOsc.start(now);
      melOsc.stop(now + stepDuration * 1.3);
    }

    // Snare / Hi-hat synth beat
    if (this.currentBeat % 4 === 2) {
      // Snare hit
      this.playSynthSnare(now);
    } else {
      // Crisp hi-hat tick
      this.playSynthHat(now);
    }

    this.currentBeat = (this.currentBeat + 1) % 64;
    this.musicTimerId = window.setTimeout(this.scheduleMusicStep, stepDuration * 1000);
  };

  private playSynthHat(now: number) {
    if (!this.ctx || !this.musicGainNode) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'highpass' as unknown as OscillatorType;
    osc.frequency.setValueAtTime(8000, now);
    gain.gain.setValueAtTime(0.03, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    osc.connect(gain);
    gain.connect(this.musicGainNode);
    osc.start(now);
    osc.stop(now + 0.05);
  }

  private playSynthSnare(now: number) {
    if (!this.ctx || !this.musicGainNode) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.08);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    osc.connect(gain);
    gain.connect(this.musicGainNode);
    osc.start(now);
    osc.stop(now + 0.09);
  }
}

export const soundEngine = new SoundEngine();
