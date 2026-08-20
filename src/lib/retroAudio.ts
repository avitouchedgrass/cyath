'use client';

// Lightweight 8-bit Web Audio API Sound Synthesizer (Zero Dependencies)

class RetroAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  public getMuted() {
    return this.isMuted;
  }

  // Quick 8-bit blip (hover or small interaction)
  public playBlip() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      const now = this.ctx.currentTime;

      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880.00, now + 0.05); // A5

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch {
      // Ignore if blocked by browser policy
    }
  }

  // 8-bit frequency sweep / scan sound (dish transition / pixel wave)
  public playScanWipe() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(261.63, now); // C4
      osc.frequency.linearRampToValueAtTime(523.25, now + 0.08); // C5
      osc.frequency.linearRampToValueAtTime(783.99, now + 0.14); // G5

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.16);
    } catch {
      // Ignore
    }
  }

  // Tactile mechanical 8-bit confirm chime (Inspect recipe click)
  public playInspectConfirm() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      
      [
        { freq: 440, delay: 0 },
        { freq: 659.25, delay: 0.06 },
        { freq: 880, delay: 0.12 },
      ].forEach(({ freq, delay }) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, now + delay);

        gain.gain.setValueAtTime(0.09, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.1);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + delay);
        osc.stop(now + delay + 0.1);
      });
    } catch {
      // Ignore
    }
  }
}

export const retroAudio = new RetroAudioEngine();
