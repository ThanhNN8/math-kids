'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface NumberPadProps {
  onSubmit: (value: number) => void;
  maxDigits?: number;
  disabled?: boolean;
}

export default function NumberPad({ onSubmit, maxDigits = 3, disabled = false }: NumberPadProps) {
  const [value, setValue] = useState('');

  const handlePress = (digit: string) => {
    if (disabled) return;
    if (digit === 'delete') {
      setValue(v => v.slice(0, -1));
    } else if (digit === 'enter') {
      if (value) {
        onSubmit(parseInt(value));
        setValue('');
      }
    } else if (value.length < maxDigits) {
      setValue(v => v + digit);
    }
  };

  const buttons = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'delete', '0', 'enter'];

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="bg-gray-100 rounded-2xl px-4 py-3 mb-3 text-center min-h-[56px] flex items-center justify-center">
        <span className="text-3xl font-bold text-gray-800">
          {value || <span className="text-gray-400">?</span>}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {buttons.map((btn) => (
          <motion.button
            key={btn}
            whileTap={{ scale: 0.9 }}
            onClick={() => handlePress(btn)}
            disabled={disabled}
            className={`
              h-16 rounded-2xl text-2xl font-bold select-none transition-colors
              ${btn === 'enter'
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : btn === 'delete'
                ? 'bg-red-400 hover:bg-red-500 text-white text-lg'
                : 'bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-200'
              }
              ${disabled ? 'opacity-50' : ''}
            `}
          >
            {btn === 'delete' ? '⌫' : btn === 'enter' ? '✓' : btn}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
