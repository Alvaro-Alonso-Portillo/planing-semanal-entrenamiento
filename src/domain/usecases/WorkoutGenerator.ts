import { Exercise } from '../entities/Exercise';
import { GymWorkout, SwimWorkout, EMOMBlock, SwimInterval } from '../entities/Workout';

export class WorkoutGenerator {
  /**
   * Genera un entrenamiento de gimnasio estructurado en 5 bloques EMOM independientes.
   * Filtra ejercicios de Tren Superior (Empuje, Tirón) y Core que NO requieran apoyo de pie.
   */
  static generateGymWorkout(availableExercises: Exercise[]): GymWorkout {
    // 1. Filtrar ejercicios válidos según restricciones médicas y musculares
    const validExercises = availableExercises.filter(
      (ex) =>
        (ex.category === 'Empuje' || ex.category === 'Tirón' || ex.category === 'Core') &&
        !ex.requiresFootSupport &&
        (ex.cardiacIntensity === 'baja' || ex.cardiacIntensity === 'media')
    );

    if (validExercises.length < 2) {
      throw new Error(
        'No hay suficientes ejercicios disponibles en la base de datos que cumplan con la restricción de NO apoyar el pie.'
      );
    }

    const emomBlocks: EMOMBlock[] = [];
    const pool = [...validExercises];
    
    // Mezclar el pool de ejercicios
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    for (let i = 1; i <= 5; i++) {
      let exerciseA: Exercise;
      let exerciseB: Exercise;

      if (pool.length >= 2) {
        exerciseA = pool.pop()!;
        exerciseB = pool.pop()!;
      } else {
        // Fallback si no quedan suficientes ejercicios únicos en el pool
        const remainingValid = validExercises.filter(ex => !pool.includes(ex));
        exerciseA = remainingValid.length > 0 
          ? remainingValid[Math.floor(Math.random() * remainingValid.length)] 
          : validExercises[Math.floor(Math.random() * validExercises.length)];
        
        let attempts = 0;
        do {
          exerciseB = validExercises[Math.floor(Math.random() * validExercises.length)];
          attempts++;
        } while (exerciseA.id === exerciseB.id && attempts < 50);
      }

      emomBlocks.push({
        blockNumber: i,
        durationMinutes: 10,
        repetitionsPerMinute: 10,
        exerciseA,
        exerciseB,
      });
    }

    const today = new Date().toISOString().split('T')[0];

    return {
      id: this.generateUUID(),
      name: `EMOM Híbrido Superior/Core - ${today}`,
      type: 'Gimnasio',
      date: today,
      blocks: emomBlocks,
    };
  }

  /**
   * Genera un entrenamiento de natación adaptado a nivel principiante (Volumen ~1000m).
   */
  static generateSwimWorkout(): SwimWorkout {
    const today = new Date().toISOString().split('T')[0];

    // Fases predefinidas con reglas estructuradas para principiante sumando exactamente 1000m
    const warmup: SwimInterval[] = [
      {
        distanceMeters: 50,
        repetitions: 4,
        style: 'Variado',
        description: 'Nado continuo suave alternando estilos por serie para calentar articulaciones.',
        restSeconds: 20,
      }, // 200m
    ];

    const legs: SwimInterval[] = [
      {
        distanceMeters: 50,
        repetitions: 3,
        style: 'Piernas con Tabla',
        description: 'Batido de piernas con tabla. Mantener ritmo constante y respiración controlada.',
        restSeconds: 30,
      }, // 150m
    ];

    const mainBlock: SwimInterval[] = [
      {
        distanceMeters: 50,
        repetitions: 6,
        style: 'Crol',
        description: 'Bloque principal: Enfoque en deslizar y mantener el codo alto. Intensidad media.',
        restSeconds: 25,
      }, // 300m
      {
        distanceMeters: 50,
        repetitions: 2,
        style: 'Espalda',
        description: 'Pincelada técnica: Trabajo de rotación de hombros y recuperación activa.',
        restSeconds: 30,
      }, // 100m
      {
        distanceMeters: 50,
        repetitions: 3,
        style: 'Crol',
        description: 'Crol enfocado en acelerar levemente la última mitad de cada largo.',
        restSeconds: 25,
      }, // 150m (Total bloque principal = 550m)
    ];

    const cooldown: SwimInterval[] = [
      {
        distanceMeters: 50,
        repetitions: 2,
        style: 'Estilos',
        description: 'Nado muy suave y relajado (estilo a elección) para bajar pulsaciones.',
        restSeconds: 20,
      }, // 100m
    ];

    const totalDistanceMeters =
      warmup.reduce((sum, int) => sum + int.distanceMeters * int.repetitions, 0) +
      legs.reduce((sum, int) => sum + int.distanceMeters * int.repetitions, 0) +
      mainBlock.reduce((sum, int) => sum + int.distanceMeters * int.repetitions, 0) +
      cooldown.reduce((sum, int) => sum + int.distanceMeters * int.repetitions, 0);

    return {
      id: this.generateUUID(),
      name: `Rutina Natación Principiante 1000m - ${today}`,
      type: 'Natación',
      date: today,
      warmup,
      legs,
      mainBlock,
      cooldown,
      totalDistanceMeters,
    };
  }

  /**
   * Generador de UUIDs compatible con entornos móviles ligeros sin dependencias externas
   */
  private static generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}
