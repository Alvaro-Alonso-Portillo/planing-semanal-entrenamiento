import { useTimerStore } from './presentation/state/useTimerStore';
import { WorkoutGenerator } from './domain/usecases/WorkoutGenerator';
import { seedExercises } from './data/database/seedData';

function runTimerTests() {
  console.log('=== INICIANDO VALIDACIÓN DEL TEMPORIZADOR EMOM ===\n');

  // 1. Generar un entrenamiento de gimnasio
  const workout = WorkoutGenerator.generateGymWorkout(seedExercises);
  console.log(`Entrenamiento generado para el test: ${workout.name}`);

  const store = useTimerStore.getState();
  
  // 2. Cargar entrenamiento en el Store
  useTimerStore.getState().setWorkout(workout);
  
  const initialStore = useTimerStore.getState();
  console.log(`\nEstado Inicial:`);
  console.log(`- Estatus: ${initialStore.status}`);
  console.log(`- Bloque actual: ${initialStore.currentBlockIndex + 1}/5`);
  console.log(`- Minuto del bloque: ${initialStore.currentMinuteIndex + 1}/10`);
  console.log(`- Ejercicio Actual (Minuto Impar): ${initialStore.currentExercise?.name}`);
  console.log(`- Ejercicio Siguiente: ${initialStore.nextExercise?.name}`);

  // 3. Simular ticks rápidos del reloj (para acelerar el test)
  console.log(`\nSimulando 3 ticks de un segundo...`);
  useTimerStore.getState().start();
  useTimerStore.getState().tick();
  useTimerStore.getState().tick();
  useTimerStore.getState().tick();
  console.log(`- Segundos restantes del minuto actual: ${useTimerStore.getState().secondsRemaining}s`);

  // 4. Simular sincronización de fondo (simular que han pasado 9 minutos y 58 segundos = 598 segundos)
  console.log(`\n[BACKGROUND SIMULATION] Simulando que han pasado 9 minutos y 58 segundos (598s)...`);
  useTimerStore.getState().syncTime(598);
  let state = useTimerStore.getState();
  console.log(`- Estatus: ${state.status}`);
  console.log(`- Minuto del bloque actual: ${state.currentMinuteIndex + 1}/10 (Debe ser el minuto 10)`);
  console.log(`- Ejercicio Actual: ${state.currentExercise?.name}`);
  console.log(`- Ejercicio Siguiente (Primer minuto del bloque 2): ${state.nextExercise?.name}`);
  console.log(`- Segundos restantes en este minuto: ${state.secondsRemaining}s (Debe ser 2s)`);

  // 5. Simular 2 ticks más para ver si hace la transición de Bloque (cruza del bloque 1 al bloque 2)
  console.log(`\nSimulando 2 ticks más para cruzar al Bloque 2...`);
  useTimerStore.getState().tick(); // llega a 1s
  useTimerStore.getState().tick(); // llega a 0s -> transiciona al minuto 0 del bloque 2
  
  state = useTimerStore.getState();
  console.log(`- Bloque actual: ${state.currentBlockIndex + 1}/5 (Debe ser el Bloque 2)`);
  console.log(`- Minuto del bloque actual: ${state.currentMinuteIndex + 1}/10 (Debe ser el minuto 1)`);
  console.log(`- Ejercicio Actual: ${state.currentExercise?.name}`);
  console.log(`- Ejercicio Siguiente: ${state.nextExercise?.name}`);
  console.log(`- Segundos restantes: ${state.secondsRemaining}s`);

  // 6. Simular sincronización de fondo al final del entrenamiento (simular que han pasado 50 minutos = 3000s)
  console.log(`\n[BACKGROUND SIMULATION] Simulando fin del entrenamiento completo (50 minutos = 3000s)...`);
  useTimerStore.getState().start();
  useTimerStore.getState().syncTime(3000);
  state = useTimerStore.getState();
  console.log(`- Estatus: ${state.status} (Debe ser 'completed')`);
  console.log(`- Ejercicio actual: ${state.currentExercise}`);
  console.log(`- Ejercicio siguiente: ${state.nextExercise}`);

  console.log('\n=== VALIDACIÓN DEL TEMPORIZADOR COMPLETADA CON ÉXITO ===');
}

runTimerTests();
