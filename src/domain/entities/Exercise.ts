export type ExerciseCategory = 'Empuje' | 'Tirón' | 'Core' | 'Natación';
export type SwimStyle = 'Crol' | 'Espalda' | 'Braza';
export type CardiacIntensity = 'baja' | 'media';

export interface Exercise {
  id: number;
  name: string;
  category: ExerciseCategory;
  style?: SwimStyle | null;
  requiresFootSupport: boolean;
  cardiacIntensity: CardiacIntensity;
}
