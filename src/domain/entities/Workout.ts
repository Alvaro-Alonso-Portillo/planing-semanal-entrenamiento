import { Exercise, SwimStyle } from './Exercise';

export interface EMOMBlock {
  blockNumber: number; // 1 a 5
  durationMinutes: number; // 10 minutos
  repetitionsPerMinute: number; // 10 reps
  exerciseA: Exercise;
  exerciseB: Exercise; // Alternados por minuto (A impar, B par)
}

export interface GymWorkout {
  id: string;
  name: string;
  type: 'Gimnasio';
  date: string;
  blocks: EMOMBlock[];
}

export interface SwimInterval {
  distanceMeters: number; // metros por repetición (ej: 50)
  repetitions: number; // número de repeticiones (ej: 4)
  style: SwimStyle | 'Variado' | 'Estilos' | 'Piernas con Tabla';
  description: string;
  restSeconds: number;
}

export interface SwimWorkout {
  id: string;
  name: string;
  type: 'Natación';
  date: string;
  warmup: SwimInterval[];
  legs: SwimInterval[];
  mainBlock: SwimInterval[];
  cooldown: SwimInterval[];
  totalDistanceMeters: number;
}

export type Workout = GymWorkout | SwimWorkout;
