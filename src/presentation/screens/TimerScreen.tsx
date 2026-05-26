import React from 'react';
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
  
  // Parámetros del anillo de progreso circular SVG
  const radius = 110;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius; 
  
  const strokeDashoffset = ((60 - secondsRemaining) / 60) * circumference;
  
  const strokeColor = isAlertZone ? '#ff3b30' : '#34c759'; 
  const glowShadow = isAlertZone 
    ? 'drop-shadow(0px 4px 10px rgba(255, 59, 48, 0.2))'
    : 'drop-shadow(0px 4px 10px rgba(52, 199, 89, 0.15))';

  const handlePrimaryAction = () => {
    if (status === 'running') {
      pause();
    } else {
      start();
    }
  };

  const handleCompleteAction = () => {
    // Alerta de seguridad nativa del navegador antes de completar manualmente
    if (window.confirm('¿Seguro que deseas dar por completado este entrenamiento antes de tiempo?')) {
      completeWorkout();
    }
  };

  const handleCancelAction = () => {
    reset();
    onCancel();
  };

  return (
    <div className="screen-container">
      {isAlertZone && status === 'running' && <div className="screen-alert-glow" />}

      {status === 'completed' ? (
        <div className="completion-container">
          <span className="completion-emoji">🎉</span>
          <h2 className="completion-title">¡Entrenamiento Completado!</h2>
          <p className="completion-subtitle">Excelente esfuerzo. Has completado tus bloques EMOM con éxito y se ha guardado en tu historial.</p>
          <button className="back-button primary" onClick={handleCancelAction}>
            Volver al Inicio
          </button>
        </div>
      ) : (
        <div className="workout-container">
          {/* Cabecera del Bloque */}
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

          {/* Círculo del Temporizador Animado SVG */}
          <div className="timer-circle-wrapper">
            <svg className="timer-svg" width="250" height="250">
              <circle
                className="timer-track"
                cx="125"
                cy="125"
                r={radius}
              />
              <circle
                className="timer-progress"
                cx="125"
                cy="125"
                r={radius}
                stroke={strokeColor}
                style={{
                  strokeDasharray: circumference,
                  strokeDashoffset: strokeDashoffset,
                  filter: glowShadow,
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

          {/* Información de los Ejercicios */}
          <div className="exercise-container">
            <div className="card active-card">
              <span className="card-label-active">TRABAJO ACTUAL (10 REPETICIONES)</span>
              <h3 className="card-title-active">{currentExercise?.name}</h3>
              <div className="badge-row">
                <span className="badge">{currentExercise?.category}</span>
                <span className="badge">Intensidad: {currentExercise?.cardiacIntensity}</span>
              </div>
            </div>

            {nextExercise && (
              <div className="card next-card">
                <span className="card-label-next">SIGUIENTE MINUTO</span>
                <p className="card-title-next">{nextExercise.name}</p>
              </div>
            )}
          </div>

          {/* Botonera de Control Reorganizada */}
          <div className="button-row">
            {/* Reanudar / Pausar */}
            <button
              className={`control-button ${status === 'running' ? 'pause-btn' : 'start-btn'}`}
              style={{ width: '42%' }}
              onClick={handlePrimaryAction}
            >
              {status === 'running' ? 'PAUSAR' : 'REANUDAR'}
            </button>
            
            {/* Completar Manualmente */}
            <button 
              className="control-button complete-btn" 
              style={{ width: '38%' }}
              onClick={handleCompleteAction}
            >
              COMPLETAR
            </button>
            
            {/* Cancelar */}
            <button 
              className="control-button cancel-btn" 
              style={{ width: '16%' }}
              onClick={handleCancelAction}
            >
              ✖
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
