'use client';

import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number;
  max: number;
  color?: 'blue' | 'green' | 'purple' | 'orange';
  showLabel?: boolean;
  height?: 'sm' | 'md' | 'lg';
  className?: string;
}

const colors = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500',
};

const heights = {
  sm: 'h-2',
  md: 'h-4',
  lg: 'h-6',
};

export default function ProgressBar({
  value,
  max,
  color = 'blue',
  showLabel = false,
  height = 'md',
  className = '',
}: ProgressBarProps) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={className}>
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${heights[height]}`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`${colors[color]} ${heights[height]} rounded-full`}
        />
      </div>
      {showLabel && (
        <div className="text-sm text-gray-500 mt-1 text-right">
          {value}/{max}
        </div>
      )}
    </div>
  );
}
