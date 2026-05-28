import { WorkoutGenerator } from './domain/usecases/WorkoutGenerator';
import { seedExercises } from './data/database/seedData';

function runTests() {
  console.log('=== INICIANDO VALIDACIÓN DEL GENERADOR DE ENTRENAMIENTOS ===\n');

  // Test 1: Gimnasio
  try {
    const gymWorkout = WorkoutGenerator.generateGymWorkout(seedExercises);
    console.log(`✅ Entrenamiento de Gimnasio Generado Correctamente: "${gymWorkout.name}"`);
    console.log(`Tipo de entrenamiento: ${gymWorkout.type}`);
    console.log(`Número de bloques EMOM: ${gymWorkout.blocks.length}`);

    // Verificar restricciones
    let pieApoyadoDetectado = false;
    gymWorkout.blocks.forEach((block) => {
      if (block.exerciseA.requiresFootSupport || block.exerciseB.requiresFootSupport) {
        pieApoyadoDetectado = true;
      }
      console.log(`  - Bloque ${block.blockNumber} (EMOM 10 Min):`);
      console.log(`    Minuto Impar: ${block.exerciseA.name} (${block.exerciseA.category}) - Reps: ${block.repetitionsPerMinute}`);
      console.log(`    Minuto Par: ${block.exerciseB.name} (${block.exerciseB.category}) - Reps: ${block.repetitionsPerMinute}`);
    });

    if (pieApoyadoDetectado) {
      console.error('❌ ERROR DE RESTRICCIÓN: Se detectó un ejercicio que requiere apoyo de pie.');
    } else {
      console.log('✅ RESTRICCIÓN CUMPLIDA: Ningún ejercicio requiere apoyo del pie.');
    }
  } catch (error: unknown) {
    console.error('❌ Error al generar entrenamiento de gimnasio:', error instanceof Error ? error.message : error);
  }

  console.log('\n--------------------------------------------------\n');

  // Test 2: Natación
  try {
    const swimWorkout = WorkoutGenerator.generateSwimWorkout();
    console.log(`✅ Entrenamiento de Natación Generado Correctamente: "${swimWorkout.name}"`);
    console.log(`Volumen Total Calculado: ${swimWorkout.totalDistanceMeters}m`);
    
    if (swimWorkout.totalDistanceMeters === 1000) {
      console.log('✅ VOLUMEN CUMPLIDO: La sesión suma exactamente 1000 metros.');
    } else {
      console.error(`❌ ERROR DE VOLUMEN: Se esperaban 1000m, pero se calcularon ${swimWorkout.totalDistanceMeters}m.`);
    }

    console.log('\nDesglose de Natación:');
    console.log(`  - Calentamiento: ${swimWorkout.warmup.reduce((s, i) => s + i.distanceMeters * i.repetitions, 0)}m`);
    console.log(`  - Piernas (con tabla): ${swimWorkout.legs.reduce((s, i) => s + i.distanceMeters * i.repetitions, 0)}m`);
    console.log(`  - Bloque Principal: ${swimWorkout.mainBlock.reduce((s, i) => s + i.distanceMeters * i.repetitions, 0)}m`);
    console.log(`  - Vuelta a la Calma: ${swimWorkout.cooldown.reduce((s, i) => s + i.distanceMeters * i.repetitions, 0)}m`);

  } catch (error: unknown) {
    console.error('❌ Error al generar entrenamiento de natación:', error instanceof Error ? error.message : error);
  }
}

runTests();
