import { useState, useEffect, useCallback, useRef } from 'react';

interface SpeakOptions {
  rate?: number;
  pitch?: number;
}

export const useVoiceCoach = () => {
  const [isVoiceMuted, setIsVoiceMuted] = useState<boolean>(() => {
    const saved = localStorage.getItem('voice_coach_muted');
    return saved === 'true';
  });

  const isVoiceMutedRef = useRef(isVoiceMuted);

  useEffect(() => {
    isVoiceMutedRef.current = isVoiceMuted;
    localStorage.setItem('voice_coach_muted', String(isVoiceMuted));
  }, [isVoiceMuted]);

  // Keep a list of voices in state if we want to force re-renders, but ref is enough for speech
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

  const updateVoices = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      voicesRef.current = window.speechSynthesis.getVoices();
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    updateVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, [updateVoices]);

  const getBestSpanishVoice = useCallback((): SpeechSynthesisVoice | null => {
    const voices = voicesRef.current.length > 0 
      ? voicesRef.current 
      : (typeof window !== 'undefined' ? window.speechSynthesis.getVoices() : []);
      
    const spanishVoices = voices.filter(voice => voice.lang.toLowerCase().startsWith('es'));
    if (spanishVoices.length === 0) return null;

    // Prioritize natural sounding voices:
    // 1. Google (very natural cloud/neural voices in Chrome/Android)
    // 2. Helena (high quality offline Spanish voice on Windows)
    // 3. Voices containing 'natural', 'premium', or 'neural'
    // 4. Local service voices
    const sorted = [...spanishVoices].sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      
      const getScore = (name: string, voice: SpeechSynthesisVoice) => {
        let score = 0;
        if (name.includes('google')) score += 100;
        if (name.includes('helena')) score += 95;
        if (name.includes('natural')) score += 80;
        if (name.includes('premium')) score += 70;
        if (name.includes('neural')) score += 60;
        if (voice.localService) score += 10;
        return score;
      };
      
      return getScore(nameB, b) - getScore(nameA, a);
    });

    return sorted[0];
  }, []);

  const speak = useCallback((text: string, options?: SpeakOptions) => {
    if (typeof window === 'undefined' || !window.speechSynthesis || isVoiceMutedRef.current) {
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Create utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    
    // Set natural sounding defaults: slightly slower rate can sound more natural depending on the voice
    utterance.rate = options?.rate ?? 0.95; 
    utterance.pitch = options?.pitch ?? 1.0;

    // Assign best voice
    const bestVoice = getBestSpanishVoice();
    if (bestVoice) {
      utterance.voice = bestVoice;
    }

    window.speechSynthesis.speak(utterance);
  }, [getBestSpanishVoice]);

  const cancel = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);

  const toggleVoiceMute = useCallback(() => {
    setIsVoiceMuted((prev) => {
      const nextVal = !prev;
      if (nextVal) {
        cancel();
      }
      return nextVal;
    });
  }, [cancel]);

  return {
    isVoiceMuted,
    toggleVoiceMute,
    speak,
    cancel,
  };
};
