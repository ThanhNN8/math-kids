'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  isSupported: boolean;
  isListening: boolean;
  interim: string;
  lastCommandLabel: string | null;
  error: string | null;
  onToggle: () => void;
}

export default function ExamVoiceControl({
  isSupported,
  isListening,
  interim,
  lastCommandLabel,
  error,
  onToggle,
}: Props) {
  if (!isSupported) return null;

  return (
    <div className="flex items-center gap-2">
      <AnimatePresence>
        {lastCommandLabel && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="hidden md:block bg-green-500/90 text-white text-xs font-bold px-3 py-1.5 rounded-full"
          >
            {lastCommandLabel}
          </motion.div>
        )}
      </AnimatePresence>
      {isListening && interim && (
        <div className="hidden md:block bg-white/90 text-gray-700 text-xs px-3 py-1.5 rounded-full italic max-w-[200px] truncate">
          “{interim}”
        </div>
      )}
      <button
        type="button"
        onClick={onToggle}
        aria-label={isListening ? 'Tắt micro' : 'Bật micro'}
        className={`relative w-11 h-11 rounded-full flex items-center justify-center text-xl shadow-lg transition-colors ${
          isListening
            ? 'bg-red-500 text-white animate-pulse'
            : 'bg-white text-indigo-600 hover:bg-indigo-50'
        }`}
      >
        🎤
        {error && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full" />
        )}
      </button>
    </div>
  );
}
