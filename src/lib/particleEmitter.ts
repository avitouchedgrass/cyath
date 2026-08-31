// Zero-dependency global particle burst event emitter for XP flight physics

type XpParticleListener = (event: { x: number; y: number; amount?: number }) => void;

class ParticleEmitter {
  private listeners: Set<XpParticleListener> = new Set();

  subscribe(listener: XpParticleListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  emit(x: number, y: number, amount: number = 10): void {
    this.listeners.forEach((listener) => {
      try {
        listener({ x, y, amount });
      } catch (err) {
        console.error('Particle emission error:', err);
      }
    });
  }
}

export const xpParticleEmitter = new ParticleEmitter();
