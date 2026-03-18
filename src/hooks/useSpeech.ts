'use client';

import { useCallback, useRef } from 'react';

const operationWords: Record<string, string> = {
  multiply: 'nhân',
  add: 'cộng',
  subtract: 'trừ',
};

export function useSpeech() {
  const speakingRef = useRef(false);

  const speak = useCallback((text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN';
    utterance.rate = 0.9;
    utterance.pitch = 1.1;

    // Try to find Vietnamese voice
    const voices = window.speechSynthesis.getVoices();
    const viVoice = voices.find((v) => v.lang.startsWith('vi'));
    if (viVoice) utterance.voice = viVoice;

    utterance.onstart = () => { speakingRef.current = true; };
    utterance.onend = () => { speakingRef.current = false; };

    window.speechSynthesis.speak(utterance);
  }, []);

  const speakProblem = useCallback((num1: number, operation: string, num2: number) => {
    const op = operationWords[operation] || 'nhân';
    speak(`${num1} ${op} ${num2} bằng bao nhiêu?`);
  }, [speak]);

  const speakResult = useCallback((num1: number, operation: string, num2: number, answer: number) => {
    const op = operationWords[operation] || 'nhân';
    speak(`${num1} ${op} ${num2} bằng ${answer}`);
  }, [speak]);

  const speakText = useCallback((text: string) => {
    speak(text);
  }, [speak]);

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);

  return { speakProblem, speakResult, speakText, stop };
}
