// Clean global emitter (particles disabled for serene editorial aesthetic)

type XpParticleListener = (event: { x: number; y: number; amount?: number }) => void;

class ParticleEmitter {
  subscribe(_listener: XpParticleListener): () => void {
    return () => {};
  }

  emit(_x: number, _y: number, _amount: number = 10): void {
    // Disabled globally
  }
}

export const xpParticleEmitter = new ParticleEmitter();
