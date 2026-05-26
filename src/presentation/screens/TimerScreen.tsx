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
  const circumference = 2 * Math.PI * radius; // Aprox 691.15
  
  // El offset disminuye a medida que corre el tiempo (de 60 a 0)
  const strokeDashoffset = ((60 - secondsRemaining) / 60) * circumference;
  
  // Colores dinámicos del anillo
  const strokeColor = isAlertZone ? '#ff3131' : '#39ff14';
  const glowShadow = isAlertZone 
    ? 'drop-shadow(0px 0px 10px rgba(255, 49, 49, 0.6))'
    : 'drop-shadow(0px 0px 8px rgba(57, 255, 20, 0.4))';

  const handlePrimaryAction = () => {
    if (status === 'running') {
      pause();
    } else {
      start();
    }
  };

  const handleCancelAction = () => {
    reset();
    onCancel();
  };

  return (
    <div className="screen-container">
      {/* Alerta roja parpadeante en los bordes de la pantalla al entrar en la zona crítica */}
      {isAlertZone && status === 'running' && <div className="screen-alert-glow" />}

      {status === 'completed' ? (
        <div className="completion-container">
          <span className="completion-emoji">🎉</span>
          <h2 className="completion-title">¡Entrenamiento Completado!</h2>
          <p className="completion-subtitle">Excelente esfuerzo. Has completado tus 5 bloques EMOM con éxito.</p>
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
              {/* Anillo de fondo gris suave */}
              <circle
                className="timer-track"
                cx="125"
                cy="125"
                r={radius}
              />
              {/* Anillo de progreso reactivo */}
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

          {/* Botonera de Control */}
          <div className="button-row">
            <button
              className={`control-button ${status === 'running' ? 'pause-btn' : 'start-btn'}`}
              onClick={handlePrimaryAction}
            >
              {status === 'running' ? 'PAUSAR' : 'REANUDAR'}
            </button>
            <button className="control-button cancel-btn" onClick={handleCancelAction}>
              CANCELAR
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
