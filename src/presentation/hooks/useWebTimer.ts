import { useEffect, useRef } from 'react';
import { useTimerStore } from '../state/useTimerStore';

export const useWebTimer = () => {
  const { status, secondsRemaining, syncTime, pause } = useTimerStore();
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const accumulatedTimeRef = useRef<number>(0);
  const lastSecondAlertRef = useRef<number>(-1);

  // Reproducir un pitido sintetizado usando Web Audio API (cero dependencias de ficheros externos)
  const playBeep = (type: 'short' | 'long' | 'whistle') => {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      
      const ctx = new AudioContextClass();

      if (type === 'whistle') {
        const duration = 0.8;
        const now = ctx.currentTime;

        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        const mainGain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        // Filtro pasabanda para simular el cuerpo metálico/plástico del silbato
        filter.type = 'bandpass';
        filter.frequency.value = 2500;
        filter.Q.value = 1.2;

        // Oscilador de baja frecuencia (LFO) para modular el tono y lograr el efecto de la bola/guisante
        lfo.frequency.value = 30; // 30Hz de vibrato
        lfoGain.gain.value = 150; // Variación de frecuencia en Hz

        // Combinación de dos tonos cercanos para crear batimiento armónico (beating)
        osc1.type = 'triangle';
        osc1.frequency.value = 2000;

        osc2.type = 'sawtooth';
        osc2.frequency.value = 2150;

        lfo.connect(lfoGain);
        lfoGain.connect(osc1.frequency);
        lfoGain.connect(osc2.frequency);

        const osc1Gain = ctx.createGain();
        const osc2Gain = ctx.createGain();
        osc1Gain.gain.value = 0.4;
        osc2Gain.gain.value = 0.2;

        osc1.connect(osc1Gain);
        osc2.connect(osc2Gain);

        osc1Gain.connect(filter);
        osc2Gain.connect(filter);
        filter.connect(mainGain);
        mainGain.connect(ctx.destination);

        // Patrón del silbato del árbitro: Dos pitidos (uno muy corto y otro más largo de confirmación)
        mainGain.gain.setValueAtTime(0, now);
        // Pitido 1 (rápido de entrada)
        mainGain.gain.linearRampToValueAtTime(0.3, now + 0.05);
        mainGain.gain.setValueAtTime(0.3, now + 0.15);
        mainGain.gain.exponentialRampToValueAtTime(0.001, now + 0.20);
        // Pitido 2 (principal)
        mainGain.gain.setValueAtTime(0, now + 0.25);
        mainGain.gain.linearRampToValueAtTime(0.3, now + 0.30);
        mainGain.gain.setValueAtTime(0.3, now + 0.65);
        mainGain.gain.exponentialRampToValueAtTime(0.001, now + 0.80);

        lfo.start(now);
        osc1.start(now);
        osc2.start(now);

        lfo.stop(now + duration);
        osc1.stop(now + duration);
        osc2.stop(now + duration);

        // Vibración Web simulando el silbato
        if ('vibrate' in navigator) {
          navigator.vibrate([150, 100, 400]);
        }
      } else {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        // Pitido corto (800Hz, 0.15s) vs largo (1200Hz, 0.5s)
        const freq = type === 'short' ? 800 : 1200;
        const duration = type === 'short' ? 0.15 : 0.5;
        
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        osc.type = 'sine';
        
        // Suave atenuación (fade out) para evitar clics de audio abruptos
        gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + duration);

        // Vibración Web (si está disponible y soportada por el móvil del usuario)
        if ('vibrate' in navigator) {
          navigator.vibrate(type === 'short' ? 100 : 300);
        }
      }
    } catch (e) {
      console.warn('El audio aún no tiene interacción del usuario o no está soportado:', e);
    }
  };

  // Escuchar el contador para lanzar sonidos en los segundos clave
  useEffect(() => {
    if (status !== 'running') return;

    if (lastSecondAlertRef.current === secondsRemaining) return;
    lastSecondAlertRef.current = secondsRemaining;

    if (secondsRemaining <= 3 && secondsRemaining >= 1) {
      playBeep('short');
    } else if (secondsRemaining === 60 || secondsRemaining === 0) {
      playBeep('whistle');
    }
  }, [secondsRemaining, status]);

  // Event loop de precisión usando Delta Time
  useEffect(() => {
    if (status === 'running') {
      if (!startTimeRef.current) {
        startTimeRef.current = Date.now();
      }

      timerRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const now = Date.now();
          const deltaMs = now - startTimeRef.current + accumulatedTimeRef.current;
          const elapsedSeconds = Math.floor(deltaMs / 1000);
          
          syncTime(elapsedSeconds);
        }
      }, 100);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      if (status === 'paused') {
        if (startTimeRef.current) {
          accumulatedTimeRef.current += Date.now() - startTimeRef.current;
          startTimeRef.current = null;
        }
      } else if (status === 'idle' || status === 'completed') {
        startTimeRef.current = null;
        accumulatedTimeRef.current = 0;
        lastSecondAlertRef.current = -1;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [status]);

  // Manejo de visibilidad (segundo plano al bloquear pantalla o cambiar pestaña)
  useEffect(() => {
    let backgroundTime: number | null = null;

    const handleVisibilityChange = () => {
      if (status !== 'running') return;

      if (document.hidden) {
        backgroundTime = Date.now();
      } else if (backgroundTime && startTimeRef.current) {
        const offlineDuration = Date.now() - backgroundTime;
        startTimeRef.current = startTimeRef.current - offlineDuration;
        backgroundTime = null;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [status]);

  return {
    status,
    secondsRemaining,
    pause,
  };
};
