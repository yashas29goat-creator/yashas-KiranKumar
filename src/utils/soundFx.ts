/**
 * Web Audio API Sound Effects Synthesizer & Stadium Atmosphere Engine
 * Zero external audio assets required; fully self-contained Web Audio synthesis.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private crowdNode: AudioNode | null = null;
  private isMuted: boolean = false;
  private speechSynth: SpeechSynthesis | null = null;
  public commentaryVoiceEnabled: boolean = true;

  constructor() {
    // AudioContext will be initialized on first user gesture
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.speechSynth = window.speechSynthesis;
    }
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.speechSynth) {
      this.speechSynth.cancel();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  /** Play Ball Kick sound with low resonant punch */
  public playKick(power: number = 0.8) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140 + power * 60, t);
    osc.frequency.exponentialRampToValueAtTime(32, t + 0.09);

    gain.gain.setValueAtTime(0.45 * Math.min(1.2, power), t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.11);
  }

  /** Play powerful strike shot */
  public playShoot(power: number = 1.0) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Impact thud
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(190 + power * 90, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.13);

    gain.gain.setValueAtTime(0.6 * power, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.15);

    // Whoosh noise
    this.playNoise(0.08, 0.25 * power, 800);
  }

  /** Play Slide Tackle grass swoosh */
  public playTackle() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    this.playNoise(0.18, 0.35, 450);
  }

  /** Play Post / Crossbar resonant metallic CLANG */
  public playWoodwork() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, t);
    osc1.frequency.exponentialRampToValueAtTime(620, t + 0.4);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1320, t);
    osc2.frequency.exponentialRampToValueAtTime(940, t + 0.3);

    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.5);
    osc2.stop(t + 0.5);
  }

  /** Play Goal Horn & Cheering Eruption */
  public playGoalCelebration() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Stadium Horn Triad Chord
    const notes = [220, 277.18, 329.63, 440];
    notes.forEach((freq) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.08, t);
      gain.gain.linearRampToValueAtTime(0.18, t + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 1.65);
    });

    // Crowd surge noise
    this.playNoise(1.8, 0.4, 1200);
  }

  /** Play 5-Star Skill Move Whoosh */
  public playSkillMove() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(900, t + 0.12);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.16);
  }

  /** Play Referee Whistle (short or long blast) */
  public playWhistle(isLong: boolean = false) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const duration = isLong ? 0.6 : 0.22;
    const t = this.ctx.currentTime;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(2600, t);
    // Slight vibrato for realistic pea whistle
    osc1.frequency.setValueAtTime(2650, t + 0.05);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(2950, t);

    gain.gain.setValueAtTime(0.0, t);
    gain.gain.linearRampToValueAtTime(0.25, t + 0.02);
    gain.gain.setValueAtTime(0.25, t + duration - 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + duration + 0.02);
    osc2.stop(t + duration + 0.02);
  }

  /** Play UI Click feedback */
  public playClick(pitch: number = 600) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(pitch, t);
    osc.frequency.exponentialRampToValueAtTime(pitch * 1.5, t + 0.04);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.05);
  }

  /** Play Pack Walkout Fireworks / Fanfare */
  public playPackFanfare() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const chord = [330, 415, 495, 660, 830];
    chord.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.06);

      gain.gain.setValueAtTime(0.12, t + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2 + idx * 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t + idx * 0.06);
      osc.stop(t + 1.3 + idx * 0.06);
    });
  }

  /** Generate dynamic noise burst */
  private playNoise(duration: number, volume: number, filterFreq: number) {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(filterFreq, this.ctx.currentTime);
    filter.Q.value = 1.0;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start();
    noise.stop(this.ctx.currentTime + duration);
  }

  /** Live Commentary Voice using Web Speech API */
  public speakCommentary(phrase: string) {
    if (this.isMuted || !this.commentaryVoiceEnabled || !this.speechSynth) return;
    try {
      if (this.speechSynth.speaking) {
        this.speechSynth.cancel();
      }
      const utterance = new SpeechSynthesisUtterance(phrase);
      utterance.rate = 1.15; // slightly energetic football pace
      utterance.pitch = 1.08; // dynamic pitch
      utterance.volume = 0.85;

      const voices = this.speechSynth.getVoices();
      const englishVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Male') || v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Daniel') || v.name.includes('Arthur')));
      if (englishVoice) {
        utterance.voice = englishVoice;
      }
      this.speechSynth.speak(utterance);
    } catch {
      // Graceful fallback if speech synth is blocked
    }
  }
}

export const sound = new SoundEngine();
