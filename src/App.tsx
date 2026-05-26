import React, { useState } from 'react';
import { useTimerStore } from './presentation/state/useTimerStore';
import { WorkoutGenerator } from './domain/usecases/WorkoutGenerator';
import { seedExercises } from './data/database/seedData';
import { TimerScreen } from './presentation/screens/TimerScreen';
import { GymWorkout, SwimWorkout } from './domain/entities/Workout';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<'home' | 'timer'>('home');
  const [selectedWorkout, setSelectedWorkout] = useState<GymWorkout | SwimWorkout | null>(null);
  const [isSwimCompleted, setIsSwimCompleted] = useState<boolean>(false);
  
  const setWorkout = useTimerStore((state) => state.setWorkout);
  const completeWorkout = useTimerStore((state) => state.completeWorkout);

  const handleGenerateGym = () => {
    try {
      setIsSwimCompleted(false);
      const workout = WorkoutGenerator.generateGymWorkout(seedExercises);
      setSelectedWorkout(workout);
      setWorkout(workout);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleGenerateSwim = () => {
    setIsSwimCompleted(false);
    const workout = WorkoutGenerator.generateSwimWorkout();
    setSelectedWorkout(workout);
    setWorkout(workout);
  };

  const handleStartWorkout = () => {
    if (selectedWorkout?.type === 'Gimnasio') {
      setActiveScreen('timer');
      useTimerStore.getState().start();
    }
  };

  const handleCompleteSwim = () => {
    if (window.confirm('¿Confirmas que has terminado esta sesión de natación?')) {
      completeWorkout();
      setIsSwimCompleted(true);
    }
  };

  const handleCancelWorkout = () => {
    setActiveScreen('home');
    setSelectedWorkout(null);
    setIsSwimCompleted(false);
  };

  return (
    <div className="app-layout">
      {activeScreen === 'timer' && selectedWorkout?.type === 'Gimnasio' ? (
        <TimerScreen onCancel={handleCancelWorkout} />
      ) : (
        <div className="home-container">
          <header className="home-header">
            <div className="logo-badge">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="logo-svg">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                <path d="M2 4h2" />
                <path d="M22 4h-2" />
                <path d="M12 2v2" />
              </svg>
            </div>
            <h1 className="app-title">Hybrid Fit Planner</h1>
            <p className="app-subtitle">Tu planificador inteligente de natación y gimnasio</p>
          </header>

          <main className="menu-container">
            <section className="selection-section">
              <h2 className="section-title">Generador de Rutina Diaria</h2>
              <div className="button-grid">
                <button className="workout-selector-btn gym" onClick={handleGenerateGym}>
                  <span className="btn-icon">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6.5 6.5h11M6.5 17.5h11M3 21h18M3 3h18M6.5 6.5v11M17.5 6.5v11" />
                    </svg>
                  </span>
                  <div className="btn-info">
                    <span className="btn-title">Gimnasio</span>
                    <span className="btn-subtitle">EMOM • Sin apoyo de pie</span>
                  </div>
                </button>

                <button className="workout-selector-btn swim" onClick={handleGenerateSwim}>
                  <span className="btn-icon">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 12h20M2 16h20M2 8h20M12 2v6" />
                    </svg>
                  </span>
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
                
                {isSwimCompleted && selectedWorkout.type === 'Natación' ? (
                  <div className="preview-card completion-container" style={{ padding: '32px 24px' }}>
                    <div className="completion-icon-wrapper blue">
                      <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="completion-svg">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                    </div>
                    <h2 className="completion-title" style={{ color: 'var(--accent-blue)' }}>¡Sesión de Natación Completada!</h2>
                    <p className="completion-subtitle">¡Excelente nado! Has completado los 1000 metros con éxito y se ha guardado en tu historial.</p>
                    <button className="back-button primary swim-color" onClick={handleCancelWorkout}>
                      Volver al Menú
                    </button>
                  </div>
                ) : (
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
                                  <span className="timeline-badge">{i.style} ({i.restSeconds}s)</span>
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
                                  <span className="timeline-badge">{i.style} ({i.restSeconds}s)</span>
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
                                  <span className="timeline-badge">{i.style} ({i.restSeconds}s)</span>
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
                                  <span className="timeline-badge">{i.style} ({i.restSeconds}s)</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <button className="start-workout-btn swim-color" onClick={handleCompleteSwim}>
                          Completar Sesión de Natación
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </section>
            )}
          </main>
        </div>
      )}
    </div>
  );
}
