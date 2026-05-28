import { beforeEach, describe, expect, it, vi } from 'vitest';
import { seedExercises } from '../../data/database/seedData';
import { WorkoutGenerator } from '../../domain/usecases/WorkoutGenerator';
import { useTimerStore } from './useTimerStore';

const storage = new Map<string, string>();

const localStorageMock: Storage = {
  get length() {
    return storage.size;
  },
  clear: vi.fn(() => storage.clear()),
  getItem: vi.fn((key: string) => storage.get(key) ?? null),
  key: vi.fn((index: number) => Array.from(storage.keys())[index] ?? null),
  removeItem: vi.fn((key: string) => storage.delete(key)),
  setItem: vi.fn((key: string, value: string) => {
    storage.set(key, value);
  }),
};

describe('useTimerStore', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', localStorageMock);
    storage.clear();
    vi.clearAllMocks();
    useTimerStore.setState({
      status: 'idle',
      secondsRemaining: 60,
      currentBlockIndex: 0,
      currentMinuteIndex: 0,
      workout: null,
      currentExercise: null,
      nextExercise: null,
      waitingForBlockStart: false,
      elapsedSeconds: 0,
    });
  });

  it('pauses at the start of the next block when synced across a block boundary', () => {
    const workout = WorkoutGenerator.generateGymWorkout(seedExercises);

    useTimerStore.getState().setWorkout(workout);
    useTimerStore.getState().start();
    useTimerStore.getState().syncTime(600);

    const state = useTimerStore.getState();
    expect(state.status).toBe('paused');
    expect(state.waitingForBlockStart).toBe(true);
    expect(state.currentBlockIndex).toBe(1);
    expect(state.currentMinuteIndex).toBe(0);
    expect(state.secondsRemaining).toBe(60);
    expect(state.currentExercise).toEqual(workout.blocks[1].exerciseA);
  });

  it('records the full gym duration when the final synced minute completes', () => {
    const workout = WorkoutGenerator.generateGymWorkout(seedExercises);

    useTimerStore.getState().setWorkout(workout);
    useTimerStore.getState().start();
    useTimerStore.getState().syncTime(3000);

    const history = JSON.parse(storage.get('workout_history') ?? '[]');
    expect(useTimerStore.getState().status).toBe('completed');
    expect(history[0]).toMatchObject({
      id: workout.id,
      type: 'Gimnasio',
      durationMinutes: 50,
    });
  });
});
