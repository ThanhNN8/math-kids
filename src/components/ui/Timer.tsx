'use client';

import { useEffect, useRef, useState } from 'react';

interface TimerProps {
  seconds: number;
  onTimeUp?: () => void;
  isRunning?: boolean;
  showMinutes?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Timer({
  seconds,
  onTimeUp,
  isRunning = true,
  showMinutes = false,
  size = 'md',
  className = '',
}: TimerProps) {
  const [remaining, setRemaining] = useState(seconds);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setRemaining(seconds);
  }, [seconds]);

  useEffect(() => {
    if (isRunning && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            onTimeUp?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, remaining > 0]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const display = showMinutes
    ? `${mins}:${secs.toString().padStart(2, '0')}`
    : `${remaining}`;

  const urgency = remaining <= 5 ? 'text-red-500 animate-pulse' : remaining <= 10 ? 'text-orange-500' : 'text-gray-700';
  const fontSize = size === 'lg' ? 'text-5xl' : size === 'md' ? 'text-3xl' : 'text-xl';

  return (
    <div className={`font-bold ${fontSize} ${urgency} tabular-nums ${className}`}>
      ⏱ {display}s
    </div>
  );
}
