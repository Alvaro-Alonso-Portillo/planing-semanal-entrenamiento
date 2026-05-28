import { describe, expect, it } from 'vitest';
import { seedExercises } from '../../data/database/seedData';
import { WorkoutGenerator } from './WorkoutGenerator';

describe('WorkoutGenerator', () => {
  it('generates five gym EMOM blocks without foot support exercises', () => {
    const workout = WorkoutGenerator.generateGymWorkout(seedExercises);

    expect(workout.type).toBe('Gimnasio');
    expect(workout.blocks).toHaveLength(5);

    for (const block of workout.blocks) {
      expect(block.durationMinutes).toBe(10);
      expect(block.repetitionsPerMinute).toBe(10);
      expect(block.exerciseA.requiresFootSupport).toBe(false);
      expect(block.exerciseB.requiresFootSupport).toBe(false);
      expect(['Empuje', 'Tirón', 'Core']).toContain(block.exerciseA.category);
      expect(['Empuje', 'Tirón', 'Core']).toContain(block.exerciseB.category);
      expect(['baja', 'media']).toContain(block.exerciseA.cardiacIntensity);
      expect(['baja', 'media']).toContain(block.exerciseB.cardiacIntensity);
    }
  });

  it('generates a beginner swim workout with exactly 1000 meters', () => {
    const workout = WorkoutGenerator.generateSwimWorkout();

    expect(workout.type).toBe('Natación');
    expect(workout.totalDistanceMeters).toBe(1000);
  });
});
