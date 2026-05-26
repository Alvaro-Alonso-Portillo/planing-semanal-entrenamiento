import { create } from 'zustand';
import { GymWorkout, EMOMBlock, SwimWorkout } from '../../domain/entities/Workout';
import { Exercise } from '../../domain/entities/Exercise';

export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed';

interface TimerState {
  status: TimerStatus;
  secondsRemaining: number; // 60 a 0
  currentBlockIndex: number; // 0 a 4 (Bloques 1 a 5)
  currentMinuteIndex: number; // 0 a 9 (Minutos 1 a 10)
  workout: GymWorkout | SwimWorkout | null;
  currentExercise: Exercise | null;
  nextExercise: Exercise | null;
  
  // Acciones
  setWorkout: (workout: GymWorkout | SwimWorkout) => void;
  start: () => void;
  pause: () => void;
  reset: () => void;
  tick: () => void;
  syncTime: (elapsedSeconds: number) => void; 
  completeWorkout: () => void; // Finalización manual y guardado en historial
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
  const isA = minuteIndex % 2 === 0;
  const current = isA ? currentBlock.exerciseA : currentBlock.exerciseB;

  let next: Exercise | null = null;
  if (minuteIndex < 9) {
    next = isA ? currentBlock.exerciseB : currentBlock.exerciseA;
  } else if (blockIndex < workout.blocks.length - 1) {
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
    if (workout.type === 'Gimnasio') {
      const { current, next } = getExercisesForTime(workout as GymWorkout, 0, 0);
      set({
        workout,
        status: 'idle',
        secondsRemaining: 60,
        currentBlockIndex: 0,
        currentMinuteIndex: 0,
        currentExercise: current,
        nextExercise: next,
      });
    } else {
      // Para natación
      set({
        workout,
        status: 'idle',
        secondsRemaining: 0,
        currentBlockIndex: 0,
        currentMinuteIndex: 0,
        currentExercise: null,
        nextExercise: null,
      });
    }
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
    if (status !== 'running' || !workout || workout.type !== 'Gimnasio') return;

    const gymWorkout = workout as GymWorkout;

    if (secondsRemaining > 1) {
      set({ secondsRemaining: secondsRemaining - 1 });
    } else {
      let nextMinute = currentMinuteIndex + 1;
      let nextBlock = currentBlockIndex;

      if (nextMinute >= 10) {
        nextMinute = 0;
        nextBlock = currentBlockIndex + 1;
      }

      if (nextBlock >= gymWorkout.blocks.length) {
        // Completar automáticamente al expirar el tiempo total
        get().completeWorkout();
      } else {
        const { current, next } = getExercisesForTime(gymWorkout, nextBlock, nextMinute);
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
    if (!workout || status !== 'running' || workout.type !== 'Gimnasio') return;

    const gymWorkout = workout as GymWorkout;
    const totalSeconds = elapsedSeconds;
    const totalMinutes = Math.floor(totalSeconds / 60);
    
    const blockIndex = Math.floor(totalMinutes / 10);
    const minuteIndex = totalMinutes % 10;
    const secondsRemaining = 60 - (totalSeconds % 60);

    if (blockIndex >= gymWorkout.blocks.length) {
      get().completeWorkout();
    } else {
      const { current, next } = getExercisesForTime(gymWorkout, blockIndex, minuteIndex);
      set({
        currentBlockIndex: blockIndex,
        currentMinuteIndex: minuteIndex,
        secondsRemaining,
        currentExercise: current,
        nextExercise: next,
      });
    }
  },

  completeWorkout: () => {
    const { workout, currentBlockIndex, currentMinuteIndex } = get();
    if (!workout) return;

    // Calcular duración real entrenada
    let duration = 0;
    if (workout.type === 'Gimnasio') {
      duration = currentBlockIndex * 10 + currentMinuteIndex;
    } else {
      duration = 45; // Duración estimada para natación
    }

    const log = {
      id: workout.id,
      name: workout.name,
      type: workout.type,
      completedAt: new Date().toISOString(),
      durationMinutes: duration > 0 ? duration : 1,
      totalDistanceMeters: workout.type === 'Natación' ? (workout as SwimWorkout).totalDistanceMeters : null,
    };

    // Guardar en el historial de localStorage
    try {
      const historyJson = localStorage.getItem('workout_history');
      const history = historyJson ? JSON.parse(historyJson) : [];
      history.unshift(log); // Colocar al inicio del historial
      localStorage.setItem('workout_history', JSON.stringify(history));
    } catch (e) {
      console.warn('No se pudo guardar en el historial local:', e);
    }

    set({
      status: 'completed',
      secondsRemaining: 0,
      currentExercise: null,
      nextExercise: null,
    });
  },
}));
