import React, { useState, useEffect } from 'react';
import { useTimerStore } from '../state/useTimerStore';
import { useWebTimer } from '../hooks/useWebTimer';

interface TimerScreenProps {
  onCancel: () => void;
}

export const TimerScreen: React.FC<TimerScreenProps> = ({ onCancel }) => {
  const { status, secondsRemaining, pause } = useWebTimer();
  const {
    currentBlockIndex,
    currentMinuteIndex,
    currentExercise,
    nextExercise,
    start,
    reset,
    completeWorkout,
  } = useTimerStore();

  const [isVoiceMuted, setIsVoiceMuted] = useState<boolean>(() => {
    const saved = localStorage.getItem('voice_coach_muted');
    return saved === 'true';
  });

  // Toggle voice mute
  const toggleVoiceMute = () => {
    setIsVoiceMuted((prev) => {
      const newVal = !prev;
      localStorage.setItem('voice_coach_muted', String(newVal));
      if (newVal) {
        window.speechSynthesis.cancel();
      }
      return newVal;
    });
  };

  // Voice Coach: Announce exercise transitions
  useEffect(() => {
    if (status === 'running' && currentExercise?.name && !isVoiceMuted) {
      window.speechSynthesis.cancel();
      const text = `Siguiente ejercicio: ${currentExercise.name}. Diez repeticiones.`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  }, [currentExercise?.name, status, isVoiceMuted]);

  // Voice Coach: Countdown alert 3, 2, 1
  useEffect(() => {
    if (status === 'running' && secondsRemaining <= 3 && secondsRemaining > 0 && !isVoiceMuted) {
      const utterance = new SpeechSynthesisUtterance(secondsRemaining.toString());
      utterance.lang = 'es-ES';
      utterance.rate = 1.2;
      window.speechSynthesis.speak(utterance);
    }
  }, [secondsRemaining, status, isVoiceMuted]);

  if (!currentExercise && status !== 'completed') {
    return (
      <div className="message-box">
        <p className="message-text">No hay ningún entrenamiento activo cargado.</p>
        <button className="back-button" onClick={onCancel}>
          Volver al Inicio
        </button>
      </div>
    );
  }

  const isAlertZone = secondsRemaining <= 3 && secondsRemaining > 0;
  
  // Progress Ring parameters
  const radius = 110;
  const circumference = 2 * Math.PI * radius; 
  const strokeDashoffset = ((60 - secondsRemaining) / 60) * circumference;
  
  const strokeColor = isAlertZone ? 'var(--accent-neon-red)' : 'var(--accent-neon-green)'; 

  const handlePrimaryAction = () => {
    if (status === 'running' && !isVoiceMuted) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance('Entrenamiento pausado');
      utterance.lang = 'es-ES';
      window.speechSynthesis.speak(utterance);
    } else if (status !== 'running' && !isVoiceMuted) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance('Entrenamiento reanudado');
      utterance.lang = 'es-ES';
      window.speechSynthesis.speak(utterance);
    }

    if (status === 'running') {
      pause();
    } else {
      start();
    }
  };

  const handleCompleteAction = () => {
    if (window.confirm('¿Seguro que deseas dar por completado este entrenamiento antes de tiempo?')) {
      if (!isVoiceMuted) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance('Entrenamiento completado. ¡Buen trabajo!');
        utterance.lang = 'es-ES';
        window.speechSynthesis.speak(utterance);
      }
      completeWorkout();
    }
  };

  const handleCancelAction = () => {
    window.speechSynthesis.cancel();
    reset();
    onCancel();
  };

  return (
    <div className="screen-container">
      {isAlertZone && status === 'running' && <div className="screen-alert-glow" />}

      {status === 'completed' ? (
        <div className="completion-container">
          <div className="completion-icon-wrapper">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="completion-svg">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h2 className="completion-title">¡Entrenamiento Completado!</h2>
          <p className="completion-subtitle">Excelente esfuerzo. Has completado tus bloques EMOM con éxito y se ha guardado en tu historial.</p>
          <button className="back-button primary" onClick={handleCancelAction}>
            Volver al Inicio
          </button>
        </div>
      ) : (
        <div className="workout-container">
          {/* Top Bar with Voice Toggle */}
          <div className="timer-top-bar">
            <button className={`voice-toggle-btn ${isVoiceMuted ? 'muted' : ''}`} onClick={toggleVoiceMute} title={isVoiceMuted ? 'Activar Entrenador de Voz' : 'Silenciar Entrenador de Voz'}>
              {isVoiceMuted ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="1" y1="1" x2="23" y2="23" />
                  <path d="M9 9v6a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
                  <path d="M17 17A9 9 0 0 1 3 12c0-1.66.45-3.21 1.25-4.55" />
                  <path d="M21 12a9 9 0 0 1-3.3 6.89" />
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
              )}
              <span>{isVoiceMuted ? 'Voz Desactivada' : 'Entrenador Activo'}</span>
            </button>
          </div>

          {/* Block & Minute Info */}
          <div className="timer-header">
            <div className="header-item">
              <span className="header-label">BLOQUE EMOM</span>
              <span className="header-value">
                {currentBlockIndex + 1} <span className="header-total">/ 5</span>
              </span>
            </div>
            <div className="header-item">
              <span className="header-label">MINUTO</span>
              <span className="header-value">
                {currentMinuteIndex + 1} <span className="header-total">/ 10</span>
              </span>
            </div>
          </div>

          {/* Animated SVG Timer Circle */}
          <div className="timer-circle-wrapper">
            <svg className="timer-svg" width="260" height="260">
              <circle
                className="timer-track"
                cx="130"
                cy="130"
                r={radius}
              />
              <circle
                className="timer-progress"
                cx="130"
                cy="130"
                r={radius}
                stroke={strokeColor}
                style={{
                  strokeDasharray: circumference,
                  strokeDashoffset: strokeDashoffset,
                }}
              />
            </svg>
            <div className="timer-circle-content">
              <span className={`timer-number ${isAlertZone ? 'alert' : ''}`} style={{ color: strokeColor }}>
                {secondsRemaining}
              </span>
              <span className="timer-subtitle">SEGUNDOS</span>
            </div>
          </div>

          {/* Exercises Cards */}
          <div className="exercise-container">
            <div className="card active-card">
              <span className="card-label-active">TRABAJO ACTUAL (10 REPS)</span>
              <h3 className="card-title-active">{currentExercise?.name}</h3>
              <div className="badge-row">
                <span className="badge">{currentExercise?.category}</span>
                <span className="badge">Cardio: {currentExercise?.cardiacIntensity}</span>
              </div>
            </div>

            {nextExercise && (
              <div className="card next-card">
                <span className="card-label-next">SIGUIENTE MINUTO</span>
                <p className="card-title-next">{nextExercise.name}</p>
              </div>
            )}
          </div>

          {/* Reorganized Controls */}
          <div className="button-row">
            {/* Play/Pause */}
            <button
              className={`control-button ${status === 'running' ? 'pause-btn' : 'start-btn'}`}
              style={{ width: '42%' }}
              onClick={handlePrimaryAction}
            >
              {status === 'running' ? (
                <span className="btn-content">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                    <rect x="6" y="4" width="4" height="16" />
                    <rect x="14" y="4" width="4" height="16" />
                  </svg>
                  PAUSAR
                </span>
              ) : (
                <span className="btn-content">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  REANUDAR
                </span>
              )}
            </button>
            
            {/* Complete manually */}
            <button 
              className="control-button complete-btn" 
              style={{ width: '38%' }}
              onClick={handleCompleteAction}
            >
              <span className="btn-content">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                COMPLETAR
              </span>
            </button>
            
            {/* Cancel/Exit */}
            <button 
              className="control-button cancel-btn" 
              style={{ width: '16%' }}
              onClick={handleCancelAction}
              title="Cancelar Entrenamiento"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
