export interface ProgressionEvents {
  'xp:gained': { amount: number; reason: string; totalXp: number };
  'level:up': { oldLevel: number; newLevel: number; title: string; unlockedTitle?: string };
  'streak:milestone': { days: number; milestoneName: string; xpAwarded: number };
  'quest:completed': { questId: string; title: string; xpAwarded: number };
}

type Handler<T> = (data: T) => void;

class ProgressionEventBus {
  private handlers: Map<keyof ProgressionEvents, Set<Handler<any>>> = new Map();

  public on<K extends keyof ProgressionEvents>(event: K, handler: Handler<ProgressionEvents[K]>): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);

    return () => {
      this.off(event, handler);
    };
  }

  public off<K extends keyof ProgressionEvents>(event: K, handler: Handler<ProgressionEvents[K]>): void {
    const set = this.handlers.get(event);
    if (!set) return;
    set.delete(handler);
  }

  public emit<K extends keyof ProgressionEvents>(event: K, data: ProgressionEvents[K]): void {
    const set = this.handlers.get(event);
    if (!set) return;
    for (const handler of Array.from(set)) {
      try {
        handler(data);
      } catch (err) {
        console.error(`Error in progression event handler for ${event}:`, err);
      }
    }
  }
}

export const progressionEvents = new ProgressionEventBus();
