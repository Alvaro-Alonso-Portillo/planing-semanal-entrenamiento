import React, { useState } from 'react';
import { useTimerStore } from './presentation/state/useTimerStore';
import { WorkoutGenerator } from './domain/usecases/WorkoutGenerator';
import { seedExercises } from './data/database/seedData';
import { TimerScreen } from './presentation/screens/TimerScreen';
import { GymWorkout, SwimWorkout } from './domain/entities/Workout';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<'home' | 'timer'>('home');
  const [selectedWorkout, setSelectedWorkout] = useState<GymWorkout | SwimWorkout | null>(null);
  const setWorkout = useTimerStore((state) => state.setWorkout);

  const handleGenerateGym = () => {
    try {
      const workout = WorkoutGenerator.generateGymWorkout(seedExercises);
      setSelectedWorkout(workout);
      setWorkout(workout);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleGenerateSwim = () => {
    const workout = WorkoutGenerator.generateSwimWorkout();
    setSelectedWorkout(workout);
  };

  const handleStartWorkout = () => {
    if (selectedWorkout?.type === 'Gimnasio') {
      setActiveScreen('timer');
      useTimerStore.getState().start();
    }
  };

  const handleCancelWorkout = () => {
    setActiveScreen('home');
    setSelectedWorkout(null);
  };

  return (
    <div className="app-layout">
      {activeScreen === 'timer' && selectedWorkout?.type === 'Gimnasio' ? (
        <TimerScreen onCancel={handleCancelWorkout} />
      ) : (
        <div className="home-container">
          <header className="home-header">
            <span className="app-logo">⚡</span>
            <h1 className="app-title">Hybrid Training Hub</h1>
            <p className="app-subtitle">Tu planificador inteligente de natación y gimnasio</p>
          </header>

          <main className="menu-container">
            <section className="selection-section">
              <h2 className="section-title">Generador de Rutina Diaria</h2>
              <div className="button-grid">
                <button className="workout-selector-btn gym" onClick={handleGenerateGym}>
                  <span className="btn-icon">🏋️‍♂️</span>
                  <div className="btn-info">
                    <span className="btn-title">Gimnasio</span>
                    <span className="btn-subtitle">EMOM • Sin apoyo de pie</span>
                  </div>
                </button>

                <button className="workout-selector-btn swim" onClick={handleGenerateSwim}>
                  <span className="btn-icon">🏊‍♂️</span>
                  <div className="btn-info">
                    <span className="btn-title">Natación</span>
                    <span className="btn-subtitle">Principiante • ~1000 metros</span>
                  </div>
                </button>
              </div>
            </section>

            {selectedWorkout && (
              <section className="preview-section">
                <h3 className="preview-title">Rutina Generada:</h3>
                <div className="preview-card">
                  <h4 className="workout-name">{selectedWorkout.name}</h4>
                  
                  {selectedWorkout.type === 'Gimnasio' ? (
                    <div className="gym-preview-details">
                      <p className="workout-desc">5 bloques EMOM de 10 minutos cada uno (10 repeticiones por minuto).</p>
                      <ul className="preview-list">
                        {(selectedWorkout as GymWorkout).blocks.map((block) => (
                          <li key={block.blockNumber} className="preview-list-item">
                            <strong>Bloque {block.blockNumber}:</strong> 
                            <div className="alternating-exercises">
                              <span>Min impar: {block.exerciseA.name}</span>
                              <span>Min par: {block.exerciseB.name}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                      <button className="start-workout-btn" onClick={handleStartWorkout}>
                        Iniciar Temporizador
                      </button>
                    </div>
                  ) : (
                    <div className="swim-preview-details">
                      <p className="workout-desc">Volumen total planificado: <strong>{(selectedWorkout as SwimWorkout).totalDistanceMeters}m</strong></p>
                      
                      {/* Timeline Deportivo para Natacion */}
                      <div className="swim-timeline">
                        {/* Calentamiento */}
                        {(selectedWorkout as SwimWorkout).warmup.map((i, idx) => (
                          <div className="timeline-item" key={`wu-${idx}`}>
                            <div className="timeline-marker" />
                            <div className="timeline-content">
                              <div className="timeline-header">
                                <h5 className="timeline-phase-title">Calentamiento</h5>
                                <span className="timeline-distance-badge">{i.repetitions}x{i.distanceMeters}m</span>
                              </div>
                              <p className="timeline-desc">{i.description}</p>
                              <div className="timeline-footer">
                                <span className="timeline-badge">Descanso: {i.style} ({i.restSeconds}s)</span>
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Piernas */}
                        {(selectedWorkout as SwimWorkout).legs.map((i, idx) => (
                          <div className="timeline-item" key={`leg-${idx}`}>
                            <div className="timeline-marker" />
                            <div className="timeline-content">
                              <div className="timeline-header">
                                <h5 className="timeline-phase-title">Piernas (Tabla)</h5>
                                <span className="timeline-distance-badge">{i.repetitions}x{i.distanceMeters}m</span>
                              </div>
                              <p className="timeline-desc">{i.description}</p>
                              <div className="timeline-footer">
                                <span className="timeline-badge">Descanso: {i.style} ({i.restSeconds}s)</span>
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Bloque Principal */}
                        {(selectedWorkout as SwimWorkout).mainBlock.map((i, idx) => (
                          <div className="timeline-item" key={`mb-${idx}`}>
                            <div className="timeline-marker" />
                            <div className="timeline-content">
                              <div className="timeline-header">
                                <h5 className="timeline-phase-title">Bloque Principal</h5>
                                <span className="timeline-distance-badge">{i.repetitions}x{i.distanceMeters}m</span>
                              </div>
                              <p className="timeline-desc">{i.description}</p>
                              <div className="timeline-footer">
                                <span className="timeline-badge">Descanso: {i.style} ({i.restSeconds}s)</span>
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Vuelta a la calma */}
                        {(selectedWorkout as SwimWorkout).cooldown.map((i, idx) => (
                          <div className="timeline-item" key={`cd-${idx}`}>
                            <div className="timeline-marker" />
                            <div className="timeline-content">
                              <div className="timeline-header">
                                <h5 className="timeline-phase-title">Vuelta a la Calma</h5>
                                <span className="timeline-distance-badge">{i.repetitions}x{i.distanceMeters}m</span>
                              </div>
                              <p className="timeline-desc">{i.description}</p>
                              <div className="timeline-footer">
                                <span className="timeline-badge">Descanso: {i.style} ({i.restSeconds}s)</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}
          </main>
        </div>
      )}
    </div>
  );
}
