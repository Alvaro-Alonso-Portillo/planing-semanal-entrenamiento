import { create } from 'zustand';
import { GymWorkout, EMOMBlock } from '../../domain/entities/Workout';
import { Exercise } from '../../domain/entities/Exercise';

export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed';

interface TimerState {
  status: TimerStatus;
  secondsRemaining: number; // 60 a 0
  currentBlockIndex: number; // 0 a 4 (Bloques 1 a 5)
  currentMinuteIndex: number; // 0 a 9 (Minutos 1 a 10)
  workout: GymWorkout | null;
  currentExercise: Exercise | null;
  nextExercise: Exercise | null;
  
  // Acciones
  setWorkout: (workout: GymWorkout) => void;
  start: () => void;
  pause: () => void;
  reset: () => void;
  tick: () => void;
  syncTime: (elapsedSeconds: number) => void; // Para sincronización al volver de segundo plano
}

const getExercisesForTime = (
  workout: GymWorkout | null,
  blockIndex: number,
  minuteIndex: number
): { current: Exercise | null; next: Exercise | null } => {
  if (!workout || blockIndex >= workout.blocks.length) {
    return { current: null, next: null };
  }

  const currentBlock = workout.blocks[blockIndex];
  
  // Minuto 0, 2, 4, 6, 8 (Minutos impares de entrenamiento: 1, 3, 5, 7, 9) -> Ejercicio A
  // Minuto 1, 3, 5, 7, 9 (Minutos pares de entrenamiento: 2, 4, 6, 8, 10) -> Ejercicio B
  const isA = minuteIndex % 2 === 0;
  const current = isA ? currentBlock.exerciseA : currentBlock.exerciseB;

  // Determinar el siguiente ejercicio
  let next: Exercise | null = null;
  if (minuteIndex < 9) {
    // Siguiente minuto en el mismo bloque
    next = isA ? currentBlock.exerciseB : currentBlock.exerciseA;
  } else if (blockIndex < workout.blocks.length - 1) {
    // Primer minuto del siguiente bloque
    const nextBlock = workout.blocks[blockIndex + 1];
    next = nextBlock.exerciseA;
  }

  return { current, next };
};

export const useTimerStore = create<TimerState>((set, get) => ({
  status: 'idle',
  secondsRemaining: 60,
  currentBlockIndex: 0,
  currentMinuteIndex: 0,
  workout: null,
  currentExercise: null,
  nextExercise: null,

  setWorkout: (workout) => {
    const { current, next } = getExercisesForTime(workout, 0, 0);
    set({
      workout,
      status: 'idle',
      secondsRemaining: 60,
      currentBlockIndex: 0,
      currentMinuteIndex: 0,
      currentExercise: current,
      nextExercise: next,
    });
  },

  start: () => {
    if (get().workout && get().status !== 'completed') {
      set({ status: 'running' });
    }
  },

  pause: () => {
    set({ status: 'paused' });
  },

  reset: () => {
    const { workout } = get();
    if (workout) {
      get().setWorkout(workout);
    } else {
      set({
        status: 'idle',
        secondsRemaining: 60,
        currentBlockIndex: 0,
        currentMinuteIndex: 0,
        currentExercise: null,
        nextExercise: null,
      });
    }
  },

  tick: () => {
    const { status, secondsRemaining, currentBlockIndex, currentMinuteIndex, workout } = get();
    if (status !== 'running' || !workout) return;

    if (secondsRemaining > 1) {
      set({ secondsRemaining: secondsRemaining - 1 });
    } else {
      // Llegamos al segundo 0 del minuto actual, pasamos al siguiente minuto
      let nextMinute = currentMinuteIndex + 1;
      let nextBlock = currentBlockIndex;

      if (nextMinute >= 10) {
        nextMinute = 0;
        nextBlock = currentBlockIndex + 1;
      }

      if (nextBlock >= workout.blocks.length) {
        set({
          status: 'completed',
          secondsRemaining: 0,
          currentExercise: null,
          nextExercise: null,
        });
      } else {
        const { current, next } = getExercisesForTime(workout, nextBlock, nextMinute);
        set({
          secondsRemaining: 60,
          currentMinuteIndex: nextMinute,
          currentBlockIndex: nextBlock,
          currentExercise: current,
          nextExercise: next,
        });
      }
    }
  },

  syncTime: (elapsedSeconds) => {
    const { workout, status } = get();
    if (!workout || status !== 'running') return;

    // Calcular la posición exacta en base a los segundos totales transcurridos
    const totalSeconds = elapsedSeconds;
    const totalMinutes = Math.floor(totalSeconds / 60);
    
    const blockIndex = Math.floor(totalMinutes / 10);
    const minuteIndex = totalMinutes % 10;
    const secondsRemaining = 60 - (totalSeconds % 60);

    if (blockIndex >= workout.blocks.length) {
      set({
        status: 'completed',
        secondsRemaining: 0,
        currentExercise: null,
        nextExercise: null,
      });
    } else {
      const { current, next } = getExercisesForTime(workout, blockIndex, minuteIndex);
      set({
        currentBlockIndex: blockIndex,
        currentMinuteIndex: minuteIndex,
        secondsRemaining,
        currentExercise: current,
        nextExercise: next,
      });
    }
  },
}));
